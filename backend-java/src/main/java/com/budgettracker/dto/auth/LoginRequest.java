package com.budgettracker.dto.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "LoginRequest", description = "Payload to authenticate")
public record LoginRequest(

        @NotBlank @Email
        @Schema(example = "admin@finova.io")
        String email,

        @NotBlank
        @Schema(example = "Admin@12345")
        String password
) {}
