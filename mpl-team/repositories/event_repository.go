package repositories

import (
	"mpl-team/models"

	"gorm.io/gorm"
)

type EventRepository struct {
	DB *gorm.DB
}

func NewEventRepository(db *gorm.DB) *EventRepository {
	return &EventRepository{DB: db}
}

func (r *EventRepository) FindAll(
	offset int,
	limit int,
	search string,
) ([]models.Event, int64, error) {
	var events []models.Event
	var totalCount int64

	query := r.DB.Model(&models.Event{})

	// Search
	if search != "" {
		query = query.Where(
			"name LIKE ?",
			"%"+search+"%",
		)
	}

	// Total data setelah search
	if err := query.Count(&totalCount).Error; err != nil {
		return nil, 0, err
	}

	// Get data
	err := query.
		Preload("Phase").
		Preload("Phase.Tournament").
		Offset(offset).
		Limit(limit).
		Find(&events).Error

	if err != nil {
		return nil, 0, err
	}

	return events, totalCount, nil
}

func (r *EventRepository) FindByID(id uint) (*models.Event, error) {
	var event models.Event

	err := r.DB.
		Preload("Matches").
		First(&event, id).Error

	if err != nil {
		return nil, err
	}

	return &event, nil
}

func (r *EventRepository) FindPhaseByID(id uint) (*models.Phase, error) {
	var phase models.Phase

	err := r.DB.
		Preload("Events").
		First(&phase, id).Error

	if err != nil {
		return nil, err
	}

	return &phase, nil
}

func (r *EventRepository) Create(event *models.Event) error {
	return r.DB.Create(event).Error
}

func (r *EventRepository) Update(event *models.Event) error {
	return r.DB.Save(event).Error
}
