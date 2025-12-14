# Research: Intelligent Multi-User Task Management

**Feature Branch**: `001-task-management`
**Date**: 2025-12-14
**Status**: Complete

---

## Research Topics

This document captures technology decisions, alternatives considered, and rationale for the task management application architecture.

---

## 1. Authentication Strategy

### Decision: Better Auth (Frontend) + JWT Verification (Backend)

**Research Summary**:
Better Auth is a TypeScript-first authentication framework designed for Next.js applications. It provides JWT-based sessions with configurable token expiry and supports multiple authentication providers.

**Key Findings**:
- Better Auth JWT Plugin generates standard JWTs with configurable claims
- JWTs are signed using HS256 algorithm with configurable secret
- Token structure includes `sub` (user ID), `iat`, `exp`, and custom claims
- Tokens can be verified independently by the backend using the shared secret

**Implementation Pattern**:
```python
# FastAPI JWT verification using python-jose
from jose import jwt, JWTError

def verify_token(token: str, secret: str) -> dict:
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Alternatives Considered**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Better Auth + JWT | Native Next.js integration, stateless verification | Requires shared secret management | **Chosen** |
| NextAuth.js | Mature ecosystem, many providers | Heavier, more complex configuration | Rejected |
| Auth0 | Enterprise features, managed | External dependency, cost at scale | Rejected |
| Custom JWT | Full control | Security risk, maintenance burden | Rejected |

**Rationale**: Better Auth provides excellent Next.js integration while maintaining stateless JWT verification capability. The shared secret approach aligns with the Constitution's serverless requirements.

---

## 2. FastAPI JWT Verification

### Decision: python-jose with middleware pattern

**Research Summary**:
python-jose is a lightweight JWT library that supports HS256 verification without heavy dependencies. It's ideal for serverless environments due to minimal cold start impact.

**Key Findings**:
- `python-jose[cryptography]` provides full JWT support
- Middleware pattern allows centralized auth enforcement
- Dependency injection provides clean user context propagation

**Implementation Pattern**:
```python
# Dependency for protected routes
async def get_current_user(
    authorization: str = Header(...),
    db: Session = Depends(get_db)
) -> User:
    token = authorization.replace("Bearer ", "")
    payload = verify_token(token, settings.BETTER_AUTH_SECRET)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401)
    return user_id
```

**Alternatives Considered**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| python-jose | Lightweight, fast startup | Manual implementation | **Chosen** |
| PyJWT | Popular, well-maintained | Slightly heavier | Acceptable alternative |
| fastapi-jwt-auth | Integrated with FastAPI | Additional dependency | Rejected |
| authlib | Full OAuth support | Overkill for JWT verification | Rejected |

**Rationale**: python-jose provides the minimal footprint needed for serverless while offering robust JWT verification.

---

## 3. SQLModel Soft Delete Pattern

### Decision: is_deleted flag with query-level filtering

**Research Summary**:
SQLModel (built on SQLAlchemy) supports soft delete patterns through column flags and query filters. The pattern allows "deleted" records to remain in the database while being excluded from standard queries.

**Key Findings**:
- Add `is_deleted: bool = False`, `deleted_at: datetime | None`, `deleted_by: str | None` columns
- Override `delete()` operation to set flags instead of removing records
- Use query filter to exclude deleted records by default
- Create separate methods for including deleted records when needed

**Implementation Pattern**:
```python
class Task(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    user_id: str = Field(index=True)
    title: str = Field(max_length=200)
    is_deleted: bool = Field(default=False, index=True)
    deleted_at: datetime | None = Field(default=None)
    deleted_by: str | None = Field(default=None)

# Repository pattern
def get_tasks(self, user_id: str, include_deleted: bool = False):
    query = select(Task).where(Task.user_id == user_id)
    if not include_deleted:
        query = query.where(Task.is_deleted == False)
    return self.session.exec(query).all()
```

**Alternatives Considered**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Soft delete flag | Simple, reversible, auditable | Storage growth | **Chosen** |
| Hard delete | Clean data, less storage | Irreversible, breaks audit trail | Rejected |
| Archive table | Separated concerns | Complex queries, migration overhead | Rejected |
| Event sourcing | Full history | High complexity, overkill | Rejected |

**Rationale**: Soft delete provides the best balance of simplicity, auditability, and recoverability without architectural complexity.

---

## 4. Audit Log Schema Design

### Decision: Event-based append-only log with per-field tracking

**Research Summary**:
Event-based audit logging captures individual changes as immutable events. This enables precise change tracking, compliance reporting, and debugging.

**Key Findings**:
- Append-only design ensures immutability
- Per-field tracking enables detailed diff views
- Indexed entity_type and entity_id for efficient queries
- System-generated events (recurring tasks) are marked distinctly

**Implementation Pattern**:
```python
class AuditLog(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid4()), primary_key=True)
    entity_type: str = Field(index=True)  # "task", "tag"
    entity_id: str = Field(index=True)
    user_id: str = Field(index=True)
    action_type: str  # "create", "update", "complete", "delete", "recurring_auto_create"
    field_changed: str | None = None  # For updates: "title", "priority", etc.
    old_value: str | None = None
    new_value: str | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_system_action: bool = Field(default=False)  # True for auto-generated events

