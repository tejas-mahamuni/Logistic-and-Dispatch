package com.logistic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "deliveries")
@Getter
@Setter
@NoArgsConstructor
public class Delivery {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, unique = true)
    private Long orderId;

    @Column(name = "assignment_id")
    private Long assignmentId;

    @Column(name = "delivery_date", nullable = false)
    private Instant deliveryDate = Instant.now();

    @Column(name = "status", nullable = false, length = 20)
    private String status = "DELIVERED";

    @Column(name = "amount_collected", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountCollected = BigDecimal.ZERO;

    @Column(name = "remarks", length = 500)
    private String remarks;

    @Column(name = "proof_of_delivery", length = 255)
    private String proofOfDelivery;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
