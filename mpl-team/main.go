package main

import (
	"log"
	"time"

	"mpl-team/config"
	"mpl-team/controllers"
	"mpl-team/repositories"
	"mpl-team/routes"
	"mpl-team/services"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	// =========================
	// Configuration
	// =========================

	if err := godotenv.Load(); err != nil {
		log.Println("File .env tidak ditemukan")
	}

	// =========================
	// Database
	// =========================

	config.ConnectDatabase()

	db := config.DB

	// =========================
	// Repositories
	// =========================

	standingRepository := repositories.NewStandingRepository(db)
	heroDraftRepository := repositories.NewHeroDraftRepository()
	matchRepository := repositories.NewMatchRepository(db)
	teamRepository := repositories.NewTeamRepository(db)
	gameRepository := repositories.NewGameRepository(db)
	eventRepository := repositories.NewEventRepository(db)
	regionRepository := repositories.NewRegionRepository(db)
	tournamentRepository := repositories.NewTournamentRepository(db)
	phaseRepository := repositories.NewPhaseRepository(db)

	// =========================
	// Services
	// =========================

	standingService := services.NewStandingService(
		standingRepository,
	)

	heroDraftService := services.NewHeroDraftService(
		db,
		heroDraftRepository,
	)

	teamService := services.NewTeamService(
		teamRepository,
	)

	eventService := services.NewEventService(
		eventRepository,
	)

	matchService := services.NewMatchService(
		matchRepository,
		standingRepository,
	)

	gameService := services.NewGameService(
		db,
		gameRepository,
		matchRepository,
		teamRepository,
		standingService,
	)

	regionService := services.NewRegionService(
		regionRepository,
	)

	tournamentService := services.NewTournamentService(
		tournamentRepository,
	)

	phaseService := services.NewPhaseService(
		phaseRepository,
	)

	// =========================
	// Controllers
	// =========================

	matchController := controllers.NewMatchController(matchService)

	gameController := controllers.NewGameController(gameService)

	heroDraftController := controllers.NewHeroDraftController(
		heroDraftService,
	)

	authController := controllers.NewAuthController(db)

	teamController := controllers.NewTeamController(teamService)

	eventController := controllers.NewEventController(eventService)

	regionController := controllers.NewRegionController(regionService)

	tournamentController := controllers.NewTournamentController(tournamentService)

	phaseController := controllers.NewPhaseController(phaseService)

	// =========================
	// Router
	// =========================

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	routes.SetupRoutes(
		r,
		matchController,
		gameController,
		heroDraftController,
		authController,
		teamController,
		eventController,
		regionController,
		tournamentController,
		phaseController,
	)

	r.Static("/uploads", "./uploads")

	// =========================
	// Start Server
	// =========================

	if err := r.Run(":8080"); err != nil {
		log.Fatal("Gagal menjalankan server:", err)
	}
}
