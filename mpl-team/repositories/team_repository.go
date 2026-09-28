package repositories

import (
	"mpl-team/models"

	"gorm.io/gorm"
)

type TeamRepository struct {
	DB *gorm.DB
}

func NewTeamRepository(db *gorm.DB) *TeamRepository {
	return &TeamRepository{DB: db}
}

func (r *TeamRepository) FindByID(
	tx *gorm.DB,
	id uint,
) (*models.Team, error) {

	var team models.Team

	if err := tx.First(&team, id).Error; err != nil {
		return nil, err
	}

	return &team, nil
}
