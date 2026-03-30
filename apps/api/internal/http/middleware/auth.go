package middleware

import (
	"api/internal/config"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

func Auth(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 1. Ưu tiên lấy token từ Cookie (HttpOnly)
		tokenString, err := c.Cookie("access_token")

		// 2. Fallback: Nếu không có cookie, thử tìm trong Header (để test Postman hoặc Mobile App sau này)
		if tokenString == "" {
			header := c.GetHeader("Authorization")
			if header != "" {
				parts := strings.Split(header, " ")
				if len(parts) == 2 && parts[0] == "Bearer" {
					tokenString = parts[1]
				}
			}
		}

		// 3. Nếu cả 2 nơi đều không có -> Báo lỗi
		if tokenString == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Chưa đăng nhập (Thiếu token)"})
			return
		}

		// 4. Parse và Verify Token
		token, err := jwt.Parse(tokenString, func(t *jwt.Token) (interface{}, error) {
			return []byte(cfg.JWTSecret), nil
		})

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Token không hợp lệ hoặc đã hết hạn"})
			return
		}

		// (Optional) Lưu claims vào context nếu cần dùng ở handler sau
		if claims, ok := token.Claims.(jwt.MapClaims); ok {
			c.Set("userID", claims["sub"])
			c.Set("tenantID", claims["tenant_id"]) // CỰC KỲ QUAN TRỌNG
			c.Set("role", claims["role"])
		}

		c.Next()
	}
}
