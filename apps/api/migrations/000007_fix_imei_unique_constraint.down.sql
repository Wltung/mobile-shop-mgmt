-- 1. Xoá unique composite
DROP INDEX uniq_phones_user_imei ON phones;

-- 2. Tạo lại unique global (trạng thái cũ)
CREATE UNIQUE INDEX imei ON phones (imei);
