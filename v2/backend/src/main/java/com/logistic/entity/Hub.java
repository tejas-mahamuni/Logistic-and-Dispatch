package com.logistic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "hubs")
@Getter
@Setter
@NoArgsConstructor
public class Hub {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "region_id")
    private Long regionId;

    @Column(name = "parent_hub_id")
    private Long parentHubId;

    @Column(name = "code", nullable = false, length = 20, unique = true)
    private String code;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "hub_type", nullable = false, length = 20)
    private com.logistic.model.HubType hubType = com.logistic.model.HubType.HUB;

    @Column(name = "address_line", nullable = false, length = 255)
    private String addressLine;

    @Column(name = "pincode", nullable = false, length = 10)
    private String pincode;

    @Column(name = "manager_user_id")
    private Long managerUserId;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
