package com.logistic.dto.vehicle;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record VehicleRequest(
        @NotNull(message = "Hub ID is required")
        Long hubId,

        @NotBlank(message = "Registration number is required")
        String registrationNo,

        @NotBlank(message = "Vehicle type is required")
        @Pattern(regexp = "^(BIKE|SCOOTER|THREE_WHEELER|MINI_VAN|VAN|TRUCK)$", message = "Vehicle type must be BIKE, SCOOTER, THREE_WHEELER, MINI_VAN, VAN, or TRUCK")
        String vehicleType,

        @NotNull(message = "Capacity in kg is required")
        @DecimalMin(value = "1.0", message = "Capacity must be greater than 0 kg")
        BigDecimal capacityKg,

        BigDecimal capacityVolumeL,

        String status
) {}
