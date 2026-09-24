package models

type Phase struct {
	ID           uint       `json:"id" gorm:"primaryKey"`
	Name         string     `json:"name" gorm:"not null"`
	TournamentID uint       `json:"tournament_id" gorm:"not null"`
	Tournament   Tournament `json:"tournament" gorm:"foreignKey:TournamentID"`
	Slug         string     `json:"slug" gorm:"type:varchar(100);not null"`
	Events       []Event    `json:"events" gorm:"foreignKey:PhaseID"`
	HasStanding  bool       `json:"has_standing" gorm:"default:false"`
}
