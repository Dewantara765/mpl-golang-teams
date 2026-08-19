package models

type Tournament struct {
	ID        uint    `json:"id" gorm:"primaryKey"`
	Name      string  `json:"name" gorm:"not null"`
	StartDate string  `json:"start_date" gorm:"not null"`
	EndDate   string  `json:"end_date" gorm:"not null"`
	Phases    []Phase `json:"phases" gorm:"foreignKey:TournamentID"`
}
