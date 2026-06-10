package com.budgettracker.dto.common;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Paginated response wrapper that hides Spring's Page implementation details
 * (which is intentionally not stable in its JSON shape).
 */
public record PagedResponse<T>(
        List<T> items,
        long total,
        int page,
        int size,
        int totalPages
) {
    public static <S, T> PagedResponse<T> from(Page<S> page, java.util.function.Function<S, T> mapper) {
        return new PagedResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getTotalElements(),
                page.getNumber(),
                page.getSize(),
                page.getTotalPages()
        );
    }
}
