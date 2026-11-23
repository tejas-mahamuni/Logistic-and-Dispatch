package com.logistic.dto.vehicle;

import java.math.BigDecimal;

public record VehicleResponse(
        Long id,
        Long hubId,
        String hubName,
        String registrationNo,
        String vehicleType,
        BigDecimal capacityKg,
        BigDecimal capacityVolumeL,
        String status
) {}
