package services

import (
	"errors"
	apperrors "mpl-team/errors"
	"mpl-team/helpers"
	"mpl-team/models"
	"mpl-team/repositories"

	"fmt"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"

	"gorm.io/gorm"
)

type TeamService struct {
	TeamRepository *repositories.TeamRepository
}

func NewTeamService(
	teamRepository *repositories.TeamRepository,
) *TeamService {
	return &TeamService{
		TeamRepository: teamRepository,
	}
}

func (s *TeamService) FindByID(
	tx *gorm.DB,
	id uint,
) (*models.Team, error) {
	team, err := s.TeamRepository.FindByID(tx, id)
	if err != nil {
		return nil, err
	}

	if team == nil {
		return nil, errors.New("team not found")
	}

	return team, nil
}

type TeamPagination struct {
	Data []models.Team `json:"data"`
	helpers.Pagination
}

func (s *TeamService) FindTeams(
	offset int,
	limit int,
	search string,
	all bool,
) ([]models.Team, int64, error) {

	return s.TeamRepository.FindAll(
		offset,
		limit,
		search,
		all,
	)
}

func SaveUploadedFile(
	file *multipart.FileHeader,
	filename string,
) error {
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	dst, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer dst.Close()

	_, err = dst.ReadFrom(src)
	return err
}

func (s *TeamService) Create(
	tx *gorm.DB,
	name string,
	shortName string,
	regionID uint,
	file *multipart.FileHeader,
) (*models.Team, error) {

	name = strings.TrimSpace(name)
	shortName = strings.TrimSpace(shortName)

	validationErrors := make(apperrors.ValidationErrors)

	name = strings.TrimSpace(name)
	shortName = strings.TrimSpace(shortName)

	if name == "" {
		validationErrors["name"] = "Name is required"
	}

	if shortName == "" {
		validationErrors["short_name"] = "Short name is required"
	}

	if file == nil {
		validationErrors["logo"] = "Logo is required"
	}

	if regionID == 0 {
		validationErrors["region_id"] = "region ID is required"
	}

	if _, err := s.TeamRepository.FindRegionByID(tx, regionID); err != nil {
		return nil, apperrors.ValidationErrors{
			"event_id": "event not found",
		}
	}

	if len(validationErrors) > 0 {
		return nil, validationErrors
	}

	// Pastikan folder uploads tersedia
	if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
		return nil, fmt.Errorf("failed to create upload directory")
	}

	// Generate filename
	filename := fmt.Sprintf(
		"uploads/%d%s",
		time.Now().UnixNano(),
		filepath.Ext(file.Filename),
	)

	// Upload logo
	if err := SaveUploadedFile(file, filename); err != nil {
		return nil, fmt.Errorf("failed to save logo")
	}

	team := models.Team{
		Name:      name,
		ShortName: shortName,
		Logo:      filename,
		RegionID:  uint(regionID),
	}

	// Simpan ke database
	if err := s.TeamRepository.Create(tx, &team); err != nil {
		os.Remove(filename)
		return nil, fmt.Errorf("failed to create team")
	}

	return &team, nil
}

func (s *TeamService) Update(
	tx *gorm.DB,
	id uint,
	name string,
	shortName string,
	regionID uint,
	file *multipart.FileHeader,
) (*models.Team, error) {

	// Cari team
	team, err := s.TeamRepository.FindByID(tx, id)
	if err != nil {
		return nil, err
	}

	name = strings.TrimSpace(name)
	shortName = strings.TrimSpace(shortName)

	// Default ke regionID lama

	// Update field jika diisi
	if name != "" {
		team.Name = name
	}

	if shortName != "" {
		team.ShortName = shortName
	}

	if regionID != 0 {
		region, err := s.TeamRepository.FindRegionByID(tx, regionID)
		if err != nil {
			return nil, err
		}

		team.RegionID = region.ID
	}

	oldLogo := team.Logo
	newLogo := ""

	// Upload logo baru jika tersedia
	if file != nil {
		if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
			return nil, fmt.Errorf("failed to create upload directory: %w", err)
		}

		newLogo = fmt.Sprintf(
			"uploads/%d%s",
			time.Now().UnixNano(),
			filepath.Ext(file.Filename),
		)

		if err := SaveUploadedFile(file, newLogo); err != nil {
			return nil, fmt.Errorf("failed to save logo: %w", err)
		}

		team.Logo = newLogo
	}

	// Update database
	if err := s.TeamRepository.Update(tx, team); err != nil {
		if newLogo != "" {
			os.Remove(newLogo)
		}

		return nil, fmt.Errorf("failed to update team: %w", err)
	}

	// Hapus logo lama setelah database berhasil
	if newLogo != "" && oldLogo != "" {
		os.Remove(oldLogo)
	}

	return team, nil
}
