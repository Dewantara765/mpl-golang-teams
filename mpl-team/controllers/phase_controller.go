package controllers

import (
	"mpl-team/config"
	"mpl-team/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func FindPhases(c *gin.Context) {
	var phases []models.Phase
	if err := config.DB.
		Preload("Tournament").
		Preload("Events").Find(&phases).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve phases"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": phases})
}

func FindPhaseByID(c *gin.Context) {
	id := c.Param("id")
	var phase models.Phase

	if err := config.DB.Preload("Events").First(&phase, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Phase not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": phase})
}

func CreatePhase(c *gin.Context) {
	var input struct {
		Name         string `json:"name" binding:"required"`
		TournamentID uint   `json:"tournament_id" binding:"required"`
		Slug         string `json:"slug" binding:"required"`
	}

	errors := make(map[string]string)

	if input.Name == "" {
		errors["name"] = "Name is required"
	}

	if input.Slug == "" {
		errors["slug"] = "Slug is required"
	}

	var tournament models.Tournament
	if err := config.DB.First(&tournament, input.TournamentID).Error; err != nil {
		errors["tournament_id"] = "Tournament not found"
	}

	if len(errors) > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"errors": errors,
		})
		return
	}

	phase := models.Phase{
		Name:         input.Name,
		TournamentID: input.TournamentID,
		Slug:         input.Slug,
	}

	if err := config.DB.Create(&phase).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"errors": map[string]string{
				"phase": "Failed to create phase",
			},
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": phase})
}

func UpdatePhase(c *gin.Context) {
	id := c.Param("id")
	var phase models.Phase

	if err := config.DB.First(&phase, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Phase not found"})
		return
	}

	var input struct {
		Name         string `json:"name"`
		TournamentID uint   `json:"tournament_id"`
		Slug         string `json:"slug"`
	}

	var tournament models.Tournament
	if err := config.DB.First(&tournament, input.TournamentID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tournament not found"})
		return
	}

	phase.Name = input.Name
	phase.TournamentID = input.TournamentID
	phase.Slug = input.Slug

	if err := config.DB.Save(&phase).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to update phase",
			"error":   err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": phase})
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
