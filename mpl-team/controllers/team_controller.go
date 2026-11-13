package controllers

import (
	"errors"
	"mpl-team/config"
	apperrors "mpl-team/errors"
	"mpl-team/helpers"
	"mpl-team/models"
	"mpl-team/services"
	"net/http"
	"os"
	"strconv"

	"gorm.io/gorm"

	"github.com/gin-gonic/gin"
)

type TeamController struct {
	TeamService *services.TeamService
}

func NewTeamController(
	teamService *services.TeamService,
) *TeamController {
	return &TeamController{
		TeamService: teamService,
	}
}

// GET /teams
func (tc *TeamController) FindTeams(c *gin.Context) {
	pagination, err := helpers.GetPagination(c)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	all := c.Query("all") == "true"

	teams, totalCount, err := tc.TeamService.FindTeams(
		pagination.Offset,
		pagination.PageSize,
		pagination.Search,
		all,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve teams",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": teams,
		"meta": gin.H{
			"total": totalCount,
		},
	})
}

func (tc *TeamController) FindTeamByID(c *gin.Context) {
	id, err := strconv.ParseUint(
		c.Param("id"),
		10, 64,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}

	team, err := tc.TeamService.FindByID(config.DB, uint(id))
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Team not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve team",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": team,
	})
}

// POST /teams
func (tc *TeamController) CreateTeam(c *gin.Context) {
	name := c.PostForm("name")
	shortName := c.PostForm("short_name")
	regionIDStr := c.PostForm("region_id")

	regionID, err := strconv.ParseUint(regionIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid uint for region ID"})
		return
	}

	file, err := c.FormFile("logo")
	if err != nil {
		file = nil
	}

	team, err := tc.TeamService.Create(
		config.DB,
		name,
		shortName,
		uint(regionID),
		file,
	)

	if err != nil {
		if validationErrors, ok := err.(apperrors.ValidationErrors); ok {
			c.JSON(http.StatusBadRequest, gin.H{
				"errors": validationErrors,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"errors": map[string]string{
				"team": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": team,
	})
}

func (tc *TeamController) UpdateTeam(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"errors": apperrors.ValidationErrors{
				"id": "Invalid team ID",
			},
		})
		return
	}

	name := c.PostForm("name")
	shortName := c.PostForm("short_name")
	regionIDStr := c.PostForm("region_id")

	regionID, err := strconv.ParseUint(regionIDStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid uint for region ID"})
		return
	}

	file, err := c.FormFile("logo")
	if err != nil {
		file = nil
	}

	team, err := tc.TeamService.Update(
		config.DB,
		uint(id),
		name,
		shortName,
		uint(regionID),
		file,
	)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Team not found",
			})
			return
		}

		if validationErrors, ok := err.(apperrors.ValidationErrors); ok {
			c.JSON(http.StatusBadRequest, gin.H{
				"errors": validationErrors,
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"errors": map[string]string{
				"team": "Failed to update team",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": team,
	})
}

func DeleteTeam(c *gin.Context) {
	id := c.Param("id")
	var team models.Team

	if err := config.DB.Where("id = ?", id).First(&team).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	if team.Logo != "" {
		os.Remove(team.Logo)
	}

	if err := config.DB.Delete(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete team"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Team deleted"})
}
