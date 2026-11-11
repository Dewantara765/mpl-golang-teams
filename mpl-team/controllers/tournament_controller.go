package controllers

import (
	"errors"
	"mpl-team/config"
	apperrors "mpl-team/errors"
	"mpl-team/models"
	"mpl-team/services"
	"net/http"
	"strconv"

	"gorm.io/gorm"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

type TournamentController struct {
	TournamentService *services.TournamentService
}

func NewTournamentController(
	tournamentService *services.TournamentService,
) *TournamentController {
	return &TournamentController{
		TournamentService: tournamentService,
	}
}

// GET /tournaments
func (tc *TournamentController) FindTournaments(c *gin.Context) {
	tournaments, err := tc.TournamentService.FindTournaments()
	if err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve tournaments"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data": tournaments,
	})
}

func (tc *TournamentController) FindPhaseWithMatches(c *gin.Context) {
	tournamentSlug := c.Param("tournamentSlug")
	phaseSlug := c.Param("phaseSlug")

	phase, err := tc.TournamentService.FindPhaseWithMatches(
		tournamentSlug,
		phaseSlug,
	)

	if err != nil {
		// Sesuaikan dengan handler error milikmu.
		c.JSON(http.StatusNotFound, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": phase,
	})
}

func (tc *TournamentController) FindTournamentBySlug(c *gin.Context) {
	slug := c.Param("slug")

	tournament, err := tc.TournamentService.FindTournamentBySlug(slug)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Tournament not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve tournament",
		})
		return

	}
	c.JSON(http.StatusOK, gin.H{"data": tournament})
}

func FindTournamentByID(c *gin.Context) {
	id := c.Param("id")
	var tournament models.Tournament

	if err := config.DB.Preload("Phases").
		Preload("Phases.Events").
		Preload("Phases.Events.Matches").
		Preload("Phases.Events.Matches.HomeTeam").
		Preload("Phases.Events.Matches.AwayTeam").
		First(&tournament, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tournament not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": tournament})
}

// POST /tournaments
func (tc *TournamentController) CreateTournament(c *gin.Context) {
	var input struct {
		Name      string `json:"name" binding:"required"`
		StartDate string `json:"start_date" binding:"required"`
		EndDate   string `json:"end_date" binding:"required"`
		Slug      string `json:"slug" binding:"required"`
		RegionID  uint   `json:"region_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		errors := make(map[string]string)

		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			for _, fieldErr := range validationErrors {
				switch fieldErr.Field() {
				case "Name":
					errors["name"] = "Name wajib diisi"
				case "StartDate":
					errors["start_date"] = "Start date wajib diisi"
				case "EndDate":
					errors["end_date"] = "End date wajib diisi"
				case "Slug":
					errors["slug"] = "Slug wajib diisi"
				case "RegionID":
					errors["region_id"] = "Region wajib diisi"
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

	tournamentInput := services.CreateTournamentInput{
		Name:      input.Name,
		StartDate: input.StartDate,
		EndDate:   input.EndDate,
		Slug:      input.Slug,
		RegionID:  input.RegionID,
	}

	// Call service
	tournament, err := tc.TournamentService.Create(tournamentInput)
	if err != nil {
		if validationErr, ok := err.(apperrors.ValidationErrors); ok {
			c.JSON(http.StatusBadRequest, gin.H{
				"errors": validationErr,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create tournament",
		})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"data": tournament,
	})
}

type UpdateTournamentInput struct {
	Name      *string `json:"name"`
	StartDate *string `json:"start_date"`
	EndDate   *string `json:"end_date"`
	Slug      *string `json:"slug"`
}

func (tc *TournamentController) UpdateTournament(c *gin.Context) {
	// Ambil ID dari URL
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid tournament ID",
		})
		return
	}

	// Binding JSON
	var input services.UpdateTournamentInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid request body",
		})
		return
	}

	// Panggil service
	tournament, err := tc.TournamentService.UpdateTournament(
		uint(id),
		input,
	)

	if err != nil {
		// Sesuaikan dengan tipe error yang kamu gunakan
		if validationErr, ok := err.(*apperrors.ValidationErrors); ok {
			c.JSON(http.StatusUnprocessableEntity, gin.H{
				"errors": validationErr,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Tournament updated successfully",
		"data":    tournament,
	})
}

func DeleteTournament(c *gin.Context) {
	id := c.Param("id")
	var tournament models.Tournament

	if err := config.DB.First(&tournament, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tournament not found"})
		return
	}

	if err := config.DB.Delete(&tournament).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to delete tournament",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Tournament deleted successfully",
	})
}
