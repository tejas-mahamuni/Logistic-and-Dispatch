package com.logistic.dto.auth;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long   expiresIn,     // seconds
        String username,
        String role,
        Long   hubId
) {}
