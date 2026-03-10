CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(230) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('ADMIN', 'BUYER', 'DRIVER') DEFAULT 'BUYER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE waste_categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) NOT NULL, -- e.g., 'Plastic', 'Organic', 'Medical'
    price_per_unit DECIMAL(12,2) NOT NULL, -- Price per bag or bin
    unit_type VARCHAR(50) DEFAULT 'bin', -- 'bin', 'kg', 'bag'
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_location (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(230) NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);




CREATE TABLE user_addresses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(230) NOT NULL,
    address_line TEXT NOT NULL,
    city VARCHAR(150),
    latitude DECIMAL(10, 8), -- Storing as Decimal is better for math/distance
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(230) UNIQUE,
    user_id VARCHAR(230) NOT NULL,
    driver_id VARCHAR(230) DEFAULT NULL, -- Assigned driver
    total_amount DECIMAL(12,2) NOT NULL,
    order_status ENUM('PENDING', 'PAID', 'ASSIGNED', 'IN_TRANSIT', 'COLLECTED', 'CANCELLED') DEFAULT 'PENDING',
    payment_status ENUM('UNPAID', 'PAID', 'FAILED', 'REFUNDED') DEFAULT 'UNPAID',
    pickup_address TEXT NOT NULL,
    pickup_latitude DECIMAL(10, 8),
    pickup_longitude DECIMAL(11, 8),
    scheduled_for TIMESTAMP NULL, -- When the user wants the pickup
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (driver_id) REFERENCES users(user_id)
);


CREATE TABLE transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(230),
    user_id VARCHAR(230),
    transaction_reference VARCHAR(150) UNIQUE, -- From MoMo Gateway (e.g., Paystack/Flutterwave)
    payment_method VARCHAR(100) DEFAULT 'MoMo',
    amount DECIMAL(12,2) NOT NULL,
    status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
    external_response TEXT, -- Store raw MoMo API response for debugging
    paid_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE user_wallets (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(230) NOT NULL UNIQUE,
    balance DECIMAL(12,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE system_wallet (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    balance DECIMAL(20,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE otp_token (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    token VARCHAR(10) NOT NULL,
    email VARCHAR(200) NOT NULL,
    type ENUM('LOGIN', 'PASSWORD_RESET', 'PAYMENT_VERIFY'),
    status ENUM('active', 'expired', 'used') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(230),
    title VARCHAR(230),
    message TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);