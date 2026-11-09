package repositories

import (
	"mpl-team/models"

	"gorm.io/gorm"
)

type RegionRepository struct {
	DB *gorm.DB
}

func NewRegionRepository(db *gorm.DB) *RegionRepository {
	return &RegionRepository{DB: db}
}

func (r *RegionRepository) FindAll() ([]models.Region, error) {
	var regions []models.Region
	err := r.DB.Find(&regions).Error
	return regions, err
}

func (r *RegionRepository) Create(region *models.Region) error {
	return r.DB.Create(region).Error
}

func (r *RegionRepository) FindByID(id uint) (*models.Region, error) {
	var region models.Region
	if err := r.DB.First(&region, id).Error; err != nil {
		return nil, err
	}
	return &region, nil
}

func (r *RegionRepository) Update(region *models.Region) error {
	return r.DB.Save(region).Error
}
