package com.budgettracker.dto.auth;

import com.budgettracker.dto.user.UserResponse;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "AuthResponse", description = "Authentication payload returned on register/login")
public record AuthResponse(
        String token,
        String tokenType,
        long expiresInSeconds,
        UserResponse user
) {
    public static AuthResponse bearer(String token, long expiresInSeconds, UserResponse user) {
        return new AuthResponse(token, "Bearer", expiresInSeconds, user);
    }
}
