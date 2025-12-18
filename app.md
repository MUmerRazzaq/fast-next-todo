# Fast Next Todo - Application Architecture

This document explains how the database, authentication, and API communication work together in the Fast Next Todo application.

## Table of Contents

- [Overview](#overview)
- [Architecture Diagram](#architecture-diagram)
- [Database Architecture](#database-architecture)
- [Authentication Flow](#authentication-flow)
- [Auto Table Creation](#auto-table-creation)
- [API Communication](#api-communication)
- [Key Design Decisions](#key-design-decisions)

---

## Overview

Fast Next Todo is a full-stack task management application with:

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Frontend** | Next.js 15 | UI, Authentication (Better Auth), JWT generation |
| **Backend** | FastAPI (Python) | REST API, Business logic, Data validation |
| **Database** | PostgreSQL | Shared database for auth and business data |
| **Auth** | Better Auth | User management, sessions, password hashing |

---

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────────┐
│                          PostgreSQL Database                               │
│                    (Shared by Frontend & Backend)                          │
├───────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────────────────┐       ┌───────────────────────────────────┐ │
│  │   FRONTEND TABLES        │       │        BACKEND TABLES             │ │
│  │   (Better Auth)          │       │        (Alembic Migrations)       │ │
│  ├──────────────────────────┤       ├───────────────────────────────────┤ │
│  │                          │       │                                   │ │
│  │  user                    │       │  tasks                            │ │
│  │  ├─ id (PK)        ◄─────┼───────┼─►├─ user_id (no FK constraint)   │ │
│  │  ├─ email                │       │  ├─ title                         │ │
│  │  ├─ name                 │       │  ├─ description                   │ │
│  │  └─ ...                  │       │  ├─ priority                      │ │
│  │                          │       │  └─ ...                           │ │
│  │  session                 │       │                                   │ │
│  │  ├─ token                │       │  tags                             │ │
│  │  └─ userId ──────────────┤       │  ├─ user_id                       │ │
│  │                          │       │  └─ name                          │ │
│  │  account                 │       │                                   │ │
│  │  └─ password (hashed)    │       │  audit_logs                       │ │
│  │                          │       │  └─ user_id                       │ │
│  │  verification            │       │                                   │ │
│  │                          │       │  task_tags (junction)             │ │
│  └──────────────────────────┘       └───────────────────────────────────┘ │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
                    ▲                           ▲
                    │                           │
         ┌──────────┴──────────┐    ┌──────────┴──────────┐
         │      FRONTEND       │    │       BACKEND       │
         │    (Next.js)        │    │     (FastAPI)       │
         ├─────────────────────┤    ├─────────────────────┤
         │ • Better Auth       │    │ • SQLModel/SQLAlchemy│
         │ • User login/signup │    │ • Task CRUD          │
         │ • Session management│    │ • Tags management    │
         │ • JWT token creation│    │ • Audit logging      │
         │ • Direct DB access  │    │ • JWT validation     │
         └─────────────────────┘    └─────────────────────┘
```

---

## Database Architecture

### Frontend Tables (Better Auth)

These tables are managed by Better Auth for authentication:

```sql
-- Users Table
CREATE TABLE "user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN NOT NULL DEFAULT FALSE,
    "image" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Sessions Table
CREATE TABLE "session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "token" TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Accounts Table (stores credentials)
CREATE TABLE "account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,      -- "credential" for email/password
    "password" TEXT,                  -- Hashed password
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Verification Table
CREATE TABLE "verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Backend Tables (Alembic Migrations)

These tables store business data:

```sql
-- Tasks Table
CREATE TABLE "tasks" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL,          -- References user.id (no FK constraint)
    "title" TEXT NOT NULL,
    "description" TEXT,
    "priority" ENUM('low', 'medium', 'high') DEFAULT 'medium',
    "due_date" TIMESTAMP,
    "recurrence" ENUM('none', 'daily', 'weekly', 'monthly') DEFAULT 'none',
    "is_completed" BOOLEAN DEFAULT FALSE,
    "completed_at" TIMESTAMP,
    "is_deleted" BOOLEAN DEFAULT FALSE,
    "deleted_at" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tags Table
CREATE TABLE "tags" (
    "id" TEXT PRIMARY KEY,
    "user_id" TEXT NOT NULL,          -- References user.id (no FK constraint)
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("user_id", "name")
);

-- Task-Tags Junction Table
CREATE TABLE "task_tags" (
    "task_id" TEXT REFERENCES "tasks"("id") ON DELETE CASCADE,
    "tag_id" TEXT REFERENCES "tags"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("task_id", "tag_id")
);

-- Audit Logs Table
CREATE TABLE "audit_logs" (
    "id" TEXT PRIMARY KEY,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "action_type" ENUM('create', 'update', 'complete', 'uncomplete', 'delete'),
    "field_changed" TEXT,
    "old_value" TEXT,
    "new_value" TEXT,
    "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "is_system_action" BOOLEAN DEFAULT FALSE
);
```

---

## Authentication Flow

### Complete Flow Diagram

```
┌──────────────┐      ┌──────────────────┐      ┌──────────────────────────┐
│   Browser    │      │     Frontend     │      │        Database          │
│              │      │    (Next.js)     │      │      (PostgreSQL)        │
└──────┬───────┘      └────────┬─────────┘      └────────────┬─────────────┘
       │                       │                              │
       │  1. Login (email/pw)  │                              │
       │──────────────────────►│                              │
       │                       │  2. Validate credentials     │
       │                       │─────────────────────────────►│
       │                       │     (check account table)    │
       │                       │◄─────────────────────────────│
       │                       │  3. Create session           │
       │                       │─────────────────────────────►│
       │  4. Session cookie    │     (insert into session)    │
       │◄──────────────────────│                              │
       │                       │                              │
       │  5. Access /tasks     │                              │
       │──────────────────────►│                              │
       │                       │  6. Get JWT token            │
       │                       │    /api/auth/token           │
       │                       │     (verify session,         │
       │                       │      create JWT with         │
       │                       │      user_id from user)      │
       │                       │                              │
┌──────┴───────┐      ┌────────┴─────────┐      ┌────────────┴─────────────┐
│   Browser    │      │     Backend      │      │        Database          │
│              │      │    (FastAPI)     │      │      (PostgreSQL)        │
└──────┬───────┘      └────────┬─────────┘      └────────────┬─────────────┘
       │                       │                              │
       │  7. API Request       │                              │
       │  Authorization:       │                              │
       │  Bearer <JWT>         │                              │
       │──────────────────────►│                              │
       │                       │  8. Verify JWT               │
       │                       │     Extract user_id          │
       │                       │                              │
       │                       │  9. Query tasks WHERE        │
       │                       │     user_id = <from JWT>     │
       │                       │─────────────────────────────►│
       │                       │◄─────────────────────────────│
       │  10. Tasks response   │                              │
       │◄──────────────────────│                              │
```

### Step-by-Step Explanation

1. **User Login**: User enters email/password in the frontend login form
2. **Credential Validation**: Better Auth checks the `account` table for matching credentials
3. **Session Creation**: On success, a new session is created in the `session` table
4. **Cookie Set**: Browser receives a session cookie (httpOnly, secure)
5. **Protected Page Access**: User navigates to a protected page (e.g., /tasks)
6. **JWT Token Generation**: Frontend calls `/api/auth/token` which:
   - Validates the session cookie
   - Creates a JWT with `{ sub: user.id, email: user.email, name: user.name }`
   - Signs it with `BETTER_AUTH_SECRET`
7. **API Request**: Frontend's API client attaches `Authorization: Bearer <JWT>` header
8. **JWT Validation**: Backend verifies JWT signature and extracts `user_id` from `sub` claim
9. **Data Query**: Backend queries tasks with `WHERE user_id = <extracted_user_id>`
10. **Response**: User receives only their own data

### JWT Token Structure

```json
{
  "sub": "abc123-user-id",     // User ID (used by backend)
  "email": "user@example.com",
  "name": "John Doe",
  "iat": 1705312800,           // Issued at
  "exp": 1705316400            // Expires (1 hour)
}
```

---

## Auto Table Creation

### Yes, tables are created automatically!

| Component | Auto-Creates? | Method | When |
|-----------|---------------|--------|------|
| **Frontend** | ✅ YES | `scripts/apply-schema.mjs` | On `npm run dev` |
| **Backend** | ✅ YES | Alembic migrations | On container start |

### Startup Order

```bash
# 1. Start PostgreSQL (empty database)
docker-compose up postgres

# 2. Frontend starts
npm run dev
  └─► Runs: node scripts/apply-schema.mjs
      └─► Reads: frontend/db/schema.sql
      └─► Creates: user, session, account, verification tables

# 3. Backend starts
docker-compose up backend
  └─► Runs: alembic upgrade head
      └─► Reads: backend/alembic/versions/*.py
      └─► Creates: tasks, tags, task_tags, audit_logs tables
```

### Package.json Script

```json
{
  "scripts": {
    "dev": "node scripts/apply-schema.mjs && next dev"
  }
}
```

---

## API Communication

### Frontend API Client

The frontend uses a custom API client (`src/lib/api-client.ts`) that:

1. **Fetches JWT token** from `/api/auth/token` (validates session)
2. **Caches token** for 55 minutes (token valid for 1 hour)
3. **Attaches token** to all backend requests as `Authorization: Bearer <token>`
4. **Clears token** on logout

```typescript
// Simplified flow
async function request<T>(endpoint: string): Promise<T> {
  const token = await getAuthToken();  // Gets/caches JWT

  const response = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,  // Attached to every request
      "Content-Type": "application/json",
    },
  });

  return response.json();
}
```

### Backend JWT Validation

The backend validates every request (`backend/app/middleware/auth.py`):

```python
# Simplified flow
async def get_current_user(authorization: str) -> TokenPayload:
    token = extract_bearer_token(authorization)
    payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=["HS256"])
    return TokenPayload(sub=payload["sub"], email=payload["email"])

# Usage in endpoints
@router.get("/tasks")
async def list_tasks(
    user_id: str = Depends(get_current_user_id),  # Extracted from JWT
    session: Session = Depends(get_session),
):
    return task_service.list_tasks(user_id=user_id)  # Only user's tasks
```

---

## Key Design Decisions

### 1. Why No Foreign Key Between Frontend & Backend Tables?

The backend's `tasks.user_id` does NOT have a foreign key constraint to `user.id`:

| Reason | Explanation |
|--------|-------------|
| **Separation of concerns** | Better Auth manages users, Backend manages tasks |
| **JWT is the contract** | If JWT is valid, user exists (guaranteed by frontend) |
| **Flexibility** | Backend doesn't need to query user table |
| **Performance** | No join needed to validate user ownership |

### 2. Why Same Database for Both?

| Benefit | Description |
|---------|-------------|
| **Simplicity** | Single database to manage |
| **Consistency** | User IDs are consistent across all tables |
| **Deployment** | Easier to deploy and backup |

### 3. Why JWT Instead of Session Cookies for Backend?

| Benefit | Description |
|---------|-------------|
| **Stateless** | Backend doesn't need to query session table |
| **Scalable** | Multiple backend instances without session sharing |
| **Decoupled** | Backend is independent of Better Auth internals |

---

## Environment Variables

### Frontend (.env.local)

```bash
# Database (same as backend)
DATABASE_URL=postgresql://user:password@localhost:5432/fastnexttodo

# Better Auth
BETTER_AUTH_SECRET=your-32-character-secret-key
BETTER_AUTH_URL=http://localhost:3000

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Backend (.env)

```bash
# Database (same as frontend)
DATABASE_URL=postgresql://user:password@localhost:5432/fastnexttodo

# Auth (must match frontend)
BETTER_AUTH_SECRET=your-32-character-secret-key

# App
FRONTEND_URL=http://localhost:3000
DEBUG=true
```

---

## Quick Reference

| Question | Answer |
|----------|--------|
| Does backend validate users? | ✅ YES - validates JWT token signature and expiry |
| How does backend get user_id? | From JWT token's `sub` claim |
| Auto-create tables on start? | ✅ YES - Frontend: apply-schema.mjs, Backend: Alembic |
| Same database? | ✅ YES - Both use same PostgreSQL |
| Foreign key between tables? | ❌ NO - user_id is just a reference, validated via JWT |
| Where is password stored? | In `account.password` (hashed by Better Auth) |
| Where are sessions stored? | In `session` table (managed by Better Auth) |
| How long is JWT valid? | 1 hour (configurable in `/api/auth/token`) |
