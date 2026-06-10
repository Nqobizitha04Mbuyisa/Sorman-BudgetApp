package com.budgettracker.service;

import com.budgettracker.dto.budget.BudgetLimitRequest;
import com.budgettracker.dto.budget.BudgetLimitResponse;
import com.budgettracker.entity.BudgetLimit;
import com.budgettracker.entity.Category;
import com.budgettracker.entity.User;
import com.budgettracker.exception.ResourceNotFoundException;
import com.budgettracker.mapper.FinovaMapper;
import com.budgettracker.repository.BudgetLimitRepository;
import com.budgettracker.repository.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

/**
 * Budget limit management with live utilisation calculation.
 *
 * <p>Upsert semantics: posting a budget for an existing (user, category)
 * pair updates the monthly limit in place — matches the React UI contract.</p>
 */
@Service
@RequiredArgsConstructor
public class BudgetLimitService {

    private static final double WARNING_THRESHOLD = 0.80;
    private static final double EXCEEDED_THRESHOLD = 1.0;

    private final BudgetLimitRepository budgetLimitRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryService categoryService;
    private final CurrentUserService currentUserService;
    private final FinovaMapper mapper;

    @Transactional
    public BudgetLimitResponse upsert(BudgetLimitRequest req) {
        User user = currentUserService.get();
        Category category = categoryService.requireByName(req.category());

        BudgetLimit limit = budgetLimitRepository.findByUserAndCategory(user, category)
                .orElseGet(() -> BudgetLimit.builder()
                        .user(user)
                        .category(category)
                        .monthlyLimit(req.monthlyLimit())
                        .build());
        limit.setMonthlyLimit(req.monthlyLimit());
        limit = budgetLimitRepository.save(limit);
        return enrich(limit);
    }

    @Transactional(readOnly = true)
    public List<BudgetLimitResponse> listForCurrentUser() {
        User user = currentUserService.get();
        return budgetLimitRepository.findAllByUser(user).stream()
                .map(this::enrich)
                .toList();
    }

    @Transactional
    public void delete(UUID id) {
        User user = currentUserService.get();
        BudgetLimit limit = budgetLimitRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> ResourceNotFoundException.of("BudgetLimit", id));
        budgetLimitRepository.delete(limit);
    }

    private BudgetLimitResponse enrich(BudgetLimit limit) {
        YearMonth ym = YearMonth.now();
        LocalDate start = ym.atDay(1);
        LocalDate end = ym.atEndOfMonth();
        BigDecimal spent = transactionRepository.sumExpenseForCategoryInRange(
                limit.getUser(), limit.getCategory().getName(), start, end);
        if (spent == null) spent = BigDecimal.ZERO;

        BigDecimal remaining = limit.getMonthlyLimit().subtract(spent).max(BigDecimal.ZERO);
        double utilization = limit.getMonthlyLimit().signum() == 0
                ? 0.0
                : spent.divide(limit.getMonthlyLimit(), 4, RoundingMode.HALF_UP).doubleValue();

        String status;
        if (utilization >= EXCEEDED_THRESHOLD) status = "EXCEEDED";
        else if (utilization >= WARNING_THRESHOLD) status = "WARNING";
        else status = "SAFE";

        return mapper.toBudgetLimitResponse(limit, spent, remaining, utilization, status);
    }
}
