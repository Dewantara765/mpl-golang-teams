package scopes

import (
	"strings"

	"fmt"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Sort(c *gin.Context) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		sort := c.DefaultQuery("sort", "id")
		order := c.DefaultQuery("order", "asc")

		if strings.ToLower(order) != "asc" && strings.ToLower(order) != "desc" {
			order = "asc"
		}

		OrderQuery := fmt.Sprintf("%s %s", sort, order)
		db = db.Order(OrderQuery)
		return db
	}
}
