package services

import (
	"errors"

	"mpl-team/models"
	"mpl-team/repositories"

	"gorm.io/gorm"
)

type HeroDraftService interface {
	CreateMany(
		gameID uint,
		teamID uint,
		draftType models.HeroDraftType,
		heroIDs []uint,
	) error

	GetByGameID(
		gameID uint,
	) ([]models.HeroDraft, error)

	GetByID(
		id uint,
	) (*models.HeroDraft, error)

	Delete(
		id uint,
	) error
}

type heroDraftService struct {
	db         *gorm.DB
	repository *repositories.HeroDraftRepository
}

func NewHeroDraftService(
	db *gorm.DB,
	repository *repositories.HeroDraftRepository,
) *heroDraftService {
	return &heroDraftService{
		db:         db,
		repository: repository,
	}
}

func (s *heroDraftService) CreateMany(
	gameID uint,
	teamID uint,
	draftType models.HeroDraftType,
	heroIDs []uint,
) error {
	if gameID == 0 {
		return errors.New("game_id is required")
	}

	if teamID == 0 {
		return errors.New("team_id is required")
	}

	if draftType != models.HeroDraftPick &&
		draftType != models.HeroDraftBan {
		return errors.New("type must be pick or ban")
	}

	if len(heroIDs) < 1 {
		return errors.New("hero_ids is required")
	}

	if len(heroIDs) > 5 {
		return errors.New("maximum 5 heroes")
	}

	// Validasi hero duplikat dalam request yang sama.
	seen := make(map[uint]bool)

	for _, heroID := range heroIDs {
		if heroID == 0 {
			return errors.New("hero_id cannot be 0")
		}

		if seen[heroID] {
			return errors.New(
				"hero cannot be selected more than once",
			)
		}

		seen[heroID] = true
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		// Validasi hero yang sudah dipick atau diban.
		exists, err := s.repository.ExistsByGameIDAndHeroIDs(
			tx,
			gameID,
			heroIDs,
		)
		if err != nil {
			return err
		}

		if exists {
			return errors.New(
				"one or more heroes have already been picked or banned in this game",
			)
		}

		drafts := make([]models.HeroDraft, 0, len(heroIDs))

		for _, heroID := range heroIDs {
			drafts = append(drafts, models.HeroDraft{
				GameID: gameID,
				TeamID: teamID,
				HeroID: heroID,
				Type:   draftType,
			})
		}

		return s.repository.CreateMany(tx, drafts)
	})
}

func (s *heroDraftService) GetByGameID(
	gameID uint,
) ([]models.HeroDraft, error) {

	return s.repository.FindByGameID(gameID)
}

func (s *heroDraftService) GetByID(
	id uint,
) (*models.HeroDraft, error) {

	return s.repository.FindByID(id)
}

func (s *heroDraftService) Delete(
	id uint,
) error {

	return s.repository.Delete(id)
}
