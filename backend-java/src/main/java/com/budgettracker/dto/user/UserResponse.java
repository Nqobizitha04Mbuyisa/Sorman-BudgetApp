package com.budgettracker.dto.user;

import com.budgettracker.entity.Role;

import java.time.Instant;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String fullName,
        String email,
        Role role,
        Instant createdAt
) {}
