package models

type Tournament struct {
	ID        uint    `json:"id" gorm:"primaryKey"`
	Name      string  `json:"name" gorm:"not null"`
	StartDate string  `json:"start_date" gorm:"not null"`
	EndDate   string  `json:"end_date" gorm:"not null"`
	Slug      string  `json:"slug" gorm:"unique;not null"`
	RegionID  uint    `json:"region_id" gorm:"not null"`
	Region    Region  `json:"region" gorm:"foreignKey:RegionID"`
	Phases    []Phase `json:"phases" gorm:"foreignKey:TournamentID"`
}
