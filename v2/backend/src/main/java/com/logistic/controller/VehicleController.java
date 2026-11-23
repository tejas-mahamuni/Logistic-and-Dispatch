package com.logistic.controller;

import com.logistic.dto.vehicle.VehicleRequest;
import com.logistic.dto.vehicle.VehicleResponse;
import com.logistic.services.VehicleService;
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
@RequestMapping("/api/v1/vehicles")
@RequiredArgsConstructor
@Tag(name = "Vehicle Management", description = "Endpoints for Vehicle Master Entry & Navigation")
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    @Operation(summary = "Create vehicle (New mode)")
    public ResponseEntity<VehicleResponse> createVehicle(@Valid @RequestBody VehicleRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicleService.createVehicle(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update vehicle (Find mode)")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request
    ) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Find vehicle by ID")
    public ResponseEntity<VehicleResponse> getVehicleById(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @GetMapping("/{id}/previous")
    @Operation(summary = "Get previous vehicle record")
    public ResponseEntity<VehicleResponse> getPreviousVehicle(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getPreviousVehicle(id));
    }

    @GetMapping("/{id}/next")
    @Operation(summary = "Get next vehicle record")
    public ResponseEntity<VehicleResponse> getNextVehicle(@PathVariable Long id) {
        return ResponseEntity.ok(vehicleService.getNextVehicle(id));
    }

    @GetMapping
    @Operation(summary = "List vehicles with pagination")
    public ResponseEntity<Page<VehicleResponse>> listVehicles(
            @RequestParam(required = false) Long hubId,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        return ResponseEntity.ok(vehicleService.listVehicles(hubId, pageable));
    }
}
