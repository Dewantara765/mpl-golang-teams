package helpers

import (
	"errors"
	"math"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

type Pagination struct {
	Page       int    `json:"page"`
	PageSize   int    `json:"pageSize"`
	Offset     int    `json:"-"`
	TotalCount int64  `json:"totalCount"`
	TotalPage  int    `json:"totalPage"`
	Search     string `json:"search"`
}

func GetPagination(c *gin.Context) (Pagination, error) {
	page, err := strconv.Atoi(c.DefaultQuery("page", "1"))
	if err != nil {
		return Pagination{}, errors.New("invalid page")
	}

	pageSize, err := strconv.Atoi(c.DefaultQuery("pageSize", "7"))
	if err != nil {
		return Pagination{}, errors.New("invalid pageSize")
	}

	search := strings.TrimSpace(c.DefaultQuery("search", ""))

	if page < 1 {
		page = 1
	}

	if pageSize < 1 {
		pageSize = 7
	}

	return Pagination{
		Page:     page,
		PageSize: pageSize,
		Offset:   (page - 1) * pageSize,
		Search:   search,
	}, nil
}

func (p *Pagination) SetTotal(total int64) {
	p.TotalCount = total
	p.TotalPage = int(math.Ceil(float64(total) / float64(p.PageSize)))
}
