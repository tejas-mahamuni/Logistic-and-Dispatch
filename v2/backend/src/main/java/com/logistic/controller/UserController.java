package com.logistic.controller;

import com.logistic.dao.DriverRepository;
import com.logistic.dao.UserRepository;
import com.logistic.dto.user.UserRequest;
import com.logistic.dto.user.UserResponse;
import com.logistic.entity.Driver;
import com.logistic.entity.User;
import com.logistic.exception.ConflictException;
import com.logistic.exception.ResourceNotFoundException;
import com.logistic.model.Role;
import com.logistic.model.UserStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Tag(name = "User Directory", description = "Endpoints for User management (ADMIN only)")
@PreAuthorize("hasRole('ADMIN')")
public class UserController {

    private final UserRepository userRepository;
    private final DriverRepository driverRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping
    @Operation(summary = "List all registered users (ADMIN only)")
    public ResponseEntity<List<UserResponse>> listUsers() {
        var users = userRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
        return ResponseEntity.ok(users);
    }

    @PostMapping
    @Operation(summary = "Create a new user (ADMIN only)")
    public ResponseEntity<UserResponse> createUser(@Valid @RequestBody UserRequest req) {
        if (userRepository.existsByUsername(req.username())) {
            throw new ConflictException("USERNAME_EXISTS", "Username '" + req.username() + "' is already taken");
        }
        if (req.email() != null && userRepository.existsByEmail(req.email())) {
            throw new ConflictException("EMAIL_EXISTS", "Email '" + req.email() + "' is already in use");
        }

        // Schema validation constraint: MANAGER, DISPATCHER, and DRIVER must have a hub_id
        if ((req.role() == Role.MANAGER || req.role() == Role.DISPATCHER || req.role() == Role.DRIVER) && req.hubId() == null) {
            throw new IllegalArgumentException("Hub ID is required for role: " + req.role());
        }

        User user = new User();
        user.setUsername(req.username());
        user.setFullName(req.fullName());
        user.setEmail(req.email());
        user.setPhone(req.phone());
        user.setPasswordHash(passwordEncoder.encode(req.password()));
        user.setRole(req.role());
        user.setHubId(req.hubId());
        user.setStatus(UserStatus.ACTIVE);
        user.setCreatedAt(Instant.now());
        user.setUpdatedAt(Instant.now());
        user = userRepository.save(user);

        // If newly created user is a DRIVER, automatically establish their fleet record in drivers table
        if (user.getRole() == Role.DRIVER && driverRepository.findByUserId(user.getId()).isEmpty()) {
            Driver driver = new Driver();
            driver.setUserId(user.getId());
            driver.setHubId(user.getHubId());
            driver.setDriverName(user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : user.getUsername());
            driver.setPhone(user.getPhone() != null && !user.getPhone().isBlank() ? user.getPhone() : "+919800000000");
            driver.setLicenseNumber("MH12-DRV-" + user.getId() + "-" + (System.currentTimeMillis() % 100000));
            driver.setMaxDailyOrders(60);
            driver.setStatus("ACTIVE");
            driver.setCreatedAt(Instant.now());
            driver.setUpdatedAt(Instant.now());
            driverRepository.save(driver);
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(user));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update user account status (ADMIN only)")
    public ResponseEntity<UserResponse> updateStatus(@PathVariable Long id, @RequestParam UserStatus status) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("USER_NOT_FOUND", "User not found with ID: " + id));
        user.setStatus(status);
        user.setUpdatedAt(Instant.now());
        return ResponseEntity.ok(toResponse(userRepository.save(user)));
    }

    private UserResponse toResponse(User u) {
        return new UserResponse(
                u.getId(),
                u.getUsername(),
                u.getFullName(),
                u.getEmail(),
                u.getPhone(),
                u.getRole(),
                u.getHubId(),
                u.getStatus(),
                u.getUpdatedAt()
        );
    }
}
