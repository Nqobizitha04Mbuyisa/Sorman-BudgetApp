package com.budgettracker.controller;

import com.budgettracker.dto.dashboard.DashboardSummaryResponse;
import com.budgettracker.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Dashboard", description = "Aggregated finance metrics")
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @Operation(summary = "Total income/expenses, savings rate, category breakdown, monthly trend")
    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> summary() {
        return ResponseEntity.ok(dashboardService.summary());
    }
}
