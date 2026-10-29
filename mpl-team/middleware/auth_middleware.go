// middleware/auth_middleware.go
package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"

	"mpl-team/models"
)

type AuthClaims struct {
	UserID uint            `json:"user_id"`
	Role   models.UserRole `json:"role"`
	jwt.RegisteredClaims
}

func AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")

		parts := strings.Fields(authHeader)
		if len(parts) != 2 || !strings.EqualFold(parts[0], "Bearer") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Token autentikasi diperlukan",
			})
			return
		}

		secret := os.Getenv("JWT_SECRET")
		if secret == "" {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{
				"message": "Konfigurasi autentikasi belum tersedia",
			})
			return
		}

		claims := &AuthClaims{}

		token, err := jwt.ParseWithClaims(
			parts[1],
			claims,
			func(token *jwt.Token) (any, error) {
				if token.Method != jwt.SigningMethodHS256 {
					return nil, jwt.ErrSignatureInvalid
				}

				return []byte(secret), nil
			},
		)

		if err != nil || token == nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Token tidak valid atau sudah kedaluwarsa",
			})
			return
		}

		if claims.UserID == 0 ||
			(claims.Role != models.RoleAdmin && claims.Role != models.RoleUser) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"message": "Claims token tidak valid",
			})
			return
		}

		// Simpan identitas user untuk handler berikutnya.
		c.Set("user_id", claims.UserID)
		c.Set("role", claims.Role)

		c.Next()
	}
}
