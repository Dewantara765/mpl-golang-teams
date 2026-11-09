package controllers

import (
	"errors"
	apperrors "mpl-team/errors"
	"mpl-team/services"
	"net/http"
	"strconv"

	"gorm.io/gorm"

	"github.com/gin-gonic/gin"
)

type RegionController struct {
	RegionService *services.RegionService
}

func NewRegionController(
	regionService *services.RegionService,
) *RegionController {
	return &RegionController{
		RegionService: regionService,
	}
}

func (rc *RegionController) FindRegions(c *gin.Context) {
	regions, err := rc.RegionService.FindRegions()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve regions",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data": regions,
	})
}

func (rc *RegionController) CreateRegion(c *gin.Context) {
	name := c.PostForm("name")
	code := c.PostForm("code")

	file, err := c.FormFile("logo")
	if err != nil {
		file = nil
	}

	region, err := rc.RegionService.Create(
		name,
		code,
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
				"region": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": region,
	})
}

func (rc *RegionController) FindRegionByID(c *gin.Context) {
	id, err := strconv.ParseUint(
		c.Param("id"),
		10, 64,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid team ID"})
		return
	}
	region, err := rc.RegionService.FindRegionByID(uint(id))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve region",
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data": region,
	})
}

func (rc *RegionController) UpdateRegion(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil || id == 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"errors": apperrors.ValidationErrors{
				"id": "Invalid region ID",
			},
		})
		return
	}

	name := c.PostForm("name")
	code := c.PostForm("code")

	file, err := c.FormFile("logo")
	if err != nil {
		file = nil
	}

	region, err := rc.RegionService.Update(
		uint(id),
		name,
		code,
		file,
	)

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "Region not found",
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
				"region": "Failed to update region",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": region,
	})
}