# Composite index for efficient queries
__table_args__ = (
    Index("ix_audit_entity", "entity_type", "entity_id"),
)
```

**Logging Rules**:
1. **CREATE**: One entry with action_type="create", no field changes
2. **UPDATE**: One entry per changed field with old/new values
3. **COMPLETE**: One entry with field_changed="is_completed"
4. **DELETE**: One entry with action_type="delete" (soft delete)
5. **RECURRING_AUTO_CREATE**: One entry with is_system_action=True

**Alternatives Considered**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Event-based log | Precise tracking, immutable | More storage, query complexity | **Chosen** |
| Snapshot-based | Simple, full state capture | Larger storage, harder to diff | Rejected |
| Database triggers | Automatic, reliable | DB coupling, less control | Rejected |
| Change data capture | Real-time streaming | Infrastructure overhead | Rejected |

**Rationale**: Event-based logging provides the granularity needed for compliance and debugging while maintaining a clean, queryable structure.

---

## 5. Neon Connection Pooling for Serverless

### Decision: Neon serverless driver with connection pooling

**Research Summary**:
Neon is a serverless PostgreSQL service designed for serverless applications. It provides automatic connection pooling and scale-to-zero capabilities.

**Key Findings**:
- Neon provides pooled connection strings (`-pooler` suffix)
- SQLAlchemy/SQLModel works with pooled connections using `NullPool`
- Connection string format: `postgresql://user:pass@host-pooler.neon.tech/db?sslmode=require`
- Configure `pool_pre_ping=True` for connection health checks

**Implementation Pattern**:
```python
from sqlalchemy import create_engine
from sqlalchemy.pool import NullPool
from sqlmodel import Session

# Use NullPool for serverless (connections managed by Neon pooler)
engine = create_engine(
    settings.DATABASE_URL,
    poolclass=NullPool,
    pool_pre_ping=True,
    echo=settings.DEBUG
)

def get_session():
    with Session(engine) as session:
        yield session
```

**Connection String Configuration**:
```
# .env
DATABASE_URL=postgresql://user:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

**Alternatives Considered**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Neon pooled | Managed, serverless-native | Neon lock-in | **Chosen** |
| PgBouncer | Proven, flexible | Self-managed infrastructure | Rejected |
| SQLAlchemy pool | Built-in | Not serverless-compatible | Rejected |
| Supabase | Good DX | Different product focus | Rejected |

**Rationale**: Neon's managed pooling eliminates connection management overhead while providing seamless serverless integration.

---

## 6. Data Model Choices

### Decision: Normalized schema with many-to-many tags

**Research Summary**:
Task management requires flexible tagging without predefined categories. A normalized many-to-many relationship between tasks and tags provides maximum flexibility.

**Key Findings**:
- Separate `Tag` table allows tag reuse and management
- `TaskTag` junction table enables many-to-many relationship
- User-scoped tags prevent cross-user tag pollution
- Cascading deletes handled at application level (soft delete)

**Entity Relationships**:
```
User (1) ──< (N) Task
User (1) ──< (N) Tag
Task (N) ──<< (M) Tag (via TaskTag)
Task (1) ──< (N) AuditLog
```

**Alternatives Considered**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Normalized (junction) | Flexible, queryable, reusable tags | Join complexity | **Chosen** |
| JSON array in task | Simple, no joins | Hard to query, no tag management | Rejected |
| Denormalized tags | Fast reads | Data duplication, update anomalies | Rejected |

**Rationale**: Normalized schema provides proper data integrity, efficient querying, and enables tag management features.

---

## 7. Server-Side Filtering and Sorting

### Decision: All filtering and sorting performed on backend

**Research Summary**:
For security and consistency, filtering and sorting are handled server-side. Query parameters are validated and applied in the repository layer.

**Key Findings**:
- Prevents client-side data manipulation
- Enables pagination with consistent ordering
- Reduces data transfer (return only matching records)
- Allows complex filtering with proper indexing

**Implementation Pattern**:
```python
@router.get("/tasks")
async def list_tasks(
    status: TaskStatus | None = None,
    priority: Priority | None = None,
    tag: str | None = None,
    search: str | None = None,
    due_from: datetime | None = None,
    due_to: datetime | None = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    page: int = 1,
    page_size: int = 25,
    current_user: str = Depends(get_current_user)
):
    return task_service.list_tasks(
        user_id=current_user,
        filters=TaskFilters(status=status, priority=priority, ...),
        pagination=Pagination(page=page, page_size=page_size),
        sorting=Sorting(field=sort_by, order=sort_order)
    )
