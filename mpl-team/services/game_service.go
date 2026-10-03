package services

import (
	"errors"
	"fmt"
	"mpl-team/models"
	"mpl-team/repositories"

	"gorm.io/gorm"
)

type GameService struct {
	DB              *gorm.DB
	GameRepository  *repositories.GameRepository
	MatchRepository *repositories.MatchRepository
	TeamRepository  *repositories.TeamRepository
	StandingService *StandingService
}

func NewGameService(
	db *gorm.DB,
	gameRepository *repositories.GameRepository,
	matchRepository *repositories.MatchRepository,
	teamRepository *repositories.TeamRepository,
	standingService *StandingService,
) *GameService {

	return &GameService{
		DB:              db,
		GameRepository:  gameRepository,
		MatchRepository: matchRepository,
		TeamRepository:  teamRepository,
		StandingService: standingService,
	}
}

type CreateGameInput struct {
	MatchID      uint
	GameNumber   int
	Duration     int
	WinnerTeamID uint
}

func (s *GameService) FindByID(
	id uint,
) (*models.Game, error) {
	return s.GameRepository.FindByID(id)
}

func (s *GameService) CreateGame(
	input CreateGameInput,
) (*models.Game, error) {

	err := s.DB.Transaction(func(tx *gorm.DB) error {

		// =========================
		// Get Match
		// =========================

		match, err := s.MatchRepository.FindByIDForGame(tx, input.MatchID)

		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("match not found")
			}

			return err
		}

		// =========================
		// Check Match Status
		// =========================

		if match.Status == models.MatchCompleted {
			return fmt.Errorf("match is already completed")
		}

		if match.Status == models.MatchCancelled {
			return fmt.Errorf("match is cancelled")
		}

		if match.Status == models.MatchPostponed {
			return fmt.Errorf("match is postponed")
		}

		// =========================
		// Validate Best Of
		// =========================

		if match.BestOf == nil || *match.BestOf <= 0 {
			return fmt.Errorf("invalid best of")
		}

		// =========================
		// Validate Winner
		// =========================

		if input.WinnerTeamID != match.HomeTeamID &&
			input.WinnerTeamID != match.AwayTeamID {

			return fmt.Errorf(
				"winner team must be one of the teams in this match",
			)
		}

		// =========================
		// Validate Team Exists
		// =========================

		_, err = s.TeamRepository.FindByID(
			tx,
			input.WinnerTeamID,
		)

		if err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("winner team not found")
			}

			return err
		}

		// =========================
		// Calculate Required Wins
		// =========================

		winsNeeded := (*match.BestOf / 2) + 1

		// =========================
		// Get Existing Games
		// =========================

		games, err := s.GameRepository.FindByMatchID(
			tx,
			match.ID,
		)

		if err != nil {
			return err
		}

		// =========================
		// Validate Game Number
		// =========================

		expectedGameNumber := len(games) + 1

		if input.GameNumber != expectedGameNumber {
			return fmt.Errorf(
				"game number must be %d",
				expectedGameNumber,
			)
		}

		// =========================
		// Check Maximum Games
		// =========================

		if len(games) >= *match.BestOf {
			return fmt.Errorf("maximum number of games reached")
		}

		// =========================
		// Create Game
		// =========================

		game := &models.Game{
			MatchID:      input.MatchID,
			GameNumber:   input.GameNumber,
			Duration:     input.Duration,
			WinnerTeamID: input.WinnerTeamID,
		}

		if err := s.GameRepository.Create(tx, game); err != nil {
			return err
		}

		// =========================
		// Calculate Score
		// =========================

		homeScore := 0
		awayScore := 0

		for _, g := range games {

			if g.WinnerTeamID == match.HomeTeamID {
				homeScore++
			}

			if g.WinnerTeamID == match.AwayTeamID {
				awayScore++
			}
		}

		// Tambahkan game baru

		if input.WinnerTeamID == match.HomeTeamID {
			homeScore++
		}

		if input.WinnerTeamID == match.AwayTeamID {
			awayScore++
		}

		// =========================
		// Determine Status
		// =========================

		status := models.MatchLive

		if homeScore >= winsNeeded ||
			awayScore >= winsNeeded {

			status = models.MatchCompleted
		}

		match.HomeScore = &homeScore
		match.AwayScore = &awayScore
		match.Status = status

		if err := s.MatchRepository.UpdateScoreAndStatus(
			tx,
			match,
			homeScore,
			awayScore,
			status,
		); err != nil {
			return err
		}

		if status == models.MatchCompleted {

			if err := s.StandingService.UpdateFromCompletedMatch(
				tx,
				match,
			); err != nil {
				return err
			}
		}

		// =========================
		// Update Match
		// =========================

		if err := s.MatchRepository.UpdateScoreAndStatus(
			tx,
			match,
			homeScore,
			awayScore,
			status,
		); err != nil {
			return err
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Ambil ulang supaya WinnerTeam ter-preload
	game, err := s.GameRepository.FindByMatchAndGameNumber(
		input.MatchID,
		input.GameNumber,
	)

	if err != nil {
		return nil, err
	}

	return game, nil
}
