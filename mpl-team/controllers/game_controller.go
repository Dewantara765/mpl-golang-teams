package controllers

import (
	"errors"
	"fmt"
	"mpl-team/config"
	"mpl-team/models"
	"mpl-team/scopes"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
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

	err := config.DB.Transaction(func(tx *gorm.DB) error {

		// =========================
		// Get Match
		// =========================

		var match models.Match

		if err := tx.First(&match, input.MatchID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("match not found")
			}

			return err
		}

		// =========================
		// Check Match Status
		// =========================

		if match.Status == models.MatchCompleted {
			return fmt.Errorf("match is already completed")
		}

		if match.Status == models.MatchCancelled {
			return fmt.Errorf("match is cancelled")
		}

		if match.Status == models.MatchPostponed {
			return fmt.Errorf("match is postponed")
		}

		// =========================
		// Validate BestOf
		// =========================

		if match.BestOf == nil || *match.BestOf <= 0 {
			return fmt.Errorf("invalid best of")
		}

		// =========================
		// Validate Winner
		// =========================

		if input.WinnerTeamID != match.HomeTeamID &&
			input.WinnerTeamID != match.AwayTeamID {

			return fmt.Errorf(
				"winner team must be one of the teams in this match",
			)
		}

		// =========================
		// Validate Winner Team Exists
		// =========================

		var team models.Team

		if err := tx.First(&team, input.WinnerTeamID).Error; err != nil {
			if errors.Is(err, gorm.ErrRecordNotFound) {
				return fmt.Errorf("winner team not found")
			}

			return err
		}

		// =========================
		// Calculate Required Wins
		// =========================

		winsNeeded := (*match.BestOf / 2) + 1

		// =========================
		// Get Existing Games
		// =========================

		var games []models.Game

		if err := tx.
			Where("match_id = ?", match.ID).
			Order("game_number ASC").
			Find(&games).Error; err != nil {
			return err
		}

		// =========================
		// Validate Game Number
		// =========================

		if input.GameNumber != len(games)+1 {
			return fmt.Errorf(
				"game number must be %d",
				len(games)+1,
			)
		}

		// =========================
		// Check Maximum Games
		// =========================

		if len(games) >= *match.BestOf {
			return fmt.Errorf("maximum number of games reached")
		}

		// =========================
		// Create Game
		// =========================

		game := models.Game{
			MatchID:      input.MatchID,
			GameNumber:   input.GameNumber,
			Duration:     input.Duration,
			WinnerTeamID: input.WinnerTeamID,
		}

		if err := tx.Create(&game).Error; err != nil {
			return err
		}

		// =========================
		// Calculate Score
		// =========================

		homeScore := 0
		awayScore := 0

		for _, g := range games {
			if g.WinnerTeamID == match.HomeTeamID {
				homeScore++
			}

			if g.WinnerTeamID == match.AwayTeamID {
				awayScore++
			}
		}

		// Tambahkan game yang baru dibuat
		if input.WinnerTeamID == match.HomeTeamID {
			homeScore++
		}

		if input.WinnerTeamID == match.AwayTeamID {
			awayScore++
		}

		// =========================
		// Determine Status
		// =========================

		status := models.MatchLive

		if homeScore >= winsNeeded ||
			awayScore >= winsNeeded {

			status = models.MatchCompleted
		}

		// =========================
		// Update Match
		// =========================

		if err := tx.Model(&match).Updates(map[string]interface{}{
			"home_score": homeScore,
			"away_score": awayScore,
			"status":     status,
		}).Error; err != nil {
			return err
		}

		return nil
	})

	// =========================
	// Handle Error
	// =========================

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

	// =========================
	// Get Created Game
	// =========================

	var game models.Game

	if err := config.DB.
		Preload("WinnerTeam").
		First(&game, "match_id = ? AND game_number = ?",
			input.MatchID,
			input.GameNumber,
		).Error; err != nil {

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Game created but failed to retrieve game",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Game created successfully",
		"data":    game,
	})
}
