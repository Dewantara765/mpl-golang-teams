package controllers

import (
	apperrors "mpl-team/errors"
	"mpl-team/models"
	"mpl-team/services"
	"net/http"
	"strconv"

	"github.com/go-playground/validator/v10"

	"github.com/gin-gonic/gin"
)

type HeroDraftController struct {
	service services.HeroDraftService
}

func NewHeroDraftController(
	service services.HeroDraftService,
) *HeroDraftController {
	return &HeroDraftController{
		service: service,
	}
}

func (c *HeroDraftController) Create(ctx *gin.Context) {

	var input struct {
		GameID  uint                 `json:"game_id" binding:"required"`
		TeamID  uint                 `json:"team_id" binding:"required"`
		Type    models.HeroDraftType `json:"type" binding:"required"`
		HeroIDs []uint               `json:"hero_ids" binding:"required"`
	}

	if err := ctx.ShouldBindJSON(&input); err != nil {
		errors := make(map[string]string)

		if validationErrors, ok := err.(validator.ValidationErrors); ok {
			for _, fieldErr := range validationErrors {
				switch fieldErr.Field() {
				case "GameID":
					errors["game_id"] = "Game wajib diisi"
				case "TeamID":
					errors["team_id"] = "Team wajib diisi"
				case "Type":
					errors["type"] = "Type wajib diisi"
				case "HeroIDs":
					errors["hero_ids"] = "Hero wajib dipilih"
				}
			}
		} else {
			errors["general"] = "Invalid request data"
		}
		ctx.JSON(http.StatusBadRequest, gin.H{
			"errors": errors,
		})
		return
	}

	if len(input.HeroIDs) != 5 {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"errors": gin.H{
				"hero_ids": "Pilih tepat 5 hero",
			},
		})
		return
	}

	if err := c.service.CreateMany(
		input.GameID,
		input.TeamID,
		input.Type,
		input.HeroIDs,
	); err != nil {
		if validationErr, ok := err.(apperrors.ValidationErrors); ok {
			ctx.JSON(http.StatusBadRequest, gin.H{
				"errors": validationErr,
			})
			return
		}

		ctx.JSON(http.StatusInternalServerError, gin.H{
			"message": "Failed to create hero drafts",
		})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "hero drafts created",
	})
}

func (c *HeroDraftController) FindByGameID(ctx *gin.Context) {

	gameID, err := strconv.ParseUint(
		ctx.Param("gameID"),
		10,
		64,
	)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid game id",
		})
		return
	}

	drafts, err := c.service.GetByGameID(uint(gameID))

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, drafts)
}

func (c *HeroDraftController) Delete(ctx *gin.Context) {

	id, err := strconv.ParseUint(
		ctx.Param("id"),
		10,
		64,
	)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid hero draft id",
		})
		return
	}

	if err := c.service.Delete(uint(id)); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "hero draft deleted",
	})
}
