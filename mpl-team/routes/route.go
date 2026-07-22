package routes

import (
	"mpl-team/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	team := router.Group("/teams")
	{
		team.GET("", controllers.FindTeams)
		team.GET("/:id", controllers.FindTeamByID)
		team.POST("", controllers.CreateTeam)
		team.PUT("/:id", controllers.UpdateTeam)
		team.DELETE("/:id", controllers.DeleteTeam)
	}

}
