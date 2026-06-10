package com.budgettracker.repository;

import com.budgettracker.entity.Transaction;
import com.budgettracker.entity.TransactionType;
import com.budgettracker.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TransactionRepository
        extends JpaRepository<Transaction, UUID>, JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByIdAndUser(UUID id, User user);

    Page<Transaction> findByUser(User user, Pageable pageable);

    /** Sum of amount for a user grouped by type. Used by dashboard. */
    @Query("""
            SELECT t.type, COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user = :user
            GROUP BY t.type
            """)
    List<Object[]> sumAmountByType(@Param("user") User user);

    @Query("""
            SELECT t.type, COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user = :user
              AND t.occurredOn BETWEEN :start AND :end
            GROUP BY t.type
            """)
    List<Object[]> sumAmountByTypeInRange(@Param("user") User user,
                                          @Param("start") LocalDate start,
                                          @Param("end") LocalDate end);

    @Query("""
            SELECT t.category.name, COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user = :user AND t.type = :type
            GROUP BY t.category.name
            """)
    List<Object[]> sumAmountByCategory(@Param("user") User user,
                                       @Param("type") TransactionType type);

    @Query("""
            SELECT COALESCE(SUM(t.amount), 0)
            FROM Transaction t
            WHERE t.user = :user
              AND t.type = com.budgettracker.entity.TransactionType.EXPENSE
              AND t.category.name = :categoryName
              AND t.occurredOn BETWEEN :start AND :end
            """)
    BigDecimal sumExpenseForCategoryInRange(@Param("user") User user,
                                            @Param("categoryName") String categoryName,
                                            @Param("start") LocalDate start,
                                            @Param("end") LocalDate end);

    long countByUser(User user);
}