```

**Alternatives Considered**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Server-side | Secure, consistent, scalable | Server load | **Chosen** |
| Client-side | Fast for small datasets | Security risk, data transfer | Rejected |
| Hybrid | Flexibility | Complexity, inconsistency risk | Rejected |

**Rationale**: Server-side processing ensures security, supports pagination correctly, and scales better for larger datasets.

---

## 8. Recurring Task Execution Model

### Decision: Create next instance on completion

**Research Summary**:
Recurring tasks need predictable behavior when completed. Creating the next instance immediately on completion provides transparency and simplicity.

**Key Findings**:
- User completes current instance → system creates next instance
- New instance has updated due date based on recurrence rule
- Original instance marked complete, new instance is pending
- Both events logged in audit trail

**Implementation Pattern**:
```python
def complete_task(self, task_id: str, user_id: str) -> Task:
    task = self.get_task(task_id, user_id)
    task.is_completed = True
    task.completed_at = datetime.utcnow()

    # Create next instance if recurring
    if task.recurrence != Recurrence.NONE:
        next_due = calculate_next_due(task.due_date, task.recurrence)
        new_task = Task(
            user_id=user_id,
            title=task.title,
            description=task.description,
            priority=task.priority,
            due_date=next_due,
            recurrence=task.recurrence,
            tags=task.tags  # Copy tag associations
        )
        self.session.add(new_task)
        self.audit_service.log(
            entity_type="task",
            entity_id=new_task.id,
            user_id=user_id,
            action_type="recurring_auto_create",
            is_system_action=True
        )

    self.session.commit()
    return task
```

**Recurrence Calculation**:
- **Daily**: Add 1 day to current due date
- **Weekly**: Add 7 days to current due date
- **Monthly**: Add 1 month (handle month-end edge cases)

**Edge Case Handling**:
- If next due date would be in the past, calculate from current date instead
- Monthly recurrence on 31st → next valid day in shorter months

**Alternatives Considered**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Create on completion | Simple, transparent | No advance scheduling | **Chosen** |
| Scheduled job | Can create ahead of time | Infrastructure complexity | Rejected |
| Series model | Full series visibility | Much more complex | Rejected |

**Rationale**: Creating on completion is simple, transparent, and meets requirements without additional infrastructure.

---

## 9. Notification Responsibility

### Decision: Frontend handles browser notifications

**Research Summary**:
Browser notifications are handled entirely by the frontend using the Web Notifications API. The backend provides due date data; no server-side notification infrastructure is needed.

**Key Findings**:
- Web Notifications API is well-supported in modern browsers
- Service Workers can show notifications even when tab is not focused
- Frontend schedules notification based on due_date minus reminder offset
- No push notification server required

**Implementation Pattern**:
```typescript
// Frontend notification scheduling
async function scheduleNotification(task: Task) {
  if (!task.dueDate || Notification.permission !== "granted") return;

  const reminderTime = new Date(task.dueDate);
  reminderTime.setMinutes(reminderTime.getMinutes() - 15); // 15 min before

  const delay = reminderTime.getTime() - Date.now();
  if (delay > 0) {
    setTimeout(() => {
      new Notification(`Task Due: ${task.title}`, {
        body: `Due at ${formatTime(task.dueDate)}`,
        tag: task.id, // Prevent duplicate notifications
      });
    }, delay);
  }
}
```

**Alternatives Considered**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Frontend (Web API) | Simple, no infrastructure | Requires browser open | **Chosen** |
| Push notifications | Works offline | Server infrastructure, complexity | Rejected |
| Email notifications | Reliable delivery | Out of scope, server cost | Rejected |

**Rationale**: Browser notifications meet requirements without additional infrastructure. Users expect the app to be open for reminders.

---

## 10. Database Schema and Indexing Strategy

### Decision: Strategic indexes for common query patterns

**Research Summary**:
Indexes are designed around the most common query patterns: user-scoped task lists, filtering by status/priority/tags, and sorting by date fields.

**Key Indexes**:
```sql
-- Task table indexes
CREATE INDEX ix_task_user_id ON task(user_id);
CREATE INDEX ix_task_user_deleted ON task(user_id, is_deleted);
CREATE INDEX ix_task_user_status ON task(user_id, is_completed, is_deleted);
CREATE INDEX ix_task_due_date ON task(user_id, due_date) WHERE is_deleted = false;
CREATE INDEX ix_task_priority ON task(user_id, priority) WHERE is_deleted = false;

-- Tag table indexes
CREATE INDEX ix_tag_user_id ON tag(user_id);
CREATE UNIQUE INDEX ix_tag_user_name ON tag(user_id, name);

-- TaskTag junction indexes
CREATE INDEX ix_tasktag_task ON tasktag(task_id);
CREATE INDEX ix_tasktag_tag ON tasktag(tag_id);

