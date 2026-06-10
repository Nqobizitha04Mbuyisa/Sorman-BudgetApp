package com.budgettracker.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.*;

/**
 * Validates that a string matches one of the canonical category names.
 *
 * <p>The actual allowed set is owned by {@link com.budgettracker.service.CategoryService}.</p>
 */
@Documented
@Constraint(validatedBy = ValidCategoryValidator.class)
@Target({ElementType.FIELD, ElementType.PARAMETER, ElementType.RECORD_COMPONENT})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidCategory {
    String message() default "Category must be one of: Food, Transport, Utilities, Entertainment, Salary, Savings, Other";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
