package com.budgettracker.service;

import com.budgettracker.dto.auth.AuthResponse;
import com.budgettracker.dto.auth.LoginRequest;
import com.budgettracker.dto.auth.RegisterRequest;
import com.budgettracker.entity.Role;
import com.budgettracker.entity.User;
import com.budgettracker.exception.ConflictException;
import com.budgettracker.mapper.FinovaMapper;
import com.budgettracker.repository.UserRepository;
import com.budgettracker.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final FinovaMapper mapper;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        String email = req.email().toLowerCase().trim();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ConflictException("Email already registered: " + email);
        }
        User user = User.builder()
                .fullName(req.fullName().trim())
                .email(email)
                .passwordHash(passwordEncoder.encode(req.password()))
                .role(Role.USER)
                .enabled(true)
                .build();
        user = userRepository.save(user);
        log.info("Registered new user {} (id={})", email, user.getId());

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return AuthResponse.bearer(token, tokenProvider.getExpirationSeconds(), mapper.toUserResponse(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        // Throws BadCredentialsException → mapped to 401 by GlobalExceptionHandler
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email().toLowerCase().trim(), req.password())
        );
        User user = userRepository.findByEmailIgnoreCase(req.email())
                .orElseThrow(() -> new org.springframework.security.authentication.BadCredentialsException("Invalid credentials"));

        String token = tokenProvider.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        return AuthResponse.bearer(token, tokenProvider.getExpirationSeconds(), mapper.toUserResponse(user));
    }
}
