package scopes

import (
	"strings"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Sort(c *gin.Context) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		sort := c.DefaultQuery("sort", "id")
		order := strings.ToLower(c.DefaultQuery("order", "asc"))

		allowedSort := map[string]string{
			"id":   "id",
			"name": "name",
		}

		column, exists := allowedSort[sort]
		if !exists {
			column = "id"
		}

		if order != "asc" && order != "desc" {
			order = "asc"
		}

		return db.Order(column + " " + order)
	}
}
