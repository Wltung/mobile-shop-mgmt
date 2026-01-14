package handler

import (
	"api/internal/model"
	"api/internal/service"
	"net/http"

	"github.com/gin-gonic/gin"
)

type PhoneHandler struct {
	Service *service.PhoneService
}

func NewPhoneHandler(s *service.PhoneService) *PhoneHandler {
	return &PhoneHandler{Service: s}
}

// POST /api/phones
func (h *PhoneHandler) CreatePhone(c *gin.Context) {
	var input model.PhoneInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// --- LẤY USER ID TỪ CONTEXT (Do Middleware Auth gắn vào) ---
	userIDFloat, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := int(userIDFloat.(float64)) // Ép kiểu về int

	// Truyền userID vào Service
	phoneID, sourceID, err := h.Service.ImportPhone(input, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":   "Nhập kho thành công",
		"phone_id":  phoneID,
		"source_id": sourceID, // Trả về ID khách để FE tạo hóa đơn
	})
}

// GET /api/phones
func (h *PhoneHandler) GetPhones(c *gin.Context) {
	// 1. LẤY USER ID TỪ CONTEXT (Bắt buộc phải có vì đã qua Middleware Auth)
	userIDFloat, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := int(userIDFloat.(float64))

	var filter model.PhoneFilter
	// BindQuery sẽ tự động lấy ?page=1&keyword=abc...
	if err := c.ShouldBindQuery(&filter); err != nil {
		// Set default nếu bind lỗi
		filter.Page = 1
		filter.Limit = 5
	}

	// 2. Truyền userID vào Service
	phones, total, totalValue, err := h.Service.GetPhones(userID, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi hệ thống: " + err.Error()})
		return
	}

	// Tính tổng số trang
	totalPages := 0
	if filter.Limit > 0 {
		totalPages = (total + filter.Limit - 1) / filter.Limit
	}

	// 3. Trả về
	c.JSON(http.StatusOK, gin.H{
		"message": "Lấy dữ liệu thành công",
		"data":    phones,
		"meta": gin.H{
			"page":        filter.Page,
			"limit":       filter.Limit,
			"total":       total,
			"total_pages": totalPages,
			"total_value": totalValue,
		},
	})
}
