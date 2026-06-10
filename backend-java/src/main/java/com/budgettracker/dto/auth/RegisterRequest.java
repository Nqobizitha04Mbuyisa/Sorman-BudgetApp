package com.budgettracker.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(name = "RegisterRequest", description = "Payload to create a new user account")
public record RegisterRequest(

        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 120, message = "Full name must be between 2 and 120 characters")
        @Schema(example = "Jane Doe")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be a valid address")
        @Schema(example = "jane@finova.io")
        String email,

        @NotBlank(message = "Password is required")
        @Size(min = 6, max = 80, message = "Password must be between 6 and 80 characters")
        @Schema(example = "S3cure!Pass")
        String password
) {}
