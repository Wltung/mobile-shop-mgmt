package mailer

import (
	"fmt"
	"net/smtp"
	"os"
)

func SendResetPasswordEmail(toEmail string, resetToken string) error {
	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASSWORD")

	// Lấy domain Frontend từ env, nếu không có thì mặc định localhost
	frontendOrigin := os.Getenv("FRONTEND_ORIGIN")
	if frontendOrigin == "" {
		frontendOrigin = "http://localhost:3000"
	}
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", frontendOrigin, resetToken)

	// Setup xác thực với Gmail
	auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)

	// Soạn nội dung Email (Hỗ trợ HTML cho đẹp)
	subject := "Subject: Đặt lại mật khẩu - Hệ thống quản lý cửa hàng\n"
	mime := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\n\n"
	body := fmt.Sprintf(`
		<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
			<h2 style="color: #333;">Yêu cầu đặt lại mật khẩu</h2>
			<p>Bạn vừa yêu cầu đặt lại mật khẩu. Vui lòng click vào nút bên dưới để tạo mật khẩu mới:</p>
			<div style="margin: 30px 0;">
				<a href="%s" style="padding: 12px 20px; background-color: #000; color: #fff; text-decoration: none; border-radius: 5px; font-weight: bold;">ĐẶT LẠI MẬT KHẨU</a>
			</div>
			<p style="color: #666; font-size: 14px;">Link này sẽ tự động hết hạn sau 15 phút.</p>
			<p style="color: #666; font-size: 14px;">Nếu bạn không yêu cầu, vui lòng bỏ qua email này và mật khẩu của bạn vẫn an toàn.</p>
		</div>
	`, resetLink)

	msg := []byte(subject + mime + body)

	// Bấm nút "Gửi"
	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, smtpUser, []string{toEmail}, msg)
	return err
}
