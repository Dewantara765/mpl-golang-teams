package controllers

import (
	"errors"
	"mpl-team/config"
	apperrors "mpl-team/errors"
	"mpl-team/helpers"
	"mpl-team/models"
	"mpl-team/services"
	"net/http"
	"strconv"

	"gorm.io/gorm"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type EventController struct {
	EventService *services.EventService
}

func NewEventController(
	eventService *services.EventService,
) *EventController {
	return &EventController{
		EventService: eventService,
	}
}

func (ec *EventController) FindEvents(c *gin.Context) {
	pagination, err := helpers.GetPagination(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	result, err := ec.EventService.FindEvents(pagination)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve matches",
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (ec *EventController) FindEventByID(c *gin.Context) {

	id, err := strconv.ParseUint(
		c.Param("id"),
		10,
		64,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid match ID",
		})
		return
	}

	event, err := ec.EventService.FindEventByID(uint(id))

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Event not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve event",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": event,
	})
}

func (ec *EventController) CreateEvent(c *gin.Context) {
	var input struct {
		Name    string `json:"name" binding:"required"`
		Type    string `json:"type" binding:"required"`
		PhaseID uint   `json:"phase_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		errors := make(map[string]string)

		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			for _, fieldErr := range validationErrors {
				switch fieldErr.Field() {
				case "Name":
					errors["name"] = "Name wajib diisi"
				case "Type":
					errors["type"] = "Type wajib diisi"
				case "PhaseID":
					errors["phase_id"] = "Phase wajib diisi"
				}
			}
		} else {
			errors["general"] = "Invalid request data"
		}

		c.JSON(http.StatusBadRequest, gin.H{
			"errors": errors,
		})
		return
	}

	eventInput := services.CreateEventInput{
		Name:    input.Name,
		Type:    input.Type,
		PhaseID: input.PhaseID,
	}

	// Call service
	event, err := ec.EventService.CreateEvent(eventInput)
	if err != nil {
		if validationErr, ok := err.(apperrors.ValidationErrors); ok {
			c.JSON(http.StatusBadRequest, gin.H{
				"errors": validationErr,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create match",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": event,
	})
}

func (ec *EventController) UpdateEvent(c *gin.Context) {
	idParam := c.Param("id")

	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid match ID",
		})
		return
	}

	var input struct {
		Name *string `json:"name"`
		Type *string `json:"type"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	updateInput := services.UpdateEventInput{
		Name: input.Name,
		Type: input.Type,
	}

	event, err := ec.EventService.UpdateEvent(
		uint(id),
		updateInput,
	)

	if err != nil {

		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Event not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Event updated successfully",
		"data":    event,
	})
}

func DeleteEvent(c *gin.Context) {
	id := c.Param("id")
	var event models.Event

	if err := config.DB.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	if err := config.DB.Delete(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to delete event",
			"error":   err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event deleted successfully"})
}
