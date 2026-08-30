package controllers

import (
	"mpl-team/config"
	"mpl-team/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GET /tournaments
func FindTournaments(c *gin.Context) {
	var tournaments []models.Tournament
	if err := config.DB.Preload("Phases").Find(&tournaments).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve tournaments"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data": tournaments,
	})
}

func FindTournamentBySlug(c *gin.Context) {
	slug := c.Param("slug")
	var tournament models.Tournament

	if err := config.DB.Preload("Phases").
		Preload("Phases.Events").
		Preload("Phases.Events.Matches").
		Preload("Phases.Events.Matches.HomeTeam").
		Preload("Phases.Events.Matches.AwayTeam").First(&tournament, "slug = ?", slug).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tournament not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": tournament})
}

// POST /tournaments
func CreateTournament(c *gin.Context) {
	var input struct {
		Name      string `json:"name" binding:"required"`
		StartDate string `json:"start_date" binding:"required"`
		EndDate   string `json:"end_date" binding:"required"`
		Slug      string `json:"slug" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	tournament := models.Tournament{
		Name:      input.Name,
		StartDate: input.StartDate,
		EndDate:   input.EndDate,
		Slug:      input.Slug,
	}

	if err := config.DB.Create(&tournament).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create tournament",
			"error":   err.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"message": "Tournament created successfully",
		"data":    tournament,
	})
}

func UpdateTournament(c *gin.Context) {
	id := c.Param("id")
	var tournament models.Tournament

	if err := config.DB.First(&tournament, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Tournament not found"})
		return
	}

	var input struct {
		Name      string `json:"name"`
		StartDate string `json:"start_date"`
		EndDate   string `json:"end_date"`
		Slug      string `json:"slug"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid input",
			"error":   err.Error(),
		})
		return
	}

	tournament.Name = input.Name
	tournament.StartDate = input.StartDate
	tournament.EndDate = input.EndDate
	tournament.Slug = input.Slug

	if err := config.DB.Save(&tournament).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to update tournament",
			"error":   err.Error(),
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
