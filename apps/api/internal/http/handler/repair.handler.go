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

func (h *RepairHandler) CreateRepair(c *gin.Context) {
	var input model.CreateRepairInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID := int(c.MustGet("userID").(float64))
	tenantID := int(c.MustGet("tenantID").(float64))

	id, err := h.Service.CreateRepairTicket(input, userID, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi tạo phiếu: " + err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":   "Tạo phiếu nhận máy thành công",
		"repair_id": id,
	})
}

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

	tenantID := int(c.MustGet("tenantID").(float64))

	if err := h.Service.UpdateRepairTicket(id, input, tenantID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi khi cập nhật phiếu: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật phiếu sửa chữa thành công"})
}

func (h *RepairHandler) GetRepair(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID không hợp lệ"})
		return
	}

	tenantID := int(c.MustGet("tenantID").(float64))

	repair, err := h.Service.GetRepairDetail(id, tenantID)
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

	tenantID := int(c.MustGet("tenantID").(float64))

	items, total, stats, err := h.Service.GetRepairs(filter, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

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

func (h *RepairHandler) CompleteRepair(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID không hợp lệ"})
		return
	}

	userID := int(c.MustGet("userID").(float64))
	tenantID := int(c.MustGet("tenantID").(float64))

	invoiceID, err := h.Service.CompleteRepair(id, userID, tenantID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":    "Đã hoàn thành sửa chữa và xuất hoá đơn",
		"invoice_id": invoiceID,
	})
}

func (h *RepairHandler) DeleteRepair(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID không hợp lệ"})
		return
	}

	tenantID := int(c.MustGet("tenantID").(float64))

	if err := h.Service.DeleteRepairTicket(id, tenantID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Đã xoá phiếu sửa chữa thành công"})
}
