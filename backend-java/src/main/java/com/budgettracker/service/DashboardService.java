package com.budgettracker.service;

import com.budgettracker.dto.dashboard.DashboardSummaryResponse;
import com.budgettracker.dto.dashboard.DashboardSummaryResponse.MonthlyTrendPoint;
import com.budgettracker.dto.transaction.TransactionResponse;
import com.budgettracker.entity.Transaction;
import com.budgettracker.entity.TransactionType;
import com.budgettracker.entity.User;
import com.budgettracker.mapper.FinovaMapper;
import com.budgettracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Aggregates summary metrics rendered by the React dashboard.
 *
 * <p>All read-only — wrapped in a single transaction to keep
 * the entity manager open across multiple repo calls (avoids N+1).</p>
 */
@Service
@RequiredArgsConstructor
public class DashboardService {

    private static final DateTimeFormatter MONTH_LABEL = DateTimeFormatter.ofPattern("MMM yy");
    private static final int TREND_MONTHS = 6;
    private static final int RECENT_TRANSACTIONS = 5;

    private final TransactionRepository transactionRepository;
    private final CurrentUserService currentUserService;
    private final FinovaMapper mapper;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse summary() {
        User user = currentUserService.get();

        // All-time totals
        Map<TransactionType, BigDecimal> totals = toMap(transactionRepository.sumAmountByType(user));
        BigDecimal totalIncome = totals.getOrDefault(TransactionType.INCOME, BigDecimal.ZERO);
        BigDecimal totalExpenses = totals.getOrDefault(TransactionType.EXPENSE, BigDecimal.ZERO);
        BigDecimal remaining = totalIncome.subtract(totalExpenses);
        double savingsRate = totalIncome.signum() > 0
                ? remaining.divide(totalIncome, 4, RoundingMode.HALF_UP).doubleValue()
                : 0.0;

        // Current month
        YearMonth thisMonth = YearMonth.now();
        Map<TransactionType, BigDecimal> monthly = toMap(
                transactionRepository.sumAmountByTypeInRange(user, thisMonth.atDay(1), thisMonth.atEndOfMonth()));
        BigDecimal monthlyIncome = monthly.getOrDefault(TransactionType.INCOME, BigDecimal.ZERO);
        BigDecimal monthlyExpenses = monthly.getOrDefault(TransactionType.EXPENSE, BigDecimal.ZERO);

        // Expense by category
        Map<String, BigDecimal> expenseByCategory = new LinkedHashMap<>();
        for (Object[] row : transactionRepository.sumAmountByCategory(user, TransactionType.EXPENSE)) {
            expenseByCategory.put((String) row[0], (BigDecimal) row[1]);
        }

        // Trend last 6 months (inclusive)
        List<MonthlyTrendPoint> trend = new ArrayList<>(TREND_MONTHS);
        for (int i = TREND_MONTHS - 1; i >= 0; i--) {
            YearMonth ym = thisMonth.minusMonths(i);
            Map<TransactionType, BigDecimal> m = toMap(
                    transactionRepository.sumAmountByTypeInRange(user, ym.atDay(1), ym.atEndOfMonth()));
            trend.add(new MonthlyTrendPoint(
                    ym.atDay(1).format(MONTH_LABEL),
                    m.getOrDefault(TransactionType.INCOME, BigDecimal.ZERO),
                    m.getOrDefault(TransactionType.EXPENSE, BigDecimal.ZERO)
            ));
        }

        // Recent
        List<TransactionResponse> recent = transactionRepository
                .findByUser(user, PageRequest.of(0, RECENT_TRANSACTIONS, Sort.by(Sort.Direction.DESC, "createdAt")))
                .map(mapper::toTransactionResponse)
                .getContent();

        long count = transactionRepository.countByUser(user);

        return new DashboardSummaryResponse(
                totalIncome, totalExpenses, remaining, savingsRate,
                monthlyIncome, monthlyExpenses, count,
                expenseByCategory, trend, recent
        );
    }

    @SuppressWarnings("unchecked")
    private static Map<TransactionType, BigDecimal> toMap(List<Object[]> rows) {
        Map<TransactionType, BigDecimal> out = new java.util.EnumMap<>(TransactionType.class);
        for (Object[] r : rows) {
            out.put((TransactionType) r[0], (BigDecimal) r[1]);
        }
        return out;
    }

    /** Helper to silence unchecked warning if needed. */
    private static <T> T cast(Object o) { return (T) o; }
}
