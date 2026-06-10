package com.budgettracker.mapper;

import com.budgettracker.dto.transaction.TransactionResponse;
import com.budgettracker.dto.user.UserResponse;
import com.budgettracker.dto.budget.BudgetLimitResponse;
import com.budgettracker.entity.BudgetLimit;
import com.budgettracker.entity.Transaction;
import com.budgettracker.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

import java.math.BigDecimal;

/**
 * Centralised MapStruct mapper. Keeping a single mapper interface keeps the
 * generated implementation small and predictable.
 */
@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface FinovaMapper {

    UserResponse toUserResponse(User user);

    @Mapping(target = "category", source = "category.name")
    TransactionResponse toTransactionResponse(Transaction transaction);

    @Mapping(target = "category", source = "limit.category.name")
    @Mapping(target = "id",       source = "limit.id")
    @Mapping(target = "monthlyLimit", source = "limit.monthlyLimit")
    @Mapping(target = "createdAt", source = "limit.createdAt")
    @Mapping(target = "spent",       source = "spent")
    @Mapping(target = "remaining",   source = "remaining")
    @Mapping(target = "utilization", source = "utilization")
    @Mapping(target = "status",      source = "status")
    BudgetLimitResponse toBudgetLimitResponse(BudgetLimit limit, BigDecimal spent, BigDecimal remaining,
                                              double utilization, String status);
}
