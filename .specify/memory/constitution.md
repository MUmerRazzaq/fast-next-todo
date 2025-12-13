# Secure Full-Stack Web Application Constitution

<!--
Sync Impact Report:
Version Change: (new) → 1.0.0
Change Type: Initial ratification
Modified Principles: N/A (initial creation)
Added Sections:
  - Core Architectural Principles (4 principles)
  - Development & Quality Standards (4 standards)
  - Security Standards (2 standards)
  - System Constraints & Environment
  - Governance
Removed Sections: N/A
Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md - Constitution Check section will now validate against these principles
  ✅ .specify/templates/spec-template.md - Aligned with requirement standards
  ✅ .specify/templates/tasks-template.md - Aligned with task categorization
Follow-up TODOs: None
-->

## Core Architectural Principles

### I. Zero-Trust API Boundary

The Backend MUST treat the Frontend as an untrusted actor.

**Implications:**
- Frontend validation is for user experience only
- Backend validation (Pydantic/SQLModel) is MANDATORY for data integrity and security
- No data enters the database without server-side validation
- All input MUST be validated against strict schemas before processing
- Error messages from backend validation MUST NOT leak implementation details

**Rationale:** In a distributed system where the frontend runs in user-controlled environments (browsers), the backend cannot assume data integrity or authenticity. This principle prevents injection attacks, data corruption, and unauthorized operations.

### II. Absolute Data Isolation (The "Tenant" Rule)

The system is multi-user by default. Every database query MUST enforce user-level isolation.

**Non-Negotiable Rules:**
- Every database query (SELECT, UPDATE, DELETE) MUST include a strict `WHERE user_id = {token_sub}` clause
- It is FORBIDDEN to query the database using an ID provided in the URL without cross-referencing it against the authenticated Token ID
- User A MUST NEVER access User B's data, even if User A knows User B's resource IDs
- All service/repository layer methods MUST require authenticated user context

**Rationale:** Multi-tenant data isolation is the foundation of user privacy and security. Violating this principle leads to catastrophic data breaches. This rule makes data isolation a compile-time/review-time requirement, not a runtime hope.

### III. Stateless Serverless Design

The architecture MUST support serverless execution (Neon/Vercel).

**Implications:**
- No in-memory state preservation between requests
- Authentication relies strictly on JWT signatures, not server-side session stores
- All user context MUST be derivable from the token or database
- Services MUST be stateless and horizontally scalable
- No reliance on sticky sessions or local caching

**Rationale:** Serverless platforms provide cost efficiency and infinite scalability but require stateless design. This constraint ensures the system can scale to zero and to millions of requests without architectural changes.

### IV. Strict Separation of Concerns (Decoupled Stack)

Frontend and Backend are separate systems with a formal contract.

**Layer Responsibilities:**
- **Frontend (Next.js):** Handles Presentation, Routing, and Client State (frontend folder)
- **Backend (FastAPI):** Handles Business Logic, Data Persistence, and Security Enforcement (backend folder)

**Communication Contract:**
- These layers communicate ONLY via the defined REST API contract
- Frontend MUST NOT bypass the API to access the database
- Backend MUST NOT serve frontend assets (except in dev mode)
- API contract changes MUST be versioned and documented in OpenAPI

**Rationale:** Separation enables independent deployment, testing, and scaling. It also creates a clear security boundary where all business rules are enforced server-side, preventing client-side tampering.

## Development & Quality Standards

### I. Type Safety Across Boundaries

All code MUST use strict typing to catch errors at compile-time.

**Python Standards:**
- Strict adherence to PEP 8
- All functions MUST use Type Hints
- Pydantic models MUST be used for all I/O validation
- No use of `Any` type except where explicitly justified

**TypeScript Standards:**
- Strict mode enabled in tsconfig.json
- The use of `any` is strictly PROHIBITED
- API response types MUST mirror the Backend's Pydantic schemas
- Use type-safe API clients (generated from OpenAPI when possible)

**Rationale:** Type safety prevents entire classes of runtime errors. By enforcing types at boundaries (API request/response), we ensure contracts are verified at build time, not discovered in production.

### II. Component & Modularity Standards

Code MUST be organized into clear, testable layers.

**Backend Standards:**
- Follow a Service/Repository pattern
- Routes (`/api/...`) call Controllers/Services; they MUST NOT write raw SQL
- Business logic lives in Services, data access in Repositories
- Each layer has a single responsibility

