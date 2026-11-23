package com.logistic.dto.order;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public record AssignmentRequest(
        Long orderId,
        List<Long> orderIds,

        @NotNull(message = "Driver ID is required")
        Long driverId,

        @NotNull(message = "Vehicle ID is required")
        Long vehicleId,

        LocalDate assignmentDate,
        String remarks
) {
    public List<Long> resolvedOrderIds() {
        if (orderIds != null && !orderIds.isEmpty()) return orderIds;
        if (orderId != null) return List.of(orderId);
        return new ArrayList<>();
    }
}
