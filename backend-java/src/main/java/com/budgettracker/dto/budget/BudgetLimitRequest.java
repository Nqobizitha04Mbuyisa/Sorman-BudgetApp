package com.budgettracker.dto.budget;

import com.budgettracker.validation.ValidCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record BudgetLimitRequest(

        @NotNull @ValidCategory
        String category,

        @NotNull
        @DecimalMin(value = "0.01", message = "Monthly limit must be > 0")
        BigDecimal monthlyLimit
) {}
