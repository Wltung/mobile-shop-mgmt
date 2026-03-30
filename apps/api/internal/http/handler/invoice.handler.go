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

	userID := int(c.MustGet("userID").(float64))
	tenantID := int(c.MustGet("tenantID").(float64))

	id, err := h.Service.CreateInvoice(input, userID, tenantID)
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

	tenantID := int(c.MustGet("tenantID").(float64))
	invoice, err := h.Service.GetInvoiceDetail(id, tenantID)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy hóa đơn hoặc không có quyền truy cập"})
		} else {
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

	tenantID := int(c.MustGet("tenantID").(float64))
	if err := h.Service.UpdateStatus(id, input.Status, tenantID); err != nil {
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

	tenantID := int(c.MustGet("tenantID").(float64))

	if err := h.Service.UpdateInvoice(id, input, tenantID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật hoá đơn thành công"})
}

// GET /api/invoices
func (h *InvoiceHandler) GetInvoices(c *gin.Context) {
	var filter model.InvoiceFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
		c.JSON(400, gin.H{"error": "Tham số không hợp lệ"})
		return
	}

	tenantID := int(c.MustGet("tenantID").(float64))
	items, total, stats, err := h.Service.GetInvoices(filter, tenantID)
	if err != nil {
		c.JSON(500, gin.H{"error": err.Error()})
		return
	}

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

	tenantID := int(c.MustGet("tenantID").(float64))

	if err := h.Service.CancelOrDeleteInvoice(id, tenantID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Đã xử lý hoá đơn thành công"})
}
