package services

import (
	apperrors "mpl-team/errors"
	"mpl-team/models"
	"mpl-team/repositories"
)

type PhaseService struct {
	PhaseRepository *repositories.PhaseRepository
}

func NewPhaseService(
	phaseRepository *repositories.PhaseRepository,
) *PhaseService {
	return &PhaseService{
		PhaseRepository: phaseRepository,
	}
}

func (s *PhaseService) FindPhases() ([]models.Phase, error) {
	phases, err := s.PhaseRepository.FindAll()
	if err != nil {
		return nil, err
	}
	return phases, nil
}

func (s *PhaseService) FindPhaseByID(id uint) (*models.Phase, error) {
	return s.PhaseRepository.FindByID(id)
}

type CreatePhaseInput struct {
	Name         string
	Slug         string
	TournamentID uint
	HasStanding  bool
}

func (s *PhaseService) Create(input CreatePhaseInput) (*models.Phase, error) {
	if _, err := s.PhaseRepository.FindTournamentByID(input.TournamentID); err != nil {
		return nil, apperrors.ValidationErrors{
			"tournament_id": "tournament not found",
		}
	}

	phase := &models.Phase{
		Name:         input.Name,
		Slug:         input.Slug,
		TournamentID: input.TournamentID,
		HasStanding:  input.HasStanding,
	}

	if err := s.PhaseRepository.Create(phase); err != nil {
		return nil, err
	}

	return s.PhaseRepository.FindByID(phase.ID)
}

type UpdatePhaseInput struct {
	Name        *string
	Slug        *string
	HasStanding *bool
}

func (s *PhaseService) Update(id uint, input UpdatePhaseInput) (*models.Phase, error) {

	phase, err := s.PhaseRepository.FindByID(id)
	if err != nil {
		return nil, err
	}

	if input.Name != nil {
		phase.Name = *input.Name
	}

	if input.Slug != nil {
		phase.Slug = *input.Slug
	}

	if input.Slug != nil {
		phase.HasStanding = *input.HasStanding
	}

	if err := s.PhaseRepository.Update(phase); err != nil {
		return nil, err
	}

	return phase, nil

}
