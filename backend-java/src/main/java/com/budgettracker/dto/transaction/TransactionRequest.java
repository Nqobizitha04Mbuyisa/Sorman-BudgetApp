package com.budgettracker.dto.transaction;

import com.budgettracker.entity.TransactionType;
import com.budgettracker.validation.ValidCategory;
import com.fasterxml.jackson.annotation.JsonFormat;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

import com.fasterxml.jackson.annotation.JsonFormat;

@Schema(name = "TransactionRequest", description = "Create or update a transaction")
public record TransactionRequest(

        @NotNull(message = "Type is required")
        @Schema(example = "EXPENSE")
        TransactionType type,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        @Schema(example = "120.50")
        BigDecimal amount,

        @NotNull(message = "Category is required")
        @ValidCategory
        @Schema(example = "Food", allowableValues = {"Food", "Transport", "Utilities", "Entertainment", "Salary", "Savings", "Other"})
        String category,

        @Size(max = 240)
        @Schema(example = "Grocery shopping")
        String description,

        @NotNull(message = "Date is required")
        @PastOrPresent(message = "Date cannot be in the future")
        @Schema(example = "2026-02-12")
        @JsonFormat(pattern = "yyyy-MM-dd")
        LocalDate occurredOn
) {}
