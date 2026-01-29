package handler

import (
	"api/internal/model"
	"api/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type InvoiceHandler struct {
	Service *service.InvoiceService
}

func NewInvoiceHandler(s *service.InvoiceService) *InvoiceHandler {
	return &InvoiceHandler{Service: s}
}

// POST /api/invoices
func (h *InvoiceHandler) CreateInvoice(c *gin.Context) {
	var input model.CreateInvoiceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Lấy UserID từ token
	userIDFloat, _ := c.Get("userID")
	userID := int(userIDFloat.(float64))

	id, err := h.Service.CreateInvoice(input, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "Tạo hóa đơn thành công",
		"invoice_id": id,
	})
}

// GET /api/invoices/:id
func (h *InvoiceHandler) GetInvoice(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID không hợp lệ"})
		return
	}

	invoice, err := h.Service.GetInvoiceDetail(id)
	if err != nil {
		// [SỬA] Kiểm tra kỹ loại lỗi để trả về status code đúng
		if err.Error() == "sql: no rows in result set" { // Hoặc check sql.ErrNoRows nếu import database/sql
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy hóa đơn"})
		} else {
			// Log lỗi ra console để debug
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi server: " + err.Error()})
		}
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": invoice})
}

// PATCH /api/invoices/:id/status
func (h *InvoiceHandler) UpdateInvoiceStatus(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID không hợp lệ"})
		return
	}

	var input struct {
		Status string `json:"status" binding:"required,oneof=PAID DRAFT CANCELLED"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.Service.UpdateStatus(id, input.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật trạng thái thành công"})
}
