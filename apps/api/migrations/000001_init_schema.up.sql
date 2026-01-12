-- Bảng Users (Auth)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role ENUM('admin', 'staff') DEFAULT 'staff',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bảng Phones (Kho máy)
CREATE TABLE IF NOT EXISTS phones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imei VARCHAR(32) NOT NULL UNIQUE,
    model_name VARCHAR(255) NOT NULL,
    details JSON, -- Thông tin chi tiết điện thoại
    status ENUM('IN_STOCK', 'SOLD', 'REPAIRING') NOT NULL DEFAULT 'IN_STOCK',
    purchase_price DECIMAL(15, 2) NOT NULL, -- Giá nhập
    sale_price DECIMAL(15, 2), -- Giá bán
    purchase_date DATE, -- Ngày mua
    sale_date DATE, -- Ngày bán
    note TEXT, -- Ghi chú
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bảng Customers (Khách hàng)
CREATE TABLE IF NOT EXISTS customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) UNIQUE,
    id_number VARCHAR(50) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Bảng Invoices (Hóa đơn chung cho Mua/Bán)
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('IMPORT', 'SALE', 'REPAIR') NOT NULL,
    phone_id INT NULL,
    customer_id INT,
    total_amount DECIMAL(15, 2) NOT NULL,
    warranty_months INT DEFAULT 0,
    warranty_expiry DATE,
    created_by INT, -- Link với bảng users
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    CONSTRAINT fk_invoices_user
        FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_invoices_phone
        FOREIGN KEY (phone_id) REFERENCES phones(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_invoices_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE warranties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone_id INT NOT NULL,
    start_date DATE,
    end_date DATE,
    CONSTRAINT fk_warranties_phone
        FOREIGN KEY (phone_id) REFERENCES phones(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE repairs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    phone_id INT,
    customer_id INT,
    repair_type ENUM('NORMAL', 'WARRANTY') NOT NULL,
    description TEXT,
    part_cost DECIMAL(12,2),
    repair_price DECIMAL(12,2),
    device_password VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_repairs_phone
        FOREIGN KEY (phone_id) REFERENCES phones(id)
        ON DELETE SET NULL,
    CONSTRAINT fk_repairs_customer
        FOREIGN KEY (customer_id) REFERENCES customers(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE accessories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(12,2),
    CONSTRAINT fk_accessories_invoice
        FOREIGN KEY (invoice_id) REFERENCES invoices(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

