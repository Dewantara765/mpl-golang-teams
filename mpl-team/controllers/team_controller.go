package controllers

import (
	"fmt"
	"mpl-team/config"
	"mpl-team/models"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// GET /teams
func FindTeams(c *gin.Context) {
	var teams []models.Team
	if err := config.DB.Find(&teams).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch teams"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": teams})
}

func FindTeamByID(c *gin.Context) {
	id := c.Param("id")
	var team models.Team

	if err := config.DB.First(&team, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": team})
}

// POST /teams
func CreateTeam(c *gin.Context) {
	name := strings.TrimSpace(c.PostForm("name"))
	shortName := strings.TrimSpace(c.PostForm("short_name"))

	errors := make(map[string]string)

	if name == "" {
		errors["name"] = "Name is required"
	}

	if shortName == "" {
		errors["short_name"] = "Short name is required"
	}

	file, err := c.FormFile("logo")
	if err != nil {
		errors["logo"] = "Logo is required"
	}

	if len(errors) > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"errors": errors,
		})
		return
	}

	// Pastikan folder uploads tersedia
	if err := os.MkdirAll("uploads", os.ModePerm); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"errors": map[string]string{
				"logo": "Failed to create upload directory",
			},
		})
		return
	}

	filename := fmt.Sprintf(
		"uploads/%d-%s",
		time.Now().UnixNano(),
		file.Filename,
	)

	if err := c.SaveUploadedFile(file, filename); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"errors": map[string]string{
				"logo": "Failed to save logo",
			},
		})
		return
	}

	team := models.Team{
		Name:      name,
		ShortName: shortName,
		Logo:      filename,
	}

	if err := config.DB.Create(&team).Error; err != nil {
		// Hapus file jika database gagal
		os.Remove(filename)

		c.JSON(http.StatusInternalServerError, gin.H{
			"errors": map[string]string{
				"team": "Failed to create team",
			},
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": team,
	})
}

func UpdateTeam(c *gin.Context) {
	id := c.Param("id")

	var team models.Team
	if err := config.DB.Where("id = ?", id).First(&team).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	name := strings.TrimSpace(c.PostForm("name"))
	shortName := strings.TrimSpace(c.PostForm("short_name"))

	if name != "" {
		team.Name = name
	}

	if shortName != "" {
		team.ShortName = shortName
	}

	file, err := c.FormFile("logo")
	if err == nil {
		if team.Logo != "" {
			os.Remove(team.Logo)
		}

		newPath := fmt.Sprintf("uploads/%d-%s", time.Now().UnixNano(), file.Filename)
		if err := c.SaveUploadedFile(file, newPath); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"errors": map[string]string{"logo": "Failed to save logo"}})
			return
		}
		team.Logo = newPath
	}

	if err := config.DB.Save(&team).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"errors": map[string]string{"team": "Failed to update team"}})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": team})
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