-- AuditLog indexes
CREATE INDEX ix_audit_entity ON auditlog(entity_type, entity_id);
CREATE INDEX ix_audit_user ON auditlog(user_id);
CREATE INDEX ix_audit_timestamp ON auditlog(timestamp DESC);
```

**Rationale**: Composite indexes on user_id with common filter fields enable efficient query execution for the most frequent access patterns.

---

## 11. Deployment Strategy

### Decision: Vercel for Frontend + Backend (Serverless Functions)

**Research Summary**:
Vercel provides a seamless deployment platform for Next.js applications with built-in support for serverless functions. The FastAPI backend can be deployed as Vercel Serverless Functions using the Python runtime.

**Key Findings**:
- Vercel natively supports Next.js with zero configuration
- Python serverless functions supported via `vercel.json` configuration
- Automatic HTTPS, CDN, and edge caching included
- Preview deployments for every PR
- Environment variables managed via Vercel dashboard
- Neon PostgreSQL integrates directly with Vercel

**Deployment Architecture**:
```
┌─────────────────────────────────────────────────────────────┐
│                         VERCEL                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐    ┌─────────────────────────────┐ │
│  │   Next.js Frontend  │    │  FastAPI Backend            │ │
│  │   (Edge/Serverless) │    │  (Python Serverless Fns)    │ │
│  │                     │    │                             │ │
│  │  - Static assets    │    │  - /api/v1/* routes         │ │
│  │  - SSR pages        │───>│  - JWT verification         │ │
│  │  - Better Auth      │    │  - Business logic           │ │
│  └─────────────────────┘    └──────────────┬──────────────┘ │
│                                            │                │
└────────────────────────────────────────────┼────────────────┘
                                             │
                                             v
                              ┌──────────────────────────────┐
                              │   Neon PostgreSQL            │
                              │   (Serverless Database)      │
                              └──────────────────────────────┘
```

**Vercel Configuration (vercel.json)**:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/next"
    },
    {
      "src": "backend/app/main.py",
      "use": "@vercel/python",
      "config": {
        "maxLambdaSize": "15mb"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/v1/(.*)",
      "dest": "backend/app/main.py"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/$1"
    }
  ],
  "env": {
    "DATABASE_URL": "@database-url",
    "BETTER_AUTH_SECRET": "@better-auth-secret"
  }
}
```

**Monorepo Structure for Vercel**:
```
fast-next-todo/
├── frontend/              # Next.js app
│   ├── package.json
│   └── next.config.js
├── backend/               # FastAPI app
│   ├── app/
│   │   └── main.py        # Entry point for Vercel
│   ├── requirements.txt   # Python dependencies
│   └── pyproject.toml
├── vercel.json            # Vercel configuration
└── .vercelignore
```

**Backend Adaptation for Vercel**:
```python
# backend/app/main.py
from fastapi import FastAPI
from mangum import Mangum  # ASGI adapter for serverless

app = FastAPI(
    title="Fast Next Todo API",
    root_path="/api/v1"  # Important for Vercel routing
)

# ... routes ...

# Vercel serverless handler
handler = Mangum(app, lifespan="off")
```

**Environment Variables Setup**:
```bash
# Set via Vercel CLI or Dashboard
vercel env add DATABASE_URL production
vercel env add BETTER_AUTH_SECRET production
vercel env add FRONTEND_URL production
```

**Alternatives Considered**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Vercel (unified) | Native Next.js, simple, preview deploys | Python cold starts | **Chosen** |
| Vercel + Railway | Dedicated Python hosting | Two platforms, complexity | Alternative |
| Vercel + Fly.io | Low-latency backend | Two platforms, more config | Alternative |
| AWS (Amplify + Lambda) | Full AWS ecosystem | More complex, AWS lock-in | Rejected |
| Render | Simple, good Python support | Slower deploys, less Next.js optimization | Rejected |

**Cold Start Mitigation**:
- Keep Python dependencies minimal (no pandas, numpy)
- Use Neon's connection pooling (no connection setup time)
- Enable Vercel's "Always On" for production (paid feature)
- Optimize imports (lazy loading where possible)

**CI/CD Pipeline**:
```yaml
# Vercel handles CI/CD automatically via GitHub integration
# For custom checks, use vercel.json ignoreCommand:
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "001-task-management": true
    }
  },
  "ignoreCommand": "git diff --quiet HEAD^ HEAD -- ."
}
```

**Domain Configuration**:
- Production: `fastnexttodo.com` → Vercel
- API: `fastnexttodo.com/api/v1/*` → Python functions
- Preview: `*.vercel.app` (automatic)

**Rationale**: Vercel provides the best developer experience for Next.js with minimal configuration. Python serverless functions allow keeping the entire stack on one platform. Neon's Vercel integration simplifies database provisioning.

---

## 12. Vercel-Neon Integration

### Decision: Use Vercel's native Neon integration

**Research Summary**:
Vercel offers a native integration with Neon that automatically provisions databases and manages connection strings.

**Key Findings**:
- One-click integration from Vercel dashboard
- Automatic `DATABASE_URL` injection into environment
- Branch databases for preview deployments
- Connection pooling enabled by default

**Setup Steps**:
1. Go to Vercel Dashboard → Integrations → Neon
2. Authorize Neon access
3. Create or link existing Neon project
4. Environment variables auto-populated

**Preview Deployments with Branch Databases**:
```
main branch        → Production database
PR #123            → Preview database (auto-created)
feature-branch     → Preview database (auto-created)
```

**Connection String Format**:
```
# Automatically set by Vercel-Neon integration
DATABASE_URL=postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require

# For preview deployments (branch database)
DATABASE_URL=postgresql://user:pass@ep-xxx-br-yyy-pooler.region.aws.neon.tech/neondb?sslmode=require
```

**Rationale**: Native integration reduces configuration, enables isolated preview databases, and simplifies secrets management.

---

## 13. Local Testing with Docker

### Decision: Docker Compose for local production-like testing

**Research Summary**:
Before deploying to Vercel, the application should be tested locally in Docker containers that mimic the production environment. This catches environment-specific issues before they reach production.

**Key Findings**:
- Docker Compose orchestrates frontend, backend, and database containers
- Local PostgreSQL container mirrors Neon behavior
- Environment variables match production configuration
- Enables testing of the full stack in isolation

**Docker Architecture**:
```
┌─────────────────────────────────────────────────────────────┐
│                    DOCKER COMPOSE                           │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────┐  │
│  │    frontend     │  │     backend     │  │  postgres   │  │
│  │   (Next.js)     │  │   (FastAPI)     │  │   (DB)      │  │
│  │   Port: 3000    │──│   Port: 8000    │──│  Port: 5432 │  │
│  └─────────────────┘  └─────────────────┘  └─────────────┘  │
│           │                    │                  │         │
│           └────────────────────┴──────────────────┘         │
│                         Network: app-network                │
└─────────────────────────────────────────────────────────────┘
```

**Docker Compose Configuration**:
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: fastnexttodo
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/fastnexttodo
      BETTER_AUTH_SECRET: local-dev-secret-min-32-characters
      FRONTEND_URL: http://localhost:3000
      DEBUG: "true"
    ports:
      - "8000:8000"
    depends_on:
      postgres:
        condition: service_healthy
    volumes:
      - ./backend:/app
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000/api/v1
      BETTER_AUTH_SECRET: local-dev-secret-min-32-characters
      BETTER_AUTH_URL: http://localhost:3000
    ports:
      - "3000:3000"
    depends_on:
      - backend
    volumes:
      - ./frontend:/app
      - /app/node_modules
    command: npm run dev

volumes:
  postgres_data:
```

**Backend Dockerfile**:
```dockerfile
# backend/Dockerfile
FROM python:3.13-slim

WORKDIR /app

# Install uv for fast dependency management
RUN pip install uv

# Copy dependency files
COPY pyproject.toml ./
COPY requirements.txt ./

# Install dependencies
RUN uv pip install --system -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Default command (overridden by docker-compose)
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile**:
```dockerfile
# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Default command (overridden by docker-compose)
CMD ["npm", "run", "dev"]
```

**Testing Workflow**:
```bash
# 1. Start all services
docker-compose up -d

# 2. Run database migrations
docker-compose exec backend alembic upgrade head

# 3. Run backend tests
docker-compose exec backend pytest

# 4. Run frontend tests
docker-compose exec frontend npm test

# 5. Manual testing at http://localhost:3000

# 6. View logs
docker-compose logs -f

# 7. Stop all services
docker-compose down
```

**Production-Like Testing**:
```yaml
# docker-compose.prod.yml (for production simulation)
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      DEBUG: "false"
    # No volume mounts - uses built image

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    # No volume mounts - uses built image
```

**Alternatives Considered**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Docker Compose | Full stack testing, production-like | Requires Docker | **Chosen** |
| Local services only | Simple, no Docker needed | Environment differences | Rejected |
| Kubernetes (minikube) | Production-identical | Overkill for local dev | Rejected |
| Podman | Rootless, Docker-compatible | Less common | Alternative |

**Pre-Deployment Checklist**:
1. All containers start without errors
2. Database migrations run successfully
3. Backend tests pass in container
4. Frontend tests pass in container
5. API endpoints respond correctly
6. Authentication flow works end-to-end
7. No console errors in frontend

**Rationale**: Docker Compose provides a consistent, reproducible environment that catches deployment issues early. Testing in containers before Vercel deployment reduces production failures.

---

## 14. UI/UX Design System

### Decision: shadcn/ui + Tailwind CSS with custom design tokens

**Research Summary**:
The UI uses shadcn/ui components built on Radix primitives with Tailwind CSS for styling. This provides accessible, customizable components with a clean white-based design supporting dark and light modes.

**Key Findings**:
- shadcn/ui provides copy-paste components with full control
- Tailwind CSS handles all animations (no external library needed)
- CSS variables enable seamless dark/light mode switching
- Mobile-first responsive design built into Tailwind

**Design Tokens**:
```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light Mode (White Base) */
    --background: 0 0% 100%;           /* Pure white */
    --foreground: 222 47% 11%;         /* Near black text */

    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;

    --popover: 0 0% 100%;
    --popover-foreground: 222 47% 11%;

    --primary: 221 83% 53%;            /* Blue #3B82F6 */
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96%;          /* Light gray */
    --secondary-foreground: 222 47% 11%;

    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;

    --accent: 210 40% 96%;
    --accent-foreground: 222 47% 11%;

    --destructive: 0 84% 60%;          /* Red */
    --destructive-foreground: 210 40% 98%;

    --success: 142 76% 36%;            /* Green */
    --warning: 38 92% 50%;             /* Amber */

    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 221 83% 53%;

    --radius: 0.5rem;

    /* Priority Colors */
    --priority-high: 0 84% 60%;        /* Red */
    --priority-medium: 38 92% 50%;     /* Amber */
    --priority-low: 142 76% 36%;       /* Green */
  }

  .dark {
    /* Dark Mode */
    --background: 224 71% 4%;          /* Near black */
    --foreground: 213 31% 91%;         /* Light text */

    --card: 224 71% 4%;
    --card-foreground: 213 31% 91%;

    --popover: 224 71% 4%;
    --popover-foreground: 213 31% 91%;

    --primary: 217 91% 60%;            /* Lighter blue */
    --primary-foreground: 222 47% 11%;

    --secondary: 222 47% 11%;
    --secondary-foreground: 213 31% 91%;

    --muted: 223 47% 11%;
    --muted-foreground: 215 16% 57%;

    --accent: 216 34% 17%;
    --accent-foreground: 213 31% 91%;

    --destructive: 0 63% 31%;
    --destructive-foreground: 210 40% 98%;

    --success: 142 76% 36%;
    --warning: 38 92% 50%;

    --border: 216 34% 17%;
    --input: 216 34% 17%;
    --ring: 224 64% 33%;
  }
}
```

**Animation System (Tailwind CSS)**:
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      animation: {
        // Entrance animations
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',

        // Interactive animations
        'bounce-subtle': 'bounceSubtle 0.3s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'pulse-subtle': 'pulseSubtle 2s infinite',

        // Loading states
        'spin-slow': 'spin 1.5s linear infinite',
        'skeleton': 'skeleton 1.5s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-3px)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        skeleton: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      transitionTimingFunction: {
        'bounce-in': 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    },
  },
}
```

