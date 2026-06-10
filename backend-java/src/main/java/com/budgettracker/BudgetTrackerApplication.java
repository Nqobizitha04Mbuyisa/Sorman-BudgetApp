package com.budgettracker;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

/**
 * Finova — Personal Finance Management System.
 *
 * <p>Enterprise-grade Spring Boot backend featuring:
 * <ul>
 *   <li>JWT-secured REST APIs</li>
 *   <li>PostgreSQL persistence via Spring Data JPA</li>
 *   <li>Layered architecture: controller → service → repository</li>
 *   <li>DTO + MapStruct mappers</li>
 *   <li>Global exception handling, validation, auditing</li>
 *   <li>Swagger / OpenAPI documentation</li>
 * </ul>
 *
 * @author Finova Engineering
 */
@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class BudgetTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(BudgetTrackerApplication.class, args);
    }
}
