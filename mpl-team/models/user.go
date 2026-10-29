package models

import "gorm.io/gorm"

type UserRole string

const (
	RoleAdmin UserRole = "admin"
	RoleUser  UserRole = "user"
)

type User struct {
	gorm.Model

	Name     string   `gorm:"type:varchar(100);not null" json:"name"`
	Username string   `gorm:"type:varchar(50);not null;uniqueIndex" json:"username"`
	Password string   `gorm:"type:varchar(255);not null" json:"-"`
	Email    string   `gorm:"type:varchar(191);not null;uniqueIndex" json:"email"`
	Role     UserRole `gorm:"type:varchar(20);not null;default:user" json:"role"`
}
