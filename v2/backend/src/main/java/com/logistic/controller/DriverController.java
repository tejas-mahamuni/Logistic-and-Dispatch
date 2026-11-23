package com.logistic.controller;

import com.logistic.dto.driver.DriverRequest;
import com.logistic.dto.driver.DriverResponse;
import com.logistic.services.DriverService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
@Tag(name = "Driver Management", description = "Endpoints for Driver Master Entry & Navigation")
public class DriverController {

    private final DriverService driverService;

    @PostMapping
    @Operation(summary = "Create driver (New mode)")
    public ResponseEntity<DriverResponse> createDriver(@Valid @RequestBody DriverRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(driverService.createDriver(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update driver (Find mode)")
    public ResponseEntity<DriverResponse> updateDriver(
            @PathVariable Long id,
            @Valid @RequestBody DriverRequest request
    ) {
        return ResponseEntity.ok(driverService.updateDriver(id, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Find driver by ID")
    public ResponseEntity<DriverResponse> getDriverById(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getDriverById(id));
    }

    @GetMapping("/by-user/{userId}")
    @Operation(summary = "Find driver by linked user ID")
    public ResponseEntity<DriverResponse> getDriverByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(driverService.getDriverByUserId(userId));
    }

    @GetMapping("/{id}/previous")
    @Operation(summary = "Get previous driver record")
    public ResponseEntity<DriverResponse> getPreviousDriver(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getPreviousDriver(id));
    }

    @GetMapping("/{id}/next")
    @Operation(summary = "Get next driver record")
    public ResponseEntity<DriverResponse> getNextDriver(@PathVariable Long id) {
        return ResponseEntity.ok(driverService.getNextDriver(id));
    }

    @GetMapping
    @Operation(summary = "List drivers with pagination")
    public ResponseEntity<Page<DriverResponse>> listDrivers(
            @RequestParam(required = false) Long hubId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(driverService.listDrivers(hubId, pageable));
    }
}
