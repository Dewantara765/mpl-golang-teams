package controllers

import (
	"mpl-team/config"
	"mpl-team/models"
	"mpl-team/scopes"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

func FindMatches(c *gin.Context) {
	var matches []models.Match

	var totalCount int64
	config.DB.Model(&models.Match{}).Count(&totalCount)
	if err := config.DB.Preload("HomeTeam").
		Preload("AwayTeam").
		Preload("Event").
		Preload("Event.Phase").
		Preload("Event.Phase.Tournament").
		Preload("Games").
		Scopes(scopes.Paginate(c)).
		Find(&matches).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve matches"})
		return
	}

	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "7"))
	totalPage := int(totalCount) / pageSize
	if int(totalCount)%pageSize != 0 {
		totalPage++
	}
	c.JSON(http.StatusOK, gin.H{
		"data":       matches,
		"page":       c.DefaultQuery("page", "1"),
		"pageSize":   pageSize,
		"totalPage":  totalPage,
		"totalCount": totalCount,
	})
}

func FindMatchByID(c *gin.Context) {
	id := c.Param("id")
	var match models.Match

	if err := config.DB.Preload("HomeTeam").Preload("AwayTeam").Preload("Games").First(&match, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": match})
}

func CreateMatch(c *gin.Context) {
	var input struct {
		HomeTeamID uint   `json:"home_team_id" binding:"required"`
		AwayTeamID uint   `json:"away_team_id" binding:"required"`
		EventID    uint   `json:"event_id" binding:"required"`
		HomeScore  *int   `json:"home_score"`
		AwayScore  *int   `json:"away_score"`
		BestOf     *int   `json:"best_of"`
		Date       string `json:"date" binding:"required"`
		Time       string `json:"time" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	// Home and away team cannot be the same
	if input.HomeTeamID == input.AwayTeamID {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Home team and away team cannot be the same",
		})
		return
	}

	// Validate scores
	if input.HomeScore != nil && *input.HomeScore < 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Home score cannot be negative",
		})
		return
	}

	if input.AwayScore != nil && *input.AwayScore < 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Away score cannot be negative",
		})
		return
	}

	// Validate date
	if _, err := time.Parse("2006-01-02", input.Date); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid date format, use YYYY-MM-DD",
		})
		return
	}

	// Validate time
	if _, err := time.Parse("15:04:05", input.Time); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Invalid time format, use HH:MM:SS",
		})
		return
	}

	// Check home team
	var homeTeam models.Team
	if err := config.DB.First(&homeTeam, input.HomeTeamID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Home team not found",
		})
		return
	}

	// Check away team
	var awayTeam models.Team
	if err := config.DB.First(&awayTeam, input.AwayTeamID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Away team not found",
		})
		return
	}

	// Check event
	var event models.Event
	if err := config.DB.First(&event, input.EventID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "Event not found",
		})
		return
	}

	// Create match
	match := models.Match{
		HomeTeamID: input.HomeTeamID,
		AwayTeamID: input.AwayTeamID,
		EventID:    input.EventID,
		HomeScore:  input.HomeScore,
		AwayScore:  input.AwayScore,
		Date:       input.Date,
		Time:       input.Time,
		BestOf:     input.BestOf,
	}

	if err := config.DB.Create(&match).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to create match",
		})
		return
	}

	// Load relationships
	if err := config.DB.
		Preload("HomeTeam").
		Preload("AwayTeam").
		Preload("Event").
		First(&match, match.ID).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to load created match",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": match,
	})
}
func UpdateMatch(c *gin.Context) {
	id := c.Param("id")
	var match models.Match

	if err := config.DB.First(&match, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Match not found"})
		return
	}

	var input struct {
		HomeTeamID *uint   `json:"home_team_id"`
		AwayTeamID *uint   `json:"away_team_id"`
		EventID    *uint   `json:"event_id"`
		Date       *string `json:"date"`
		Time       *string `json:"time"`
		HomeScore  *int    `json:"home_score"`
		AwayScore  *int    `json:"away_score"`
		BestOf     *int    `json:"best_of"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if input.HomeTeamID != nil && input.AwayTeamID != nil && *input.HomeTeamID == *input.AwayTeamID {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Home team and away team cannot be the same"})
		return
	}

	if input.HomeTeamID != nil {
		var homeTeam models.Team
		if err := config.DB.First(&homeTeam, *input.HomeTeamID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Home team not found"})
			return
		}
		match.HomeTeamID = *input.HomeTeamID
	}

	if input.AwayTeamID != nil {
		var awayTeam models.Team
		if err := config.DB.First(&awayTeam, *input.AwayTeamID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Away team not found"})
			return
		}
		match.AwayTeamID = *input.AwayTeamID
	}

	if input.EventID != nil {
		var event models.Event
		if err := config.DB.First(&event, *input.EventID).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Event not found"})
			return
		}
		match.EventID = *input.EventID
	}

	match.HomeScore = input.HomeScore
	match.AwayScore = input.AwayScore
	match.Date = *input.Date

	match.Time = *input.Time
	match.BestOf = input.BestOf

	if err := config.DB.Save(&match).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update match"})
		return
	}

	config.DB.Preload("HomeTeam").Preload("AwayTeam").First(&match, match.ID)

	c.JSON(http.StatusOK, gin.H{"data": match})
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
