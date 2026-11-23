-- =============================================================================
-- Logistic & Dispatch Management System — Core Relational Schema
-- Fully normalized, clean, and explicit Foreign Key relationships for ER diagrams
-- =============================================================================

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS deliveries;
DROP TABLE IF EXISTS dispatch_assignments;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS vehicles;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS refresh_tokens;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS service_zones;
DROP TABLE IF EXISTS hubs;
DROP TABLE IF EXISTS regions;
DROP TABLE IF EXISTS customers;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. REGIONS
CREATE TABLE regions (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    code        VARCHAR(10)     NOT NULL UNIQUE,
    name        VARCHAR(100)    NOT NULL,
    state       VARCHAR(50)     NOT NULL DEFAULT 'Maharashtra',
    status      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 2. HUBS
CREATE TABLE hubs (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    region_id       BIGINT UNSIGNED NOT NULL,
    parent_hub_id   BIGINT UNSIGNED NULL,
    code            VARCHAR(20)     NOT NULL UNIQUE,
    name            VARCHAR(100)    NOT NULL,
    hub_type        VARCHAR(20)     NOT NULL DEFAULT 'HUB',
    address_line    VARCHAR(255)    NOT NULL,
    pincode         VARCHAR(10)     NOT NULL,
    manager_user_id BIGINT UNSIGNED NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_hubs_region FOREIGN KEY (region_id) REFERENCES regions (id),
    CONSTRAINT fk_hubs_parent FOREIGN KEY (parent_hub_id) REFERENCES hubs (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 3. SERVICE ZONES (Pincode -> Hub)
CREATE TABLE service_zones (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    hub_id      BIGINT UNSIGNED NOT NULL,
    pincode     VARCHAR(10)     NOT NULL UNIQUE,
    area_name   VARCHAR(100)    NOT NULL,
    status      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at  DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_zones_hub FOREIGN KEY (hub_id) REFERENCES hubs (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 4. USERS (Staff: Admin, Dispatcher, Driver)
CREATE TABLE users (
    id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    hub_id        BIGINT UNSIGNED NULL,
    username      VARCHAR(50)     NOT NULL UNIQUE,
    password_hash VARCHAR(255)    NOT NULL,
    full_name     VARCHAR(100)    NOT NULL,
    email         VARCHAR(100)    NOT NULL UNIQUE,
    phone         VARCHAR(20)     NOT NULL,
    role          VARCHAR(20)     NOT NULL,
    status        VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_users_hub FOREIGN KEY (hub_id) REFERENCES hubs (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Link Hub Manager back to users
ALTER TABLE hubs ADD CONSTRAINT fk_hubs_manager FOREIGN KEY (manager_user_id) REFERENCES users (id);

-- 5. CUSTOMERS (Separate table with direct phone login)
CREATE TABLE customers (
    id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    full_name     VARCHAR(150)    NOT NULL,
    phone         VARCHAR(20)     NOT NULL UNIQUE,
    email         VARCHAR(100)    NULL,
    address       VARCHAR(500)    NOT NULL,
    pincode       VARCHAR(10)     NOT NULL,
    password_hash VARCHAR(255)    NULL,
    status        VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 6. DRIVERS
CREATE TABLE drivers (
    id               BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id          BIGINT UNSIGNED NOT NULL UNIQUE,
    hub_id           BIGINT UNSIGNED NOT NULL,
    driver_name      VARCHAR(150)    NOT NULL,
    phone            VARCHAR(20)     NOT NULL,
    license_number   VARCHAR(50)     NOT NULL UNIQUE,
    max_daily_orders INT             NOT NULL DEFAULT 60,
    status           VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at       DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_drivers_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_drivers_hub  FOREIGN KEY (hub_id)  REFERENCES hubs (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 7. VEHICLES
CREATE TABLE vehicles (
    id              BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    hub_id          BIGINT UNSIGNED NOT NULL,
    registration_no VARCHAR(30)     NOT NULL UNIQUE,
    vehicle_type    VARCHAR(50)     NOT NULL,
    capacity_kg     DECIMAL(10,2)   NOT NULL DEFAULT 100.00,
    status          VARCHAR(20)     NOT NULL DEFAULT 'AVAILABLE',
    created_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at      DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_vehicles_hub FOREIGN KEY (hub_id) REFERENCES hubs (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 8. ORDERS (Direct relationship to Customer & Hub; simplified addresses)
CREATE TABLE orders (
    id                  BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    tracking_no         VARCHAR(30)     NOT NULL UNIQUE,
    customer_id         BIGINT UNSIGNED NOT NULL,
    hub_id              BIGINT UNSIGNED NOT NULL,
    source_address      VARCHAR(500)    NOT NULL,
    destination_address VARCHAR(500)    NOT NULL,
    destination_pincode VARCHAR(10)     NOT NULL,
    order_amount        DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    payment_mode        VARCHAR(10)     NOT NULL DEFAULT 'PREPAID',
    weight_kg           DECIMAL(8,2)    NOT NULL DEFAULT 1.00,
    current_status      VARCHAR(30)     NOT NULL DEFAULT 'PENDING',
    dispatch_date       DATE            NOT NULL,
    promised_date       DATE            NOT NULL,
    created_at          DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at          DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers (id),
    CONSTRAINT fk_orders_hub      FOREIGN KEY (hub_id)      REFERENCES hubs (id),
    CONSTRAINT chk_orders_status  CHECK (current_status IN ('PENDING','ASSIGNED','OUT_FOR_DELIVERY','DELIVERED','DELAYED','CANCELLED')),
    CONSTRAINT chk_orders_payment CHECK (payment_mode IN ('PREPAID','COD'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 9. DISPATCH ASSIGNMENTS (One active assignment per order)
CREATE TABLE dispatch_assignments (
    id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id      BIGINT UNSIGNED NOT NULL UNIQUE,
    driver_id     BIGINT UNSIGNED NOT NULL,
    vehicle_id    BIGINT UNSIGNED NOT NULL,
    hub_id        BIGINT UNSIGNED NOT NULL,
    assigned_date DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    status        VARCHAR(30)     NOT NULL DEFAULT 'ASSIGNED',
    remarks       VARCHAR(255)    NULL,
    created_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    updated_at    DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_assign_order   FOREIGN KEY (order_id)   REFERENCES orders (id),
    CONSTRAINT fk_assign_driver  FOREIGN KEY (driver_id)  REFERENCES drivers (id),
    CONSTRAINT fk_assign_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles (id),
    CONSTRAINT fk_assign_hub     FOREIGN KEY (hub_id)     REFERENCES hubs (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 10. DELIVERIES (Handover & Proof of Delivery)
CREATE TABLE deliveries (
    id                BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    order_id          BIGINT UNSIGNED NOT NULL UNIQUE,
    assignment_id     BIGINT UNSIGNED NULL,
    delivery_date     DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    status            VARCHAR(20)     NOT NULL DEFAULT 'DELIVERED',
    amount_collected  DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    remarks           VARCHAR(500)    NULL,
    proof_of_delivery VARCHAR(255)    NULL,
    created_at        DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_deliv_order      FOREIGN KEY (order_id)      REFERENCES orders (id),
    CONSTRAINT fk_deliv_assignment FOREIGN KEY (assignment_id) REFERENCES dispatch_assignments (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- 11. REFRESH TOKENS (JWT Authentication)
CREATE TABLE refresh_tokens (
    id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    user_id    BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(255)    NOT NULL,
    expires_at DATETIME(3)     NOT NULL,
    created_at DATETIME(3)     NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    CONSTRAINT fk_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
