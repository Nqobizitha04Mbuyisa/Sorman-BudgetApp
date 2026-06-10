package com.budgettracker.validation;

import com.budgettracker.util.CategoryConstants;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ValidCategoryValidator implements ConstraintValidator<ValidCategory, String> {

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null) return false;
        return CategoryConstants.SYSTEM_CATEGORIES.contains(value);
    }
}
