package com.budgettracker.controller;

import com.budgettracker.dto.auth.AuthResponse;
import com.budgettracker.dto.auth.LoginRequest;
import com.budgettracker.dto.auth.RegisterRequest;
import com.budgettracker.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirements;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Tag(name = "Authentication", description = "Register and log in")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@SecurityRequirements // no JWT required
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Register a new user account")
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @Operation(summary = "Authenticate and obtain a JWT")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}
