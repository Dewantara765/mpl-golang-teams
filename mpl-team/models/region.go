package models

type Region struct {
	ID   uint   `json:"id" gorm:"primaryKey"`
	Name string `json:"name" binding:"required"`
	Code string `json:"code" binding:"required"`
	Logo string `json:"logo" binding:"required"`
}