**Component Animation Patterns**:
```tsx
// Task card with animations
<div className="
  group
  bg-card rounded-lg border p-4
  transition-all duration-200 ease-out
  hover:shadow-md hover:border-primary/20
  hover:-translate-y-0.5
  animate-fade-in
">
  {/* Checkbox with scale animation */}
  <button className="
    w-5 h-5 rounded border-2
    transition-all duration-150
    hover:scale-110 hover:border-primary
    active:scale-95
    data-[checked=true]:bg-primary data-[checked=true]:border-primary
  "/>

  {/* Priority indicator with pulse */}
  <span className="
    w-2 h-2 rounded-full bg-[hsl(var(--priority-high))]
    animate-pulse-subtle
  "/>
</div>

// Button with micro-interactions
<button className="
  px-4 py-2 rounded-md bg-primary text-primary-foreground
  transition-all duration-150
  hover:bg-primary/90 hover:shadow-md
  active:scale-[0.98]
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Add Task
</button>

// Loading skeleton
<div className="
  h-4 rounded bg-muted
  animate-skeleton
  bg-gradient-to-r from-muted via-muted/50 to-muted
  bg-[length:200%_100%]
"/>
```

**Dark Mode Implementation**:
```tsx
// ThemeProvider component
'use client';
import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>('system');

  useEffect(() => {
    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (theme === 'dark' || (theme === 'system' && systemTheme)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Theme toggle button
<button
  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
  className="
    p-2 rounded-md
    transition-all duration-200
    hover:bg-accent
    active:scale-95
  "
>
  {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
</button>
```

