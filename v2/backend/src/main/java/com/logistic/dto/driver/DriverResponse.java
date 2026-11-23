package com.logistic.dto.driver;

public record DriverResponse(
        Long id,
        Long userId,
        String driverName,
        String username,
        String phone,
        String licenseNumber,
        Long hubId,
        String hubName,
        Integer maxDailyOrders,
        String status
) {
    public String getFullName() { return driverName; }
}
