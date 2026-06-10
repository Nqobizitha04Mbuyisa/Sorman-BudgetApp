package com.budgettracker.service;

import com.budgettracker.entity.Category;
import com.budgettracker.exception.ResourceNotFoundException;
import com.budgettracker.repository.CategoryRepository;
import com.budgettracker.util.CategoryConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public Set<String> systemNames() {
        return CategoryConstants.SYSTEM_CATEGORIES;
    }

    @Transactional(readOnly = true)
    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Category requireByName(String name) {
        return categoryRepository.findByNameIgnoreCase(name)
                .orElseThrow(() -> ResourceNotFoundException.of("Category", name));
    }
}
