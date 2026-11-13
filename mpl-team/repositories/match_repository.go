package repositories

import (
	"mpl-team/models"

	"gorm.io/gorm"
)

type MatchRepository struct {
	DB *gorm.DB
}

func NewMatchRepository(db *gorm.DB) *MatchRepository {
	return &MatchRepository{
		DB: db,
	}
}

func (r *MatchRepository) WithTx(tx *gorm.DB) *MatchRepository {
	return &MatchRepository{
		DB: tx,
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
		Preload("Games.FirstPickTeam").
		First(&match, id).Error

	if err != nil {
		return nil, err
	}

	return &match, nil
}

func (r *MatchRepository) FindByIDForGame(
	db *gorm.DB,
	id uint,
) (*models.Match, error) {

	var match models.Match

	err := r.DB.
		Preload("HomeTeam").
		Preload("AwayTeam").
		Preload("Event").
		Preload("Event.Phase").
		First(&match, id).Error

	if err != nil {
		return nil, err
	}

	return &match, nil
}

func (r *MatchRepository) UpdateScoreAndStatus(
	tx *gorm.DB,
	match *models.Match,
	homeScore int,
	awayScore int,
	status models.MatchStatus,
) error {

	return tx.Model(match).Updates(map[string]interface{}{
		"home_score": homeScore,
		"away_score": awayScore,
		"status":     status,
	}).Error
}

func (r *MatchRepository) FindAll(offset int, limit int, search string,
	tournamentID uint) ([]models.Match, int64, error) {
	var matches []models.Match
	var totalCount int64

	query := r.DB.Model(&models.Match{})

	// Search
	if search != "" {
		query = query.Where("name LIKE ?", "%"+search+"%")
	}

	// Filter tournament
	if tournamentID > 0 {
		query = query.
			Joins("JOIN events ON events.id = matches.event_id").
			Joins("JOIN phases ON phases.id = events.phase_id").
			Where("phases.tournament_id = ?", tournamentID).
			Preload("Event").
			Preload("Event.Phase").
			Preload("Event.Phase.Tournament")
	}

	// Count setelah filter
	if err := query.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	// Ambil data
	if err := query.
		Preload("HomeTeam").
		Preload("AwayTeam").
		Order("id DESC").
		Offset(offset).
		Limit(limit).
		Find(&matches).Error; err != nil {
		return nil, 0, err
	}

	return matches, totalCount, nil
}
