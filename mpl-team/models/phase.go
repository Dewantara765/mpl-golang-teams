package models

type Phase struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	Name         string     `json:"name" gorm:"not null"`
	TournamentID uint       `json:"tournament_id" gorm:"not null"`
	Tournament   Tournament `json:"tournament" gorm:"foreignKey:TournamentID"`
	Events       []Event    `json:"events" gorm:"foreignKey:PhaseID"`
}
