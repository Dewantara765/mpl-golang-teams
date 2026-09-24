package main

import (
	"mpl-team/config"
	"mpl-team/models"
)

func main() {
	config.ConnectDatabase()

	config.DB.AutoMigrate(
		&models.Team{},
		&models.Tournament{},
		&models.Phase{},
		&models.Event{},
		&models.Match{},
		&models.Hero{},
		&models.Game{},
		&models.Standing{},
	)
}
