package com.budgettracker.dto.dashboard;

import com.budgettracker.dto.transaction.TransactionResponse;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public record DashboardSummaryResponse(
        BigDecimal totalIncome,
        BigDecimal totalExpenses,
        BigDecimal remainingBalance,
        double savingsRate,
        BigDecimal monthlyIncome,
        BigDecimal monthlyExpenses,
        long transactionCount,
        Map<String, BigDecimal> expenseByCategory,
        List<MonthlyTrendPoint> monthlyTrend,
        List<TransactionResponse> recentTransactions
) {
    public record MonthlyTrendPoint(String month, BigDecimal income, BigDecimal expense) {}
}
