package com.budgettracker.service;

import com.budgettracker.dto.common.PagedResponse;
import com.budgettracker.dto.transaction.TransactionRequest;
import com.budgettracker.dto.transaction.TransactionResponse;
import com.budgettracker.entity.Category;
import com.budgettracker.entity.Transaction;
import com.budgettracker.entity.TransactionType;
import com.budgettracker.entity.User;
import com.budgettracker.exception.ResourceNotFoundException;
import com.budgettracker.mapper.FinovaMapper;
import com.budgettracker.repository.TransactionRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Core transaction CRUD + paginated/filterable listing using JPA Specifications.
 */
@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryService categoryService;
    private final CurrentUserService currentUserService;
    private final FinovaMapper mapper;

    @Transactional
    public TransactionResponse create(TransactionRequest req) {
        User user = currentUserService.get();
        Category category = categoryService.requireByName(req.category());
        Transaction tx = Transaction.builder()
                .user(user)
                .category(category)
                .type(req.type())
                .amount(req.amount())
                .description(req.description())
                .occurredOn(req.occurredOn())
                .build();
        tx = transactionRepository.save(tx);
        return mapper.toTransactionResponse(tx);
    }

    @Transactional
    public TransactionResponse update(UUID id, TransactionRequest req) {
        User user = currentUserService.get();
        Transaction tx = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> ResourceNotFoundException.of("Transaction", id));
        Category category = categoryService.requireByName(req.category());
        tx.setCategory(category);
        tx.setType(req.type());
        tx.setAmount(req.amount());
        tx.setDescription(req.description());
        tx.setOccurredOn(req.occurredOn());
        return mapper.toTransactionResponse(transactionRepository.save(tx));
    }

    @Transactional
    public void delete(UUID id) {
        User user = currentUserService.get();
        Transaction tx = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> ResourceNotFoundException.of("Transaction", id));
        transactionRepository.delete(tx);
    }

    @Transactional(readOnly = true)
    public TransactionResponse findById(UUID id) {
        User user = currentUserService.get();
        return transactionRepository.findByIdAndUser(id, user)
                .map(mapper::toTransactionResponse)
                .orElseThrow(() -> ResourceNotFoundException.of("Transaction", id));
    }

    @Transactional(readOnly = true)
    public PagedResponse<TransactionResponse> list(int page, int size,
                                                   TransactionType type,
                                                   String category,
                                                   String search,
                                                   LocalDate startDate,
                                                   LocalDate endDate,
                                                   String sortBy,
                                                   String sortDir) {
        User user = currentUserService.get();
        Sort sort = Sort.by("desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC,
                sanitizeSort(sortBy));
        Page<Transaction> result = transactionRepository.findAll(
                buildSpec(user, type, category, search, startDate, endDate),
                PageRequest.of(page, size, sort)
        );
        return PagedResponse.from(result, mapper::toTransactionResponse);
    }

    private String sanitizeSort(String field) {
        return switch (field) {
            case "amount", "createdAt", "occurredOn" -> field;
            default -> "occurredOn";
        };
    }

    private Specification<Transaction> buildSpec(User user, TransactionType type, String category, String search,
                                                 LocalDate start, LocalDate end) {
        return (root, q, cb) -> {
            List<Predicate> ps = new ArrayList<>();
            ps.add(cb.equal(root.get("user"), user));
            if (type != null) ps.add(cb.equal(root.get("type"), type));
            if (StringUtils.hasText(category)) ps.add(cb.equal(root.get("category").get("name"), category));
            if (StringUtils.hasText(search)) {
                ps.add(cb.like(cb.lower(root.get("description")), "%" + search.toLowerCase() + "%"));
            }
            if (start != null) ps.add(cb.greaterThanOrEqualTo(root.get("occurredOn"), start));
            if (end != null) ps.add(cb.lessThanOrEqualTo(root.get("occurredOn"), end));
            return cb.and(ps.toArray(new Predicate[0]));
        };
    }
}
