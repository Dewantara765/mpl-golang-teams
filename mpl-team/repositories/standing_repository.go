package repositories

import (
	"mpl-team/models"

	"gorm.io/gorm"
)

type StandingRepository struct {
	DB *gorm.DB
}

func NewStandingRepository(db *gorm.DB) *StandingRepository {
	return &StandingRepository{
		DB: db,
	}
}

func (r *StandingRepository) UpdateAfterMatch(
	phaseID uint,
	homeTeamID uint,
	awayTeamID uint,
	homeScore int,
	awayScore int,
) error {

	var homeStanding models.Standing
	var awayStanding models.Standing

	if err := r.DB.
		Where("phase_id = ? AND team_id = ?", phaseID, homeTeamID).
		First(&homeStanding).Error; err != nil {
		return err
	}

	if err := r.DB.
		Where("phase_id = ? AND team_id = ?", phaseID, awayTeamID).
		First(&awayStanding).Error; err != nil {
		return err
	}

	homeStanding.MatchPlayed++
	awayStanding.MatchPlayed++

	homeStanding.GameWin += homeScore
	homeStanding.GameLose += awayScore

	awayStanding.GameWin += awayScore
	awayStanding.GameLose += homeScore

	homeStanding.GameDiff += homeScore - awayScore
	awayStanding.GameDiff += awayScore - homeScore

	if homeScore > awayScore {
		homeStanding.MatchWin++
		awayStanding.MatchLose++
	} else {
		awayStanding.MatchWin++
		homeStanding.MatchLose++
	}

	if err := r.DB.Save(&homeStanding).Error; err != nil {
		return err
	}

	if err := r.DB.Save(&awayStanding).Error; err != nil {
		return err
	}

	return nil
}

func (r *StandingRepository) FindByTeamAndPhase(
	tx *gorm.DB,
	teamID uint,
	phaseID uint,
) (*models.Standing, error) {

	var standing models.Standing

	err := tx.
		Where(
			"team_id = ? AND phase_id = ?",
			teamID,
			phaseID,
		).
		First(&standing).Error

	if err != nil {
		return nil, err
	}

	return &standing, nil
}

func (r *StandingRepository) Update(
	tx *gorm.DB,
	standing *models.Standing,
) error {

	return tx.Model(standing).Updates(map[string]interface{}{
		"match_played": standing.MatchPlayed,
		"match_win":    standing.MatchWin,
		"match_lose":   standing.MatchLose,
		"game_win":     standing.GameWin,
		"game_lose":    standing.GameLose,
		"game_diff":    standing.GameDiff,
	}).Error
}
