package repositories

import (
	"mpl-team/config"
	"mpl-team/models"

	"gorm.io/gorm"
)

type StandingRepository struct {
	DB *gorm.DB
}

func NewStandingRepository() *StandingRepository {
	return &StandingRepository{
		DB: config.DB,
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
