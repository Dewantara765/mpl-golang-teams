package services

import (
	"errors"
	apperrors "mpl-team/errors"
	"mpl-team/models"
	"mpl-team/repositories"
	"time"

	"gorm.io/gorm"
)

type TournamentService struct {
	TournamentRepository *repositories.TournamentRepository
}

func NewTournamentService(
	tournamentRepository *repositories.TournamentRepository,
) *TournamentService {
	return &TournamentService{
		TournamentRepository: tournamentRepository,
	}
}

func (s *TournamentService) FindTournaments() ([]models.Tournament, error) {
	tournaments, err := s.TournamentRepository.FindAll()
	if err != nil {
		return nil, err
	}
	return tournaments, nil
}

func (s *TournamentService) FindTournamentBySlug(slug string) (*models.Tournament, error) {
	return s.TournamentRepository.FindBySlug(slug)
}

type CreateTournamentInput struct {
	Name      string
	StartDate string
	EndDate   string
	Slug      string
	RegionID  uint
}

func (s *TournamentService) Create(input CreateTournamentInput) (*models.Tournament, error) {

	errors := make(map[string]string)

	// Validasi region
	if _, err := s.TournamentRepository.FindRegionByID(input.RegionID); err != nil {
		errors["region_id"] = "Region not found"
	}

	// Validasi start date
	startDate, err := time.Parse("2006-01-02", input.StartDate)
	if err != nil {
		errors["start_date"] = "Start date must be in YYYY-MM-DD format"
	}

	// Validasi end date
	endDate, err := time.Parse("2006-01-02", input.EndDate)
	if err != nil {
		errors["end_date"] = "End date must be in YYYY-MM-DD format"
	}

	// Validasi rentang tanggal
	if _, startErr := time.Parse("2006-01-02", input.StartDate); startErr == nil {
		if _, endErr := time.Parse("2006-01-02", input.EndDate); endErr == nil {
			if endDate.Before(startDate) {
				errors["end_date"] = "End date must be after or equal to start date"
			}
		}
	}

	if len(errors) > 0 {
		return nil, apperrors.ValidationErrors(errors)
	}

	tournament := &models.Tournament{
		Name:      input.Name,
		StartDate: input.StartDate,
		EndDate:   input.EndDate,
		Slug:      input.Slug,
		RegionID:  input.RegionID,
	}

	if err := s.TournamentRepository.Create(tournament); err != nil {
		return nil, err
	}

	return s.TournamentRepository.FindByID(tournament.ID)
}

type UpdateTournamentInput struct {
	Name      *string
	StartDate *string
	EndDate   *string
	Slug      *string
	RegionID  *uint
}

func (s *TournamentService) UpdateTournament(
	id uint,
	input UpdateTournamentInput,
) (*models.Tournament, error) {

	tournament, err := s.TournamentRepository.FindByID(id)
	if err != nil {
		return nil, err
	}

	// Partial update
	if input.Name != nil {
		tournament.Name = *input.Name
	}

	if input.StartDate != nil {
		tournament.StartDate = *input.StartDate
	}

	if input.EndDate != nil {
		tournament.EndDate = *input.EndDate
	}

	if input.Slug != nil {
		tournament.Slug = *input.Slug
	}

	// Validasi
	validationErrors := make(map[string]string)

	startDate, startErr := time.Parse(
		"2006-01-02",
		tournament.StartDate,
	)

	endDate, endErr := time.Parse(
		"2006-01-02",
		tournament.EndDate,
	)

	if startErr != nil {
		validationErrors["start_date"] =
			"Start date must be in YYYY-MM-DD format"
	}

	if endErr != nil {
		validationErrors["end_date"] =
			"End date must be in YYYY-MM-DD format"
	}

	if startErr == nil && endErr == nil &&
		endDate.Before(startDate) {
		validationErrors["end_date"] =
			"End date must be after or equal to start date"
	}

	if len(validationErrors) > 0 {
		return nil, apperrors.ValidationErrors(validationErrors)
	}

	// Update database
	if err := s.TournamentRepository.Update(tournament); err != nil {
		return nil, err
	}

	return tournament, nil
}

func (s *TournamentService) FindPhaseWithMatches(
	tournamentSlug string,
	phaseSlug string,
) (*models.Phase, error) {

	phase, err := s.TournamentRepository.FindPhaseWithMatches(
		tournamentSlug,
		phaseSlug,
	)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("phase not found")
		}

		return nil, err
	}

	return phase, nil
}
