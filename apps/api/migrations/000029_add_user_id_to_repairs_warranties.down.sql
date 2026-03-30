-- Xoá foreign key trước
ALTER TABLE repairs DROP FOREIGN KEY fk_repairs_user;
ALTER TABLE warranties DROP FOREIGN KEY fk_warranties_user;

-- Xoá index
DROP INDEX idx_repairs_user_id ON repairs;
DROP INDEX idx_warranties_user_id ON warranties;

-- Xoá column
ALTER TABLE repairs DROP COLUMN user_id;
ALTER TABLE warranties DROP COLUMN user_id;