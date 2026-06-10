package com.budgettracker.controller;

import com.budgettracker.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@Tag(name = "Categories", description = "Reference data for categorising transactions")
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "List all system categories")
    @GetMapping
    public ResponseEntity<Map<String, Object>> list() {
        List<String> names = categoryService.systemNames().stream().sorted().toList();
        return ResponseEntity.ok(Map.of("categories", names));
    }
}
