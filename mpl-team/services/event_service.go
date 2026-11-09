package services

import (
	apperrors "mpl-team/errors"
	"mpl-team/helpers"
	"mpl-team/models"
	"mpl-team/repositories"
)

type EventService struct {
	EventRepository *repositories.EventRepository
}

func NewEventService(
	eventRepository *repositories.EventRepository,
) *EventService {
	return &EventService{
		EventRepository: eventRepository,
	}
}

type EventPagination struct {
	Data []models.Event `json:"data"`
	helpers.Pagination
}

func (s *EventService) FindEvents(
	pagination helpers.Pagination,
) (*EventPagination, error) {

	events, totalCount, err := s.EventRepository.FindAll(
		pagination.Offset,
		pagination.PageSize,
		pagination.Search,
	)

	if err != nil {
		return nil, err
	}

	pagination.SetTotal(totalCount)

	return &EventPagination{
		Data:       events,
		Pagination: pagination,
	}, nil
}

func (s *EventService) FindEventByID(id uint) (*models.Event, error) {
	return s.EventRepository.FindByID(id)
}

type CreateEventInput struct {
	Name    string
	Type    string
	PhaseID uint
}

func (s *EventService) CreateEvent(input CreateEventInput) (*models.Event, error) {

	if _, err := s.EventRepository.FindPhaseByID(input.PhaseID); err != nil {
		return nil, apperrors.ValidationErrors{
			"phase_id": "phase not found",
		}
	}

	event := &models.Event{
		Name:    input.Name,
		Type:    input.Type,
		PhaseID: input.PhaseID,
	}

	if err := s.EventRepository.Create(event); err != nil {
		return nil, err
	}

	// 10. Load relationships
	return s.EventRepository.FindByID(event.ID)

}

type UpdateEventInput struct {
	Name *string
	Type *string
}

func (s *EventService) UpdateEvent(id uint, input UpdateEventInput) (*models.Event, error) {

	event, err := s.EventRepository.FindByID(id)
	if err != nil {
		return nil, err
	}

	if input.Name != nil {
		event.Name = *input.Name
	}

	if input.Type != nil {
		event.Type = *input.Type
	}

	if err := s.EventRepository.Update(event); err != nil {
		return nil, err
	}

	return event, nil

}
