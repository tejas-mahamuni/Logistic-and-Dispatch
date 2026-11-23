-- =============================================================================
-- LOGISTIC AND DISPATCH MANAGEMENT SYSTEM (v2)
-- MASTER POSTGRESQL SCHEMA & SEED DATA FOR SUPABASE
-- =============================================================================

DROP TABLE IF EXISTS deliveries CASCADE;
DROP TABLE IF EXISTS dispatch_assignments CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS vehicles CASCADE;
DROP TABLE IF EXISTS drivers CASCADE;
DROP TABLE IF EXISTS refresh_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS service_zones CASCADE;
DROP TABLE IF EXISTS hubs CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- 2. HUBS (Central Sorting Warehouse & Last-Mile Delivery Hubs)
CREATE TABLE hubs (
    id              BIGSERIAL PRIMARY KEY,
    parent_hub_id   BIGINT NULL REFERENCES hubs (id) ON DELETE SET NULL ON UPDATE CASCADE,
    code            VARCHAR(20)     NOT NULL UNIQUE,
    name            VARCHAR(100)    NOT NULL,
    hub_type        VARCHAR(20)     NOT NULL DEFAULT 'HUB',
    address_line    VARCHAR(255)    NOT NULL,
    pincode         VARCHAR(10)     NOT NULL,
    manager_user_id BIGINT NULL,
    status          VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. SERVICE ZONES (Pincode Postal Coverage mapped to Hub)
CREATE TABLE service_zones (
    id          BIGSERIAL PRIMARY KEY,
    hub_id      BIGINT          NOT NULL REFERENCES hubs (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    pincode     VARCHAR(10)     NOT NULL UNIQUE,
    area_name   VARCHAR(100)    NOT NULL,
    status      VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. USERS (Staff Accounts: ADMIN, MANAGER, DISPATCHER, DRIVER)
CREATE TABLE users (
    id            BIGSERIAL PRIMARY KEY,
    hub_id        BIGINT          NULL REFERENCES hubs (id) ON DELETE SET NULL ON UPDATE CASCADE,
    username      VARCHAR(50)     NOT NULL UNIQUE,
    password_hash VARCHAR(255)    NOT NULL,
    full_name     VARCHAR(100)    NOT NULL,
    email         VARCHAR(100)    NOT NULL UNIQUE,
    phone         VARCHAR(20)     NOT NULL,
    role          VARCHAR(20)     NOT NULL,
    status        VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. CUSTOMERS (Customer Directory with Direct Phone Login)
CREATE TABLE customers (
    id            BIGSERIAL PRIMARY KEY,
    full_name     VARCHAR(150)    NOT NULL,
    phone         VARCHAR(20)     NOT NULL UNIQUE,
    email         VARCHAR(100)    NULL,
    address       VARCHAR(500)    NOT NULL,
    pincode       VARCHAR(10)     NOT NULL,
    password_hash VARCHAR(255)    NULL,
    status        VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. DRIVERS (Fleet Drivers linked to Staff User Account and Hub)
CREATE TABLE drivers (
    id               BIGSERIAL PRIMARY KEY,
    user_id          BIGINT          NOT NULL UNIQUE REFERENCES users (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    hub_id           BIGINT          NOT NULL REFERENCES hubs (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    driver_name      VARCHAR(150)    NOT NULL,
    phone            VARCHAR(20)     NOT NULL,
    license_number   VARCHAR(50)     NOT NULL UNIQUE,
    max_daily_orders INT             NOT NULL DEFAULT 60,
    status           VARCHAR(20)     NOT NULL DEFAULT 'ACTIVE',
    created_at       TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. VEHICLES (Fleet Assets assigned to Hubs)
CREATE TABLE vehicles (
    id              BIGSERIAL PRIMARY KEY,
    hub_id          BIGINT          NOT NULL REFERENCES hubs (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    registration_no VARCHAR(30)     NOT NULL UNIQUE,
    vehicle_type    VARCHAR(50)     NOT NULL,
    capacity_kg     DECIMAL(10,2)   NOT NULL DEFAULT 100.00,
    status          VARCHAR(20)     NOT NULL DEFAULT 'AVAILABLE',
    created_at      TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. ORDERS (Consignments with Source, Destination & Pincode Auto-Routing)
CREATE TABLE orders (
    id                  BIGSERIAL PRIMARY KEY,
    tracking_no         VARCHAR(30)     NOT NULL UNIQUE,
    customer_id         BIGINT          NOT NULL REFERENCES customers (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    hub_id              BIGINT          NOT NULL REFERENCES hubs (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    source_address      VARCHAR(500)    NOT NULL,
    destination_address VARCHAR(500)    NOT NULL,
    destination_pincode VARCHAR(10)     NOT NULL,
    order_amount        DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    payment_mode        VARCHAR(10)     NOT NULL DEFAULT 'PREPAID',
    weight_kg           DECIMAL(8,2)    NOT NULL DEFAULT 1.00,
    current_status      VARCHAR(30)     NOT NULL DEFAULT 'PENDING',
    dispatch_date       DATE            NOT NULL,
    promised_date       DATE            NOT NULL,
    created_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_orders_status  CHECK (current_status IN ('PENDING','ASSIGNED','OUT_FOR_DELIVERY','DELIVERED','DELAYED','CANCELLED')),
    CONSTRAINT chk_orders_payment CHECK (payment_mode IN ('PREPAID','COD'))
);

-- 9. DISPATCH ASSIGNMENTS (Order Allocated to Driver, Vehicle & Hub)
CREATE TABLE dispatch_assignments (
    id            BIGSERIAL PRIMARY KEY,
    order_id      BIGINT          NOT NULL UNIQUE REFERENCES orders (id) ON DELETE CASCADE ON UPDATE CASCADE,
    driver_id     BIGINT          NOT NULL REFERENCES drivers (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    vehicle_id    BIGINT          NOT NULL REFERENCES vehicles (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    hub_id        BIGINT          NOT NULL REFERENCES hubs (id) ON DELETE RESTRICT ON UPDATE CASCADE,
    assigned_date TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status        VARCHAR(30)     NOT NULL DEFAULT 'ASSIGNED',
    remarks       VARCHAR(255)    NULL,
    created_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. DELIVERIES (Handover Confirmation & Cash Collection Record)
CREATE TABLE deliveries (
    id                BIGSERIAL PRIMARY KEY,
    order_id          BIGINT          NOT NULL UNIQUE REFERENCES orders (id) ON DELETE CASCADE ON UPDATE CASCADE,
    assignment_id     BIGINT          NULL REFERENCES dispatch_assignments (id) ON DELETE SET NULL ON UPDATE CASCADE,
    delivery_date     TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status            VARCHAR(20)     NOT NULL DEFAULT 'DELIVERED',
    amount_collected  DECIMAL(10,2)   NOT NULL DEFAULT 0.00,
    remarks           VARCHAR(500)    NULL,
    proof_of_delivery VARCHAR(255)    NULL,
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. REFRESH TOKENS (JWT Session Persistence)
CREATE TABLE refresh_tokens (
    id         BIGSERIAL PRIMARY KEY,
    user_id    BIGINT          NOT NULL REFERENCES users (id) ON DELETE CASCADE ON UPDATE CASCADE,
    token_hash VARCHAR(255)    NOT NULL,
    expires_at TIMESTAMPTZ     NOT NULL,
    created_at TIMESTAMPTZ     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- 2. HUBS
INSERT INTO hubs (id, parent_hub_id, code, name, hub_type, address_line, pincode, status)
VALUES 
(1, NULL, 'PUN-WH-01', 'Pune Central Sorting Warehouse', 'WAREHOUSE', 'Plot 42, Chakan Industrial Area, Phase 2', '410501', 'ACTIVE'),
(2, 1, 'PUN-HUB-01', 'Hinjawadi Delivery Hub', 'HUB', 'Phase 1, Rajiv Gandhi Infotech Park, Hinjawadi', '411057', 'ACTIVE'),
(3, 1, 'PUN-HUB-02', 'Shivajinagar Delivery Hub', 'HUB', 'Near FC Road, Shivajinagar', '411005', 'ACTIVE'),
(4, 1, 'PUN-HUB-03', 'Kothrud Delivery Hub', 'HUB', 'Paud Road, Near Vanaz Corner, Kothrud', '411038', 'ACTIVE'),
(5, 1, 'PUN-HUB-04', 'Hadapsar Delivery Hub', 'HUB', 'Magarpatta South Gate, Hadapsar', '411028', 'ACTIVE'),
(6, 1, 'PUN-HUB-05', 'Viman Nagar Delivery Hub', 'HUB', 'Symbiosis Road, Viman Nagar', '411014', 'ACTIVE');

-- 3. SERVICE ZONES
INSERT INTO service_zones (id, hub_id, pincode, area_name, status)
VALUES
(1, 2, '411057', 'Hinjawadi Phase 1, 2, 3', 'ACTIVE'),
(2, 2, '411033', 'Wakad & Thergaon', 'ACTIVE'),
(3, 3, '411005', 'Shivajinagar & Model Colony', 'ACTIVE'),
(4, 3, '411004', 'Prabhat Road & FC Road', 'ACTIVE'),
(5, 4, '411038', 'Kothrud & Ideal Colony', 'ACTIVE'),
(6, 4, '411029', 'Karve Nagar & Warje', 'ACTIVE'),
(7, 5, '411028', 'Hadapsar & Sasane Nagar', 'ACTIVE'),
(8, 5, '411013', 'Magarpatta City & Amanora', 'ACTIVE'),
(9, 6, '411014', 'Viman Nagar & Airport Area', 'ACTIVE'),
(10, 6, '411006', 'Yerwada & Shastri Nagar', 'ACTIVE');

-- 4. USERS (BCrypt hash of 'Secret@123')
INSERT INTO users (id, hub_id, username, password_hash, full_name, email, phone, role, status)
VALUES
(1, NULL, 'admin', '$2a$10$3zP9p1i/p0u6F7O5m8C.heE6qA1k8qgV.1N8yD9qJ0O8t5K1l3bKa', 'System Administrator', 'admin@logistic.local', '+919800000001', 'ADMIN', 'ACTIVE'),
(2, 2, 'hinjawadi.disp', '$2a$10$3zP9p1i/p0u6F7O5m8C.heE6qA1k8qgV.1N8yD9qJ0O8t5K1l3bKa', 'Amit Deshmukh (Dispatcher)', 'hinjawadi.disp@logistic.local', '+919800000004', 'DISPATCHER', 'ACTIVE'),
(3, 2, 'hinjawadi.driver1', '$2a$10$3zP9p1i/p0u6F7O5m8C.heE6qA1k8qgV.1N8yD9qJ0O8t5K1l3bKa', 'Suresh Kadam (Driver)', 'hinjawadi.driver1@logistic.local', '+919800000005', 'DRIVER', 'ACTIVE'),
(4, 2, 'hinjawadi.driver2', '$2a$10$3zP9p1i/p0u6F7O5m8C.heE6qA1k8qgV.1N8yD9qJ0O8t5K1l3bKa', 'Ganesh More (Driver)', 'hinjawadi.driver2@logistic.local', '+919800000006', 'DRIVER', 'ACTIVE'),
(5, 3, 'shivaji.disp', '$2a$10$3zP9p1i/p0u6F7O5m8C.heE6qA1k8qgV.1N8yD9qJ0O8t5K1l3bKa', 'Pooja Kulkarni (Dispatcher)', 'shivaji.disp@logistic.local', '+919800000008', 'DISPATCHER', 'ACTIVE'),
(6, 3, 'shivaji.driver1', '$2a$10$3zP9p1i/p0u6F7O5m8C.heE6qA1k8qgV.1N8yD9qJ0O8t5K1l3bKa', 'Santosh Pawar (Driver)', 'shivaji.driver1@logistic.local', '+919800000009', 'DRIVER', 'ACTIVE');

-- Link Hub Manager User IDs
UPDATE hubs SET manager_user_id = 2 WHERE id = 2;
UPDATE hubs SET manager_user_id = 5 WHERE id = 3;

-- 5. CUSTOMERS
INSERT INTO customers (id, full_name, phone, email, address, pincode, password_hash, status)
VALUES
(1, 'Rajesh Sharma', '+919822011111', 'rajesh.sharma@example.com', 'Flat 402, Rohan Tarang, Wakad, Pune', '411033', '$2a$10$3zP9p1i/p0u6F7O5m8C.heE6qA1k8qgV.1N8yD9qJ0O8t5K1l3bKa', 'ACTIVE'),
(2, 'Priya Patel', '+919822022222', 'priya.patel@example.com', 'Bldg B-3, Blue Ridge, Hinjawadi Phase 1, Pune', '411057', '$2a$10$3zP9p1i/p0u6F7O5m8C.heE6qA1k8qgV.1N8yD9qJ0O8t5K1l3bKa', 'ACTIVE'),
(3, 'Amit Verma', '+919822033333', 'amit.verma@example.com', '12, Deep Bungalow Chowk, Shivajinagar, Pune', '411005', '$2a$10$3zP9p1i/p0u6F7O5m8C.heE6qA1k8qgV.1N8yD9qJ0O8t5K1l3bKa', 'ACTIVE'),
(4, 'Sneha Kulkarni', '+919822044444', 'sneha.kulkarni@example.com', 'Plot 18, Mayur Colony, Kothrud, Pune', '411038', '$2a$10$3zP9p1i/p0u6F7O5m8C.heE6qA1k8qgV.1N8yD9qJ0O8t5K1l3bKa', 'ACTIVE'),
(5, 'Vikas Deshmukh', '+919822055555', 'vikas.deshmukh@example.com', 'Tower 5, Amanora Park Town, Hadapsar, Pune', '411028', '$2a$10$3zP9p1i/p0u6F7O5m8C.heE6qA1k8qgV.1N8yD9qJ0O8t5K1l3bKa', 'ACTIVE');

-- 6. DRIVERS
INSERT INTO drivers (id, user_id, hub_id, driver_name, phone, license_number, max_daily_orders, status)
VALUES
(1, 3, 2, 'Suresh Kadam', '+919800000005', 'MH12-2018-0012345', 60, 'ACTIVE'),
(2, 4, 2, 'Ganesh More', '+919800000006', 'MH12-2019-0054321', 60, 'ACTIVE'),
(3, 6, 3, 'Santosh Pawar', '+919800000009', 'MH12-2020-0098765', 50, 'ACTIVE');

-- 7. VEHICLES
INSERT INTO vehicles (id, hub_id, registration_no, vehicle_type, capacity_kg, status)
VALUES
(1, 2, 'MH12-EV-1001', 'BIKE', 35.00, 'AVAILABLE'),
(2, 2, 'MH12-EV-1002', 'BIKE', 35.00, 'AVAILABLE'),
(3, 2, 'MH12-TR-2001', 'THREE_WHEELER', 350.00, 'AVAILABLE'),
(4, 2, 'MH12-VN-3001', 'MINI_VAN', 800.00, 'AVAILABLE'),
(5, 3, 'MH12-EV-1003', 'BIKE', 35.00, 'AVAILABLE'),
(6, 3, 'MH12-VN-3002', 'MINI_VAN', 800.00, 'AVAILABLE');

-- 8. ORDERS
INSERT INTO orders (id, tracking_no, customer_id, hub_id, source_address, destination_address, destination_pincode, order_amount, payment_mode, weight_kg, current_status, dispatch_date, promised_date)
VALUES
(1, 'TRK-PUN-1001', 1, 2, 'Plot 42, Chakan Industrial Area', 'Flat 402, Rohan Tarang, Wakad, Pune', '411033', 0.00, 'PREPAID', 1.20, 'PENDING', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
(2, 'TRK-PUN-1002', 2, 2, 'Plot 42, Chakan Industrial Area', 'Bldg B-3, Blue Ridge, Hinjawadi Phase 1, Pune', '411057', 1250.00, 'COD', 2.50, 'PENDING', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
(3, 'TRK-PUN-1003', 1, 2, 'Plot 42, Chakan Industrial Area', 'Flat 402, Rohan Tarang, Wakad, Pune', '411033', 450.00, 'COD', 0.80, 'PENDING', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
(4, 'TRK-PUN-1004', 2, 2, 'Plot 42, Chakan Industrial Area', 'Bldg B-3, Blue Ridge, Hinjawadi Phase 1, Pune', '411057', 0.00, 'PREPAID', 3.10, 'OUT_FOR_DELIVERY', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
(5, 'TRK-PUN-1005', 3, 3, 'Plot 42, Chakan Industrial Area', '12, Deep Bungalow Chowk, Shivajinagar, Pune', '411005', 899.00, 'COD', 1.50, 'DELIVERED', CURRENT_DATE - INTERVAL '1 day', CURRENT_DATE),
(6, 'TRK-PUN-1009', 1, 1, 'Pune Central Sorting Warehouse, Chakan', 'Flat 402, Rohan Tarang, Wakad, Pune', '411033', 1850.00, 'COD', 3.20, 'PENDING', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day'),
(7, 'TRK-PUN-1010', 3, 1, 'Pune Central Sorting Warehouse, Chakan', '12, Deep Bungalow Chowk, Shivajinagar, Pune', '411005', 0.00, 'PREPAID', 1.10, 'PENDING', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day');

-- 9. DISPATCH ASSIGNMENTS
INSERT INTO dispatch_assignments (id, order_id, driver_id, vehicle_id, hub_id, assigned_date, status, remarks)
VALUES
(1, 4, 1, 1, 2, CURRENT_TIMESTAMP, 'OUT_FOR_DELIVERY', 'Assigned to Suresh Kadam on Bike MH12-EV-1001'),
(2, 5, 3, 5, 3, CURRENT_TIMESTAMP - INTERVAL '1 day', 'DELIVERED', 'Delivered yesterday');

-- 10. DELIVERIES
INSERT INTO deliveries (id, order_id, assignment_id, delivery_date, status, amount_collected, remarks)
VALUES
(1, 5, 2, CURRENT_TIMESTAMP - INTERVAL '1 day', 'DELIVERED', 899.00, 'Cash collected and handed over');

-- Update serial sequences so subsequent inserts auto-increment without ID collisions
SELECT setval(pg_get_serial_sequence('hubs', 'id'), coalesce(max(id), 1)) FROM hubs;
SELECT setval(pg_get_serial_sequence('service_zones', 'id'), coalesce(max(id), 1)) FROM service_zones;
SELECT setval(pg_get_serial_sequence('users', 'id'), coalesce(max(id), 1)) FROM users;
SELECT setval(pg_get_serial_sequence('customers', 'id'), coalesce(max(id), 1)) FROM customers;
SELECT setval(pg_get_serial_sequence('drivers', 'id'), coalesce(max(id), 1)) FROM drivers;
SELECT setval(pg_get_serial_sequence('vehicles', 'id'), coalesce(max(id), 1)) FROM vehicles;
SELECT setval(pg_get_serial_sequence('orders', 'id'), coalesce(max(id), 1)) FROM orders;
SELECT setval(pg_get_serial_sequence('dispatch_assignments', 'id'), coalesce(max(id), 1)) FROM dispatch_assignments;
SELECT setval(pg_get_serial_sequence('deliveries', 'id'), coalesce(max(id), 1)) FROM deliveries;
