package repositories

import (
	"mpl-team/models"

	"gorm.io/gorm"
)

type GameRepository struct {
	DB *gorm.DB
}

func NewGameRepository(db *gorm.DB) *GameRepository {
	return &GameRepository{DB: db}
}

func (r *GameRepository) FindByMatchID(
	tx *gorm.DB,
	matchID uint,
) ([]models.Game, error) {

	var games []models.Game

	err := tx.
		Where("match_id = ?", matchID).
		Order("game_number ASC").
		Find(&games).Error

	return games, err
}

func (r *GameRepository) Create(
	tx *gorm.DB,
	game *models.Game,
) error {
	return tx.Create(game).Error
}

func (r *GameRepository) FindByMatchAndGameNumber(
	matchID uint,
	gameNumber int,
) (*models.Game, error) {

	var game models.Game

	err := r.DB.
		Preload("WinnerTeam").
		Where("match_id = ? AND game_number = ?", matchID, gameNumber).
		First(&game).Error

	if err != nil {
		return nil, err
	}

	return &game, nil
}

func (r *GameRepository) FindByID(id uint) (*models.Game, error) {
	var game models.Game

	err := r.DB.
		Preload("Match").
		First(&game, id).Error
	if err != nil {
		return nil, err
	}

	return &game, nil
}

func (r *GameRepository) UpdateFirstPick(
	gameID uint,
	teamID uint,
) error {
	return r.DB.
		Model(&models.Game{}).
		Where("id = ?", gameID).
		Update("first_pick_team_id", teamID).
		Error
}
