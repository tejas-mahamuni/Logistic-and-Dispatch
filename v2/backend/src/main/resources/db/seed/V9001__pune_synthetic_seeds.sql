-- =============================================================================
-- Logistic & Dispatch Management System — Pune Seed Data
-- =============================================================================

SET NAMES utf8mb4;

-- 1. REGIONS
INSERT INTO regions (id, code, name, state, status)
VALUES (1, 'PUN', 'Pune Metropolitan Region', 'Maharashtra', 'ACTIVE')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 2. HUBS
INSERT INTO hubs (id, region_id, parent_hub_id, code, name, hub_type, address_line, pincode, status)
VALUES 
(1, 1, NULL, 'PUN-WH-01', 'Pune Central Sorting Warehouse', 'WAREHOUSE', 'Plot 42, Chakan Industrial Area, Phase 2', '410501', 'ACTIVE'),
(2, 1, 1, 'PUN-HUB-01', 'Hinjawadi Delivery Hub', 'HUB', 'Phase 1, Rajiv Gandhi Infotech Park, Hinjawadi', '411057', 'ACTIVE'),
(3, 1, 1, 'PUN-HUB-02', 'Shivajinagar Delivery Hub', 'HUB', 'Near FC Road, Shivajinagar', '411005', 'ACTIVE'),
(4, 1, 1, 'PUN-HUB-03', 'Kothrud Delivery Hub', 'HUB', 'Paud Road, Near Vanaz Corner, Kothrud', '411038', 'ACTIVE'),
(5, 1, 1, 'PUN-HUB-04', 'Hadapsar Delivery Hub', 'HUB', 'Magarpatta South Gate, Hadapsar', '411028', 'ACTIVE'),
(6, 1, 1, 'PUN-HUB-05', 'Viman Nagar Delivery Hub', 'HUB', 'Symbiosis Road, Viman Nagar', '411014', 'ACTIVE')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 3. SERVICE ZONES (Pincode to Hub)
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
(10, 6, '411006', 'Yerwada & Shastri Nagar', 'ACTIVE')
ON DUPLICATE KEY UPDATE area_name = VALUES(area_name);

