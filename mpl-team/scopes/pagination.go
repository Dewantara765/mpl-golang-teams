package scopes

import (
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func Paginate(c *gin.Context) func(db *gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
		pageSize, _ := strconv.Atoi(c.DefaultQuery("pageSize", "7"))

		if page <= 0 {
			page = 1
		}
		if pageSize <= 0 {
			pageSize = 7
		}

		offset := (page - 1) * pageSize
		return db.Offset(offset).Limit(pageSize)
	}
}
