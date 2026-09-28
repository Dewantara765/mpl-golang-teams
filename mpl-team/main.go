package main

import (
	"mpl-team/config"
	"mpl-team/controllers"
	"mpl-team/repositories"
	"mpl-team/routes"
	"mpl-team/services"

	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize router
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"}, // React
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Connect database and run migration
	config.ConnectDatabase()

	standingRepository := repositories.NewStandingRepository(config.DB)

	standingService := services.NewStandingService(
		standingRepository,
	)

	// Repository
	matchRepository := repositories.NewMatchRepository(config.DB)
	teamRepository := repositories.NewTeamRepository(config.DB)
	gameRepository := repositories.NewGameRepository(config.DB)

	gameService := services.NewGameService(
		config.DB,
		gameRepository,
		matchRepository,
		teamRepository,
		standingService,
	)

	// Service
	matchService := services.NewMatchService(
		matchRepository,
		standingRepository,
	)

	// Controller
	matchController := controllers.NewMatchController(
		matchService,
	)

	gameController := controllers.NewGameController(
		gameService,
	)

	routes.SetupRoutes(r, matchController, gameController)
	r.Static("/uploads", "./uploads")

	// Start application server on port 8080
	r.Run(":8080")
}
