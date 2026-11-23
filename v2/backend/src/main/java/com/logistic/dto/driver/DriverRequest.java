package com.logistic.dto.driver;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import java.time.LocalDate;

public record DriverRequest(
        String fullName,
        String driverName,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^(\\+91)?[6-9]\\d{9}$", message = "Phone number must be a valid 10-digit Indian mobile number (e.g., 9822012345 or +919822012345)")
        String phone,

        @NotBlank(message = "License number is required")
        String licenseNumber,

        LocalDate licenseExpiry,

        @NotNull(message = "Hub ID is required")
        Long hubId,

        Integer maxDailyOrders
) {
    public String resolveName() {
        if (fullName != null && !fullName.isBlank()) return fullName.trim();
        if (driverName != null && !driverName.isBlank()) return driverName.trim();
        return "Fleet Driver";
    }
}
