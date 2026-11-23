package com.logistic.config;

import com.logistic.dao.*;
import com.logistic.entity.*;
import com.logistic.model.Role;
import com.logistic.model.UserStatus;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * Initializes and syncs default system users, fleet, customers, orders, and assignments on startup.
 */
@Component
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);
    private static final String DEFAULT_PASSWORD = "Secret@123";

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final OrderRepository orderRepository;
    private final DispatchAssignmentRepository assignmentRepository;
    private final DeliveryRepository deliveryRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminBootstrap(UserRepository userRepository,
                          CustomerRepository customerRepository,
                          VehicleRepository vehicleRepository,
                          DriverRepository driverRepository,
                          OrderRepository orderRepository,
                          DispatchAssignmentRepository assignmentRepository,
                          DeliveryRepository deliveryRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.orderRepository = orderRepository;
        this.assignmentRepository = assignmentRepository;
        this.deliveryRepository = deliveryRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            seedAll();
        } catch (Exception e) {
            log.error("Notice: AdminBootstrap encountered an issue while seeding demo records: {}", e.getMessage(), e);
        }
    }

    private void seedAll() {
        String encodedPassword = passwordEncoder.encode(DEFAULT_PASSWORD);

        // 1. Ensure global ADMIN exists
        userRepository.findByUsername("admin").ifPresentOrElse(
                admin -> {
                    if (!passwordEncoder.matches(DEFAULT_PASSWORD, admin.getPasswordHash())) {
                        admin.setPasswordHash(encodedPassword);
                        admin.setStatus(UserStatus.ACTIVE);
                        userRepository.save(admin);
                    }
                },
                () -> {
                    User admin = new User();
                    admin.setUsername("admin");
                    admin.setFullName("System Administrator");
                    admin.setEmail("admin@logistic.local");
                    admin.setPhone("+919800000001");
                    admin.setPasswordHash(encodedPassword);
                    admin.setRole(Role.ADMIN);
                    admin.setStatus(UserStatus.ACTIVE);
                    userRepository.save(admin);
                }
        );

        // 2. Ensure default demo staff accounts exist
        ensureUser("wh.manager", "Ramesh Patil", "wh.manager@logistic.local", "+919800000002", Role.MANAGER, 1L, encodedPassword);
        ensureUser("hinjawadi.mgr", "Vikram Shinde", "hinjawadi.mgr@logistic.local", "+919800000003", Role.MANAGER, 2L, encodedPassword);
        ensureUser("hinjawadi.disp", "Amit Deshmukh", "hinjawadi.disp@logistic.local", "+919800000004", Role.DISPATCHER, 2L, encodedPassword);
        User driverUser1 = ensureUser("hinjawadi.driver1", "Suresh Kadam", "hinjawadi.driver1@logistic.local", "+919800000005", Role.DRIVER, 2L, encodedPassword);
        User driverUser2 = ensureUser("hinjawadi.driver2", "Ganesh More", "hinjawadi.driver2@logistic.local", "+919800000006", Role.DRIVER, 2L, encodedPassword);
        ensureUser("shivaji.mgr", "Sunil Joshi", "shivaji.mgr@logistic.local", "+919800000007", Role.MANAGER, 3L, encodedPassword);
        ensureUser("shivaji.disp", "Pooja Kulkarni", "shivaji.disp@logistic.local", "+919800000008", Role.DISPATCHER, 3L, encodedPassword);
        User driverUser3 = ensureUser("shivaji.driver1", "Santosh Pawar", "shivaji.driver1@logistic.local", "+919800000009", Role.DRIVER, 3L, encodedPassword);

        // 3. Seed Vehicles
        Vehicle v1 = ensureVehicle("MH12-EV-1001", 2L, "BIKE", 35.0);
        Vehicle v2 = ensureVehicle("MH12-EV-1002", 2L, "BIKE", 35.0);
        Vehicle v3 = ensureVehicle("MH12-TR-2001", 2L, "THREE_WHEELER", 350.0);
        Vehicle v4 = ensureVehicle("MH12-VN-3001", 2L, "MINI_VAN", 800.0);
        Vehicle v5 = ensureVehicle("MH12-EV-1003", 3L, "BIKE", 35.0);
        Vehicle v6 = ensureVehicle("MH12-VN-3002", 3L, "MINI_VAN", 800.0);

        // 4. Seed Drivers
        Driver d1 = ensureDriver(driverUser1.getId(), 2L, "Suresh Kadam", "+919800000005", "MH12-2018-0012345");
        Driver d2 = ensureDriver(driverUser2.getId(), 2L, "Ganesh More", "+919800000006", "MH12-2019-0054321");
        Driver d3 = ensureDriver(driverUser3.getId(), 3L, "Santosh Pawar", "+919800000009", "MH12-2020-0098765");

        // 5. Seed Customers
        Customer c1 = ensureCustomer("Rajesh Sharma", "+919822011111", "rajesh.sharma@example.com", "Flat 402, Rohan Tarang, Wakad, Pune", "411033", encodedPassword);
        Customer c2 = ensureCustomer("Priya Patel", "+919822022222", "priya.patel@example.com", "Bldg B-3, Blue Ridge, Hinjawadi Phase 1, Pune", "411057", encodedPassword);
        Customer c3 = ensureCustomer("Amit Verma", "+919822033333", "amit.verma@example.com", "12, Deep Bungalow Chowk, Model Colony, Shivajinagar, Pune", "411005", encodedPassword);
        Customer c4 = ensureCustomer("Sneha Kulkarni", "+919822044444", "sneha.k@example.com", "Plot 18, Mayur Colony, Kothrud, Pune", "411038", encodedPassword);
        Customer c5 = ensureCustomer("Vikas Deshmukh", "+919822055555", "vikas.d@example.com", "Tower 5, Amanora Park Town, Hadapsar, Pune", "411028", encodedPassword);

        // 6. Seed Sample Orders
        Order o1 = ensureOrder("TRK-PUN-1001", 2L, c1, "PENDING", new BigDecimal("1.20"), BigDecimal.ZERO, "PREPAID");
        Order o2 = ensureOrder("TRK-PUN-1002", 2L, c2, "PENDING", new BigDecimal("2.50"), new BigDecimal("1250.00"), "COD");
        Order o3 = ensureOrder("TRK-PUN-1003", 2L, c1, "PENDING", new BigDecimal("0.80"), new BigDecimal("450.00"), "COD");
        Order o4 = ensureOrder("TRK-PUN-1004", 2L, c2, "OUT_FOR_DELIVERY", new BigDecimal("3.10"), BigDecimal.ZERO, "PREPAID");
        Order o5 = ensureOrder("TRK-PUN-1005", 3L, c3, "DELIVERED", new BigDecimal("1.50"), new BigDecimal("899.00"), "COD");
        Order o6 = ensureOrder("TRK-PUN-1006", 3L, c3, "PENDING", new BigDecimal("0.70"), new BigDecimal("499.00"), "COD");
        Order o7 = ensureOrder("TRK-PUN-1007", 4L, c4, "PENDING", new BigDecimal("0.30"), BigDecimal.ZERO, "PREPAID");
        Order o8 = ensureOrder("TRK-PUN-1008", 5L, c5, "DELIVERED", new BigDecimal("2.50"), BigDecimal.ZERO, "PREPAID");
        Order o9 = ensureOrder("TRK-PUN-1009", 1L, c1, "PENDING", new BigDecimal("3.20"), new BigDecimal("1850.00"), "COD");
        if (o9.getHubId() != 1L && assignmentRepository.findByOrderId(o9.getId()).isEmpty()) {
            o9.setHubId(1L);
            orderRepository.save(o9);
        }
        Order o10 = ensureOrder("TRK-PUN-1010", 1L, c3, "PENDING", new BigDecimal("1.10"), BigDecimal.ZERO, "PREPAID");
        if (o10.getHubId() != 1L && assignmentRepository.findByOrderId(o10.getId()).isEmpty()) {
            o10.setHubId(1L);
            orderRepository.save(o10);
        }

        // Release demo orders (1, 2, 3) as pristine PENDING UNASSIGNED orders for live demo assignment
        for (Order unassignedOrder : java.util.List.of(o1, o2, o3)) {
            deliveryRepository.findByOrderId(unassignedOrder.getId()).ifPresent(deliveryRepository::delete);
            assignmentRepository.findByOrderId(unassignedOrder.getId()).ifPresent(assignmentRepository::delete);
            unassignedOrder.setCurrentStatus("PENDING");
            orderRepository.save(unassignedOrder);
        }

        // 7. Seed Sample Dispatch Assignments & Deliveries (Only o4 active for driver runsheet, o5 delivered)
        ensureAssignmentAndDelivery(o4, d1, v1, "OUT_FOR_DELIVERY", null);
        ensureAssignmentAndDelivery(o5, d3, v5, "DELIVERED", new BigDecimal("899.00"));

        log.info("AdminBootstrap: Successfully seeded clean users, fleet, customers, and active orders pipeline.");
    }

    private User ensureUser(String username, String fullName, String email, String phone, Role role, Long hubId, String pwd) {
        return userRepository.findByUsername(username).map(existing -> {
            if (!passwordEncoder.matches(DEFAULT_PASSWORD, existing.getPasswordHash())) {
                existing.setPasswordHash(pwd);
                existing.setStatus(UserStatus.ACTIVE);
                return userRepository.save(existing);
            }
            return existing;
        }).orElseGet(() -> {
            User u = new User();
            u.setUsername(username);
            u.setFullName(fullName);
            u.setEmail(email);
            u.setPhone(phone);
            u.setRole(role);
            u.setHubId(hubId);
            u.setPasswordHash(pwd);
            u.setStatus(UserStatus.ACTIVE);
            return userRepository.save(u);
        });
    }

    private Vehicle ensureVehicle(String regNo, Long hubId, String type, Double capKg) {
        return vehicleRepository.findByRegistrationNo(regNo).orElseGet(() -> {
            Vehicle v = new Vehicle();
            v.setRegistrationNo(regNo);
            v.setHubId(hubId);
            v.setVehicleType(type);
            v.setCapacityKg(BigDecimal.valueOf(capKg));
            v.setStatus("AVAILABLE");
            v.setCreatedAt(Instant.now());
            v.setUpdatedAt(Instant.now());
            return vehicleRepository.save(v);
        });
    }

    private Driver ensureDriver(Long userId, Long hubId, String name, String phone, String licenseNo) {
        return driverRepository.findByUserId(userId).orElseGet(() -> {
            Driver d = new Driver();
            d.setUserId(userId);
            d.setHubId(hubId);
            d.setDriverName(name);
            d.setPhone(phone);
            d.setLicenseNumber(licenseNo);
            d.setMaxDailyOrders(60);
            d.setStatus("ACTIVE");
            d.setCreatedAt(Instant.now());
            d.setUpdatedAt(Instant.now());
            return driverRepository.save(d);
        });
    }

    private Customer ensureCustomer(String name, String phone, String email, String address, String pincode, String pwd) {
        return customerRepository.findByPhone(phone).map(existing -> {
            if (existing.getPasswordHash() == null || !passwordEncoder.matches(DEFAULT_PASSWORD, existing.getPasswordHash())) {
                existing.setPasswordHash(pwd);
                existing.setStatus("ACTIVE");
                return customerRepository.save(existing);
            }
            return existing;
        }).orElseGet(() -> {
            Customer c = new Customer();
            c.setFullName(name);
            c.setPhone(phone);
            c.setEmail(email);
            c.setAddress(address);
            c.setPincode(pincode);
            c.setPasswordHash(pwd);
            c.setStatus("ACTIVE");
            c.setCreatedAt(Instant.now());
            c.setUpdatedAt(Instant.now());
            return customerRepository.save(c);
        });
    }

    private Order ensureOrder(String trackingNo, Long hubId, Customer c, String status, BigDecimal weightKg, BigDecimal amount, String payMode) {
        return orderRepository.findByTrackingNo(trackingNo).orElseGet(() -> {
            Order o = new Order();
            o.setTrackingNo(trackingNo);
            o.setCustomerId(c.getId());
            o.setHubId(hubId);
            o.setSourceAddress("Hub Central Depot, Pune");
            o.setDestinationAddress(c.getAddress());
            o.setDestinationPincode(c.getPincode());
            o.setOrderAmount(amount);
            o.setPaymentMode(payMode);
            o.setWeightKg(weightKg);
            o.setCurrentStatus(status);
            o.setDispatchDate(LocalDate.now());
            o.setPromisedDate(LocalDate.now().plusDays(1));
            o.setCreatedAt(Instant.now());
            o.setUpdatedAt(Instant.now());
            return orderRepository.save(o);
        });
    }

    private void ensureAssignmentAndDelivery(Order order, Driver driver, Vehicle vehicle, String status, BigDecimal amountCollected) {
        order.setCurrentStatus(status);
        orderRepository.save(order);
        DispatchAssignment da = assignmentRepository.findByOrderId(order.getId()).orElseGet(() -> {
            DispatchAssignment a = new DispatchAssignment();
            a.setOrderId(order.getId());
            a.setDriverId(driver.getId());
            a.setVehicleId(vehicle.getId());
            a.setHubId(order.getHubId());
            a.setStatus(status);
            a.setRemarks("Bootstrap assignment");
            a.setAssignedDate(Instant.now());
            a.setCreatedAt(Instant.now());
            a.setUpdatedAt(Instant.now());
            return assignmentRepository.save(a);
        });

        if ("DELIVERED".equalsIgnoreCase(status)) {
            deliveryRepository.findByOrderId(order.getId()).orElseGet(() -> {
                Delivery del = new Delivery();
                del.setOrderId(order.getId());
                del.setAssignmentId(da.getId());
                del.setDeliveryDate(Instant.now());
                del.setStatus("DELIVERED");
                del.setAmountCollected(amountCollected != null ? amountCollected : BigDecimal.ZERO);
                del.setRemarks("Delivered successfully via bootstrap");
                del.setCreatedAt(Instant.now());
                return deliveryRepository.save(del);
            });
        }
    }
}
