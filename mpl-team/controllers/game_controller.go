package controllers

import (
	"mpl-team/config"
	"mpl-team/models"
	"mpl-team/scopes"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func FindGames(c *gin.Context) {
	var games []models.Game

	var totalCount int64
	config.DB.Model(&models.Game{}).Count(&totalCount)
	if err := config.DB.Preload("Match").
		Preload("WinnerTeam").
		Scopes(scopes.Paginate(c)).
		Find(&games).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve games"})
		return
	}

	pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "7"))
	totalPage := int(totalCount) / pageSize
	if int(totalCount)%pageSize != 0 {
		totalPage++
	}
	c.JSON(http.StatusOK, gin.H{
		"data":       games,
		"page":       c.DefaultQuery("page", "1"),
		"pageSize":   pageSize,
		"totalPage":  totalPage,
		"totalCount": totalCount,
	})

}

func CreateGame(c *gin.Context) {
	var input struct {
		MatchID      uint `json:"match_id"`
		GameNumber   int  `json:"game_number"`
		Duration     int  `json:"duration"`
		WinnerTeamID uint `json:"winner_team_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   err.Error(),
			"message": "Invalid request",
		})
		return
	}

	if input.GameNumber <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Game must be greater than 0",
		})
		return
	}

	if input.Duration <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Duration must be greater than 0",
		})
		return
	}

	var match models.Match
	if err := config.DB.First(&match, input.MatchID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "Match not found",
		})
		return
	}

	homeTeamID := match.HomeTeamID
	awayTeamID := match.AwayTeamID

	if input.WinnerTeamID != homeTeamID &&
		input.WinnerTeamID != awayTeamID {

		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Winner team must be one of the teams in this match",
		})
		return
	}

	var team models.Team
	if err := config.DB.First(&team, input.WinnerTeamID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": "Winner team not found",
		})
		return
	}

	game := models.Game{
		MatchID:      input.MatchID,
		GameNumber:   input.GameNumber,
		Duration:     input.Duration,
		WinnerTeamID: input.WinnerTeamID,
	}

	if err := config.DB.Create(&game).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create game",
			"error":   err.Error(),
		})
		return
	}

	config.DB.Preload("WinnerTeam").First(&game, game.ID)

	c.JSON(http.StatusCreated, gin.H{
		"message": "Game created successfully",
		"data":    game,
	})
}
