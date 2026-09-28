package services

import (
	"fmt"
	"mpl-team/models"
	"mpl-team/repositories"

	"gorm.io/gorm"
)

type StandingService struct {
	DB                 *gorm.DB
	StandingRepository *repositories.StandingRepository
}

func NewStandingService(
	standingRepository *repositories.StandingRepository,
) *StandingService {

	return &StandingService{
		StandingRepository: standingRepository,
	}
}

func (s *StandingService) UpdateFromCompletedMatch(
	tx *gorm.DB,
	match *models.Match,
) error {

	if !match.Event.Phase.HasStanding {
		return nil
	}

	if match.Status != models.MatchCompleted {
		return fmt.Errorf("match is not completed")
	}

	homeScore := 0
	awayScore := 0

	if match.HomeScore != nil {
		homeScore = *match.HomeScore
	}

	if match.AwayScore != nil {
		awayScore = *match.AwayScore
	}

	homeStanding, err := s.StandingRepository.FindByTeamAndPhase(
		tx,
		match.HomeTeamID,
		match.Event.PhaseID,
	)

	if err != nil {
		return err
	}

	awayStanding, err := s.StandingRepository.FindByTeamAndPhase(
		tx,
		match.AwayTeamID,
		match.Event.PhaseID,
	)

	if err != nil {
		return err
	}

	// Match Played
	homeStanding.MatchPlayed++
	awayStanding.MatchPlayed++

	// Match Win / Lose
	if homeScore > awayScore {
		homeStanding.MatchWin++
		awayStanding.MatchLose++
	} else {
		awayStanding.MatchWin++
		homeStanding.MatchLose++
	}

	// Game Win / Lose
	homeStanding.GameWin += homeScore
	homeStanding.GameLose += awayScore
	homeStanding.GameDiff = homeStanding.GameWin - homeStanding.GameLose

	awayStanding.GameWin += awayScore
	awayStanding.GameLose += homeScore
	awayStanding.GameDiff = awayStanding.GameWin - awayStanding.GameLose

	if err := s.StandingRepository.Update(tx, homeStanding); err != nil {
		return err
	}

	if err := s.StandingRepository.Update(tx, awayStanding); err != nil {
		return err
	}

	return nil
}
