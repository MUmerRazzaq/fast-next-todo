---
id: 0001
title: Initial Secure Full-Stack Constitution
stage: constitution
date: 2025-12-13
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: master
user: umer
command: /sp.constitution
labels: ["constitution", "security", "architecture", "full-stack"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - N/A (constitution document)
---

## Prompt

```text
Secure Full-Stack Web Application
---

### I. Core Architectural Principles (The Blueprint)

These principles govern the distributed nature of the system (Next.js Frontend + FastAPI Backend) to ensure security and scalability.

*   **Zero-Trust API Boundary:** The Backend must treat the Frontend as an untrusted actor.
    *   *Implication:* Frontend validation is for user experience only. Backend validation (Pydantic/SQLModel) is for data integrity and security. No data enters the database without server-side validation.
*   **Absolute Data Isolation (The "Tenant" Rule):** The system is multi-user by default.
    *   *Rule:* Every database query (Select, Update, Delete) must include a strict `WHERE user_id = {token_sub}` clause.
    *   *Constraint:* It is forbidden to query the database using an ID provided in the URL without cross-referencing it against the authenticated Token ID.
*   **Stateless Serverless Design:** The architecture must support serverless execution (Neon/Vercel).
    *   *Implication:* No in-memory state preservation between requests. Authentication relies strictly on JWT signatures, not server-side session stores.
*   **Strict Separation of Concerns (Decoupled Stack):**
    *   **Frontend (Next.js):** Handles Presentation, Routing, and Client State (frontend folder).
    *   **Backend (FastAPI):** Handles Business Logic, Data Persistence, and Security Enforcement (bcakend folder).
    *   These layers communicate *only* via the defined REST API contract.

---

### II. Development & Quality Standards (The Code Contract)

These standards define the minimum acceptable quality bar for code health and collaboration.

*   **Type Safety Across Boundaries:**
    *   **Python:** Strict adherence to **PEP 8**. All functions must use **Type Hints**. Pydantic models must be used for all I/O validation.
    *   **TypeScript:** Strict mode enabled. The use of `any` is strictly prohibited. API response types must mirror the Backend's Pydantic schemas.
*   **Component & Modularity Standards:**
    *   **Backend:** Follow a Service/Repository pattern. Routes (`/api/...`) call Controllers/Services; they do not write raw SQL.
    *   **Frontend:** "Smart" Server Components (data fetching) vs. "Dumb" Client Components (interactivity). Avoid "Prop Drilling" where possible.
*   **Library Vetting:**
    *   Dependencies must be vetted for "Serverless Cold Start" impact. Heavy libraries (like Pandas) are forbidden unless explicitly authorized by the Meta-Developer.
*   **Documentation-First API:**
    *   Changes to API endpoints must be reflected in the OpenAPI (Swagger) generation before implementation code is written.

---

### III. Security Standards (The Iron Dome)

Specific to the Better Auth + FastAPI integration.

*   **The "Shared Secret" Handshake:** The `BETTER_AUTH_SECRET` is the root of trust. It must never be committed to Git. It acts as the bridge between the Node.js Auth layer and the Python Data layer.
*   **Token Verification:**
    *   Middleware must intercept *every* request to `/api/`.
    *   Expired tokens must return `401 Unauthorized`.
    *   Valid tokens accessing mismatched IDs (e.g., User A requesting User B's task) must return `403 Forbidden`.

---

### IV. System Constraints & Environment

*   **Backend Runtime:** Python 3.13+ (FastAPI).
*   **Frontend Runtime:** Node.js LTS (Next.js 16 App Router).
*   **Database:** Neon (PostgreSQL) accessed via SQLModel (SQLAlchemy).
*   **Package Management:**
    *   Python: `uv` (for speed and rigorous dependency locking).
    *   TypeScript: `npm` or `pnpm`.
*   **Linter Tolerance:** Zero warnings allowed in build pipelines (`ruff` for Python, `eslint` for JS).
```

## Response snapshot

Created the project constitution at `.specify/memory/constitution.md` (v1.0.0) with the following structure:

**Core Architectural Principles (4):**
1. Zero-Trust API Boundary - Backend treats Frontend as untrusted, all validation server-side
2. Absolute Data Isolation - Multi-user system with mandatory `WHERE user_id = {token_sub}` clauses
3. Stateless Serverless Design - No session state, JWT-based auth for Neon/Vercel
4. Strict Separation of Concerns - Frontend (Next.js) and Backend (FastAPI) communicate only via REST API

**Development & Quality Standards (4):**
1. Type Safety Across Boundaries - PEP 8, Type Hints, Pydantic (Python); strict mode, no `any` (TypeScript)
2. Component & Modularity Standards - Service/Repository pattern (backend); Smart/Dumb components (frontend)
3. Library Vetting - Serverless cold-start impact assessment required
4. Documentation-First API - OpenAPI spec before implementation

**Security Standards (2):**
1. Shared Secret Handshake - `BETTER_AUTH_SECRET` never committed, bridges Node.js/Python layers
2. Token Verification - Middleware intercepts all `/api/` requests, validates tokens, returns proper status codes

**System Constraints:**
- Python 3.13+ (FastAPI), Node.js LTS (Next.js 16), Neon PostgreSQL (SQLModel)
- Package management: `uv` (Python), `npm`/`pnpm` (TypeScript)
- Zero linter warnings (`ruff`, `eslint`)
- Performance: <3s cold start, <500ms p95 API latency

## Outcome

- ✅ Impact: Initial constitution established (v1.0.0), defining security-first architectural principles for full-stack serverless application
- 🧪 Tests: N/A (documentation artifact)
- 📁 Files: Created `.specify/memory/constitution.md`
- 🔁 Next prompts: Feature specifications can now reference constitutional principles; `/sp.plan` will validate against Constitution Check gates
- 🧠 Reflection: Constitution provides clear, testable, declarative rules for security (data isolation, zero-trust), architecture (stateless, separation of concerns), and quality (type safety, documentation-first). Version 1.0.0 establishes baseline for future governance.

## Evaluation notes (flywheel)

- Failure modes observed: None - initial creation
- Graders run and results (PASS/FAIL): N/A (constitution is the grading rubric)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Monitor first feature specification against constitution to validate principle clarity and completeness
