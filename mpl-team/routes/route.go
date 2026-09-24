package routes

import (
	"mpl-team/controllers"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.Engine,
	matchController *controllers.MatchController,
) {

	team := router.Group("/teams")
	{
		team.GET("", controllers.FindTeams)
		team.GET("/:id", controllers.FindTeamByID)
		team.POST("", controllers.CreateTeam)
		team.PUT("/:id", controllers.UpdateTeam)
		team.DELETE("/:id", controllers.DeleteTeam)
	}

	tournament := router.Group("/tournaments")
	{
		tournament.GET("", controllers.FindTournaments)
		tournament.GET("/:slug", controllers.FindTournamentBySlug)
		tournament.GET("/db/:id", controllers.FindTournamentByID)
		tournament.POST("", controllers.CreateTournament)
		tournament.PUT("/:id", controllers.UpdateTournament)
		tournament.DELETE("/:id", controllers.DeleteTournament)
	}

	phase := router.Group("/phases")
	{
		phase.GET("", controllers.FindPhases)
		phase.GET("/:id", controllers.FindPhaseByID)
		phase.POST("", controllers.CreatePhase)
		phase.PUT("/:id", controllers.UpdatePhase)
		phase.DELETE("/:id", controllers.DeletePhase)
	}

	event := router.Group("/events")
	{
		event.GET("", controllers.FindEvents)
		event.GET("/:id", controllers.FindEventByID)
		event.POST("", controllers.CreateEvent)
		event.PUT("/:id", controllers.UpdateEvent)
		event.DELETE("/:id", controllers.DeleteEvent)
	}

	match := router.Group("/matches")
	{
		match.GET("", matchController.FindMatches)
		match.GET("/:id", matchController.FindMatchByID)
		match.POST("", matchController.CreateMatch)
		match.PUT("/:id", matchController.UpdateMatch)
		match.POST("/:id/complete", matchController.CompleteMatch)
		match.POST(
			"/:id/update-standing",
			matchController.UpdateStandingFromCompletedMatch,
		)
		match.DELETE("/:id", controllers.DeleteMatch)
	}

	hero := router.Group("/heroes")
	{
		hero.GET("", controllers.FindHeroes)
		hero.GET("/:id", controllers.FindHeroByID)
		hero.POST("", controllers.CreateHero)
		hero.PUT("/:id", controllers.UpdateHero)
		hero.DELETE("/:id", controllers.DeleteHero)
	}

	game := router.Group("/games")
	{
		game.GET("", controllers.FindGames)
		game.POST("", controllers.CreateGame)
	}

	standing := router.Group("/standings")
	{
		standing.GET("", controllers.FindStandings)
		standing.POST("", controllers.CreateStanding)
	}
}