**Mobile Responsive Patterns**:
```tsx
// Responsive task list layout
<div className="
  grid gap-4
  grid-cols-1                    /* Mobile: single column */
  md:grid-cols-2                 /* Tablet: two columns */
  lg:grid-cols-1                 /* Desktop: back to single (list view) */
">

// Responsive sidebar
<aside className="
  fixed inset-y-0 left-0 z-40
  w-64 bg-background border-r
  transform transition-transform duration-300
  -translate-x-full              /* Hidden on mobile */
  md:translate-x-0               /* Visible on tablet+ */
  md:static
">

// Mobile bottom navigation
<nav className="
  fixed bottom-0 inset-x-0
  bg-background border-t
  flex justify-around py-2
  md:hidden                      /* Hidden on tablet+ */
">
```

**Alternatives Considered**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| shadcn/ui + Tailwind | Full control, accessible, lightweight | Manual setup | **Chosen** |
| Chakra UI | Quick development | Larger bundle, less control | Rejected |
| Material UI | Comprehensive | Heavy, opinionated design | Rejected |
| Framer Motion | Powerful animations | Larger bundle, complexity | Rejected |

**Rationale**: shadcn/ui with Tailwind CSS provides the best balance of customization, accessibility, and performance. CSS-based animations keep the bundle small while enabling smooth, attractive interactions.

