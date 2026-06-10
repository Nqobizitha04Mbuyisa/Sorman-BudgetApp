package com.budgettracker.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

/**
 * Reference category used to classify transactions.
 *
 * <p>Seeded at startup with the canonical set:
 * Food, Transport, Utilities, Entertainment, Salary, Savings, Other.</p>
 */
@Entity
@Table(name = "categories", indexes = {
        @Index(name = "idx_categories_name", columnList = "name", unique = true)
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends Auditable {

    @Id
    @GeneratedValue
    @Column(name = "id", updatable = false, nullable = false, columnDefinition = "uuid")
    private UUID id;

    @Column(name = "name", nullable = false, unique = true, length = 60)
    private String name;

    @Column(name = "description", length = 200)
    private String description;

    @Column(name = "is_system", nullable = false)
    @Builder.Default
    private boolean system = true;
}
