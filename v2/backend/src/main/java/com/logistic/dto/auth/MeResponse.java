package com.logistic.dto.auth;

public record MeResponse(
        Long   userId,
        String username,
        String fullName,
        String role,
        Long   hubId
) {}
