package models

type Event struct {
	ID      uint    `json:"id" gorm:"primaryKey"`
	Name    string  `json:"name" gorm:"not null"`
	Type    string  `json:"type" gorm:"not null"`
	PhaseID uint    `json:"phase_id" gorm:"not null"`
	Phase   Phase   `json:"phase" gorm:"foreignKey:PhaseID"`
	Matches []Match `json:"matches" gorm:"foreignKey:EventID"`
}
