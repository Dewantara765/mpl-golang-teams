package controllers

import (
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"mpl-team/models"
)

type AuthController struct {
	DB *gorm.DB
}

func NewAuthController(db *gorm.DB) *AuthController {
	return &AuthController{
		DB: db,
	}
}

type RegisterInput struct {
	Name     string `json:"name" binding:"required"`
	Username string `json:"username" binding:"required,min=3,max=50"`
	Password string `json:"password" binding:"required,min=8"`
	Email    string `json:"email" binding:"required,email"`
}

type LoginInput struct {
	Login    string `json:"login" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type AuthClaims struct {
	UserID uint            `json:"user_id"`
	Role   models.UserRole `json:"role"`
	jwt.RegisteredClaims
}

func (ac *AuthController) Register(c *gin.Context) {
	var input RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Input tidak valid",
		})
		return
	}

	input.Name = strings.TrimSpace(input.Name)
	input.Username = strings.TrimSpace(input.Username)
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))

	if input.Name == "" || input.Username == "" || input.Email == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Nama, username, dan email wajib diisi",
		})
		return
	}

	if len([]byte(input.Password)) > 72 {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Password maksimal 72 byte",
		})
		return
	}

	// Periksa apakah username sudah digunakan.
	var existingUser models.User

	err := ac.DB.
		Where("username = ?", input.Username).
		First(&existingUser).Error

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"message": "Username sudah digunakan",
		})
		return
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Terjadi kesalahan pada server",
		})
		return
	}

	// Periksa apakah email sudah digunakan.
	err = ac.DB.
		Where("email = ?", input.Email).
		First(&existingUser).Error

	if err == nil {
		c.JSON(http.StatusConflict, gin.H{
			"message": "Email sudah digunakan",
		})
		return
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Terjadi kesalahan pada server",
		})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword(
		[]byte(input.Password),
		bcrypt.DefaultCost,
	)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Gagal memproses password",
		})
		return
	}

	user := models.User{
		Name:     input.Name,
		Username: input.Username,
		Email:    input.Email,
		Password: string(hashedPassword),
		Role:     models.RoleUser,
	}

	if err := ac.DB.Create(&user).Error; err != nil {
		// Tetap perlu menangani unique constraint di sini,
		// karena request bersamaan dapat lolos dari pemeriksaan awal.
		c.JSON(http.StatusConflict, gin.H{
			"message": "Username atau email sudah digunakan",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Registrasi berhasil",
		"data": gin.H{
			"id":       user.ID,
			"name":     user.Name,
			"username": user.Username,
			"email":    user.Email,
			"role":     user.Role,
		},
	})
}

func (ac *AuthController) Login(c *gin.Context) {
	var input LoginInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"message": "Login dan password wajib diisi",
		})
		return
	}

	input.Login = strings.TrimSpace(input.Login)

	var user models.User

	err := ac.DB.
		Where(
			"username = ? OR email = ?",
			input.Login,
			strings.ToLower(input.Login),
		).
		First(&user).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusUnauthorized, gin.H{
				"message": "Username/email atau password salah",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Terjadi kesalahan pada server",
		})
		return
	}

	if err := bcrypt.CompareHashAndPassword(
		[]byte(user.Password),
		[]byte(input.Password),
	); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"message": "Username/email atau password salah",
		})
		return
	}

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Konfigurasi autentikasi belum tersedia",
		})
		return
	}

	claims := AuthClaims{
		UserID: user.ID,
		Role:   user.Role,
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "user",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	tokenString, err := token.SignedString([]byte(secret))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"message": "Gagal membuat token",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Login berhasil",
		"token":   tokenString,
		"user": gin.H{
			"id":       user.ID,
			"name":     user.Name,
			"username": user.Username,
			"email":    user.Email,
			"role":     user.Role,
		},
	})
}
