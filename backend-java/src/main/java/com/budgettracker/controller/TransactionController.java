package com.budgettracker.controller;

import com.budgettracker.dto.common.PagedResponse;
import com.budgettracker.dto.transaction.TransactionRequest;
import com.budgettracker.dto.transaction.TransactionResponse;
import com.budgettracker.entity.TransactionType;
import com.budgettracker.service.TransactionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@Tag(name = "Transactions", description = "Income & expense CRUD with filtering and pagination")
@RestController
@RequestMapping("/api/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @Operation(summary = "Create a transaction")
    @PostMapping
    public ResponseEntity<TransactionResponse> create(@Valid @RequestBody TransactionRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(transactionService.create(req));
    }

    @Operation(summary = "List transactions with filtering, sorting, pagination")
    @GetMapping
    public ResponseEntity<PagedResponse<TransactionResponse>> list(
            @Parameter(description = "Zero-based page index") @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Page size 1–100") @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) TransactionType type,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @RequestParam(name = "start_date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(name = "end_date", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(name = "sort_by", defaultValue = "occurredOn") String sortBy,
            @RequestParam(name = "sort_dir", defaultValue = "desc") String sortDir
    ) {
        size = Math.max(1, Math.min(size, 100));
        return ResponseEntity.ok(transactionService.list(page, size, type, category, search, startDate, endDate, sortBy, sortDir));
    }

    @Operation(summary = "Fetch a single transaction by id")
    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> get(@PathVariable UUID id) {
        return ResponseEntity.ok(transactionService.findById(id));
    }

    @Operation(summary = "Update a transaction")
    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> update(@PathVariable UUID id,
                                                      @Valid @RequestBody TransactionRequest req) {
        return ResponseEntity.ok(transactionService.update(id, req));
    }

    @Operation(summary = "Delete a transaction")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        transactionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
