package handler

import (
	"api/internal/model"
	"api/internal/service"
	"database/sql"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type RepairHandler struct {
	Service *service.RepairService
}

func NewRepairHandler(s *service.RepairService) *RepairHandler {
	return &RepairHandler{Service: s}
}

// POST /api/repairs
func (h *RepairHandler) CreateRepair(c *gin.Context) {
	var input model.CreateRepairInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Lấy UserID từ token để biết nhân viên nào tạo phiếu
	userIDFloat, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa đăng nhập"})
		return
	}
	userID := int(userIDFloat.(float64))

	id, err := h.Service.CreateRepairTicket(input, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi tạo phiếu: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":   "Tạo phiếu nhận máy thành công",
		"repair_id": id,
	})
}

// PATCH /api/repairs/:id
func (h *RepairHandler) UpdateRepair(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID không hợp lệ"})
		return
	}

	var input model.UpdateRepairInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.Service.UpdateRepairTicket(id, input); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi cập nhật phiếu: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật phiếu sửa chữa thành công"})
}

// GET /api/repairs/:id
func (h *RepairHandler) GetRepair(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID không hợp lệ"})
		return
	}

	repair, err := h.Service.GetRepairDetail(id)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy phiếu sửa chữa"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi server: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": repair})
}

func (h *RepairHandler) GetRepairs(c *gin.Context) {
	var filter model.RepairFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	items, total, stats, err := h.Service.GetRepairs(filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// Tính Meta
	totalPages := total / filter.Limit
	if total%filter.Limit != 0 {
		totalPages++
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  items,
		"stats": stats,
		"meta": map[string]interface{}{
			"page":        filter.Page,
			"limit":       filter.Limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}
