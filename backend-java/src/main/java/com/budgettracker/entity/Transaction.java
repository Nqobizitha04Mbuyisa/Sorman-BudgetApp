package com.budgettracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/**
 * A single income or expense transaction owned by a user.
 *
 * <p>All monetary amounts use {@link BigDecimal} for financial precision —
 * never use {@code double} for money.</p>
 */
@Entity
@Table(name = "transactions", indexes = {
        @Index(name = "idx_txn_user", columnList = "user_id"),
        @Index(name = "idx_txn_user_date", columnList = "user_id, occurredOn"),
        @Index(name = "idx_txn_user_type", columnList = "user_id, type"),
        @Index(name = "idx_txn_user_category", columnList = "user_id, category_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Transaction extends Auditable {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_txn_user"))
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false, foreignKey = @ForeignKey(name = "fk_txn_category"))
    private Category category;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private TransactionType type;

    @Column(name = "amount", nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Column(name = "description", length = 240)
    private String description;

    @Column(name = "occurredOn", nullable = false)
    private LocalDate occurredOn;
}
