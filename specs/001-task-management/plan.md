# Implementation Plan: Intelligent Multi-User Task Management

**Branch**: `001-task-management` | **Date**: 2025-12-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-task-management/spec.md`

## Summary

Build a modern, production-ready, multi-user task management web application with intelligent scheduling features. The system uses a decoupled architecture: Next.js 16+ frontend with Better Auth for authentication, FastAPI backend with JWT verification middleware for business logic, and Neon Serverless PostgreSQL for persistent storage with full audit trail capabilities.

## Technical Context

**Language/Version**:
- Backend: Python 3.13+ (FastAPI)
- Frontend: TypeScript (Next.js 16+ App Router)

**Primary Dependencies**:
- Backend: FastAPI, SQLModel, Pydantic, python-jose (JWT), bcrypt
- Frontend: Next.js 16+, Better Auth, React Query, Tailwind CSS

**Storage**: Neon Serverless PostgreSQL (accessed via SQLModel/SQLAlchemy with connection pooling)

**Testing**:
- Backend: pytest (unit + integration)
- Frontend: Jest + React Testing Library
- E2E: Playwright

**Target Platform**: Web (modern browsers supporting Notifications API)

**Project Type**: Web application (frontend + backend)

**Performance Goals**:
- p95 latency <500ms for standard endpoints (per Constitution)
- Cold start <3 seconds (per Constitution)
- Task list loads <2 seconds for up to 500 tasks
- Support 100 concurrent users

**Constraints**:
- Serverless-compatible (stateless design)
- Connection pooling for Neon PostgreSQL
- JWT-based authentication (no server-side sessions)

**Scale/Scope**:
- Multi-user with strict data isolation
- Pagination: 25 tasks per page default
- Field limits: Title 200 chars, Description 2000 chars, 10 tags per task

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Zero-Trust API Boundary ✅
- **Compliance**: Backend validates all input via Pydantic/SQLModel schemas
- **Implementation**: FastAPI routes use Pydantic models for request/response validation
- **Error Messages**: Structured error responses without implementation details

### II. Absolute Data Isolation ✅
- **Compliance**: All queries include `WHERE user_id = {token_sub}`
- **Implementation**: Service layer enforces user context on all operations
- **Verification**: JWT user_id cross-referenced before any data access

### III. Stateless Serverless Design ✅
- **Compliance**: No in-memory state between requests
- **Implementation**: JWT-based auth, all state in database or token
- **Database**: Neon serverless-compatible with connection pooling

### IV. Strict Separation of Concerns ✅
- **Compliance**: Frontend/Backend communicate only via REST API
- **Implementation**:
  - Frontend: Next.js handles presentation, routing, client state
  - Backend: FastAPI handles business logic, data persistence, security

### Development Standards

| Standard | Status | Implementation |
|----------|--------|----------------|
| Type Safety | ✅ | Python type hints + strict TypeScript |
| Component Modularity | ✅ | Service/Repository pattern (backend), Smart/Dumb components (frontend) |
| Library Vetting | ✅ | Serverless-compatible deps only, pinned versions |
| Documentation-First API | ✅ | OpenAPI spec in /contracts |

### Security Standards

| Standard | Status | Implementation |
|----------|--------|----------------|
| Shared Secret Handshake | ✅ | BETTER_AUTH_SECRET in env vars only |
| Token Verification | ✅ | Middleware on all /api/ routes, 401/403 responses |

**Constitution Check Result**: PASS ✅

## Project Structure

### Documentation (this feature)

```text
specs/001-task-management/
├── plan.md              # This file
├── research.md          # Phase 0 output - Technology decisions
├── data-model.md        # Phase 1 output - Entity definitions
├── quickstart.md        # Phase 1 output - Developer setup
├── contracts/           # Phase 1 output - OpenAPI specs
│   └── openapi.yaml     # API contract
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry
│   ├── config.py            # Environment configuration
│   ├── database.py          # Neon connection + session management
│   ├── models/              # SQLModel definitions
│   │   ├── __init__.py
│   │   ├── user.py          # User model
│   │   ├── task.py          # Task model
│   │   ├── tag.py           # Tag model + TaskTag junction
│   │   └── audit.py         # AuditLog model
│   ├── schemas/             # Pydantic request/response schemas
│   │   ├── __init__.py
│   │   ├── task.py
│   │   ├── tag.py
│   │   └── auth.py
│   ├── services/            # Business logic layer
│   │   ├── __init__.py
│   │   ├── task_service.py
│   │   ├── tag_service.py
│   │   └── audit_service.py
│   ├── repositories/        # Data access layer
│   │   ├── __init__.py
│   │   ├── task_repository.py
│   │   ├── tag_repository.py
│   │   └── audit_repository.py
│   ├── api/                 # Route handlers
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── tasks.py
│   │   │   ├── tags.py
│   │   │   └── health.py
│   │   └── deps.py          # Dependency injection (auth, db session)
│   └── middleware/
│       ├── __init__.py
│       └── auth.py          # JWT verification middleware
├── tests/
│   ├── conftest.py
│   ├── unit/
│   ├── integration/
│   └── contract/
├── alembic/                 # Database migrations
│   ├── versions/
│   └── env.py
├── pyproject.toml
└── alembic.ini

