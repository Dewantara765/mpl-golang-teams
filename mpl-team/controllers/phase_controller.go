package controllers

import (
	"mpl-team/config"
	"mpl-team/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func FindPhases(c *gin.Context) {
	var phases []models.Phase
	if err := config.DB.Preload("Events").Find(&phases).Error; err != nil {
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
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	phase := models.Phase{
		Name:         input.Name,
		TournamentID: input.TournamentID,
	}

	if err := config.DB.Create(&phase).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create phase",
			"error":   err.Error()})
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
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid input",
			"error":   err.Error()})
		return
	}

	phase.Name = input.Name
	phase.TournamentID = input.TournamentID

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
