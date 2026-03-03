package handler

import (
	"api/internal/model"
	"api/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type WarrantyHandler struct {
	Service *service.WarrantyService
}

func NewWarrantyHandler(s *service.WarrantyService) *WarrantyHandler {
	return &WarrantyHandler{Service: s}
}

func (h *WarrantyHandler) Create(c *gin.Context) {
	var input model.CreateWarrantyInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := int(c.MustGet("userID").(float64))
	id, err := h.Service.CreateWarranty(input, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Tạo phiếu bảo hành thành công", "id": id})
}

func (h *WarrantyHandler) GetAll(c *gin.Context) {
	var filter model.WarrantyFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Nhận thêm stats
	items, total, stats, err := h.Service.GetWarranties(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	totalPages := total / filter.Limit
	if total%filter.Limit != 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, gin.H{
		"data": items,
		"meta": map[string]interface{}{
			"page": filter.Page, "limit": filter.Limit, "total": total, "total_pages": totalPages,
		},
		"stats": stats, // BỔ SUNG TRẢ VỀ CHO FRONTEND
	})
}

func (h *WarrantyHandler) GetByID(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	item, err := h.Service.GetWarrantyDetail(id)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": item})
}

func (h *WarrantyHandler) Update(c *gin.Context) {
	id, _ := strconv.Atoi(c.Param("id"))
	var input model.UpdateWarrantyInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.Service.UpdateWarranty(id, input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật thành công"})
}

func (h *WarrantyHandler) SearchEligible(c *gin.Context) {
	keyword := c.Query("keyword")
	invType := c.Query("type")

	if invType == "" {
		invType = "SALE"
	}

	items, err := h.Service.SearchEligibleItems(keyword, invType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if items == nil {
		items = []model.WarrantySearchItem{}
	}

	c.JSON(http.StatusOK, gin.H{"data": items})
}
