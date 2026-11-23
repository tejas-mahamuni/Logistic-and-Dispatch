package com.logistic.dto.order;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

public record AssignmentResponse(
        Long id,
        Long orderId,
        String orderTrackingNo,
        String customerName,
        String deliveryAddress,
        String deliveryPincode,
        BigDecimal orderAmount,
        String paymentMode,
        BigDecimal weightKg,
        Long driverId,
        String driverName,
        String driverPhone,
        Long vehicleId,
        String vehicleRegNo,
        String vehicleType,
        Long hubId,
        String hubName,
        String status,
        Instant assignedDate,
        String remarks,
        List<AssignedOrderSummary> orders
) {
    public record AssignedOrderSummary(
            Long stopId,
            Long orderId,
            String trackingNo,
            String recipientName,
            String deliveryAddressText,
            String deliveryPincode,
            Integer weightG,
            BigDecimal orderAmount,
            String paymentMode,
            String status,
            int sequenceNo
    ) {}

    // Legacy getters for backwards compatibility with React trips explorer
    public Long getTripId() { return id; }
    public String getTripCode() { return "ASN-" + id; }
    public LocalDate getTripDate() { return LocalDate.now(); }
    public Integer getStopCount() { return orders != null ? orders.size() : 1; }
    public Integer getTotalWeightG() {
        return orders != null
                ? orders.stream().mapToInt(AssignedOrderSummary::weightG).sum()
                : (weightKg != null ? (int)(weightKg.doubleValue() * 1000) : 1000);
    }
}
