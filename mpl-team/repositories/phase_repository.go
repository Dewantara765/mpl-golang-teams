package repositories

import (
	"mpl-team/models"

	"gorm.io/gorm"
)

type PhaseRepository struct {
	DB *gorm.DB
}

func NewPhaseRepository(db *gorm.DB) *PhaseRepository {
	return &PhaseRepository{DB: db}
}

func (r *PhaseRepository) FindAll() ([]models.Phase, error) {
	var phases []models.Phase
	err := r.DB.
		Preload("Tournament").
		Preload("Events").Find(&phases).Error
	return phases, err
}

func (r *PhaseRepository) FindByID(id uint) (*models.Phase, error) {
	var phase models.Phase
	if err := r.DB.First(&phase, id).Error; err != nil {
		return nil, err
	}
	return &phase, nil
}

func (r *PhaseRepository) FindTournamentByID(id uint) (*models.Tournament, error) {
	var tournament models.Tournament
	if err := r.DB.First(&tournament, id).Error; err != nil {
		return nil, err
	}
	return &tournament, nil
}

func (r *PhaseRepository) Create(phase *models.Phase) error {
	return r.DB.Create(phase).Error
}

func (r *PhaseRepository) Update(phase *models.Phase) error {
	return r.DB.Save(phase).Error
}
