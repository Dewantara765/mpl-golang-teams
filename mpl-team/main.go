package main

import (
	"mpl-team/config"
	"mpl-team/models"
	"mpl-team/routes"

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
	config.DB.AutoMigrate(&models.Team{})
	config.DB.AutoMigrate(&models.Tournament{})
	config.DB.AutoMigrate(&models.Phase{})
	config.DB.AutoMigrate(&models.Event{})
	config.DB.AutoMigrate(&models.Match{})

	routes.SetupRoutes(r)
	r.Static("/uploads", "./uploads")

	// Start application server on port 8080
	r.Run(":8080")
}
