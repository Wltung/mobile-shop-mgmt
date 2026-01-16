-- 1. Xóa ràng buộc UNIQUE cũ trên cột imei (đang là Global)
ALTER TABLE phones DROP INDEX imei;

-- 2. Tạo unique composite theo user (shop)
CREATE UNIQUE INDEX uniq_phones_user_imei
ON phones (import_by, imei);