-- 4. USERS (Staff Accounts: BCrypt hash of 'Secret@123')
INSERT INTO users (id, hub_id, username, password_hash, full_name, email, phone, role, status)
VALUES
-- Global Admin
(1, NULL, 'admin', '$2a$10$wN1QGg0W0j9Z1Jk1wN9uUOa5s7K0Y4J3O2c1N9m8e7d6c5b4a3a2a', 'System Administrator', 'admin@logistic.local', '+919800000001', 'ADMIN', 'ACTIVE'),
-- Hinjawadi Dispatcher / Manager
(2, 2, 'hinjawadi.disp', '$2a$10$wN1QGg0W0j9Z1Jk1wN9uUOa5s7K0Y4J3O2c1N9m8e7d6c5b4a3a2a', 'Amit Deshmukh (Dispatcher)', 'hinjawadi.disp@logistic.local', '+919800000004', 'DISPATCHER', 'ACTIVE'),
-- Hinjawadi Drivers
(3, 2, 'hinjawadi.driver1', '$2a$10$wN1QGg0W0j9Z1Jk1wN9uUOa5s7K0Y4J3O2c1N9m8e7d6c5b4a3a2a', 'Suresh Kadam (Driver)', 'hinjawadi.driver1@logistic.local', '+919800000005', 'DRIVER', 'ACTIVE'),
(4, 2, 'hinjawadi.driver2', '$2a$10$wN1QGg0W0j9Z1Jk1wN9uUOa5s7K0Y4J3O2c1N9m8e7d6c5b4a3a2a', 'Ganesh More (Driver)', 'hinjawadi.driver2@logistic.local', '+919800000006', 'DRIVER', 'ACTIVE'),
-- Shivajinagar Dispatcher & Driver
(5, 3, 'shivaji.disp', '$2a$10$wN1QGg0W0j9Z1Jk1wN9uUOa5s7K0Y4J3O2c1N9m8e7d6c5b4a3a2a', 'Pooja Kulkarni (Dispatcher)', 'shivaji.disp@logistic.local', '+919800000008', 'DISPATCHER', 'ACTIVE'),
(6, 3, 'shivaji.driver1', '$2a$10$wN1QGg0W0j9Z1Jk1wN9uUOa5s7K0Y4J3O2c1N9m8e7d6c5b4a3a2a', 'Santosh Pawar (Driver)', 'shivaji.driver1@logistic.local', '+919800000009', 'DRIVER', 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

UPDATE hubs SET manager_user_id = 2 WHERE id = 2;
UPDATE hubs SET manager_user_id = 5 WHERE id = 3;

-- 5. CUSTOMERS (Directory with initial password = phone for customer portal)
INSERT INTO customers (id, full_name, phone, email, address, pincode, password_hash, status)
VALUES
(1, 'Rajesh Sharma', '+919822011111', 'rajesh.sharma@example.com', 'Flat 402, Rohan Tarang, Wakad, Pune', '411033', '$2a$10$wN1QGg0W0j9Z1Jk1wN9uUOa5s7K0Y4J3O2c1N9m8e7d6c5b4a3a2a', 'ACTIVE'),
(2, 'Priya Patel', '+919822022222', 'priya.patel@example.com', 'Bldg B-3, Blue Ridge, Hinjawadi Phase 1, Pune', '411057', '$2a$10$wN1QGg0W0j9Z1Jk1wN9uUOa5s7K0Y4J3O2c1N9m8e7d6c5b4a3a2a', 'ACTIVE'),
(3, 'Amit Verma', '+919822033333', 'amit.verma@example.com', '12, Deep Bungalow Chowk, Shivajinagar, Pune', '411005', '$2a$10$wN1QGg0W0j9Z1Jk1wN9uUOa5s7K0Y4J3O2c1N9m8e7d6c5b4a3a2a', 'ACTIVE'),
(4, 'Sneha Kulkarni', '+919822044444', 'sneha.kulkarni@example.com', 'Plot 18, Mayur Colony, Kothrud, Pune', '411038', '$2a$10$wN1QGg0W0j9Z1Jk1wN9uUOa5s7K0Y4J3O2c1N9m8e7d6c5b4a3a2a', 'ACTIVE'),
(5, 'Vikas Deshmukh', '+919822055555', 'vikas.deshmukh@example.com', 'Tower 5, Amanora Park Town, Hadapsar, Pune', '411028', '$2a$10$wN1QGg0W0j9Z1Jk1wN9uUOa5s7K0Y4J3O2c1N9m8e7d6c5b4a3a2a', 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

-- 6. DRIVERS
INSERT INTO drivers (id, user_id, hub_id, driver_name, phone, license_number, max_daily_orders, status)
VALUES
(1, 3, 2, 'Suresh Kadam', '+919800000005', 'MH12-2018-0012345', 60, 'ACTIVE'),
(2, 4, 2, 'Ganesh More', '+919800000006', 'MH12-2019-0054321', 60, 'ACTIVE'),
(3, 6, 3, 'Santosh Pawar', '+919800000009', 'MH12-2020-0098765', 50, 'ACTIVE')
ON DUPLICATE KEY UPDATE driver_name = VALUES(driver_name);

-- 7. VEHICLES
INSERT INTO vehicles (id, hub_id, registration_no, vehicle_type, capacity_kg, status)
VALUES
(1, 2, 'MH12-EV-1001', 'BIKE', 35.00, 'AVAILABLE'),
(2, 2, 'MH12-EV-1002', 'BIKE', 35.00, 'AVAILABLE'),
(3, 2, 'MH12-TR-2001', 'THREE_WHEELER', 350.00, 'AVAILABLE'),
(4, 2, 'MH12-VN-3001', 'MINI_VAN', 800.00, 'AVAILABLE'),
(5, 3, 'MH12-EV-1003', 'BIKE', 35.00, 'AVAILABLE'),
(6, 3, 'MH12-VN-3002', 'MINI_VAN', 800.00, 'AVAILABLE')
ON DUPLICATE KEY UPDATE vehicle_type = VALUES(vehicle_type);

-- 8. ORDERS (Pending orders & active pipeline)
INSERT INTO orders (id, tracking_no, customer_id, hub_id, source_address, destination_address, destination_pincode, order_amount, payment_mode, weight_kg, current_status, dispatch_date, promised_date)
VALUES
-- Pending Orders ready for dispatch assignment
(1, 'TRK-PUN-1001', 1, 2, 'Plot 42, Chakan Industrial Area', 'Flat 402, Rohan Tarang, Wakad, Pune', '411033', 0.00, 'PREPAID', 1.20, 'PENDING', CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)),
(2, 'TRK-PUN-1002', 2, 2, 'Plot 42, Chakan Industrial Area', 'Bldg B-3, Blue Ridge, Hinjawadi Phase 1, Pune', '411057', 1250.00, 'COD', 2.50, 'PENDING', CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)),
(3, 'TRK-PUN-1003', 1, 2, 'Plot 42, Chakan Industrial Area', 'Flat 402, Rohan Tarang, Wakad, Pune', '411033', 450.00, 'COD', 0.80, 'PENDING', CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)),
-- Dispatched / Out for Delivery order
(4, 'TRK-PUN-1004', 2, 2, 'Plot 42, Chakan Industrial Area', 'Bldg B-3, Blue Ridge, Hinjawadi Phase 1, Pune', '411057', 0.00, 'PREPAID', 3.10, 'OUT_FOR_DELIVERY', CURRENT_DATE, DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY)),
-- Delivered order
(5, 'TRK-PUN-1005', 3, 3, 'Plot 42, Chakan Industrial Area', '12, Deep Bungalow Chowk, Shivajinagar, Pune', '411005', 899.00, 'COD', 1.50, 'DELIVERED', DATE_SUB(CURRENT_DATE, INTERVAL 1 DAY), CURRENT_DATE)
ON DUPLICATE KEY UPDATE tracking_no = VALUES(tracking_no);

-- 9. DISPATCH ASSIGNMENTS (For order 4 and order 5)
INSERT INTO dispatch_assignments (id, order_id, driver_id, vehicle_id, hub_id, assigned_date, status, remarks)
VALUES
(1, 4, 1, 1, 2, NOW(), 'OUT_FOR_DELIVERY', 'Assigned to Suresh Kadam on Bike MH12-EV-1001'),
(2, 5, 3, 5, 3, DATE_SUB(NOW(), INTERVAL 1 DAY), 'DELIVERED', 'Delivered yesterday')
ON DUPLICATE KEY UPDATE status = VALUES(status);

-- 10. DELIVERIES (For order 5)
INSERT INTO deliveries (id, order_id, assignment_id, delivery_date, status, amount_collected, remarks)
VALUES
(1, 5, 2, DATE_SUB(NOW(), INTERVAL 1 DAY), 'DELIVERED', 899.00, 'Cash collected and handed over')
ON DUPLICATE KEY UPDATE status = VALUES(status);
