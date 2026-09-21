package models

type Hero struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name" gorm:"unique;not null"`
	Logo string `json:"logo" gorm:"not null"`
}
