package controllers

import (
	"fmt"
	"mpl-team/config"
	"mpl-team/models"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
)

// GET /teams
func FindTeams(c *gin.Context) {
	var teams []models.Team
	config.DB.Find(&teams)
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
	name := c.PostForm("name")
	short_name := c.PostForm("short_name")

	if name == "" || short_name == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "All fields are required"})
		return
	}

	file, err := c.FormFile("logo")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to upload logo"})
		return
	}

	filename := fmt.Sprintf("uploads/%d-%s", time.Now().Unix(), file.Filename)
	if err := c.SaveUploadedFile(file, filename); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to save logo"})
		return
	}

	team := models.Team{
		Name:      name,
		ShortName: short_name,
		Logo:      filename,
	}

	config.DB.Create(&team)
	c.JSON(http.StatusCreated, gin.H{"data": team})
}

func UpdateTeam(c *gin.Context) {
	id := c.Param("id")

	var team models.Team
	if err := config.DB.Where("id = ?", id).First(&team).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Team not found"})
		return
	}

	name := c.PostForm("name")
	short_name := c.PostForm("short_name")

	if name != "" {
		team.Name = name
	}

	if short_name != "" {
		team.ShortName = short_name
	}

	file, err := c.FormFile("logo")
	if err == nil {
		if team.Logo != "" {
			os.Remove(team.Logo)
		}

		newPath := fmt.Sprintf("uploads/%d-%s", time.Now().Unix(), file.Filename)
		if err := c.SaveUploadedFile(file, newPath); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to save logo"})
			return
		}
		team.Logo = newPath
	}

	config.DB.Save(&team)
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

	config.DB.Delete(&team)
	c.JSON(http.StatusOK, gin.H{"message": "Team deleted"})
}
