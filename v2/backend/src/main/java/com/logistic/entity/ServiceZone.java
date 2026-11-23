package com.logistic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "service_zones")
@Getter
@Setter
@NoArgsConstructor
public class ServiceZone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "hub_id", nullable = false)
    private Long hubId;

    @Column(name = "pincode", nullable = false, length = 6, unique = true)
    private String pincode;

    @Column(name = "area_name", length = 100)
    private String areaName;

    @Column(name = "status", nullable = false, length = 10)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
