package handler

import (
	"api/internal/model"
	"api/internal/service"
	"database/sql"
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

	userIDFloat, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := int(userIDFloat.(float64))

	phoneID, err := h.Service.ImportPhone(input, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Nhập kho thành công",
		"phone_id": phoneID,
	})
}

func (h *PhoneHandler) handleGetList(
	c *gin.Context,
	// ĐÃ FIX: Thêm map[string]interface{} vào chữ ký của func parameter
	serviceFunc func(int, model.PhoneFilter) ([]model.Phone, int, float64, map[string]interface{}, error),
) {
	userIDFloat, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	userID := int(userIDFloat.(float64))

	var filter model.PhoneFilter
	if err := c.ShouldBindQuery(&filter); err != nil {
	}

	if filter.Page <= 0 {
		filter.Page = 1
	}
	if filter.Limit <= 0 {
		filter.Limit = 5
	}

	// ĐÃ FIX: Hứng thêm biến stats
	phones, total, totalValue, stats, err := serviceFunc(userID, filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi hệ thống: " + err.Error()})
		return
	}

	totalPages := 0
	if filter.Limit > 0 {
		totalPages = (total + filter.Limit - 1) / filter.Limit
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Lấy dữ liệu thành công",
		"data":    phones,
		"stats":   stats, // ĐÃ FIX: Gắn cục stats vào response JSON gửi về FE
		"meta": gin.H{
			"page":        filter.Page,
			"limit":       filter.Limit,
			"total":       total,
			"total_pages": totalPages,
			"total_value": totalValue,
		},
	})
}

func (h *PhoneHandler) GetImportPhones(c *gin.Context) {
	h.handleGetList(c, h.Service.GetImportPhones)
}

func (h *PhoneHandler) GetSalePhones(c *gin.Context) {
	h.handleGetList(c, h.Service.GetSalePhones)
}

func (h *PhoneHandler) GetPhoneDetail(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID máy không hợp lệ"})
		return
	}

	userIDFloat, exists := c.Get("userID")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Chưa đăng nhập"})
		return
	}
	userID := int(userIDFloat.(float64))

	phone, err := h.Service.GetPhoneDetail(id, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "Không tìm thấy máy hoặc bạn không có quyền xem"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Lỗi server: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Thành công",
		"data":    phone,
	})
}

func (h *PhoneHandler) UpdatePhone(c *gin.Context) {
	idStr := c.Param("id")
	id, _ := strconv.Atoi(idStr)

	var input model.PhoneUpdateInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userIDFloat, _ := c.Get("userID")
	userID := int(userIDFloat.(float64))

	err := h.Service.UpdatePhone(id, input, userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cập nhật thành công"})
}

func (h *PhoneHandler) DeletePhone(c *gin.Context) {
	idStr := c.Param("id")
	id, err := strconv.Atoi(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID không hợp lệ"})
		return
	}

	userIDFloat, _ := c.Get("userID")
	userID := int(userIDFloat.(float64))

	if err := h.Service.DeletePhone(id, userID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Đã xoá máy thành công"})
}
