package com.logistic.dto.hub;

import com.logistic.model.HubType;

import java.math.BigDecimal;

public record HubResponse(
        Long id,
        Long regionId,
        Long parentHubId,
        String code,
        String name,
        HubType hubType,
        String addressLine,
        String pincode,
        BigDecimal latitude,
        BigDecimal longitude,
        Integer dailyCapacityOrders,
        String status
) {}
