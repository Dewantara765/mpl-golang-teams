package controllers

import (
	"mpl-team/models"
	"mpl-team/services"
	"net/http"
	"strconv"

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
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}

	if len(input.HeroIDs) != 5 {
		ctx.JSON(400, gin.H{
			"error": "must select exactly 5 heroes",
		})
		return
	}

	if err := c.service.CreateMany(
		input.GameID,
		input.TeamID,
		input.Type,
		input.HeroIDs,
	); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
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