---

## 15. Rate Limiting

### Decision: Sliding window rate limiting with Redis (optional) or in-memory

**Research Summary**:
Rate limiting prevents API abuse and ensures fair usage. Implementation uses sliding window algorithm with configurable limits per endpoint.

**Implementation Pattern**:
```python
# FastAPI rate limiting middleware
from fastapi import Request, HTTPException
from collections import defaultdict
import time

class RateLimiter:
    def __init__(self, requests_per_minute: int = 60):
        self.requests_per_minute = requests_per_minute
        self.requests = defaultdict(list)

    def is_allowed(self, user_id: str) -> bool:
        now = time.time()
        minute_ago = now - 60

        # Clean old requests
        self.requests[user_id] = [
            req_time for req_time in self.requests[user_id]
            if req_time > minute_ago
        ]

        # Check limit
        if len(self.requests[user_id]) >= self.requests_per_minute:
            return False

        self.requests[user_id].append(now)
        return True

# Dependency
rate_limiter = RateLimiter(requests_per_minute=100)

async def check_rate_limit(request: Request, current_user: str = Depends(get_current_user)):
    if not rate_limiter.is_allowed(current_user):
        raise HTTPException(
            status_code=429,
            detail="Too many requests. Please wait before trying again.",
            headers={"Retry-After": "60"}
        )
    return current_user
```

**Rate Limits**:
| Endpoint Category | Limit | Window |
|-------------------|-------|--------|
| Read operations (GET) | 100/min | Per user |
| Write operations (POST/PATCH) | 30/min | Per user |
| Delete operations | 20/min | Per user |
| Auth endpoints | 10/min | Per IP |

**Rationale**: In-memory rate limiting is sufficient for initial deployment. Can upgrade to Redis for distributed rate limiting when scaling.

---

## 16. Data Export

### Decision: CSV and JSON export with streaming for large datasets

**Research Summary**:
Users can export their tasks for backup or migration. Export supports filtering and includes all task data with tags.

**Implementation Pattern**:
```python
# Export endpoint
from fastapi.responses import StreamingResponse
import csv
import json
from io import StringIO

@router.get("/tasks/export")
async def export_tasks(
    format: str = Query("csv", enum=["csv", "json"]),
    current_user: str = Depends(get_current_user),
    task_service: TaskService = Depends()
):
    tasks = await task_service.get_all_tasks(user_id=current_user)

    if format == "csv":
        return StreamingResponse(
            generate_csv(tasks),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=tasks.csv"}
        )
    else:
        return StreamingResponse(
            generate_json(tasks),
            media_type="application/json",
            headers={"Content-Disposition": "attachment; filename=tasks.json"}
        )

def generate_csv(tasks):
    output = StringIO()
    writer = csv.DictWriter(output, fieldnames=[
        'id', 'title', 'description', 'priority',
        'due_date', 'is_completed', 'tags', 'created_at'
    ])
    writer.writeheader()

    for task in tasks:
        writer.writerow({
            'id': task.id,
            'title': task.title,
            'description': task.description or '',
            'priority': task.priority,
            'due_date': task.due_date.isoformat() if task.due_date else '',
            'is_completed': task.is_completed,
            'tags': ','.join(t.name for t in task.tags),
            'created_at': task.created_at.isoformat()
        })
        yield output.getvalue()
        output.seek(0)
        output.truncate(0)
```

**Export Format**:
```csv
id,title,description,priority,due_date,is_completed,tags,created_at
abc-123,Review PR,Check the new feature,high,2025-12-15T15:00:00,false,"work,urgent",2025-12-14T10:00:00
```

**Rationale**: Streaming export handles large datasets without memory issues. CSV provides spreadsheet compatibility, JSON enables programmatic import.

---

## Summary of Decisions

| Decision Area | Choice | Key Rationale |
|--------------|--------|---------------|
| Authentication | Better Auth + JWT | Stateless, serverless-compatible |
| JWT Verification | python-jose | Lightweight, fast cold start |
| Delete Strategy | Soft delete | Auditability, recoverability |
| Audit Logging | Event-based | Precise tracking, immutable |
| Connection Pooling | Neon pooler | Managed, serverless-native |
| Data Model | Normalized with junction | Flexibility, data integrity |
| Filtering/Sorting | Server-side | Security, consistency |
| Recurring Tasks | Create on completion | Simple, transparent |
| Notifications | Frontend browser API | No infrastructure needed |
| Indexing | Composite user-scoped | Query performance |
| Deployment | Vercel (unified) | Native Next.js, simple CI/CD |
| Database Integration | Vercel-Neon native | Auto-provisioning, branch DBs |
| Local Testing | Docker Compose | Production-like, catches issues early |
| UI Components | shadcn/ui + Tailwind | Accessible, customizable, lightweight |
| Animations | Tailwind CSS | Native, no extra bundle |
| Theming | CSS variables | Dark/light mode, easy customization |
| Rate Limiting | Sliding window | API protection, fair usage |
| Data Export | CSV + JSON streaming | Backup, portability |
| Keyboard Shortcuts | Custom hook | Power user productivity, no extra deps |

