package repositories

import (
	"mpl-team/config"
	"mpl-team/models"

	"gorm.io/gorm"
)

type HeroDraftRepository struct{}

func NewHeroDraftRepository() *HeroDraftRepository {
	return &HeroDraftRepository{}
}

func (r *HeroDraftRepository) Create(
	draft *models.HeroDraft,
) error {
	return config.DB.Create(draft).Error
}

func (r *HeroDraftRepository) CreateMany(
	tx *gorm.DB,
	drafts []models.HeroDraft,
) error {
	return tx.Create(&drafts).Error
}

func (r *HeroDraftRepository) FindByGameID(
	gameID uint,
) ([]models.HeroDraft, error) {

	var drafts []models.HeroDraft

	err := config.DB.
		Preload("Team").
		Preload("Hero").
		Preload("Game").
		Where("game_id = ?", gameID).
		Find(&drafts).Error

	return drafts, err
}

func (r *HeroDraftRepository) FindByID(
	id uint,
) (*models.HeroDraft, error) {

	var draft models.HeroDraft

	err := config.DB.
		Preload("Team").
		Preload("Hero").
		First(&draft, id).Error

	if err != nil {
		return nil, err
	}

	return &draft, nil
}

func (r *HeroDraftRepository) Delete(
	id uint,
) error {
	return config.DB.Delete(
		&models.HeroDraft{},
		id,
	).Error
}

func (r *HeroDraftRepository) ExistsByGameIDAndHeroIDs(
	tx *gorm.DB,
	gameID uint,
	heroIDs []uint,
) (bool, error) {
	var count int64

	err := tx.Model(&models.HeroDraft{}).
		Where("game_id = ? AND hero_id IN ?", gameID, heroIDs).
		Count(&count).Error

	if err != nil {
		return false, err
	}

	return count > 0, nil
}
