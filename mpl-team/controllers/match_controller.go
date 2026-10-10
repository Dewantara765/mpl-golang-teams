package controllers

import (
	"errors"
	"mpl-team/config"
	apperrors "mpl-team/errors"
	"mpl-team/models"
	"mpl-team/services"
	"net/http"
	"strconv"

	"github.com/go-playground/validator/v10"

	"gorm.io/gorm"

	"github.com/gin-gonic/gin"
)

type MatchController struct {
	MatchService *services.MatchService
}

func NewMatchController(
	matchService *services.MatchService,
) *MatchController {
	return &MatchController{
		MatchService: matchService,
	}
}

func (mc *MatchController) FindMatches(c *gin.Context) {

	page, err := strconv.Atoi(
		c.DefaultQuery("page", "1"),
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid page",
		})
		return
	}

	pageSize, err := strconv.Atoi(
		c.DefaultQuery("pageSize", "7"),
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid pageSize",
		})
		return
	}

	result, err := mc.MatchService.FindMatches(
		page,
		pageSize,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve matches",
		})
		return
	}

	c.JSON(http.StatusOK, result)
}

func (mc *MatchController) FindMatchByID(c *gin.Context) {

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

	match, err := mc.MatchService.FindMatchByID(uint(id))

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Match not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve match",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": match,
	})
}

func (mc *MatchController) CreateMatch(c *gin.Context) {

	var input struct {
		HomeTeamID uint   `json:"home_team_id" binding:"required"`
		AwayTeamID uint   `json:"away_team_id" binding:"required"`
		EventID    uint   `json:"event_id" binding:"required"`
		BestOf     *int   `json:"best_of"`
		Date       string `json:"date" binding:"required"`
		Time       string `json:"time" binding:"required"`
	}

	// Binding HTTP request
	if err := c.ShouldBindJSON(&input); err != nil {
		errors := make(map[string]string)

		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			for _, fieldErr := range validationErrors {
				switch fieldErr.Field() {
				case "HomeTeamID":
					errors["home_team_id"] = "Home team wajib diisi"
				case "AwayTeamID":
					errors["away_team_id"] = "Away team wajib diisi"
				case "EventID":
					errors["event_id"] = "Event wajib diisi"
				case "Date":
					errors["date"] = "Date wajib diisi"
				case "Time":
					errors["time"] = "Time wajib diisi"
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

	// Convert HTTP input → service input
	matchInput := services.CreateMatchInput{
		HomeTeamID: input.HomeTeamID,
		AwayTeamID: input.AwayTeamID,
		EventID:    input.EventID,
		BestOf:     input.BestOf,
		Date:       input.Date,
		Time:       input.Time,
	}

	// Call service
	match, err := mc.MatchService.CreateMatch(matchInput)
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
		"data": match,
	})
}

func (mc *MatchController) UpdateMatch(c *gin.Context) {
	idParam := c.Param("id")

	id, err := strconv.ParseUint(idParam, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid match ID",
		})
		return
	}

	var input struct {
		Date   *string `json:"date"`
		Time   *string `json:"time"`
		BestOf *int    `json:"best_of"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	updateInput := services.UpdateMatchInput{
		Date:   input.Date,
		Time:   input.Time,
		BestOf: input.BestOf,
	}

	match, err := mc.MatchService.UpdateMatch(
		uint(id),
		updateInput,
	)

	if err != nil {
		if err.Error() == "completed match cannot be updated" {
			c.JSON(http.StatusUnprocessableEntity, gin.H{
				"error": err.Error(),
			})
			return
		}

		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Match not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Match updated successfully",
		"data":    match,
	})
}

func (mc *MatchController) CompleteMatch(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid match ID",
		})
		return
	}

	if err := mc.MatchService.CompleteMatch(uint(id)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Match completed successfully",
	})
}

func (mc *MatchController) UpdateStandingFromCompletedMatch(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid match ID",
		})
		return
	}

	err = mc.MatchService.UpdateStandingFromCompletedMatch(uint(id))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Standing updated successfully",
	})
}

func DeleteMatch(c *gin.Context) {
	id := c.Param("id")
	var match models.Match

	if err := config.DB.First(&match, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
		return
	}

	if err := config.DB.Delete(&match).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete match"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": true})
}
