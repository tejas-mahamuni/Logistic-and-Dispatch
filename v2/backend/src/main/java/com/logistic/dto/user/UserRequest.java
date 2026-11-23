package com.logistic.dto.user;

import com.logistic.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UserRequest(
        @NotBlank(message = "Username is required")
        String username,

        @NotBlank(message = "Full name is required")
        String fullName,

        String email,
        String phone,

        @NotBlank(message = "Password is required")
        String password,

        @NotNull(message = "Role is required")
        Role role,

        Long hubId
) {}
