package models

type Team struct {
	ID        uint   `json:"id" gorm:"primaryKey"`
	Name      string `json:"name" binding:"required"`
	ShortName string `json:"short_name" binding:"required"`
	Logo      string `json:"logo" binding:"required"`
}
