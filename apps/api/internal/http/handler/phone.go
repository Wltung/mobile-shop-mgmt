package handler

import (
	"api/internal/model"
	"api/internal/service"
	"net/http"
	"strconv"

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
	if err := h.Service.ImportPhone(input, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Nhập kho thành công"})
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

	// Lấy page & limit từ URL (Mặc định page=1, limit=10)
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))

	// 2. Truyền userID vào Service
	phones, total, totalValue, err := h.Service.GetPhones(userID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi hệ thống: " + err.Error()})
		return
	}

	// Tính tổng số trang
	totalPages := 0
	if limit > 0 {
		totalPages = (total + limit - 1) / limit
	}

	// 3. Trả về
	c.JSON(http.StatusOK, gin.H{
		"message": "Lấy dữ liệu thành công",
		"data":    phones,
		"meta": gin.H{
			"page":        page,
			"limit":       limit,
			"total":       total,
			"total_pages": totalPages,
			"total_value": totalValue,
		},
	})
}
