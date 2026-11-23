package com.logistic.dto.order;

import java.math.BigDecimal;
import java.time.LocalDate;

public record OrderRequest(
        Long customerId,
        String customerName,
        String recipientName,
        String customerPhone,
        String recipientPhone,
        String customerEmail,
        String sourceAddress,
        String destinationAddress,
        String deliveryAddressText,
        String destinationPincode,
        String deliveryPincode,
        String paymentMode,
        BigDecimal orderAmount,
        BigDecimal codAmount,
        BigDecimal weightKg,
        Integer weightG,
        LocalDate promisedDate,
        String status
) {
    public String resolveName() {
        if (recipientName != null && !recipientName.isBlank()) return recipientName.trim();
        if (customerName != null && !customerName.isBlank()) return customerName.trim();
        return "Valued Customer";
    }

    public String resolvePhone() {
        if (recipientPhone != null && !recipientPhone.isBlank()) return recipientPhone.trim();
        if (customerPhone != null && !customerPhone.isBlank()) return customerPhone.trim();
        return "+919800000000";
    }

    public String resolveSource() {
        String addr = (sourceAddress != null && !sourceAddress.isBlank()) ? sourceAddress.trim() : "Pune Central Sorting Warehouse, Chakan";
        return addr.length() > 500 ? addr.substring(0, 500) : addr;
    }

    public String resolveDestination() {
        String addr = "Pune Delivery Point";
        if (destinationAddress != null && !destinationAddress.isBlank()) addr = destinationAddress.trim();
        else if (deliveryAddressText != null && !deliveryAddressText.isBlank()) addr = deliveryAddressText.trim();
        return addr.length() > 500 ? addr.substring(0, 500) : addr;
    }

    public String resolvePincode() {
        String pin = "411057";
        if (destinationPincode != null && !destinationPincode.isBlank()) pin = destinationPincode.trim();
        else if (deliveryPincode != null && !deliveryPincode.isBlank()) pin = deliveryPincode.trim();
        return pin.length() > 10 ? pin.substring(0, 10) : pin;
    }

    public String resolvePaymentMode() {
        if (paymentMode != null && !paymentMode.isBlank()) {
            String mode = paymentMode.toUpperCase().trim();
            if (mode.contains("COD") || mode.contains("CASH")) return "COD";
            return "PREPAID";
        }
        return "PREPAID";
    }

    public BigDecimal resolveAmount() {
        if (orderAmount != null) return orderAmount;
        if (codAmount != null) return codAmount;
        return BigDecimal.ZERO;
    }

    public BigDecimal resolveWeightKg() {
        if (weightKg != null) return weightKg;
        if (weightG != null) return BigDecimal.valueOf(weightG / 1000.0);
        return new BigDecimal("1.00");
    }
}
