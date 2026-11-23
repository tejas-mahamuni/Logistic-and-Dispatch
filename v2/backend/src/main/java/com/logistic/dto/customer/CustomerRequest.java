package com.logistic.dto.customer;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CustomerRequest(
        @NotBlank(message = "Full name is required")
        String fullName,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^(\\+91)?[6-9]\\d{9}$", message = "Phone number must be a valid 10-digit Indian mobile number (e.g., 9822012345 or +919822012345)")
        String phone,

        @Email(message = "Invalid email format")
        String email,

        String address,

        String addressLine,

        String city,

        @NotBlank(message = "Pincode is required")
        @Pattern(regexp = "^\\d{6}$", message = "Pincode must be exactly 6 digits")
        String pincode
) {
    public String resolvedAddress() {
        if (address != null && !address.isBlank()) return address.trim();
        if (addressLine != null && !addressLine.isBlank()) {
            return (city != null && !city.isBlank()) ? addressLine.trim() + ", " + city.trim() : addressLine.trim();
        }
        return "Pune, Maharashtra";
    }
}
