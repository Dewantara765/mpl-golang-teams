package services

import (
	"fmt"
	"mime/multipart"
	apperrors "mpl-team/errors"
	"mpl-team/models"
	"mpl-team/repositories"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type RegionService struct {
	RegionRepository *repositories.RegionRepository
}

func NewRegionService(
	regionRepository *repositories.RegionRepository,
) *RegionService {
	return &RegionService{
		RegionRepository: regionRepository,
	}
}

func (s *RegionService) FindRegions() ([]models.Region, error) {
	regions, err := s.RegionRepository.FindAll()
	if err != nil {
		return nil, err
	}
	return regions, nil
}

func (s *RegionService) Create(

	name string,
	code string,
	file *multipart.FileHeader,
) (*models.Region, error) {

	name = strings.TrimSpace(name)
	code = strings.TrimSpace(code)

	validationErrors := make(apperrors.ValidationErrors)

	name = strings.TrimSpace(name)
	code = strings.TrimSpace(code)

	if name == "" {
		validationErrors["name"] = "Name is required"
	}

	if code == "" {
		validationErrors["code"] = "Code is required"
	}

	if file == nil {
		validationErrors["logo"] = "Logo is required"
	}

	if len(validationErrors) > 0 {
		return nil, validationErrors
	}

	// Pastikan folder uploads tersedia
	if err := os.MkdirAll("uploads/region", os.ModePerm); err != nil {
		return nil, fmt.Errorf("failed to create upload directory")
	}

	// Generate filename
	filename := fmt.Sprintf(
		"uploads/region/%d%s",
		time.Now().UnixNano(),
		filepath.Ext(file.Filename),
	)

	// Upload logo
	if err := SaveUploadedFile(file, filename); err != nil {
		return nil, fmt.Errorf("failed to save logo")
	}

	region := models.Region{
		Name: name,
		Code: code,
		Logo: filename,
	}

	// Simpan ke database
	if err := s.RegionRepository.Create(&region); err != nil {
		os.Remove(filename)
		return nil, fmt.Errorf("failed to create region")
	}

	return &region, nil
}

func (s *RegionService) FindRegionByID(id uint) (*models.Region, error) {
	return s.RegionRepository.FindByID(id)
}

func (s *RegionService) Update(
	id uint,
	name string,
	code string,
	file *multipart.FileHeader,
) (*models.Region, error) {

	// Cari region
	region, err := s.RegionRepository.FindByID(id)
	if err != nil {
		return nil, err
	}

	name = strings.TrimSpace(name)
	code = strings.TrimSpace(code)

	// Update field jika diisi
	if name != "" {
		region.Name = name
	}

	if code != "" {
		region.Code = code
	}

	oldLogo := region.Logo
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

		region.Logo = newLogo
	}

	// Update database
	if err := s.RegionRepository.Update(region); err != nil {
		// Hapus logo baru jika database gagal
		if newLogo != "" {
			os.Remove(newLogo)
		}

		return nil, fmt.Errorf("failed to update region: %w", err)
	}

	// Hapus logo lama setelah database berhasil
	if newLogo != "" && oldLogo != "" {
		os.Remove(oldLogo)
	}

	return region, nil
}
