package com.logistic.dto.hub;

import com.logistic.model.HubType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

import java.math.BigDecimal;

public record HubRequest(
        @NotNull(message = "regionId is required")
        Long regionId,

        Long parentHubId,

        @NotBlank(message = "Hub code is required")
        String code,

        @NotBlank(message = "Hub name is required")
        String name,

        @NotNull(message = "hubType is required")
        HubType hubType,

        @NotBlank(message = "addressLine is required")
        String addressLine,

        @NotBlank(message = "pincode is required")
        @Pattern(regexp = "^[1-9][0-9]{5}$", message = "Pincode must be a 6-digit Indian postal code")
        String pincode,

        BigDecimal latitude,
        BigDecimal longitude,
        Long managerUserId,
        Integer dailyCapacityOrders
) {}
