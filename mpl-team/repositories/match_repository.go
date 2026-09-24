package repositories

import (
	"mpl-team/config"
	"mpl-team/models"

	"gorm.io/gorm"
)

type MatchRepository struct {
	DB *gorm.DB
}

func NewMatchRepository() *MatchRepository {
	return &MatchRepository{
		DB: config.DB,
	}
}

func (r *MatchRepository) FindTeamByID(id uint) (*models.Team, error) {
	var team models.Team

	if err := r.DB.First(&team, id).Error; err != nil {
		return nil, err
	}

	return &team, nil
}

func (r *MatchRepository) FindEventByID(id uint) (*models.Event, error) {
	var event models.Event

	if err := r.DB.First(&event, id).Error; err != nil {
		return nil, err
	}

	return &event, nil
}

func (r *MatchRepository) Create(match *models.Match) error {
	return r.DB.Create(match).Error
}

func (r *MatchRepository) Update(match *models.Match) error {
	return r.DB.Save(match).Error
}

func (r *MatchRepository) FindByID(id uint) (*models.Match, error) {
	var match models.Match

	err := r.DB.
		Preload("HomeTeam").
		Preload("AwayTeam").
		Preload("Event").
		Preload("Event.Phase").
		Preload("Event.Phase.Tournament").
		Preload("Games").
		Preload("Games.WinnerTeam").
		First(&match, id).Error

	if err != nil {
		return nil, err
	}

	return &match, nil
}

func (r *MatchRepository) FindAll(offset int, limit int) ([]models.Match, int64, error) {
	var matches []models.Match
	var totalCount int64

	// Total data
	if err := r.DB.
		Model(&models.Match{}).
		Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	query := r.DB.
		Preload("HomeTeam").
		Preload("AwayTeam").
		Preload("Event").
		Preload("Event.Phase").
		Preload("Event.Phase.Tournament").
		Preload("Games").
		Offset(offset).
		Limit(limit)

	if err := query.Find(&matches).Error; err != nil {
		return nil, 0, err
	}

	return matches, totalCount, nil
}
