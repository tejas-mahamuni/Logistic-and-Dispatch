package com.logistic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "drivers")
@Getter
@Setter
@NoArgsConstructor
public class Driver {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "hub_id", nullable = false)
    private Long hubId;

    @Column(name = "driver_name", nullable = false, length = 150)
    private String driverName;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "license_number", nullable = false, length = 50, unique = true)
    private String licenseNumber;

    @Column(name = "max_daily_orders", nullable = false)
    private Integer maxDailyOrders = 60;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
