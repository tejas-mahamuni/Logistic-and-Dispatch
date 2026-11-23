package com.logistic.dto.customer;

public record CustomerResponse(
        Long id,
        String fullName,
        String phone,
        String email,
        String address,
        String addressLine,
        String city,
        String pincode,
        String status
) {}
