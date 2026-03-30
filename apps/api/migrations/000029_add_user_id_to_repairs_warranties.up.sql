-- Thêm cột user_id vào repairs
ALTER TABLE repairs
ADD COLUMN user_id INT NULL AFTER invoice_id;

-- Thêm cột user_id vào warranties
ALTER TABLE warranties
ADD COLUMN user_id INT NULL AFTER invoice_id;

-- Tạo index
CREATE INDEX idx_repairs_user_id ON repairs(user_id);
CREATE INDEX idx_warranties_user_id ON warranties(user_id);

-- Thêm foreign key
ALTER TABLE repairs
ADD CONSTRAINT fk_repairs_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE warranties
ADD CONSTRAINT fk_warranties_user
FOREIGN KEY (user_id) REFERENCES users(id)
ON DELETE SET NULL
ON UPDATE CASCADE;