frontend/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/          # Auth route group
│   │   │   ├── signin/
│   │   │   └── signup/
│   │   └── (dashboard)/     # Protected route group
│   │       ├── layout.tsx
│   │       └── tasks/
│   ├── components/          # React components
│   │   ├── ui/              # Design system primitives
│   │   ├── tasks/           # Task-related components
│   │   └── layout/          # Layout components
│   ├── lib/                 # Utilities and clients
│   │   ├── api.ts           # API client
│   │   ├── auth.ts          # Better Auth client
│   │   └── utils.ts
│   ├── hooks/               # Custom React hooks
│   │   ├── use-tasks.ts
│   │   └── use-auth.ts
│   ├── types/               # TypeScript types
│   │   ├── task.ts
│   │   └── api.ts
│   └── styles/
│       └── globals.css
├── tests/
│   ├── unit/
│   └── e2e/
├── package.json
├── tsconfig.json
├── next.config.js
└── tailwind.config.js
```

**Structure Decision**: Web application structure with separate backend/ and frontend/ directories. Backend follows Service/Repository pattern per Constitution. Frontend uses Next.js App Router with route groups for auth and protected pages.

## Key Architectural Decisions

### 1. Authentication Strategy
- **Decision**: Better Auth (frontend) + JWT verification middleware (backend)
- **Flow**:
  1. User signs in via Better Auth on frontend
  2. JWT issued and stored client-side
  3. JWT attached to API requests via Authorization header
  4. FastAPI middleware verifies JWT signature using shared secret
  5. user_id extracted from token claims for all data operations
- **Rationale**: Decoupled auth allows independent scaling; JWT verification is stateless

### 2. Data Modeling
- **Tasks**: Core entity with user_id, title, description, priority, due_date, recurrence, status
- **Tags**: Separate table with many-to-many relationship (TaskTag junction)
- **Audit Logs**: Event-based immutable log for all mutations
- **Rationale**: Normalized schema enables efficient queries and reporting

### 3. Soft Delete Strategy
- **Decision**: Soft delete for tasks (is_deleted, deleted_at, deleted_by)
- **Query Behavior**: Default queries exclude deleted; can be overridden for admin/recovery
- **Rationale**: Enables auditability, recovery, and compliance

### 4. Audit Logging
- **Decision**: Event-based audit log (append-only)
- **Logged Events**: create, update, complete, delete, recurring_auto_create
- **Per-Field Tracking**: Updates log each changed field with old/new values
- **Rationale**: Full change history for compliance and debugging

### 5. Server-Side Filtering/Sorting
- **Decision**: All filtering and sorting performed server-side
- **Implementation**: Query parameters processed in repository layer
- **Rationale**: Consistent behavior, better performance for large datasets, security

### 6. Recurring Task Model
- **Decision**: On completion, system creates new task with next due date
- **Recurrence Types**: none, daily, weekly, monthly
- **Logging**: System-generated events logged in audit trail
- **Rationale**: Simple implementation, full transparency of automated actions

### 7. Notification Responsibility
- **Decision**: Frontend handles browser notifications
- **Implementation**: Frontend schedules notifications based on task due dates
- **Backend Role**: Provides due date data; no push notification infrastructure
- **Rationale**: Simpler architecture; browser Notifications API is sufficient

### 8. Local Testing Strategy
- **Decision**: Docker Compose for production-like local testing
- **Components**: Frontend, Backend, and PostgreSQL containers
- **Purpose**: Catch environment-specific issues before deployment
- **Workflow**: Test in Docker → Pass all checks → Deploy to Vercel
- **Rationale**: Consistent environment, reproducible builds, early issue detection

### 9. Deployment Strategy
- **Decision**: Vercel for unified deployment (frontend + backend)
- **Frontend**: Next.js deployed natively on Vercel edge
- **Backend**: FastAPI as Python serverless functions via Mangum adapter
- **Database**: Neon integration for auto-provisioned branch databases
- **CI/CD**: GitHub integration with automatic preview deployments
- **Rationale**: Native Next.js support, simple configuration, preview deployments per PR

### 10. UI/UX Design System
- **Decision**: shadcn/ui + Tailwind CSS with white base theme
- **Components**: Radix-based accessible primitives from shadcn/ui
- **Styling**: Tailwind CSS with CSS variables for theming
- **Theme**: Dark and Light mode with system preference detection
- **Animations**: Tailwind CSS transitions (fade, slide, scale, skeleton)
- **Responsive**: Mobile-first design with bottom navigation on mobile
- **Rationale**: Accessible, customizable, lightweight, no extra bundle for animations

### 11. Rate Limiting
- **Decision**: Sliding window rate limiting (in-memory)
- **Limits**: 100 GET/min, 30 POST/min, 20 DELETE/min per user
- **Auth Endpoints**: 10/min per IP (brute force protection)
- **Response**: 429 Too Many Requests with Retry-After header
- **Rationale**: Prevents API abuse, protects server resources

### 12. Data Export
- **Decision**: CSV and JSON export with streaming
- **Scope**: All user tasks with tags, priorities, dates
- **Method**: Streaming response for large datasets
- **Endpoint**: GET /api/v1/tasks/export?format=csv|json
- **Rationale**: User data portability, backup capability

### 13. Keyboard Shortcuts
- **Decision**: Global keyboard shortcuts with custom hook
- **Navigation**: J/K for task selection, / for search focus
- **Actions**: N (new), E (edit), Delete, Ctrl+Enter (complete)
- **Priority**: 1/2/3 for high/medium/low
- **Help**: ? to show shortcuts dialog
- **Context-Aware**: Disabled during text input, modal-aware
- **Rationale**: Power user productivity, vim-like navigation, no external dependencies

## Implementation Phases

### Phase 1: Research
- Better Auth JWT plugin behavior and token format
- FastAPI JWT verification with python-jose
- SQLModel soft delete patterns
- Audit log schema design
- Neon connection pooling for serverless

### Phase 2: Foundation
- Project scaffolding (backend + frontend)
- Environment configuration (.env structure)
- Neon PostgreSQL connection with pooling
- SQLModel base models
- JWT verification middleware
- Base audit logging utilities
- shadcn/ui initialization and base components
- Tailwind CSS configuration with custom animations
- Theme provider (dark/light mode)
- Rate limiting middleware

### Phase 3: Core Implementation
- Task CRUD endpoints (soft delete)
- Completion toggle
- Priority assignment
- Tag management (CRUD + assignment)
- Search, filter, sort endpoints
- Due date handling
- Audit log creation on all mutations
- Pagination
- Data export endpoint (CSV/JSON)

### Phase 4: Advanced Features
- Recurring task logic
- Auto-create next task on completion
- Browser notification scheduling (frontend)
- Notification permission handling

### Phase 5: Frontend Integration
- Auth pages (signup/signin) with animations
- Task dashboard with loading skeletons
- Create/Edit task modal with form validation
- Filter & sort sidebar (responsive)
- Task cards with hover effects and micro-interactions
- Priority color indicators (animated pulse for high)
- Due date/overdue state indicators
- Theme toggle (dark/light mode)
- Mobile bottom navigation
- Toast notifications for actions
- Export button (CSV/JSON download)
- Empty state illustrations
- Keyboard shortcuts hook (useKeyboardShortcuts)
- Keyboard shortcuts help dialog (? key)
- Task navigation with J/K keys
- Quick actions (N, E, Delete, Ctrl+Enter)

### Phase 6: Validation & Refinement
- Security testing (auth, isolation)
- Audit integrity validation
- Soft delete behavior verification
- Edge case handling
- Performance optimization

### Phase 7: Docker Local Testing
- Create Dockerfiles (backend, frontend)
- Create docker-compose.yml configuration
- Local PostgreSQL container setup
- Run full test suite in containers
- End-to-end testing in Docker environment
- Production build verification
- Pre-deployment checklist validation

### Phase 8: Vercel Deployment
- Vercel project configuration (vercel.json)
- Neon integration setup via Vercel dashboard
- Environment variables configuration (production/preview)
- Mangum adapter for FastAPI serverless
- Domain configuration
- Preview deployment testing
- Production deployment and smoke tests

## Testing Strategy

### Authentication Tests
- Missing JWT → 401 Unauthorized
- Invalid JWT signature → 401 Unauthorized
- Expired JWT → 401 Unauthorized
- Valid JWT, wrong resource → 403 Forbidden
- Valid JWT, correct resource → 200 OK

### Data Isolation Tests
- User A cannot see User B's tasks
- User A cannot update User B's tasks
- User A cannot delete User B's tasks
- User A cannot access User B's audit logs

### Soft Delete Tests
- Deleted tasks excluded from default list
- Deleted tasks still exist in database
- Delete action logged with timestamp/user
- Deleted tasks queryable with flag

### Audit Logging Tests
- Create action generates log entry
- Update logs each changed field
- Completion toggle logged
- Delete logged correctly
- Recurring auto-create logged

### API Contract Tests
- All endpoints match OpenAPI spec
- Request validation rejects invalid input
- Response schemas match documentation
- Rate limiting returns 429 when exceeded
- Export endpoint returns valid CSV/JSON

### UI/UX Tests
- Dark/Light mode toggle works
- Theme persists across sessions
- Animations render smoothly (no jank)
- Mobile responsive breakpoints
- Loading skeletons display during fetch
- Toast notifications appear on actions
- Form validation shows errors correctly
- Empty states display when no data
- Keyboard shortcuts work correctly (N, E, J, K, ?)
- Shortcuts disabled during text input
- Help dialog displays all shortcuts
- Task selection with J/K navigation

### Docker Local Tests
- All containers start without errors
- Database migrations run in container
- Backend tests pass in container
- Frontend tests pass in container
- API endpoints respond correctly (localhost:8000)
- Frontend renders correctly (localhost:3000)
- Authentication flow works end-to-end
- Production build completes without errors

### Deployment Tests
- Preview deployment builds successfully
- Production deployment builds successfully
- API endpoints respond correctly on Vercel
- Database connection works from serverless functions
- Environment variables correctly loaded
- CORS configured for production domain
- Cold start time within acceptable limits (<3s)

## Quality Validation Checklist

### Backend
- [ ] All mutations generate audit logs
- [ ] No hard deletes occur on tasks
- [ ] All queries enforce user_id filter
- [ ] JWT verification on all protected endpoints
- [ ] Pydantic validation on all inputs
- [ ] Type hints on all Python functions
- [ ] Rate limiting active on all endpoints
- [ ] Export endpoint streams large datasets
- [ ] OpenAPI spec matches implementation

### Frontend
- [ ] No TypeScript `any` usage
- [ ] Dark/Light mode works correctly
- [ ] All animations are smooth (60fps)
- [ ] Mobile responsive on all screens
- [ ] Loading states on all async operations
- [ ] Form validation with clear error messages
- [ ] Accessible (WCAG 2.1 AA compliant)
- [ ] shadcn/ui components properly styled
- [ ] Keyboard shortcuts functional
- [ ] Shortcuts help dialog accessible via ?

### Infrastructure
- [ ] Docker Compose starts all services
- [ ] All tests pass in Docker containers
- [ ] Production builds complete in Docker
- [ ] Vercel deployment configuration complete
- [ ] Neon integration configured
- [ ] Production environment variables set
- [ ] Preview deployments working
- [ ] Cold start time < 3 seconds

## Complexity Tracking

No Constitution violations requiring justification. All architectural decisions align with the Secure Full-Stack Web Application Constitution v1.0.0.

## Next Steps

1. **Run `/sp.tasks`** to generate actionable task list from this plan
2. **Review contracts/** for API specification
3. **Begin Phase 2 (Foundation)** implementation
