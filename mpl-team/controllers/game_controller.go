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

func (gc *GameController) UpdateFirstPick(c *gin.Context) {
	gameID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "invalid game id",
		})
		return
	}

	var input struct {
		TeamID uint `json:"team_id" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	err = gc.GameService.UpdateFirstPick(
		uint(gameID),
		input.TeamID,
	)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "first pick updated successfully",
	})
}

func (gc *GameController) CreateGame(c *gin.Context) {

	var input struct {
		MatchID         uint `json:"match_id"`
		GameNumber      int  `json:"game_number"`
		Duration        int  `json:"duration"`
		WinnerTeamID    uint `json:"winner_team_id"`
		FirstPickTeamID uint `json:"first_pick_team_id"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"errors": gin.H{
				"general": "Invalid request",
			},
		})
		return
	}

	// =========================
	// Basic Validation
	// =========================

	errors := make(map[string]string)

	if input.MatchID == 0 {
		errors["match_id"] = "Match wajib dipilih"
	}

	if input.GameNumber <= 0 {
		errors["game_number"] = "Game number harus lebih besar dari 0"
	}

	if input.Duration <= 0 {
		errors["duration"] = "Duration harus lebih besar dari 0"
	}

	if input.WinnerTeamID == 0 {
		errors["winner_team_id"] = "Winner team wajib dipilih"
	}

	if input.FirstPickTeamID == 0 {
		errors["first_pick_team_id"] = "First pick team wajib dipilih"
	}

	if len(errors) > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"errors": errors,
		})
		return
	}

	// =========================
	// Service
	// =========================

	game, err := gc.GameService.CreateGame(
		services.CreateGameInput{
			MatchID:         input.MatchID,
			GameNumber:      input.GameNumber,
			Duration:        input.Duration,
			WinnerTeamID:    input.WinnerTeamID,
			FirstPickTeamID: input.FirstPickTeamID,
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
