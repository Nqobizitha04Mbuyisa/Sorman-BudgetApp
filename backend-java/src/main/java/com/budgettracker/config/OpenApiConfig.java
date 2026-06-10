package com.budgettracker.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String JWT_SCHEME = "bearerAuth";

    @Bean
    public OpenAPI finovaOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Finova — Personal Finance Management API")
                        .version("1.0.0")
                        .description("Enterprise-grade REST API for personal finance tracking. "
                                + "Includes JWT auth, role-based access, transactions, budgets and analytics.")
                        .contact(new Contact().name("Finova Engineering").email("eng@finova.io"))
                        .license(new License().name("MIT")))
                .addSecurityItem(new SecurityRequirement().addList(JWT_SCHEME))
                .components(new Components().addSecuritySchemes(JWT_SCHEME,
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("JWT bearer token obtained from /api/auth/login")));
    }
}
