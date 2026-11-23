package com.logistic.dto.user;

import com.logistic.model.Role;
import com.logistic.model.UserStatus;

import java.time.Instant;

public record UserResponse(
        Long id,
        String username,
        String fullName,
        String email,
        String phone,
        Role role,
        Long hubId,
        UserStatus status,
        Instant lastLoginAt
) {}
