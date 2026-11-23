package com.logistic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "dispatch_assignments")
@Getter
@Setter
@NoArgsConstructor
public class DispatchAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_id", nullable = false, unique = true)
    private Long orderId;

    @Column(name = "driver_id", nullable = false)
    private Long driverId;

    @Column(name = "vehicle_id", nullable = false)
    private Long vehicleId;

    @Column(name = "hub_id", nullable = false)
    private Long hubId;

    @Column(name = "assigned_date", nullable = false)
    private Instant assignedDate = Instant.now();

    @Column(name = "status", nullable = false, length = 30)
    private String status = "ASSIGNED";

    @Column(name = "remarks", length = 255)
    private String remarks;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
