package com.logistic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_no", nullable = false, length = 30, unique = true)
    private String trackingNo;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "hub_id", nullable = false)
    private Long hubId;

    @Column(name = "source_address", nullable = false, length = 500)
    private String sourceAddress;

    @Column(name = "destination_address", nullable = false, length = 500)
    private String destinationAddress;

    @Column(name = "destination_pincode", nullable = false, length = 10)
    private String destinationPincode;

    @Column(name = "order_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal orderAmount = BigDecimal.ZERO;

    @Column(name = "payment_mode", nullable = false, length = 10)
    private String paymentMode = "PREPAID";

    @Column(name = "weight_kg", nullable = false, precision = 8, scale = 2)
    private BigDecimal weightKg = new BigDecimal("1.00");

    @Column(name = "current_status", nullable = false, length = 30)
    private String currentStatus = "PENDING";

    @Column(name = "dispatch_date", nullable = false)
    private LocalDate dispatchDate = LocalDate.now();

    @Column(name = "promised_date", nullable = false)
    private LocalDate promisedDate = LocalDate.now().plusDays(1);

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