---

## 17. Keyboard Shortcuts

### Decision: Global keyboard shortcuts with customizable bindings

**Research Summary**:
Keyboard shortcuts improve power user productivity by enabling quick task management without mouse interaction. Implementation uses native keyboard event handling with a global shortcut manager.

**Key Findings**:
- React hooks can capture keyboard events globally
- Shortcuts should be non-conflicting with browser defaults
- Modal/dialog context should suspend certain shortcuts
- Shortcuts should be discoverable via help dialog

**Implementation Pattern**:
```typescript
// useKeyboardShortcuts hook
import { useCallback, useEffect } from 'react';

interface ShortcutMap {
  [key: string]: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutMap, enabled = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Skip if user is typing in input/textarea
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    // Build key combo string
    const combo = [
      event.ctrlKey && 'ctrl',
      event.metaKey && 'meta',
      event.shiftKey && 'shift',
      event.altKey && 'alt',
      event.key.toLowerCase()
    ].filter(Boolean).join('+');

    const action = shortcuts[combo];
    if (action) {
      event.preventDefault();
      action();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Usage in TaskDashboard
const shortcuts = useMemo(() => ({
  'n': () => setShowNewTaskModal(true),          // New task
  'f': () => searchInputRef.current?.focus(),    // Focus search
  'escape': () => setSelectedTask(null),         // Deselect
  '?': () => setShowShortcutsHelp(true),         // Show help
  'ctrl+enter': () => completeSelectedTask(),    // Complete task
  'e': () => editSelectedTask(),                 // Edit task
  'delete': () => deleteSelectedTask(),          // Delete task
  'j': () => selectNextTask(),                   // Next task
  'k': () => selectPreviousTask(),               // Previous task
  '1': () => setPriority('high'),                // Set high priority
  '2': () => setPriority('medium'),              // Set medium priority
  '3': () => setPriority('low'),                 // Set low priority
  't': () => focusTagInput(),                    // Add tag
  'd': () => openDatePicker(),                   // Set due date
}), [/* dependencies */]);

useKeyboardShortcuts(shortcuts, !isModalOpen);
```

**Shortcut Reference**:
| Shortcut | Action | Context |
|----------|--------|---------|
| `N` | New task | Global |
| `F` or `/` | Focus search | Global |
| `?` | Show shortcuts help | Global |
| `Escape` | Close modal / Deselect | Global |
| `J` | Select next task | Task list |
| `K` | Select previous task | Task list |
| `Enter` | Open selected task | Task list |
| `E` | Edit selected task | Task selected |
| `Delete` | Delete selected task | Task selected |
| `Ctrl+Enter` | Complete/uncomplete task | Task selected |
| `1` / `2` / `3` | Set priority (high/medium/low) | Task selected |
| `T` | Add tag to task | Task selected |
| `D` | Set due date | Task selected |
| `Ctrl+S` | Save (in edit mode) | Edit modal |

**Help Dialog Component**:
```tsx
// KeyboardShortcutsHelp component
export function KeyboardShortcutsHelp({ open, onClose }: Props) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 text-sm">
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-muted-foreground">Navigation</div>
            <div></div>
            <ShortcutRow keys={['J']} description="Next task" />
            <ShortcutRow keys={['K']} description="Previous task" />
            <ShortcutRow keys={['/']} description="Search" />
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div className="font-medium text-muted-foreground">Actions</div>
            <div></div>
            <ShortcutRow keys={['N']} description="New task" />
            <ShortcutRow keys={['E']} description="Edit task" />
            <ShortcutRow keys={['Ctrl', 'Enter']} description="Complete" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ShortcutRow({ keys, description }: { keys: string[], description: string }) {
  return (
    <>
      <div className="flex gap-1">
        {keys.map((key, i) => (
          <kbd key={i} className="
            px-2 py-1 text-xs rounded border
            bg-muted font-mono
          ">
            {key}
          </kbd>
        ))}
      </div>
      <div>{description}</div>
    </>
  );
}
```

**Accessibility Considerations**:
- All shortcuts have mouse-based alternatives
- Screen readers announce shortcut availability
- Help dialog keyboard-accessible
- Shortcuts disabled during text input

**Alternatives Considered**:

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Custom hook | Lightweight, full control | Manual implementation | **Chosen** |
| react-hotkeys-hook | Feature-rich, tested | Additional dependency | Alternative |
| Mousetrap | Popular, browser support | jQuery-era, large | Rejected |

**Rationale**: Custom hook provides exact functionality needed without external dependencies. Keeps bundle small and allows full control over behavior.

---

## Open Questions Resolved

All "NEEDS CLARIFICATION" items from Technical Context have been resolved through this research phase. No outstanding unknowns remain for implementation.
