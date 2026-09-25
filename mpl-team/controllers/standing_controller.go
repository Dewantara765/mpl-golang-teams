package controllers

import (
	"mpl-team/config"
	"mpl-team/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

func FindStandings(c *gin.Context) {
	var standings []models.Standing

	if err := config.DB.Preload("Team").
		Preload("Phase").
		Order("match_win DESC").
		Order("game_diff DESC").
		Order("game_win DESC").
		Order("id ASC").
		Find(&standings).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve matches"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": standings,
	})
}

func CreateStanding(c *gin.Context) {
	var input struct {
		TeamID      uint `json:"team_id" binding:"required"`
		PhaseID     uint `json:"phase_id" binding:"required"`
		MatchPlayed int  `json:"match_played"`
		MatchWin    int  `json:"match_win"`
		GameWin     int  `json:"game_win"`
		GameLose    int  `json:"game_lose"`
	}

	errors := make(map[string]string)
	// 1. Bind JSON
	if err := c.ShouldBindJSON(&input); err != nil {
		errors["input"] = err.Error()

		c.JSON(http.StatusBadRequest, gin.H{
			"errors": errors,
		})
		return
	}

	var team models.Team
	if err := config.DB.First(&team, input.TeamID).Error; err != nil {
		errors["team_id"] = "Team not found"
		c.JSON(http.StatusBadRequest, gin.H{"errors": errors})
		return
	}

	var phase models.Phase
	if err := config.DB.First(&phase, input.PhaseID).Error; err != nil {
		errors["phase_id"] = "Phase not found"
		c.JSON(http.StatusBadRequest, gin.H{"errors": errors})
		return
	}

	var existing models.Standing

	if err := config.DB.
		Where("tournament_id = ? AND team_id = ?", input.PhaseID, input.TeamID).
		First(&existing).Error; err == nil {

		errors["team_id"] = "Standing for this team already exists in this Phase"

		c.JSON(http.StatusConflict, gin.H{
			"errors": errors,
		})
		return
	}

	if input.MatchWin > input.MatchPlayed {
		errors["match_win"] = "Match win cannot be greater than match played"
	}

	if input.MatchPlayed < 0 {
		errors["match_played"] = "Match played cannot be negative"
	}

	if input.MatchWin < 0 {
		errors["match_win"] = "Match win cannot be negative"
	}

	if input.GameWin < 0 {
		errors["game_win"] = "Game win cannot be negative"
	}

	if input.GameLose < 0 {
		errors["game_lose"] = "Game lose cannot be negative"
	}

	matchLose := input.MatchPlayed - input.MatchWin
	GameDiff := input.GameWin - input.GameLose

	if len(errors) > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"errors": errors,
		})
		return
	}

	standing := models.Standing{
		PhaseID:     input.PhaseID,
		TeamID:      input.TeamID,
		MatchPlayed: input.MatchPlayed,
		MatchWin:    input.MatchWin,
		MatchLose:   matchLose,
		GameWin:     input.GameWin,
		GameLose:    input.GameLose,
		GameDiff:    GameDiff,
	}

	if err := config.DB.Create(&standing).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"errors": map[string]string{
				"standing": "Failed to create standing",
			},
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": standing})

}
