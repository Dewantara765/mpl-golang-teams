package controllers

import (
	"mpl-team/config"
	"mpl-team/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func FindEvents(c *gin.Context) {
	var events []models.Event
	if err := config.DB.Preload("Phase").
		Preload("Phase.Tournament").
		Preload("Matches").Find(&events).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve events"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data": events,
	})
}

func FindEventByID(c *gin.Context) {
	id := c.Param("id")
	var event models.Event

	if err := config.DB.Preload("Matches").First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": event})
}

func CreateEvent(c *gin.Context) {
	var input struct {
		Name    string `json:"name" binding:"required"`
		Type    string `json:"type" binding:"required"`
		PhaseID uint   `json:"phase_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var phase models.Phase
	if err := config.DB.First(&phase, input.PhaseID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Phase not found"})
		return
	}

	event := models.Event{
		Name:    input.Name,
		Type:    input.Type,
		PhaseID: input.PhaseID,
	}

	if err := config.DB.Create(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create event",
			"error":   err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": event})
}

func UpdateEvent(c *gin.Context) {
	id := c.Param("id")
	var event models.Event

	if err := config.DB.First(&event, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		return
	}

	var input struct {
		Name    string `json:"name"`
		Type    string `json:"type"`
		PhaseID uint   `json:"phase_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid input",
			"error":   err.Error()})
		return
	}
	var phase models.Phase
	if err := config.DB.First(&phase, input.PhaseID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Phase not found"})
		return
	}

	event.Name = input.Name
	event.PhaseID = input.PhaseID
	event.Type = input.Type

	if err := config.DB.Save(&event).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to update event",
			"error":   err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": event})
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
