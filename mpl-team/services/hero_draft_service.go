package services

import (
	"errors"

	apperrors "mpl-team/errors"
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
		return apperrors.ValidationErrors{
			"game_id": "Game wajib diisi",
		}
	}

	if teamID == 0 {
		return apperrors.ValidationErrors{
			"team_id": "Tim wajib diisi",
		}
	}

	if draftType != models.HeroDraftPick &&
		draftType != models.HeroDraftBan {
		return apperrors.ValidationErrors{
			"type": "Type harus pick atau ban",
		}
	}

	if len(heroIDs) != 5 {
		return apperrors.ValidationErrors{
			"hero_ids": "Pilih tepat 5 hero",
		}
	}

	seen := make(map[uint]bool)

	for _, heroID := range heroIDs {
		if heroID == 0 {
			return apperrors.ValidationErrors{
				"hero_ids": "Hero ID tidak valid",
			}
		}

		if seen[heroID] {
			return apperrors.ValidationErrors{
				"hero_ids": "Hero tidak boleh dipilih lebih dari sekali",
			}
		}

		seen[heroID] = true
	}

	return s.db.Transaction(func(tx *gorm.DB) error {
		count, err := s.repository.CountByGameIDAndType(
			tx,
			gameID,
			teamID,
			draftType,
		)
		if err != nil {
			return err
		}

		if count+int64(len(heroIDs)) > 5 {
			message := "Maksimal 5 hero pick per tim dalam satu game"

			if draftType == models.HeroDraftBan {
				message = "Maksimal 5 hero ban per tim dalam satu game"
			}

			return apperrors.ValidationErrors{
				"hero_ids": message,
			}
		}
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
