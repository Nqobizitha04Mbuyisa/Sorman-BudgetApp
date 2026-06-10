package com.budgettracker.controller;

import com.budgettracker.dto.budget.BudgetLimitRequest;
import com.budgettracker.dto.budget.BudgetLimitResponse;
import com.budgettracker.service.BudgetLimitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Tag(name = "Budgets", description = "Monthly spending limits per category")
@RestController
@RequestMapping("/api/budgets")
@RequiredArgsConstructor
public class BudgetLimitController {

    private final BudgetLimitService budgetLimitService;

    @Operation(summary = "Create or update a monthly budget for a category")
    @PostMapping
    public ResponseEntity<BudgetLimitResponse> upsert(@Valid @RequestBody BudgetLimitRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(budgetLimitService.upsert(req));
    }

    @Operation(summary = "List the current user's budgets with live utilisation")
    @GetMapping
    public ResponseEntity<List<BudgetLimitResponse>> list() {
        return ResponseEntity.ok(budgetLimitService.listForCurrentUser());
    }

    @Operation(summary = "Delete a budget")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        budgetLimitService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
