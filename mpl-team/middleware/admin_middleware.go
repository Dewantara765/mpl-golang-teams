// middleware/admin_middleware.go
package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"mpl-team/models"
)

func AdminMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("role")

		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Autentikasi diperlukan",
			})
			return
		}

		if role != models.RoleAdmin {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"message": "Akses hanya untuk admin",
			})
			return
		}

		c.Next()
	}
}
