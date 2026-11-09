package routes

import (
	"mpl-team/controllers"
	"mpl-team/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRoutes(
	router *gin.Engine,
	matchController *controllers.MatchController,
	gameController *controllers.GameController,
	heroDraftController *controllers.HeroDraftController,
	authController *controllers.AuthController,
	teamController *controllers.TeamController,
	eventController *controllers.EventController,
	regionController *controllers.RegionController,
) {

	auth := router.Group("/auth")
	{
		auth.POST("/register", authController.Register)
		auth.POST("/login", authController.Login)
	}

	admin := router.Group("/api/admin")
	admin.Use(
		middleware.AuthMiddleware(),
		middleware.AdminMiddleware(),
	)

	admin.POST("/teams", teamController.CreateTeam)
	admin.PUT("/teams/:id", teamController.UpdateTeam)
	admin.DELETE("/teams/:id", controllers.DeleteTeam)

	admin.POST("/tournaments", controllers.CreateTournament)
	admin.PUT("/tournaments/:id", controllers.UpdateTournament)
	admin.DELETE("/tournaments/:id", controllers.DeleteTournament)

	admin.POST("/phases", controllers.CreatePhase)
	admin.PUT("/phases/:id", controllers.UpdatePhase)
	admin.DELETE("/phases/:id", controllers.DeletePhase)

	admin.POST("/events", eventController.CreateEvent)
	admin.PUT("/events/:id", eventController.UpdateEvent)
	admin.DELETE("/events/:id", controllers.DeleteEvent)

	admin.POST("/matches", matchController.CreateMatch)
	admin.PUT("/matches/:id", matchController.UpdateMatch)
	admin.POST("/matches/:id/complete", matchController.CompleteMatch)
	admin.POST(
		"/matches/:id/update-standing",
		matchController.UpdateStandingFromCompletedMatch,
	)
	admin.DELETE("/matches/:id", controllers.DeleteMatch)

	admin.POST("/heroes", controllers.CreateHero)
	admin.PUT("/heroes/:id", controllers.UpdateHero)
	admin.DELETE("/heroes/:id", controllers.DeleteHero)

	admin.POST("/games", gameController.CreateGame)
	admin.PUT("/games/:id/first-pick", gameController.UpdateFirstPick)

	admin.POST("/standings", controllers.CreateStanding)

	admin.POST("/hero-drafts", heroDraftController.Create)
	admin.DELETE(
		"/hero-drafts/:id",
		heroDraftController.Delete,
	)

	admin.POST("/regions", regionController.CreateRegion)
	admin.PUT("/regions/:id", regionController.UpdateRegion)

	team := router.Group("/teams")
	{
		team.GET("", teamController.FindTeams)
		team.GET("/:id", teamController.FindTeamByID)

	}

	tournament := router.Group("/tournaments")
	{
		tournament.GET("", controllers.FindTournaments)
		tournament.GET("/:tournamentSlug/phases/:phaseSlug", controllers.FindPhaseWithMatches)
		tournament.GET("/slug/:slug", controllers.FindTournamentBySlug)
		tournament.GET("/db/:id", controllers.FindTournamentByID)

	}

	phase := router.Group("/phases")
	{
		phase.GET("", controllers.FindPhases)
		phase.GET("/:id", controllers.FindPhaseByID)

	}

	event := router.Group("/events")
	{
		event.GET("", eventController.FindEvents)
		event.GET("/:id", eventController.FindEventByID)

	}

	match := router.Group("/matches")
	{
		match.GET("", matchController.FindMatches)
		match.GET("/:id", matchController.FindMatchByID)

	}

	hero := router.Group("/heroes")
	{
		hero.GET("", controllers.FindHeroes)
		hero.GET("/:id", controllers.FindHeroByID)

	}

	game := router.Group("/games")
	{
		game.GET("", controllers.FindGames)

		game.GET("/:id", gameController.FindByID)

	}

	standing := router.Group("/standings")
	{
		standing.GET("", controllers.FindStandings)

	}

	heroDraft := router.Group("/hero-drafts")
	{

		heroDraft.GET(
			"/games/:gameID",
			heroDraftController.FindByGameID,
		)

	}

	region := router.Group("/regions")
	{
		region.GET("", regionController.FindRegions)
		region.GET("/:id", regionController.FindRegionByID)

	}
}