**Frontend Standards:**
- "Smart" Server Components handle data fetching
- "Dumb" Client Components handle interactivity
- Avoid "Prop Drilling" where possible; use Context or state management
- Components should be small, focused, and independently testable

**Rationale:** Layered architecture enables testing, maintains separation of concerns, and makes the codebase navigable. It also prevents business logic from leaking into presentation or data access layers.

### III. Library Vetting

Dependencies MUST be vetted for serverless compatibility and security.

**Requirements:**
- Dependencies MUST be vetted for "Serverless Cold Start" impact
- Heavy libraries (like Pandas) are FORBIDDEN unless explicitly authorized
- All dependencies MUST be pinned to specific versions
- Security vulnerabilities MUST be addressed within one sprint

**Rationale:** In serverless environments, cold start time directly impacts user experience and cost. Large dependencies can make functions unusable. Strict vetting prevents performance regressions and security vulnerabilities.

### IV. Documentation-First API

API changes MUST be documented before implementation.

**Requirements:**
- Changes to API endpoints MUST be reflected in the OpenAPI (Swagger) specification before implementation code is written
- API documentation MUST include request/response schemas, error codes, and authentication requirements
- Breaking changes MUST be versioned (e.g., `/api/v2/...`)

**Rationale:** Documentation-first design creates a contract that frontend and backend teams can work against independently. It also serves as automated testing documentation and client SDK generation source.

## Security Standards

### I. The "Shared Secret" Handshake

The `BETTER_AUTH_SECRET` is the root of trust between the authentication layer and the data layer.

**Requirements:**
- The `BETTER_AUTH_SECRET` MUST NEVER be committed to Git
- It MUST be stored in environment variables or secure secret management
- It acts as the bridge between the Node.js Auth layer and the Python Data layer
- Rotation procedures MUST be documented and tested

**Rationale:** The shared secret validates JWT signatures. If compromised, attackers can forge tokens for any user. Treating it as sacred prevents the most catastrophic authentication bypass.

### II. Token Verification

Every protected API request MUST undergo strict token validation.

**Requirements:**
- Middleware MUST intercept every request to `/api/` (except public endpoints)
- Expired tokens MUST return `401 Unauthorized`
- Valid tokens accessing mismatched resources (e.g., User A requesting User B's task) MUST return `403 Forbidden`
- Token claims MUST be validated (expiry, issuer, audience)
- Token tampering attempts MUST be logged and monitored

**Rationale:** Token verification is the enforcement point for authentication and authorization. Middleware ensures no endpoint can accidentally bypass security checks. Proper status codes (401 vs 403) help clients handle errors correctly.

## System Constraints & Environment

### Runtime Environments

- **Backend Runtime:** Python 3.13+ (FastAPI)
- **Frontend Runtime:** Node.js LTS (Next.js 16 App Router)
- **Database:** Neon (PostgreSQL) accessed via SQLModel (SQLAlchemy)

### Package Management

- **Python:** `uv` (for speed and rigorous dependency locking)
- **TypeScript:** `npm` or `pnpm`

### Code Quality Gates

- **Linter Tolerance:** Zero warnings allowed in build pipelines
- **Python Linting:** `ruff` (configured for PEP 8 compliance)
- **TypeScript Linting:** `eslint` (strict mode, no `any` rule enforced)

### Performance Constraints

- **Cold Start:** Backend functions MUST start in <3 seconds
- **API Response Time:** p95 latency <500ms for standard endpoints
- **Database Connections:** Use connection pooling; serverless-compatible pool sizes

## Governance

This Constitution supersedes all other development practices and MUST be followed without exception.

### Amendment Process

1. Proposed changes MUST be documented with rationale
2. Changes affecting security or data isolation require senior architect approval
3. Constitution updates MUST include a migration plan if existing code is affected
4. All amendments MUST update the version number and Last Amended date

### Compliance & Reviews

- All Pull Requests MUST verify compliance with Constitutional principles
- Code reviewers MUST explicitly check:
  - Data isolation (WHERE user_id clauses)
  - Type safety (no `any`, all type hints present)
  - Input validation (Pydantic schemas)
  - API documentation (OpenAPI updated)
- Complexity introduced beyond these standards MUST be justified
- Security violations MUST block merges

### Version History

**Version**: 1.0.0 | **Ratified**: 2025-12-13 | **Last Amended**: 2025-12-13

**Changelog:**
- 1.0.0 (2025-12-13): Initial ratification - Secure Full-Stack Web Application Constitution established
