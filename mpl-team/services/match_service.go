package services

import (
	"errors"
	"time"

	"mpl-team/models"
	"mpl-team/repositories"
)

type MatchService struct {
	MatchRepository    *repositories.MatchRepository
	StandingRepository *repositories.StandingRepository
}

func NewMatchService(
	matchRepository *repositories.MatchRepository,
	standingRepository *repositories.StandingRepository,
) *MatchService {
	return &MatchService{
		MatchRepository:    matchRepository,
		StandingRepository: standingRepository,
	}
}

type CreateMatchInput struct {
	HomeTeamID uint
	AwayTeamID uint
	EventID    uint
	BestOf     *int
	Date       string
	Time       string
}

func (s *MatchService) CreateMatch(
	input CreateMatchInput,
) (*models.Match, error) {

	// 1. Validate home & away
	if input.HomeTeamID == input.AwayTeamID {
		return nil, errors.New(
			"home team and away team cannot be the same",
		)
	}

	// 2. Validate date
	if _, err := time.Parse("2006-01-02", input.Date); err != nil {
		return nil, errors.New(
			"invalid date format, use YYYY-MM-DD",
		)
	}

	// 3. Validate time
	if _, err := time.Parse("15:04:05", input.Time); err != nil {
		return nil, errors.New(
			"invalid time format, use HH:MM:SS",
		)
	}

	// 4. Validate BestOf
	if input.BestOf != nil {
		if *input.BestOf != 3 &&
			*input.BestOf != 5 &&
			*input.BestOf != 7 {

			return nil, errors.New(
				"best of must be 3, 5 or 7",
			)
		}
	}

	// 5. Check home team
	if _, err := s.MatchRepository.FindTeamByID(input.HomeTeamID); err != nil {
		return nil, errors.New("home team not found")
	}

	// 6. Check away team
	if _, err := s.MatchRepository.FindTeamByID(input.AwayTeamID); err != nil {
		return nil, errors.New("away team not found")
	}

	// 7. Check event
	if _, err := s.MatchRepository.FindEventByID(input.EventID); err != nil {
		return nil, errors.New("event not found")
	}

	// 8. Create model
	match := &models.Match{
		HomeTeamID: input.HomeTeamID,
		AwayTeamID: input.AwayTeamID,
		EventID:    input.EventID,
		Date:       input.Date,
		Time:       input.Time,
		BestOf:     input.BestOf,
		Status:     models.MatchScheduled,
	}

	// 9. Save
	if err := s.MatchRepository.Create(match); err != nil {
		return nil, err
	}

	// 10. Load relationships
	return s.MatchRepository.FindByID(match.ID)
}

type MatchPagination struct {
	Data       []models.Match `json:"data"`
	Page       int            `json:"page"`
	PageSize   int            `json:"pageSize"`
	TotalPage  int            `json:"totalPage"`
	TotalCount int64          `json:"totalCount"`
}

func (s *MatchService) FindMatches(
	page int,
	pageSize int,
) (*MatchPagination, error) {

	if page < 1 {
		page = 1
	}

	if pageSize < 1 {
		pageSize = 7
	}

	offset := (page - 1) * pageSize

	matches, totalCount, err :=
		s.MatchRepository.FindAll(offset, pageSize)

	if err != nil {
		return nil, err
	}

	totalPage := int(totalCount) / pageSize

	if totalCount%int64(pageSize) != 0 {
		totalPage++
	}

	return &MatchPagination{
		Data:       matches,
		Page:       page,
		PageSize:   pageSize,
		TotalPage:  totalPage,
		TotalCount: totalCount,
	}, nil
}

func (s *MatchService) FindMatchByID(id uint) (*models.Match, error) {
	return s.MatchRepository.FindByID(id)
}

type UpdateMatchInput struct {
	BestOf *int
	Date   *string
	Time   *string
}

func (s *MatchService) UpdateMatch(id uint,
	input UpdateMatchInput,
) (*models.Match, error) {

	match, err := s.MatchRepository.FindByID(id)
	if err != nil {
		return nil, err
	}

	if match.Status == "completed" {
		return nil, errors.New(
			"completed match cannot be updated",
		)
	}

	if input.Date != nil {
		match.Date = *input.Date
	}

	if input.Time != nil {
		match.Time = *input.Time
	}

	if input.BestOf != nil {
		match.BestOf = input.BestOf
	}

	if err := s.MatchRepository.Update(match); err != nil {
		return nil, err
	}

	return match, nil

}

func (s *MatchService) CompleteMatch(matchID uint) error {

	match, err := s.MatchRepository.FindByID(matchID)
	if err != nil {
		return err
	}

	if match.Status == "completed" {
		return errors.New("match already completed")
	}

	homeScore := 0
	awayScore := 0

	for _, game := range match.Games {
		switch game.WinnerTeamID {
		case match.HomeTeamID:
			homeScore++
		case match.AwayTeamID:
			awayScore++
		}
	}

	if homeScore == awayScore {
		return errors.New("match must have a winner")
	}

	match.HomeScore = &homeScore
	match.AwayScore = &awayScore
	match.Status = "completed"

	if err := s.MatchRepository.Update(match); err != nil {
		return err
	}

	// Hanya phase yang memiliki standing
	if match.Event.Phase.HasStanding {

		if err := s.StandingRepository.UpdateAfterMatch(
			match.Event.PhaseID,
			match.HomeTeamID,
			match.AwayTeamID,
			homeScore,
			awayScore,
		); err != nil {
			return err
		}
	}

	return nil
}

func (s *MatchService) UpdateStandingFromCompletedMatch(matchID uint) error {
	match, err := s.MatchRepository.FindByID(matchID)

	if err != nil {
		return err
	}

	if match.Status != "completed" {
		return errors.New("match is not completed")
	}

	if match.HomeScore == nil || match.AwayScore == nil {
		return errors.New("match score is not available")
	}

	if !match.Event.Phase.HasStanding {
		return nil
	}

	return s.StandingRepository.UpdateAfterMatch(
		match.Event.PhaseID,
		match.HomeTeamID,
		match.AwayTeamID,
		*match.HomeScore,
		*match.AwayScore,
	)
}
