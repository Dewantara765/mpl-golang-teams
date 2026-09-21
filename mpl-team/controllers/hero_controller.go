package controllers

import (
	"errors"
	"io"
	"math"
	"mime/multipart"
	"mpl-team/config"
	"mpl-team/models"
	"mpl-team/scopes"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"fmt"
	"time"

	"github.com/gin-gonic/gin"
)

const (
	maxLogoSize = 2 * 1024 * 1024 // 2 MB
)

// Helper untuk upload dan validasi logo
func saveHeroLogo(c *gin.Context, fileHeader *multipart.FileHeader) (string, error) {
	if fileHeader.Size > maxLogoSize {
		return "", errors.New("logo must not exceed 2 MB")
	}

	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	buffer := make([]byte, 512)

	n, err := io.ReadFull(file, buffer)
	if err != nil && err != io.ErrUnexpectedEOF {
		return "", err
	}

	mimeType := http.DetectContentType(buffer[:n])

	allowedTypes := map[string]string{
		"image/jpeg": ".jpg",
		"image/png":  ".png",
		"image/webp": ".webp",
	}

	extension, valid := allowedTypes[mimeType]

	if !valid {
		return "", errors.New("only JPG, PNG and WEBP images are allowed")
	}

	uploadDir := "uploads/hero"

	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		return "", err
	}

	filename := fmt.Sprintf(
		"hero-%d%s",
		time.Now().Unix(),
		extension,
	)

	filePath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(fileHeader, filePath); err != nil {
		return "", err
	}

	return filePath, nil
}

func FindHeroes(c *gin.Context) {
	var heroes []models.Hero

	var total int64

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "7"))

	if page < 1 {
		page = 1
	}

	if limit < 1 || limit > 100 {
		limit = 7
	}

	offset := (page - 1) * limit

	config.DB.Model(&models.Hero{}).Count(&total)
	if err := config.DB.
		Limit(limit).
		Offset(offset).
		Scopes(scopes.Sort(c)).
		Find(&heroes).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Failed to retrieve heroes"})
		return
	}

	totalPages := int(math.Ceil(float64(total) / float64(limit)))

	sort := c.DefaultQuery("sort", "id")
	order := c.DefaultQuery("order", "desc")
	c.JSON(http.StatusOK, gin.H{
		"data":        heroes,
		"page":        page,
		"limit":       limit,
		"total":       total,
		"total_pages": totalPages,
		"sort":        sort,
		"order":       order,
	})
}

func FindHeroByID(c *gin.Context) {
	id := c.Param("id")
	var hero models.Hero

	if err := config.DB.First(&hero, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Hero not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": hero})
}

func CreateHero(c *gin.Context) {
	name := strings.TrimSpace(c.PostForm("name"))

	errors := make(map[string]string)

	if name == "" {
		errors["name"] = "Name is required"
	}

	var existingHero models.Hero

	if err := config.DB.
		Where("name = ?", name).
		First(&existingHero).Error; err == nil {
		errors["name"] = "Name already exists"
	}

	fileHeader, err := c.FormFile("logo")

	if err != nil {
		errors["logo"] = "Logo is required"
	}

	if len(errors) > 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"errors": errors,
		})
		return
	}

	// Upload dan validasi logo
	logoPath, err := saveHeroLogo(c, fileHeader)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"errors": map[string]string{
				"logo": err.Error(),
			},
		})
		return
	}

	// Simpan hero
	hero := models.Hero{
		Name: name,
		Logo: logoPath,
	}

	if err := config.DB.Create(&hero).Error; err != nil {

		// Hapus logo jika database gagal
		os.Remove(logoPath)

		c.JSON(http.StatusInternalServerError, gin.H{
			"errors": map[string]string{
				"hero": "Failed to create hero",
			},
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data": hero,
	})
}

func UpdateHero(c *gin.Context) {
	id := c.Param("id")

	var hero models.Hero

	if err := config.DB.First(&hero, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Hero not found",
		})
		return
	}

	name := strings.TrimSpace(c.PostForm("name"))

	if name == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"errors": map[string]string{
				"name": "Name is required",
			},
		})
		return
	}

	oldLogo := hero.Logo
	newLogo := ""

	// Cek apakah ada logo baru
	fileHeader, err := c.FormFile("logo")

	if err == nil {
		// Upload dan validasi logo baru
		newLogo, err = saveHeroLogo(c, fileHeader)

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{
				"errors": map[string]string{
					"logo": err.Error(),
				},
			})
			return
		}
	}

	// Update data hero
	hero.Name = name

	if newLogo != "" {
		hero.Logo = newLogo
	}

	if err := config.DB.Save(&hero).Error; err != nil {

		// Hapus logo baru jika database gagal
		if newLogo != "" {
			os.Remove(newLogo)
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"errors": map[string]string{
				"hero": "Failed to update hero",
			},
		})
		return
	}

	// Hapus logo lama setelah database berhasil
	if newLogo != "" && oldLogo != "" {
		os.Remove(oldLogo)
	}

	c.JSON(http.StatusOK, gin.H{
		"data": hero,
	})
}

func DeleteHero(c *gin.Context) {
	id := c.Param("id")

	var hero models.Hero

	if err := config.DB.First(&hero, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "Hero not found",
		})
		return
	}

	// Hapus data dari database
	if err := config.DB.Delete(&hero).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"errors": map[string]string{
				"hero": "Failed to delete hero",
			},
		})
		return
	}

	// Hapus file logo
	if hero.Logo != "" {
		if err := os.Remove(hero.Logo); err != nil &&
			!os.IsNotExist(err) {

			// Data sudah dihapus dari database,
			// tetapi file gagal dihapus.
			fmt.Println("Failed to delete logo:", err)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Hero deleted successfully",
	})
}
