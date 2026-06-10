package com.budgettracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Monthly spending cap per category for a user.
 *
 * <p>Unique on the (user, category) pair so each user has at most one
 * monthly limit per category. The {@code monthlyLimit} amount is expressed
 * in the user's display currency (default USD).</p>
 */
@Entity
@Table(name = "budget_limits", uniqueConstraints = {
        @UniqueConstraint(name = "uk_budget_user_category", columnNames = {"user_id", "category_id"})
}, indexes = {
        @Index(name = "idx_budget_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetLimit extends Auditable {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_budget_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false, foreignKey = @ForeignKey(name = "fk_budget_category"))
    private Category category;

    @Column(name = "monthly_limit", nullable = false, precision = 19, scale = 2)
    private BigDecimal monthlyLimit;
}
