package controllers

import (
	"errors"
	"mpl-team/config"
	apperrors "mpl-team/errors"
	"mpl-team/models"
	"mpl-team/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"gorm.io/gorm"
)

type PhaseController struct {
	PhaseService *services.PhaseService
}

func NewPhaseController(
	phaseService *services.PhaseService,
) *PhaseController {
	return &PhaseController{
		PhaseService: phaseService,
	}
}

func (pc *PhaseController) FindPhases(c *gin.Context) {
	phases, err := pc.PhaseService.FindPhases()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve phases",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": phases})
}

func (pc *PhaseController) FindPhaseByID(c *gin.Context) {
	id, err := strconv.ParseUint(
		c.Param("id"),
		10, 64,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid phase ID"})
		return
	}

	phase, err := pc.PhaseService.FindPhaseByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve phase",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": phase})
}

func (pc *PhaseController) CreatePhase(c *gin.Context) {
	var input struct {
		Name         string `json:"name" binding:"required"`
		TournamentID uint   `json:"tournament_id" binding:"required"`
		Slug         string `json:"slug" binding:"required"`
		HasStanding  bool   `json:"has_standing"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		errors := make(map[string]string)
		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			for _, fieldErr := range validationErrors {
				switch fieldErr.Field() {
				case "Name":
					errors["name"] = "Name wajib diisi"
				case "TournamentID":
					errors["tournament_id"] = "Tournament wajib diisi"
				case "Slug":
					errors["slug"] = "Slug wajib diisi"
				case "HasStanding":
					errors["has_standing"] = "Has Standing wajib diisi"
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

	phaseInput := services.CreatePhaseInput{
		Name:         input.Name,
		TournamentID: input.TournamentID,
		Slug:         input.Slug,
		HasStanding:  input.HasStanding,
	}

	phase, err := pc.PhaseService.Create(phaseInput)
	if err != nil {
		if validationErr, ok := err.(apperrors.ValidationErrors); ok {
			c.JSON(http.StatusBadRequest, gin.H{
				"errors": validationErr,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create phase",
		})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"data": phase})
}

func (pc *PhaseController) UpdatePhase(c *gin.Context) {
	idParam := c.Param("id")

	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid phase ID",
		})
		return
	}

	var input struct {
		Name        *string `json:"name"`
		Slug        *string `json:"slug"`
		HasStanding *bool   `json:"has_standing"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	updateInput := services.UpdatePhaseInput{
		Name:        input.Name,
		Slug:        input.Slug,
		HasStanding: input.HasStanding,
	}

	phase, err := pc.PhaseService.Update(
		uint(id),
		updateInput,
	)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Phase not found",
			})
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": phase,
	})
}

func DeletePhase(c *gin.Context) {
	id := c.Param("id")
	var phase models.Phase

	if err := config.DB.First(&phase, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Phase not found"})
		return
	}

	if err := config.DB.Delete(&phase).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to delete phase",
			"error":   err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Phase deleted successfully"})
}
