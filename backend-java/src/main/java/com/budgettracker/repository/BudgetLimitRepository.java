package com.budgettracker.repository;

import com.budgettracker.entity.BudgetLimit;
import com.budgettracker.entity.Category;
import com.budgettracker.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BudgetLimitRepository extends JpaRepository<BudgetLimit, UUID> {

    Optional<BudgetLimit> findByUserAndCategory(User user, Category category);

    List<BudgetLimit> findAllByUser(User user);

    Optional<BudgetLimit> findByIdAndUser(UUID id, User user);
}
