package com.logistic.dto.order;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record OrderResponse(
        Long id,
        String trackingNo,
        Long customerId,
        String customerName,
        String customerPhone,
        Long hubId,
        String hubName,
        Long targetHubId,
        String targetHubName,
        String sourceAddress,
        String destinationAddress,
        String destinationPincode,
        BigDecimal orderAmount,
        String paymentMode,
        BigDecimal weightKg,
        String currentStatus,
        LocalDate dispatchDate,
        LocalDate promisedDate,
        Instant createdAt
) {
    // Aliases for frontend React dashboards
    @JsonProperty("trackingNumber")
    public String getTrackingNumber() { return trackingNo; }

    @JsonProperty("deliveryAddress")
    public String getDeliveryAddress() { return destinationAddress; }

    @JsonProperty("deliveryAddressText")
    public String getDeliveryAddressText() { return destinationAddress; }

    @JsonProperty("pincode")
    public String getPincode() { return destinationPincode; }

    @JsonProperty("deliveryPincode")
    public String getDeliveryPincode() { return destinationPincode; }

    @JsonProperty("status")
    public String getStatus() { return currentStatus; }

    @JsonProperty("recipientName")
    public String getRecipientName() { return customerName; }

    @JsonProperty("recipientPhone")
    public String getRecipientPhone() { return customerPhone; }

    @JsonProperty("codAmount")
    public BigDecimal getCodAmount() { return orderAmount; }

    @JsonProperty("weightGrams")
    public Integer getWeightGrams() { return weightKg != null ? (int)(weightKg.doubleValue() * 1000) : 1000; }

    @JsonProperty("weightG")
    public Integer getWeightG() { return weightKg != null ? (int)(weightKg.doubleValue() * 1000) : 1000; }
}
