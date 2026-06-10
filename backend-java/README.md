# Finova — Personal Finance Management System

> **A recruiter-ready Java backend portfolio project.** Built with **Spring Boot 3, Spring Security + JWT, Spring Data JPA, PostgreSQL (NeonDB), and OpenAPI 3** — wired to a polished React + Tailwind dashboard.

[![Java](https://img.shields.io/badge/Java-17-007396?logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.2-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-4169E1?logo=postgresql&logoColor=white)](https://neon.tech/)
[![Build: Maven](https://img.shields.io/badge/build-maven-C71A36?logo=apachemaven&logoColor=white)](https://maven.apache.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## ✨ Highlights

- **JWT-secured REST API** with role-based access (`USER`, `ADMIN`)
- **Layered enterprise architecture**: `controller → service → repository → entity`
- **DTO + MapStruct** mappers, **Bean Validation**, custom validators
- **Global exception handler** with uniform JSON error envelope
- **PostgreSQL via NeonDB** + HikariCP connection pooling
- **JPA Specifications** for dynamic filtering, sorting, pagination
- **Auditing fields** (`createdAt`, `updatedAt`) via `@EntityListeners`
- **Swagger / OpenAPI 3** UI at `/swagger-ui.html`
- **Dockerised** with a hardened multi-stage build (non-root, Alpine JRE, healthcheck)
- **docker-compose** for one-command local stack
- **Data seeder** bootstraps admin user + system categories on first run

---

## 🧱 Architecture

```
src/main/java/com/budgettracker/
├── BudgetTrackerApplication.java
├── config/        # SecurityConfig, OpenApiConfig, DataSeeder
├── controller/    # @RestController endpoints
├── service/       # Business logic, transactional
├── repository/    # Spring Data JPA + Specifications
├── entity/        # JPA entities (User, Transaction, Category, BudgetLimit)
├── dto/           # Request/Response records — typed by domain
├── mapper/        # MapStruct interface mappers
├── security/      # JWT filter, provider, principal, entry point
├── exception/     # Domain exceptions + @RestControllerAdvice
├── validation/    # @ValidCategory custom constraint
└── util/          # Constants
```

### Why this structure scales

- **Single-responsibility packages** → easy navigation in IDE & PRs.
- **Records for DTOs** → immutable, concise, valid OpenAPI schemas.
- **Specifications** for transactions allow recruiters to inspect a clean dynamic-query implementation without leaking JPA into controllers.
- **`@ControllerAdvice`** keeps error semantics centralised — every endpoint returns the same `ErrorResponse` shape.

---

## 🔐 Security model

- Passwords are hashed with **BCrypt** (strength 12).
- JWTs are signed with **HMAC-SHA256** via `jjwt`, issued by `JwtTokenProvider`.
- Stateless sessions (`SessionCreationPolicy.STATELESS`).
- The `JwtAuthenticationFilter` runs once per request, extracts the `Authorization: Bearer …` header, validates the token, and populates `SecurityContextHolder`.
- `@EnableMethodSecurity` lets services use `@PreAuthorize` if needed.
- `JwtAuthenticationEntryPoint` returns a typed `ErrorResponse` for unauthenticated requests instead of Spring's default text body.

### Public endpoints
```
POST  /api/auth/register
POST  /api/auth/login
GET   /api/health
GET   /swagger-ui.html
GET   /v3/api-docs
```

### Authenticated endpoints (require `Authorization: Bearer <jwt>`)
```
GET    /api/users/me
PUT    /api/users/me

GET    /api/dashboard/summary

GET    /api/categories

GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/{id}
PUT    /api/transactions/{id}
DELETE /api/transactions/{id}

GET    /api/budgets
POST   /api/budgets
DELETE /api/budgets/{id}
```

---

## 🚀 Run locally

### 1. Prerequisites
- Java 17+
- Maven 3.9+
- Docker (optional, for `docker compose`)

### 2. Configure env
```bash
cp .env.example .env
# Edit .env with your NeonDB credentials (or local Postgres if you prefer).
```

### 3a. Run with Maven (Postgres must be reachable)
```bash
./mvnw clean spring-boot:run
```

### 3b. Or run with docker-compose (spins up Postgres too)
```bash
docker compose up --build
```

App is now live at:
- **API**         → http://localhost:8080
- **Swagger UI** → http://localhost:8080/swagger-ui.html
- **OpenAPI JSON** → http://localhost:8080/v3/api-docs

Default seeded admin (override via `ADMIN_EMAIL` / `ADMIN_PASSWORD`):
```
email:    admin@finova.io
password: Admin@12345
```

---

## ☁️ Deploying

### NeonDB (Postgres)
1. Create a project at [console.neon.tech](https://console.neon.tech).
2. Copy the **JDBC** connection string → set `SPRING_DATASOURCE_URL` (must include `?sslmode=require`).
3. Set `SPRING_DATASOURCE_USERNAME` / `SPRING_DATASOURCE_PASSWORD`.

### Render
1. New → Web Service → connect this repo.
2. Build command: `./mvnw clean package -DskipTests`
3. Start command: `java -jar target/finova-budget-tracker.jar`
4. Add the env vars from `.env.example`.

### Railway
1. New project → Deploy from repo.
2. Add a **PostgreSQL** plugin or paste your NeonDB URL.
3. Railway auto-detects the `Dockerfile`. Set env vars.

### Vercel (frontend)
The React frontend lives at `/frontend`. Deploy it as a static site and set:
```
REACT_APP_BACKEND_URL=https://your-spring-api.example.com
```

---

## 🧪 Sample requests

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
     -H 'Content-Type: application/json' \
     -d '{"fullName":"Jane Doe","email":"jane@finova.io","password":"S3cure!Pass"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
        -H 'Content-Type: application/json' \
        -d '{"email":"admin@finova.io","password":"Admin@12345"}' \
        | jq -r .token)

# Create an expense
curl -X POST http://localhost:8080/api/transactions \
     -H "Authorization: Bearer $TOKEN" \
     -H 'Content-Type: application/json' \
     -d '{"type":"EXPENSE","amount":42.50,"category":"Food","description":"Lunch","occurredOn":"2026-02-12"}'

# Fetch dashboard summary
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/dashboard/summary
```

---

## 🗃️ Database schema (high level)

| Table            | Purpose                                  |
|------------------|------------------------------------------|
| `users`          | Account records (UUID PK, email unique)  |
| `categories`     | Reference data (seeded on startup)       |
| `transactions`   | Income/expense entries owned by a user   |
| `budget_limits`  | Monthly cap per (user, category)         |

All tables carry `created_at` / `updated_at` audit columns and UUID primary keys.

---

## 📂 Frontend

React + Tailwind + Recharts dashboard lives at `../frontend` and consumes this exact REST contract. See its README for details.

---

## 📝 License

MIT © Finova Engineering
