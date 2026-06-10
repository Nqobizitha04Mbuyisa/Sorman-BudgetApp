package com.budgettracker.dto.budget;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record BudgetLimitResponse(
        UUID id,
        String category,
        BigDecimal monthlyLimit,
        BigDecimal spent,
        BigDecimal remaining,
        double utilization,   // 0..1+
        String status,        // SAFE | WARNING | EXCEEDED
        Instant createdAt
) {}
