package controllers

import (
	"mpl-team/config"
	"mpl-team/models"
	"mpl-team/scopes"
	"mpl-team/services"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type GameController struct {
	GameService *services.GameService
}

func NewGameController(
	gameService *services.GameService,
) *GameController {
	return &GameController{
		GameService: gameService,
	}
}

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

func (gc *GameController) FindByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Invalid game ID",
		})
		return
	}

	game, err := gc.GameService.FindByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": game,
	})
}

func (gc *GameController) CreateGame(c *gin.Context) {

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

	// =========================
	// Basic Validation
	// =========================

	if input.MatchID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Match ID is required",
		})
		return
	}

	if input.GameNumber <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Game number must be greater than 0",
		})
		return
	}

	if input.Duration <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Duration must be greater than 0",
		})
		return
	}

	if input.WinnerTeamID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Winner team is required",
		})
		return
	}

	// =========================
	// Service
	// =========================

	game, err := gc.GameService.CreateGame(
		services.CreateGameInput{
			MatchID:      input.MatchID,
			GameNumber:   input.GameNumber,
			Duration:     input.Duration,
			WinnerTeamID: input.WinnerTeamID,
		},
	)

	if err != nil {

		switch err.Error() {

		case "match not found":
			c.JSON(http.StatusNotFound, gin.H{
				"message": err.Error(),
			})

		case "winner team not found":
			c.JSON(http.StatusNotFound, gin.H{
				"message": err.Error(),
			})

		default:
			c.JSON(http.StatusBadRequest, gin.H{
				"message": err.Error(),
			})
		}

		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Game created successfully",
		"data":    game,
	})
}
