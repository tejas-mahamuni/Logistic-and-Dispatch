package com.logistic.dto.hub;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ZoneRequest(
        @NotBlank(message = "Pincode is required")
        @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Pincode must be a 6-digit Indian postal code")
        String pincode,

        String areaName
) {}
