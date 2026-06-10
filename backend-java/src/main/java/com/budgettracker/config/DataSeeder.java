package com.budgettracker.config;

import com.budgettracker.entity.Category;
import com.budgettracker.entity.Role;
import com.budgettracker.entity.User;
import com.budgettracker.repository.CategoryRepository;
import com.budgettracker.repository.UserRepository;
import com.budgettracker.util.CategoryConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Bootstraps the database with system categories and a default ADMIN user.
 *
 * <p>Idempotent: safe to run on every startup.</p>
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.full-name}")
    private String adminFullName;

    @Override
    @Transactional
    public void run(String... args) {
        seedCategories();
        seedAdminUser();
    }

    private void seedCategories() {
        CategoryConstants.SYSTEM_CATEGORIES.forEach(name -> {
            if (!categoryRepository.existsByNameIgnoreCase(name)) {
                categoryRepository.save(Category.builder().name(name).system(true).build());
                log.info("Seeded category: {}", name);
            }
        });
    }

    private void seedAdminUser() {
        if (userRepository.existsByEmailIgnoreCase(adminEmail)) {
            log.info("Admin user already exists: {}", adminEmail);
            return;
        }
        User admin = User.builder()
                .fullName(adminFullName)
                .email(adminEmail.toLowerCase())
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role(Role.ADMIN)
                .enabled(true)
                .build();
        userRepository.save(admin);
        log.info("Seeded admin user: {}", adminEmail);
    }
}
