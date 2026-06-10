package com.budgettracker.util;

import java.util.Set;

/**
 * Canonical list of system-managed categories. Acts as the source of truth
 * for {@link com.budgettracker.validation.ValidCategoryValidator} and the
 * data seeder.
 */
public final class CategoryConstants {

    public static final Set<String> SYSTEM_CATEGORIES = Set.of(
            "Food",
            "Transport",
            "Utilities",
            "Entertainment",
            "Salary",
            "Savings",
            "Other"
    );

    private CategoryConstants() {}
}
