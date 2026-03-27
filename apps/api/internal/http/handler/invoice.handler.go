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

// PATCH /api/invoices/:id
func (h *InvoiceHandler) UpdateInvoice(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID không hợp lệ"})
		return
	}

	var input model.UpdateInvoiceInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDFloat, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa đăng nhập hoặc phiên làm việc hết hạn"})
		return
	}
	userID := int(userIDFloat.(float64))

	if err := h.Service.UpdateInvoice(id, input, userID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật hoá đơn thành công"})
}

func (h *InvoiceHandler) GetInvoices(c *gin.Context) {
	var filter model.InvoiceFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(400, gin.H{"error": "Tham số không hợp lệ"})
		return
	}

	items, total, stats, err := h.Service.GetInvoices(filter)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

	// Tính toán metadata phân trang
	totalPages := (total + filter.Limit - 1) / filter.Limit

	c.JSON(200, gin.H{
		"message": "Lấy danh sách hoá đơn thành công",
		"data":    items,
		"stats":   stats,
		"meta": map[string]interface{}{
			"page":        filter.Page,
			"limit":       filter.Limit,
			"total":       total,
			"total_pages": totalPages,
		},
	})
}

// DELETE /api/invoices/:id
func (h *InvoiceHandler) DeleteInvoice(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID không hợp lệ"})
		return
	}

	userIDFloat, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa đăng nhập"})
		return
	}
	userID := int(userIDFloat.(float64))

	// Gọi bộ não điều phối
	if err := h.Service.CancelOrDeleteInvoice(id, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Đã xử lý hoá đơn thành công"})
}
