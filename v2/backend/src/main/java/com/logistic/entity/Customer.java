package com.logistic.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(name = "phone", nullable = false, length = 20, unique = true)
    private String phone;

    @Column(name = "email", length = 100)
    private String email;

    @Column(name = "address", nullable = false, length = 500)
    private String address;

    @Column(name = "pincode", nullable = false, length = 10)
    private String pincode;

    @Column(name = "password_hash", length = 255)
    private String passwordHash;

    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();
}
