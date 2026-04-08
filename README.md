# 📱 Mobile Shop Management System (ERP)

Một hệ thống quản lý bán hàng toàn diện (ERP) dành cho các cửa hàng kinh doanh thiết bị di động. Hệ thống được thiết kế theo kiến trúc **Monorepo** với khả năng hỗ trợ **Multi-tenant (Đa cửa hàng)**, giúp quản lý liền mạch từ kho bãi, bán hàng, hóa đơn đến sửa chữa và bảo hành.

---

## Tính năng nổi bật

### 🔐 Xác thực & Phân quyền an toàn
- Đăng nhập/Đăng ký với JWT (Access Token lưu qua HttpOnly Cookie).
- Luồng **"Quên mật khẩu"** an toàn tích hợp gửi Email SMTP.
- Cơ chế chống Spam API và Blacklist Token.

### 🏢 Multi-Tenant
- Quản lý dữ liệu hoàn toàn độc lập cho nhiều cửa hàng trên cùng một hệ thống.

### 📦 Quản lý Kho (Inventory)
- Theo dõi trạng thái từng thiết bị qua IMEI:
  - `IN_STOCK`
  - `SOLD`
  - `REPAIRING`

### 🧾 Quản lý Hóa đơn (Invoices)
- Hỗ trợ các loại:
  - Nhập hàng (Import)
  - Bán hàng (Sale)
  - Sửa chữa (Repair)

### 🛠️ Sửa chữa & Bảo hành
- Theo dõi tiến trình sửa chữa thiết bị.
- Quản lý thiết bị của khách và cửa hàng.
- Sinh mã bảo hành và theo dõi thời hạn bảo hành theo IMEI / Linh kiện.

### 📊 Dashboard
- Báo cáo trực quan:
  - Doanh thu
  - Tồn kho
  - Hiệu suất hoạt động

---

## 🛠️ Tech Stack

### Frontend (`/apps/web`)
- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS + Shadcn UI
- **State Management:** Zustand + React Hook Form
- **Validation:** Zod
- **Icons:** Lucide React

### Backend (`/apps/api`)
- **Language:** Golang
- **Framework:** Gin
- **Database Toolkit:** sqlx + go-sql-driver/mysql
- **Authentication:** JWT + bcrypt
- **Migration:** golang-migrate

### Database & DevOps
- **Database:** MySQL 8.0
- **Containerization:** Docker & Docker Compose
- **Reverse Proxy:** Nginx
- **CI/CD:** GitHub Actions + AWS EC2 + Docker Hub

---

## 📂 Cấu trúc dự án (Monorepo)

```plaintext
mobile-shop-mgmt/
├── apps/
│   ├── api/                # Golang Backend Server
│   │   ├── cmd/            # Entry point (main.go)
│   │   ├── internal/       # Core logic (handlers, services, repos, middlewares)
│   │   └── migrations/     # Database migration scripts
│   └── web/                # Next.js Frontend Application
│       ├── src/app/        # App Router pages
│       ├── src/components/ # UI components
│       ├── src/hooks/      # Custom hooks
│       └── src/services/   # API services
├── packages/               # Shared packages (optional)
├── docker-compose.yml      # Dev environment
└── docker-compose.prod.yml # Production environment
```
---

## 🗄️ Database Schema Tổng quan

Các bảng chính:

- **tenants, users** → Quản lý cửa hàng & người dùng  
- **phones** → Quản lý thiết bị theo IMEI  
- **invoices, invoice_items** → Giao dịch & chi tiết  
- **repairs** → Theo dõi sửa chữa  
- **warranties** → Quản lý bảo hành  
- **password_resets** → Reset mật khẩu  
- **blacklisted_tokens** → Token bị vô hiệu hóa  

---

## 💻 Hướng dẫn cài đặt (Local Development)

### Yêu cầu môi trường
- Node.js >= 18.x  
- pnpm  
- Go >= 1.22  
- Docker & Docker Compose  

---

### 1. Khởi chạy Database

Tạo file `.env` (hoặc config trực tiếp trong docker-compose):

~~~bash
docker compose up -d mysql
~~~

---

### 2. Chạy Backend (API)

~~~bash
cd apps/api

# Cấu hình file .env (DB, JWT, SMTP, ...)
go mod download
go run cmd/main.go
~~~

API chạy tại:  
    http://localhost:9000  

---

### 3. Chạy Frontend (Web)

~~~bash
cd apps/web
pnpm install
pnpm dev
~~~

App chạy tại:  
    http://localhost:3000  

---

## ☁️ Deployment (CI/CD)

Hệ thống triển khai tự động lên AWS EC2 thông qua GitHub Actions:

### 🔄 Quy trình:
1. Code được push/merge vào `main`  
2. GitHub Actions:
   - Build Docker image (web + api)  
   - Push lên Docker Hub  
3. Server EC2:
   - Pull image mới  
   - Restart container bằng `docker-compose.prod.yml`  
   - Reverse proxy qua Nginx  

---

## Ghi chú

- Hệ thống thiết kế theo hướng **scalable & multi-tenant**  
- Phù hợp cho:
  - Chuỗi cửa hàng  
  - Startup bán lẻ thiết bị di động  
  - Hệ thống quản lý nội bộ  
