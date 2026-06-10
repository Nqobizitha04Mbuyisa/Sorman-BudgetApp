package com.budgettracker.dto.user;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @Size(min = 2, max = 120) String fullName
) {}
