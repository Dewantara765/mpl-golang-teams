package repositories

import (
	"mpl-team/models"

	"gorm.io/gorm"
)

type TournamentRepository struct {
	DB *gorm.DB
}

func NewTournamentRepository(db *gorm.DB) *TournamentRepository {
	return &TournamentRepository{DB: db}
}

func (r *TournamentRepository) FindAll() ([]models.Tournament, error) {
	var tournaments []models.Tournament
	err := r.DB.Preload("Phases").Find(&tournaments).Error
	return tournaments, err
}

func (r *TournamentRepository) FindBySlug(slug string) (*models.Tournament, error) {
	var tournament models.Tournament

	if err := r.DB.Preload("Phases").
		Preload("Phases.Events").
		Preload("Phases.Standings", func(db *gorm.DB) *gorm.DB {
			return db.Order(`
				match_win DESC,
				game_diff DESC,
				game_win DESC,
				id DESC
			`)
		}).
		Preload("Phases.Standings.Team").
		Preload("Phases.Events.Matches", func(db *gorm.DB) *gorm.DB {
			return db.Where("status = ?", "completed")
		}).
		First(&tournament, "slug = ?", slug).Error; err != nil {
		return nil, err
	}

	return &tournament, nil

}

func (r *TournamentRepository) FindByID(id uint) (*models.Tournament, error) {
	var tournament models.Tournament

	if err := r.DB.Preload("Phases").
		Preload("Phases.Events").
		Preload("Phases.Standings", func(db *gorm.DB) *gorm.DB {
			return db.Order(`
				match_win DESC,
				game_diff DESC,
				game_win DESC,
				id DESC
			`)
		}).
		Preload("Phases.Standings.Team").
		Preload("Phases.Events.Matches", func(db *gorm.DB) *gorm.DB {
			return db.Where("status = ?", "completed")
		}).
		First(&tournament, id).Error; err != nil {
		return nil, err
	}

	return &tournament, nil

}

func (r *TournamentRepository) FindRegionByID(id uint) (*models.Region, error) {
	var region models.Region
	if err := r.DB.First(&region, id).Error; err != nil {
		return nil, err
	}
	return &region, nil

}

func (r *TournamentRepository) Create(tournament *models.Tournament) error {
	return r.DB.Create(tournament).Error
}

func (r *TournamentRepository) Update(tournament *models.Tournament) error {
	return r.DB.Save(tournament).Error
}

func (r *TournamentRepository) FindPhaseWithMatches(
	tournamentSlug string,
	phaseSlug string,
) (*models.Phase, error) {

	var phase models.Phase

	err := r.DB.
		Joins("JOIN tournaments ON tournaments.id = phases.tournament_id").
		Where("tournaments.slug = ?", tournamentSlug).
		Where("phases.slug = ?", phaseSlug).
		Preload("Tournament").
		Preload("Events").
		Preload("Events.Matches").
		Preload("Events.Matches.HomeTeam").
		Preload("Events.Matches.AwayTeam").
		Preload("Events.Matches.Games").
		Preload("Events.Matches.Games.HeroDrafts").
		Preload("Events.Matches.Games.HeroDrafts.Hero").
		First(&phase).Error

	if err != nil {
		return nil, err
	}

	return &phase, nil
}
