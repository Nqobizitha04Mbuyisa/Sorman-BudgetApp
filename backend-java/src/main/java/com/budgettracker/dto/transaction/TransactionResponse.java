package com.budgettracker.dto.transaction;

import com.budgettracker.entity.TransactionType;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record TransactionResponse(
        UUID id,
        TransactionType type,
        BigDecimal amount,
        String category,
        String description,
        LocalDate occurredOn,
        Instant createdAt,
        Instant updatedAt
) {}
