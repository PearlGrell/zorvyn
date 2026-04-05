# Zorvyn - Financial Records Management System

> **Developed by:** Aryan Trivedi  
> **Live Demo:** [zorvyn-eapl.onrender.com](https://zorvyn-eapl.onrender.com)  
> **API Docs:** [zorvyn-eapl.onrender.com/api/docs](https://zorvyn-eapl.onrender.com/api/docs)

Zorvyn is a professional-grade financial management backend designed for security, scalability, and ease of use. It features granular Role-Based Access Control (RBAC), automated auditing, and real-time financial insights.

---

## Tech Stack

- **Runtime:** [Bun](https://bun.sh/) (Hyper-fast JS runtime)
- **Framework:** [Express.js](https://expressjs.com/) (v5.x)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **Database:** SQLite
- **Security:** JWT, Zod, Helmet, HPP, Rate-Limiting
- **Documentation:** Swagger (OpenAPI 3.0)

---

## Core Features

### User & Role Management
- **Granular RBAC:** Permissions for `VIEWER`, `ANALYST`, and `ADMIN`.
- **Permission Inheritance:** Hierarchical mapping ensures clean access management.
- **Account Status:** Supports `ACTIVE`, `INACTIVE`, and `RESTRICTED` (read-only) states.

### Financial Management
- **Records:** Full CRUD for transactions with amount, category, and metadata.
- **Soft Delete:** Support for non-destructive data deletion through status-based management.
- **Insights:** Automated category-wise spending, monthly summaries, and savings trends.
- **Filtering:** High-performance searching and filtering across all financial data.

### Security & Reliability
- **Automated Auditing:** Every sensitive action is logged with full accountability.
- **Input Validation:** Strict schema enforcement using Zod.
- **Hardened Security:** PBKDF2 password hashing (100k iterations) and layered middleware protection.

---

## Key Differentiators

- **Architectural Restricted Status:** A dedicated security layer that enables instant, global write-access suspension for specific accounts via unified middleware, providing a fail-safe mechanism for risk management.
- **Enterprise-Grade Soft Delete:** Implemented through status-based record management (Users) to preserve full historical integrity and referential data for audit compliance and recovery.
- **Permission Inheritance Architecture:** A hierarchical, permission-based access model where `ADMIN` builds upon `ANALYST`, ensuring a clean, scalable security footprint across the system.
- **Zod-Verified Zero-Drift Config:** Strict runtime validation of environment variables ensures the application never enters an invalid state due to configuration errors.
- **Aggregation-Native Services:** Built-in dashboard and insight layers that perform high-speed aggregations for category analysis and spending trends.
- **Audit Logging:** Treats auditing as a core service, automatically tracking sensitive mutations out-of-the-box.
- **Environment Validation:** Uses Zod for configuration validation at startup to ensure the application never runs with an invalid configuration.
- **Aggregated Insights:** Built-in services that provide financial trends and spending analysis beyond basic record-keeping.

---

## Setup & Installation

### 1. Clone & Install
```bash
git clone https://github.com/PearlGrell/zorvyn.git
cd zorvyn
bun install
```

### 2. Environment Setup
Create a `.env` file: (copy from `.env.example`)
```env
PORT=3000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your_secret"
```

### 3. Initialize & Run
```bash
bun db:push
bun db:generate
bun dev
```

---

## Project Structure

```text
api/
├── config/          # Centralized configuration (Prisma, Env, Cors)
├── controllers/     # Business logic layer
├── middlewares/     # Auth, RBAC, Error Handling, Security
├── routes/          # Express route definitions
├── services/        # Database & core logic
├── validators/      # Zod schemas for input validation
├── utils/           # Hashing, JWT, and Response helpers
└── app.ts           # Entry point
```

---

## API Documentation
Access the interactive Swagger UI to explore and test endpoints:
- **Local:** `http://localhost:3000/api/docs`
- **Production:** `https://zorvyn-eapl.onrender.com/api/docs`

---

## Useful Commands
- `bun dev`: Start server with hot reload.
- `bun db:studio`: Visual database explorer.
- `bun test`: Run test suites.
