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

func (r *TeamRepository) FindRegionByID(
	tx *gorm.DB,
	id uint,
) (*models.Region, error) {
	var region models.Region

	if err := tx.First(&region, id).Error; err != nil {
		return nil, err
	}

	return &region, nil

}

func (r *TeamRepository) FindAll(
	offset int,
	limit int,
	search string,
) ([]models.Team, int64, error) {
	var teams []models.Team
	var totalCount int64

	query := r.DB.Model(&models.Team{})

	// Search
	if search != "" {
		query = query.Where(
			"name LIKE ?",
			"%"+search+"%",
		)
	}

	// Total data setelah search
	if err := query.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	// Get data
	err := query.
		Offset(offset).
		Limit(limit).
		Preload("Region").
		Find(&teams).Error

	if err != nil {
		return nil, 0, err
	}

	return teams, totalCount, nil
}

func (r *TeamRepository) Create(tx *gorm.DB, team *models.Team) error {
	return tx.Create(team).Error
}

func (r *TeamRepository) Update(tx *gorm.DB, team *models.Team) error {
	return tx.Save(team).Error
}
