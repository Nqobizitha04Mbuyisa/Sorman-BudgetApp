<div align="center">

# 💸 Sorman — Personal Finance Management System

### A production-grade **Java Spring Boot** backend portfolio project, paired with a cinematic React dashboard.

<br/>

[![Java](https://img.shields.io/badge/Java-17-007396?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-JWT-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security)
[![Hibernate](https://img.shields.io/badge/Hibernate-JPA-59666C?style=for-the-badge&logo=hibernate&logoColor=white)](https://hibernate.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-NeonDB-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)
[![Maven](https://img.shields.io/badge/Maven-3.9-C71A36?style=for-the-badge&logo=apachemaven&logoColor=white)](https://maven.apache.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-Analytics-FF6384?style=for-the-badge)](https://recharts.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br/>

**A recruiter-ready showcase of enterprise Java engineering** — layered architecture, JWT-secured REST APIs, JPA Specifications, MapStruct, Bean Validation, global exception handling, OpenAPI docs, and a hardened Docker build — wired to a polished React + Tailwind dashboard.

[🧱 Architecture](#-architecture) · [✨ Features](#-features) · [🚀 Quick start](#-quick-start) · [📡 API](#-api-reference) · [☁️ Deployment](#%EF%B8%8F-deployment) · [🖼️ Screenshots](#%EF%B8%8F-screenshots) · [🛣️ Roadmap](#%EF%B8%8F-roadmap)

</div>

---

## ⭐ Why this project

Sorman was built primarily to demonstrate **enterprise-grade Java backend engineering**. It's targeted at recruiters and engineering managers reviewing portfolios for:

- 🎯 **Java Backend Developer** roles
- 🎯 **Software Engineering** roles
- 🎯 **Full-Stack Java Developer** roles

Every layer in the Spring Boot codebase exists for a reason — the package layout, the choice of `BigDecimal` for money, `BeforeValidator`-style mappers, `@RestControllerAdvice` for uniform error envelopes, JPA `Specification` for dynamic queries, stateless JWT auth, BCrypt(12) hashing, HikariCP tuning, and a non-root multi-stage Docker image. Skim `backend-java/src/main/java/com/budgettracker/` and you'll see production patterns, not tutorial code.

> The React frontend is intentionally polished but **secondary**. The headline artefact is the Spring Boot backend at [`backend-java/`](./backend-java).

---

## 🧱 Architecture

```
Sorman-budget-tracker/
│
├── 📦 backend-java/                ★ PRIMARY ARTEFACT — Spring Boot 3 + PostgreSQL
│   ├── src/main/java/com/budgettracker/
│   │   ├── BudgetTrackerApplication.java
│   │   ├── controller/             # @RestController layer (7 controllers)
│   │   ├── service/                # @Service business logic (7 services)
│   │   ├── repository/             # Spring Data JPA + Specifications
│   │   ├── entity/                 # JPA entities (UUID PKs, auditing)
│   │   ├── dto/                    # Records — auth/user/transaction/budget/dashboard/common
│   │   ├── mapper/                 # MapStruct
│   │   ├── security/               # JWT filter, provider, principal, entry point
│   │   ├── config/                 # SecurityConfig, OpenApiConfig, DataSeeder
│   │   ├── exception/              # Domain exceptions + @RestControllerAdvice
│   │   ├── validation/             # Custom @ValidCategory constraint
│   │   └── util/                   # Constants
│   ├── src/main/resources/application.properties
│   ├── src/test/java/...           # Spring context smoke test
│   ├── pom.xml
│   ├── Dockerfile                  # Multi-stage, non-root, healthcheck
│   ├── docker-compose.yml          # API + Postgres
│   └── .env.example
│
├── 🌐 frontend/                    React 19 + Tailwind + Recharts + shadcn UI
│   ├── src/
│   │   ├── pages/                  # Login, Register, Dashboard, Transactions,
│   │   │                           # AddTransaction, Analytics, Budgets, Profile
│   │   ├── components/             # Layout, Sidebar, Topbar, KPICard, ui/
│   │   ├── context/                # AuthContext, ThemeContext
│   │   └── lib/                    # api.js (axios), utils.js
│   └── .env.example
│
├── 🪞 backend/                     FastAPI mirror — used ONLY for the live preview
│                                   (mirrors the Spring Boot REST contract 1:1)
│
├── 📜 scripts/
│   └── build-zip.sh                Generates a clean distributable archive
│
├── 📚 docs/
│   └── screenshots/                Place your README screenshots here
│
└── README.md
```

### Design choices worth a closer look

| Decision | Where | Why |
|---|---|---|
| Layered architecture (`controller → service → repository`) | `backend-java/src/main/java/com/budgettracker/` | Keeps HTTP concerns out of business logic; trivially unit-testable. |
| **DTO records** for every request/response | `dto/**` | Immutable, concise, auto-documented in OpenAPI. |
| **JPA Specifications** for transaction listing | `service/TransactionService#buildSpec` | Dynamic filtering without writing N JPQL queries. |
| `@RestControllerAdvice` returning typed `ErrorResponse` | `exception/GlobalExceptionHandler` | Uniform error envelope across 100% of endpoints. |
| **BCrypt(12)** + **HMAC-SHA256 JWT** via `jjwt` | `config/SecurityConfig`, `security/JwtTokenProvider` | Industry-standard auth, stateless sessions. |
| `BigDecimal(19,2)` for all money fields | `entity/Transaction`, `entity/BudgetLimit` | Avoids floating-point rounding errors. |
| UUID primary keys | every entity | Safe to expose in URLs, no enumeration leaks. |
| **JPA auditing** via `@EntityListeners(AuditingEntityListener.class)` | `entity/Auditable` | Free `createdAt` / `updatedAt` on every row. |
| **HikariCP** pool tuning | `application.properties` | Battle-tested defaults for Postgres connections. |
| **Multi-stage Docker** with non-root user + healthcheck | `Dockerfile` | Tiny final image, secure by default. |
| **Idempotent data seeder** | `config/DataSeeder` | Bootstrap admin + categories on first run. |

---

## ✨ Features

### 🔐 Authentication & Authorisation
- ✅ User registration & login
- ✅ JWT bearer tokens (HMAC-SHA256, 24h expiry by default)
- ✅ BCrypt password hashing (strength 12)
- ✅ Role-based access control: `USER` + `ADMIN`
- ✅ Seeded admin account on first run

### 💰 Budget & Expense Management
- ✅ Create / read / update / delete income & expense transactions
- ✅ 7 system categories: Food, Transport, Utilities, Entertainment, Salary, Savings, Other
- ✅ Filter transactions by **type · category · description (search) · date range**
- ✅ Sort by date, amount, created date · ascending or descending
- ✅ Pagination (page + size, max 100 per page)
- ✅ Monthly budget limits per category with **live utilisation** and `SAFE` / `WARNING` / `EXCEEDED` status

### 📊 Dashboard & Analytics
- ✅ KPI cards: total income · total expenses · remaining balance · savings rate
- ✅ Monthly income & expense for the current month
- ✅ Expense breakdown by category
- ✅ 6-month income vs. expense trend
- ✅ Recent transactions feed
- ✅ Interactive charts: area, bar, pie, line (Recharts)

### 🛠️ Engineering quality
- ✅ Global exception handler returning a uniform JSON `ErrorResponse`
- ✅ Bean Validation (`jakarta.validation`) on every request DTO + custom `@ValidCategory`
- ✅ MapStruct mappers (compile-time, zero reflection)
- ✅ JPA Specifications for dynamic queries
- ✅ Stateless sessions (`SessionCreationPolicy.STATELESS`)
- ✅ CORS configured via env
- ✅ **Swagger / OpenAPI 3** UI at `/swagger-ui.html`
- ✅ Spring Boot Actuator health + info endpoints

### 🎨 Frontend
- ✅ Dark / light theme with `next-themes`-style switcher
- ✅ Cinematic glassmorphism + subtle neon accents
- ✅ Distinctive typography: Cabinet Grotesk · Manrope · JetBrains Mono
- ✅ Sidebar + topbar layout, fully responsive
- ✅ shadcn/ui components, sonner toasts, alert dialogs
- ✅ `data-testid` attributes across every interactive element (test-friendly)

---

## 🚀 Quick start

### Prerequisites
- ☕ **Java 17+** (`java -version`)
- 📦 **Maven 3.9+** (`mvn -v`) — or use the included `./mvnw`
- 🟢 **Node 18+** with **Yarn** (`yarn -v`)
- 🐳 **Docker** (optional, for the bundled Postgres)
- ☁️ A free **NeonDB** project — [console.neon.tech](https://console.neon.tech)

### 1. Clone

```bash
git clone https://github.com/<your-username>/Sorman-budget-tracker.git
cd Sorman-budget-tracker
```

### 2. Run the **Spring Boot backend**

```bash
cd backend-java
cp .env.example .env
#   ✏️  edit .env with your NeonDB credentials + JWT secret
./mvnw spring-boot:run
```

> Prefer Docker? `docker compose up --build` brings up Postgres + the API in one command.

API is now live at:

| URL | Purpose |
|---|---|
| http://localhost:8080 | REST API root |
| http://localhost:8080/swagger-ui.html | Interactive API docs |
| http://localhost:8080/v3/api-docs | OpenAPI 3 JSON |
| http://localhost:8080/actuator/health | Liveness probe |

### 3. Run the **React frontend**

```bash
cd frontend
cp .env.example .env
#   ✏️  edit .env: REACT_APP_BACKEND_URL=http://localhost:8080
yarn install
yarn start
```

App → http://localhost:3000

### 4. Sign in with the seeded admin

```
email:    admin@finova.io
password: Admin@12345
```

> ⚠️ Change the admin password immediately in production by setting `ADMIN_EMAIL` / `ADMIN_PASSWORD` env vars before the first startup.

---

## 🔧 Environment variables

### `backend-java/.env`

```ini
# --- NeonDB / PostgreSQL ---
SPRING_DATASOURCE_URL=jdbc:postgresql://ep-xxxx.us-east-2.aws.neon.tech/Sorman_db?sslmode=require
SPRING_DATASOURCE_USERNAME=Sorman_user
SPRING_DATASOURCE_PASSWORD=replace-with-neon-password

# --- JWT ---
JWT_SECRET=replace-with-a-256-bit-random-string-use-openssl-rand-base64-64
JWT_EXPIRATION_MS=86400000

# --- Admin bootstrap ---
ADMIN_EMAIL=admin@finova.io
ADMIN_PASSWORD=Admin@12345

# --- App ---
SERVER_PORT=8080
JPA_DDL_AUTO=update
JPA_SHOW_SQL=false
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://Sorman-frontend.vercel.app
```

### `frontend/.env`

```ini
REACT_APP_BACKEND_URL=http://localhost:8080
WDS_SOCKET_PORT=443
```

> Generate a strong JWT secret:
> ```bash
> openssl rand -base64 64
> ```

---

## 📡 API reference

> Full interactive documentation at `/swagger-ui.html` once the backend is running.

### Public
| Method | Path | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create a new account → returns JWT + user |
| `POST` | `/api/auth/login` | Authenticate → returns JWT + user |
| `GET`  | `/api/health` | Liveness probe |
| `GET`  | `/swagger-ui.html` | Swagger UI |

### Authenticated (`Authorization: Bearer <jwt>`)
| Method | Path | Description |
|---|---|---|
| `GET`    | `/api/users/me` | Current user |
| `PUT`    | `/api/users/me` | Update profile (full name) |
| `GET`    | `/api/categories` | List the 7 system categories |
| `POST`   | `/api/transactions` | Create transaction |
| `GET`    | `/api/transactions` | List with filters (`type`, `category`, `search`, `start_date`, `end_date`, `sort_by`, `sort_dir`, `page`, `size`) |
| `GET`    | `/api/transactions/{id}` | Fetch by id |
| `PUT`    | `/api/transactions/{id}` | Update |
| `DELETE` | `/api/transactions/{id}` | Delete |
| `POST`   | `/api/budgets` | Upsert a monthly budget limit |
| `GET`    | `/api/budgets` | List budgets w/ live utilisation |
| `DELETE` | `/api/budgets/{id}` | Delete budget |
| `GET`    | `/api/dashboard/summary` | Aggregated dashboard metrics |

### Sample request

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8080/api/auth/login \
        -H 'Content-Type: application/json' \
        -d '{"email":"admin@finova.io","password":"Admin@12345"}' \
        | jq -r .token)

# 2. Add an expense
curl -X POST http://localhost:8080/api/transactions \
     -H "Authorization: Bearer $TOKEN" \
     -H 'Content-Type: application/json' \
     -d '{
           "type":"EXPENSE",
           "amount":42.50,
           "category":"Food",
           "description":"Lunch",
           "occurredOn":"2026-02-12"
         }'

# 3. Fetch dashboard
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/dashboard/summary
```

---

## ☁️ Deployment

### NeonDB (Postgres)
1. Sign up at [console.neon.tech](https://console.neon.tech).
2. Create a project → copy the **JDBC** connection string.
3. Ensure the string ends with `?sslmode=require`.
4. Paste into `SPRING_DATASOURCE_URL` in your hosting provider's env config.

### Render — backend
1. **New → Web Service** → connect this GitHub repo, root = `backend-java`.
2. Runtime: **Docker**, Dockerfile path: `backend-java/Dockerfile`.
3. Add env vars from `backend-java/.env.example` (point `SPRING_DATASOURCE_URL` at NeonDB).
4. Set health check path to `/actuator/health`.

### Railway — backend
1. **New project → Deploy from GitHub** → select this repo, set service root to `backend-java`.
2. Railway auto-detects the `Dockerfile`.
3. Either add a **PostgreSQL plugin** or point `SPRING_DATASOURCE_URL` at NeonDB.
4. Add the remaining env vars.

### Vercel — frontend
1. **New project** → import this repo, root directory = `frontend`.
2. Framework preset: **Create React App**.
3. Build command: `yarn build`, output: `build`.
4. Add env var `REACT_APP_BACKEND_URL` pointing to your deployed Spring API.

### One-command local stack (Docker Compose)
```bash
cd backend-java
docker compose up --build
```
Starts Postgres 16 + the Spring Boot API together. Useful for demos.

---

## 🖼️ Screenshots

> Drop your screenshots into [`docs/screenshots/`](./docs/screenshots/) and the README will pick them up. Suggested captures:

| Screen | File |
|---|---|
| Login (split-screen, cinematic) | `docs/screenshots/01-login.png` |
| Dashboard (KPIs, charts) | `docs/screenshots/02-dashboard.png` |
| Transactions (filters, search, table) | `docs/screenshots/03-transactions.png` |
| Add transaction (form) | `docs/screenshots/04-add-transaction.png` |
| Analytics (bar/pie/line charts) | `docs/screenshots/05-analytics.png` |
| Budgets (utilisation bars, warnings) | `docs/screenshots/06-budgets.png` |
| Swagger UI (Spring Boot) | `docs/screenshots/07-swagger.png` |
| Light theme | `docs/screenshots/08-light-theme.png` |

```html
<!-- example markdown once you've added them -->
![Dashboard](docs/screenshots/02-dashboard.png)
![Swagger UI](docs/screenshots/07-swagger.png)
```

---

## 🧪 Testing

```bash
# Backend (Spring Boot smoke test — H2 in-memory)
cd backend-java
./mvnw test
```

The repository also includes a Pytest suite covering the FastAPI mirror used in the live preview (`backend/tests/`). Run with `pytest backend/tests/ -v`.

---

## 📦 Distributable archive

Run the helper script to produce a clean **`Sorman-portfolio.zip`** (excludes `node_modules`, `target`, `.git`, `.venv`, `__pycache__`, `.env` secrets):

```bash
./scripts/build-zip.sh
```

You'll get `Sorman-portfolio.zip` in the project root — perfect for emailing or attaching to a job application.

---

## 🛣️ Roadmap

### Near-term
- [ ] Password reset flow (email tokens via SendGrid / Resend)
- [ ] Multi-currency support with per-user currency preference
- [ ] CSV bulk import for transactions
- [ ] Recurring transactions (monthly salary, rent, subscriptions)
- [ ] Email alerts when a budget hits WARNING / EXCEEDED

### Mid-term
- [ ] Refresh-token rotation
- [ ] Two-factor authentication (TOTP)
- [ ] Admin moderation dashboard (`/api/admin/**`)
- [ ] Export reports to PDF / Excel
- [ ] Date-range picker on the Analytics page
- [ ] Internationalisation (i18n)

### Long-term
- [ ] PWA / mobile companion view
- [ ] Bank-account import via Plaid (US) / TrueLayer (EU)
- [ ] AI-powered category suggestions on new transactions

---

## 🤝 Contributing

Issues and PRs welcome. For substantial changes, please open an issue first to discuss the approach.

```bash
# Standard workflow
git checkout -b feature/your-feature
# … make changes, add tests …
./mvnw -pl backend-java test
git commit -m "feat: short description"
git push origin feature/your-feature
```

---

## 📝 License

Released under the [MIT License](LICENSE).

---

<div align="center">

### Built by a Java backend engineer, for Java backend engineers.

If this project helped your hiring decision or sparked an idea, a ⭐ on GitHub goes a long way.

</div>
