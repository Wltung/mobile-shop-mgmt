-- =========================================================================
-- MIGRATION 31: INIT MULTI-TENANT (SHARED DB, SHARED SCHEMA)
-- =========================================================================

-- 1. DỌN SẠCH DATA RÁC ĐỂ TRÁNH XUNG ĐỘT KHI THÊM CỘT NOT NULL
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE invoice_items;
TRUNCATE TABLE warranties;
TRUNCATE TABLE repairs;
TRUNCATE TABLE invoices;
TRUNCATE TABLE phones;
TRUNCATE TABLE password_resets;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================================
-- 2. TẠO BẢNG TENANTS (THỰC THỂ CỬA HÀNG)
-- =========================================================================
CREATE TABLE `tenants` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
    `phone` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
    `status` enum('ACTIVE', 'SUSPENDED') COLLATE utf8mb4_unicode_ci DEFAULT 'ACTIVE',
    `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================================
-- 3. CẬP NHẬT BẢNG USERS
-- =========================================================================
ALTER TABLE `users` 
ADD COLUMN `tenant_id` int NOT NULL AFTER `id`;

ALTER TABLE `users`
ADD CONSTRAINT `fk_users_tenant` 
FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- 4. CẬP NHẬT BẢNG PHONES
-- =========================================================================
ALTER TABLE `phones` 
ADD COLUMN `tenant_id` int NOT NULL AFTER `id`;

ALTER TABLE `phones` 
ADD CONSTRAINT `fk_phones_tenant` 
FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- [ĐÃ FIX LỖI 1553]: Gỡ tạm Foreign Key ra trước
ALTER TABLE `phones` DROP FOREIGN KEY `fk_phones_import_by_users`;

-- Sau đó mới được xoá Unique Index cũ và tạo lại theo Tenant
ALTER TABLE `phones` DROP INDEX `uniq_phones_user_imei`;
CREATE UNIQUE INDEX `uniq_phones_tenant_imei` ON `phones`(`tenant_id`, `imei`);

-- Cuối cùng: Gắn trả lại Foreign Key cho cột import_by
ALTER TABLE `phones` 
ADD CONSTRAINT `fk_phones_import_by_users` 
FOREIGN KEY (`import_by`) REFERENCES `users` (`id`) 
ON DELETE RESTRICT;

-- =========================================================================
-- 5. CẬP NHẬT BẢNG INVOICES
-- =========================================================================
ALTER TABLE `invoices` 
ADD COLUMN `tenant_id` int NOT NULL AFTER `id`;

ALTER TABLE `invoices` 
ADD CONSTRAINT `fk_invoices_tenant` 
FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Xoá Unique Index cũ và tạo lại theo Tenant
ALTER TABLE `invoices` DROP INDEX `idx_invoice_code_user`;
CREATE UNIQUE INDEX `idx_invoice_code_tenant` ON `invoices`(`tenant_id`, `invoice_code`);

-- =========================================================================
-- 6. CẬP NHẬT BẢNG REPAIRS
-- =========================================================================
ALTER TABLE `repairs` 
ADD COLUMN `tenant_id` int NOT NULL AFTER `id`;

ALTER TABLE `repairs` 
ADD CONSTRAINT `fk_repairs_tenant` 
FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- 7. CẬP NHẬT BẢNG WARRANTIES
-- =========================================================================
ALTER TABLE `warranties` 
ADD COLUMN `tenant_id` int NOT NULL AFTER `id`;

ALTER TABLE `warranties` 
ADD CONSTRAINT `fk_warranties_tenant` 
FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`) 
ON DELETE CASCADE ON UPDATE CASCADE;

-- Xoá Unique Index cũ và tạo lại theo Tenant
ALTER TABLE `warranties` DROP INDEX `idx_warranty_code_user`;
CREATE UNIQUE INDEX `idx_warranty_code_tenant` ON `warranties`(`tenant_id`, `warranty_code`);