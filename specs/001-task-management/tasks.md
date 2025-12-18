# Tasks: Intelligent Multi-User Task Management

**Input**: Design documents from `/specs/001-task-management/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/openapi.yaml

**Tests**: Tests are NOT explicitly requested in the feature specification. Test tasks are OMITTED.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/app/` for source, `backend/tests/` for tests
- **Frontend**: `frontend/src/` for source, `frontend/tests/` for tests

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend project structure with directories: app/{models,schemas,services,repositories,api/v1,middleware} in backend/
- [X] T002 Create frontend project structure with directories: src/{app,components,lib,hooks,types,styles} in frontend/
- [X] T003 [P] Initialize Python project with pyproject.toml, dependencies (FastAPI, SQLModel, python-jose, bcrypt, uvicorn, alembic) in backend/pyproject.toml
- [X] T004 [P] Initialize Next.js 16+ project with TypeScript, Tailwind CSS, React Query in frontend/package.json
- [X] T005 [P] Configure backend linting with ruff and type checking with mypy in backend/pyproject.toml
- [X] T006 [P] Configure frontend linting with ESLint and TypeScript strict mode in frontend/tsconfig.json
- [X] T007 [P] Create backend environment configuration module in backend/app/config.py
- [X] T008 [P] Create frontend environment configuration in frontend/src/lib/config.ts
- [X] T009 Create .env.example files for both backend/frontend with documented variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**CRITICAL**: No user story work can begin until this phase is complete

### Database Infrastructure

- [X] T010 Setup Neon PostgreSQL connection with NullPool for serverless in backend/app/database.py
- [X] T011 Initialize Alembic for migrations in backend/alembic/
- [X] T012 Create base SQLModel class with common fields (id, timestamps) in backend/app/models/__init__.py

### Authentication Infrastructure

- [X] T013 [P] Implement JWT verification middleware using python-jose in backend/app/middleware/auth.py
- [X] T014 [P] Create auth dependency for extracting current user from JWT in backend/app/api/deps.py
- [X] T015 [P] Initialize Better Auth client configuration in frontend/src/lib/auth.ts
- [X] T016 Setup Better Auth API routes in frontend/src/app/api/auth/[...all]/route.ts

### API Infrastructure

- [X] T017 Create FastAPI application entry point with CORS, middleware in backend/app/main.py
- [X] T018 [P] Create base Pydantic schemas for common response patterns in backend/app/schemas/__init__.py
- [X] T019 [P] Implement standardized error handling and error responses in backend/app/api/deps.py
- [X] T020 Implement rate limiting middleware with sliding window algorithm in backend/app/middleware/rate_limit.py
- [X] T021 Create health check endpoint in backend/app/api/v1/health.py

### Frontend Infrastructure

- [X] T022 [P] Initialize shadcn/ui with required components (button, card, input, dialog, checkbox, badge, toast, skeleton, select, dropdown-menu) in frontend/
- [X] T023 [P] Configure Tailwind CSS with custom animations (fade-in, slide-up, skeleton) and design tokens in frontend/tailwind.config.ts
- [X] T024 [P] Create global CSS with light/dark mode CSS variables in frontend/src/styles/globals.css
- [X] T025 Create ThemeProvider component for dark/light mode switching in frontend/src/components/theme-provider.tsx
- [X] T026 Create root layout with ThemeProvider, auth session provider in frontend/src/app/layout.tsx
- [X] T027 [P] Create API client with axios/fetch, interceptors, auth header injection in frontend/src/lib/api-client.ts
- [X] T028 [P] Create TypeScript types for API responses (Task, Tag, Pagination) in frontend/src/types/

### Audit Infrastructure

- [X] T029 Create AuditLog model with ActionType enum in backend/app/models/audit.py
- [X] T030 Create audit repository for append-only log operations in backend/app/repositories/audit_repository.py
- [X] T031 Create audit service with methods for logging all mutation types in backend/app/services/audit_service.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Secure Account Access (Priority: P1) - MVP

**Goal**: Enable users to create accounts and securely sign in so that tasks are private and only accessible to them.

**Independent Test**: Create an account, sign in, verify session persistence, sign out, verify protected route redirect.

### Implementation for User Story 1

- [X] T032 [P] [US1] Create auth schemas for signin/signup responses in backend/app/schemas/auth.py
- [X] T033 [P] [US1] Create signin page with form validation in frontend/src/app/(auth)/signin/page.tsx
- [X] T034 [P] [US1] Create signup page with form validation in frontend/src/app/(auth)/signup/page.tsx
- [X] T035 [US1] Create auth layout with centered card design in frontend/src/app/(auth)/layout.tsx
- [X] T036 [US1] Implement protected route middleware checking auth status in frontend/src/middleware.ts
- [X] T037 [US1] Create useAuth hook for auth state and actions in frontend/src/hooks/use-auth.ts
- [X] T038 [US1] Create UserButton component showing user info and sign out in frontend/src/components/layout/user-button.tsx
- [X] T039 [US1] Add form validation with error messages for invalid credentials in frontend/src/app/(auth)/signin/page.tsx
- [ ] T040 [US1] Test JWT token refresh and session persistence across browser restarts

**Checkpoint**: User Story 1 complete - users can sign up, sign in, and access protected routes

---

## Phase 4: User Story 2 - Basic Task Management (Priority: P1) - MVP

**Goal**: Enable users to create, view, edit, and delete tasks to track their work items.

**Independent Test**: Create a task, view in list, edit title/description, mark complete/incomplete, delete task.

### Backend Implementation for User Story 2

- [X] T041 [P] [US2] Create Task model with all fields (title, description, priority, due_date, recurrence, is_completed, soft delete fields) in backend/app/models/task.py
- [X] T042 [US2] Generate Alembic migration for Task table with indexes in backend/alembic/versions/001_initial_schema.py
- [X] T043 [P] [US2] Create Task Pydantic schemas (TaskCreate, TaskUpdate, TaskResponse, TaskListResponse) in backend/app/schemas/task.py
- [X] T044 [US2] Create task repository with CRUD operations, soft delete, user filtering in backend/app/repositories/task_repository.py
- [X] T045 [US2] Create task service with business logic, audit logging integration in backend/app/services/task_service.py
- [X] T046 [US2] Implement task CRUD endpoints (GET /tasks, POST /tasks, GET /tasks/{id}, PATCH /tasks/{id}, DELETE /tasks/{id}) in backend/app/api/v1/tasks.py
- [X] T047 [US2] Implement complete/uncomplete endpoints (POST /tasks/{id}/complete, POST /tasks/{id}/uncomplete) in backend/app/api/v1/tasks.py

### Frontend Implementation for User Story 2

- [X] T048 [P] [US2] Create task TypeScript types matching API schemas in frontend/src/types/api.ts
- [X] T049 [US2] Create useTasks hook with React Query for task list fetching in frontend/src/hooks/use-tasks.ts
- [X] T050 [US2] Create useTaskMutations hook for create, update, delete, complete operations in frontend/src/hooks/use-task-mutations.ts
- [X] T051 [US2] Create dashboard layout with header, sidebar structure in frontend/src/app/(dashboard)/layout.tsx
- [X] T052 [US2] Create task dashboard page as main protected view in frontend/src/app/(dashboard)/tasks/page.tsx
- [X] T053 [P] [US2] Create TaskCard component with checkbox, title, actions menu in frontend/src/components/tasks/task-card.tsx
- [X] T054 [P] [US2] Create TaskList component rendering array of TaskCard in frontend/src/components/tasks/task-list.tsx
- [X] T055 [US2] Create CreateTaskDialog with form (title required, description optional) in frontend/src/components/tasks/create-task-dialog.tsx
- [X] T056 [US2] Create EditTaskDialog for updating existing task fields in frontend/src/components/tasks/edit-task-dialog.tsx
- [X] T057 [US2] Create DeleteTaskDialog with confirmation prompt in frontend/src/components/tasks/delete-task-dialog.tsx
- [X] T058 [US2] Add loading skeletons for task list during data fetch in frontend/src/components/tasks/task-list-skeleton.tsx
- [X] T059 [US2] Add toast notifications for task actions (created, updated, deleted, completed) in frontend/src/components/ui/toast.tsx and task components
- [X] T060 [US2] Create empty state component when no tasks exist in frontend/src/components/tasks/empty-state.tsx

**Checkpoint**: User Story 2 complete - users can manage tasks with full CRUD operations

---

## Phase 5: User Story 10 - Data Isolation Between Users (Priority: P1) - MVP

**Goal**: Ensure tasks are completely private with no cross-user data access.

**Independent Test**: Create two user accounts, create tasks for each, verify neither can access the other's tasks via API.

### Implementation for User Story 10

- [X] T061 [US10] Add user_id filter enforcement in task repository all query methods in backend/app/repositories/task_repository.py
- [X] T062 [US10] Add ownership verification in task service before any mutation in backend/app/services/task_service.py
- [X] T063 [US10] Return 403 Forbidden when user attempts to access another user's task in backend/app/api/v1/tasks.py
- [X] T064 [US10] Verify JWT sub claim matches requested resource owner in all task endpoints in backend/app/api/v1/tasks.py

**Checkpoint**: User Story 10 complete - data isolation is enforced at API level

---

## Phase 6: User Story 3 - Task Prioritization (Priority: P2)

**Goal**: Enable users to assign priority levels (high, medium, low) to tasks for focus management.

**Independent Test**: Create tasks with different priorities, verify visual distinction, change priority on existing task.

### Implementation for User Story 3

- [X] T065 [P] [US3] Add Priority enum (low, medium, high) to Task model if not already present in backend/app/models/task.py
- [X] T066 [US3] Add priority field to TaskCreate and TaskUpdate schemas in backend/app/schemas/task.py
- [X] T067 [US3] Create PriorityBadge component with color coding (red=high, amber=medium, green=low) in frontend/src/components/tasks/priority-badge.tsx
- [X] T068 [US3] Add priority selector dropdown to CreateTaskDialog in frontend/src/components/tasks/create-task-dialog.tsx
- [X] T069 [US3] Add priority selector dropdown to EditTaskDialog in frontend/src/components/tasks/edit-task-dialog.tsx
- [X] T070 [US3] Display PriorityBadge in TaskCard with animated pulse for high priority in frontend/src/components/tasks/task-card.tsx

**Checkpoint**: User Story 3 complete - users can prioritize tasks with visual distinction

---

## Phase 7: User Story 4 - Task Tagging (Priority: P2)

**Goal**: Enable users to assign tags/categories to tasks for contextual organization.

**Independent Test**: Create tags, assign tags to tasks, view tags on task cards, remove tags from tasks.

### Backend Implementation for User Story 4

- [X] T071 [P] [US4] Create Tag model with user_id, name fields in backend/app/models/tag.py
- [X] T072 [P] [US4] Create TaskTag junction table model for many-to-many relationship in backend/app/models/tag.py
- [X] T073 [US4] Generate Alembic migration for Tag and TaskTag tables in backend/alembic/versions/
- [X] T074 [P] [US4] Create Tag Pydantic schemas (TagCreate, TagUpdate, TagResponse, TagListResponse) in backend/app/schemas/tag.py
- [X] T075 [US4] Create tag repository with CRUD, uniqueness validation per user in backend/app/repositories/tag_repository.py
- [X] T076 [US4] Create tag service with business logic in backend/app/services/tag_service.py
- [X] T077 [US4] Implement tag CRUD endpoints (GET /tags, POST /tags, GET /tags/{id}, PATCH /tags/{id}, DELETE /tags/{id}) in backend/app/api/v1/tags.py
- [X] T078 [US4] Update task repository to handle tag associations (add/remove tags) in backend/app/repositories/task_repository.py
- [X] T079 [US4] Update task schemas to include tag_ids for create/update, tags for response in backend/app/schemas/task.py

### Frontend Implementation for User Story 4

- [X] T080 [P] [US4] Create tag TypeScript types in frontend/src/types/tag.ts
- [X] T081 [US4] Create useTags hook for fetching user's tags in frontend/src/hooks/use-tags.ts
- [X] T082 [P] [US4] Create TagBadge component for displaying individual tag in frontend/src/components/tags/tag-badge.tsx
- [X] T083 [US4] Create TagSelector multi-select component for task forms in frontend/src/components/tags/tag-selector.tsx
- [X] T084 [US4] Create TagManager component/dialog for CRUD operations on tags in frontend/src/components/tags/tag-manager.tsx
- [X] T085 [US4] Add TagSelector to CreateTaskDialog in frontend/src/components/tasks/create-task-dialog.tsx
- [X] T086 [US4] Add TagSelector to EditTaskDialog in frontend/src/components/tasks/edit-task-dialog.tsx
- [X] T087 [US4] Display tags in TaskCard using TagBadge components in frontend/src/components/tasks/task-card.tsx

**Checkpoint**: User Story 4 complete - users can organize tasks with custom tags

---

## Phase 8: User Story 5 - Search and Filter Tasks (Priority: P2)

**Goal**: Enable users to search and filter tasks for quick discovery.

**Independent Test**: Create multiple tasks, search by keyword, filter by status/priority/tag/date range, clear filters.

### Backend Implementation for User Story 5

- [X] T088 [US5] Add search parameter (ILIKE on title, description) to task repository list method in backend/app/repositories/task_repository.py
- [X] T089 [US5] Add filter parameters (status, priority, tag_id, due_from, due_to) to task repository in backend/app/repositories/task_repository.py
- [X] T090 [US5] Add pagination parameters (page, page_size) with total count to task repository in backend/app/repositories/task_repository.py
- [X] T091 [US5] Update GET /tasks endpoint with all query parameters in backend/app/api/v1/tasks.py

### Frontend Implementation for User Story 5

- [X] T092 [P] [US5] Create SearchInput component with debounced input in frontend/src/components/tasks/search-input.tsx
- [X] T093 [P] [US5] Create FilterSidebar component with filter controls in frontend/src/components/tasks/filter-sidebar.tsx
- [X] T094 [US5] Add status filter (All, Active, Completed) in FilterSidebar in frontend/src/components/tasks/filter-sidebar.tsx
- [X] T095 [US5] Add priority filter multi-select in FilterSidebar in frontend/src/components/tasks/filter-sidebar.tsx
- [X] T096 [US5] Add tag filter multi-select in FilterSidebar in frontend/src/components/tasks/filter-sidebar.tsx
- [X] T097 [US5] Add date range picker for due date filtering in FilterSidebar in frontend/src/components/tasks/filter-sidebar.tsx
- [X] T098 [US5] Add clear filters button in FilterSidebar in frontend/src/components/tasks/filter-sidebar.tsx
- [X] T099 [US5] Update useTasks hook to accept filter parameters in frontend/src/hooks/use-tasks.ts
- [X] T100 [US5] Integrate SearchInput and FilterSidebar into task dashboard in frontend/src/app/(dashboard)/tasks/page.tsx
- [X] T101 [US5] Add pagination controls to task list in frontend/src/components/tasks/pagination.tsx
- [X] T102 [US5] Create no results state when search/filter returns empty in frontend/src/components/tasks/no-results.tsx

**Checkpoint**: User Story 5 complete - users can search and filter their task list

---

## Phase 9: User Story 6 - Task Sorting (Priority: P2)

**Goal**: Enable users to sort task list in preferred order.

**Independent Test**: Create multiple tasks, sort by due date, priority, title, creation date in both directions.

### Implementation for User Story 6

- [X] T103 [US6] Add sort_by and sort_order parameters to task repository in backend/app/repositories/task_repository.py
- [X] T104 [US6] Implement sorting logic for due_date, priority, title, created_at in backend/app/repositories/task_repository.py
- [X] T105 [US6] Update GET /tasks endpoint with sort parameters in backend/app/api/v1/tasks.py
- [X] T106 [US6] Create SortDropdown component with sort options in frontend/src/app/(dashboard)/tasks/page.tsx (inline implementation)
- [X] T107 [US6] Add sort state to useTasks hook in frontend/src/hooks/use-tasks.ts
- [X] T108 [US6] Integrate SortDropdown into task dashboard header in frontend/src/app/(dashboard)/tasks/page.tsx

**Checkpoint**: User Story 6 complete - users can sort tasks by various criteria

---

## Phase 10: User Story 7 - Due Dates and Times (Priority: P3)

**Goal**: Enable users to set due dates and times on tasks with overdue indicators.

**Independent Test**: Set due date on task, verify display, change due date, verify overdue visual indicator.

### Implementation for User Story 7

- [X] T109 [US7] Add due_date field handling in task schemas if not already complete in backend/app/schemas/task.py
- [X] T110 [US7] Add is_overdue computed property to TaskResponse - implemented in frontend/src/types/api.ts:isTaskOverdue()
- [X] T111 [US7] Create DateTimePicker component - using native HTML date input for simplicity
- [X] T112 [US7] Add DateTimePicker to CreateTaskDialog in frontend/src/components/tasks/create-task-dialog.tsx
- [X] T113 [US7] Add DateTimePicker to EditTaskDialog in frontend/src/components/tasks/edit-task-dialog.tsx
- [X] T114 [US7] Create DueDate display component - inline implementation in TaskCard
- [X] T115 [US7] Add overdue visual indicator (red text, icon) to TaskCard in frontend/src/components/tasks/task-card.tsx

**Checkpoint**: User Story 7 complete - users can set and track due dates

---

## Phase 11: User Story 8 - Browser Notifications (Priority: P3)

**Goal**: Enable browser notifications before tasks are due.

**Independent Test**: Grant notification permission, create task with due date, verify notification appears before due time.

### Implementation for User Story 8

- [X] T116 [P] [US8] Create notification permission request utility in frontend/src/lib/notifications.ts
- [X] T117 [P] [US8] Create notification scheduling logic based on due dates in frontend/src/lib/notifications.ts
- [X] T118 [US8] Create useNotifications hook for managing notification scheduling in frontend/src/hooks/use-notifications.ts
- [X] T119 [US8] Add notification permission prompt on first app load in frontend/src/app/(dashboard)/layout.tsx
- [X] T120 [US8] Schedule notifications when tasks with due dates are loaded in frontend/src/app/(dashboard)/tasks/page.tsx
- [X] T121 [US8] Re-schedule notifications when task due date is updated - handled via scheduleForTask in useNotifications
- [X] T122 [US8] Create NotificationSettings component for reminder offset configuration in frontend/src/components/settings/notification-settings.tsx

**Checkpoint**: User Story 8 complete - users receive browser notifications for upcoming tasks

---

## Phase 12: User Story 9 - Recurring Tasks (Priority: P3)

**Goal**: Enable recurring tasks that automatically reschedule.

**Independent Test**: Create recurring task (daily), complete it, verify new task created with next due date.

### Backend Implementation for User Story 9

- [X] T123 [US9] Add Recurrence enum (none, daily, weekly, monthly) to Task model if not already in backend/app/models/task.py
- [X] T124 [US9] Create recurrence calculation utility (next due date logic) in backend/app/services/task_service.py:351-375
- [X] T125 [US9] Update complete_task service method to auto-create next instance for recurring tasks in backend/app/services/task_service.py:251-256
- [X] T126 [US9] Log recurring_auto_create action to audit log with is_system_action=True in backend/app/services/task_service.py:342-347
- [X] T127 [US9] Update CompleteTaskResponse schema to include next_task field in backend/app/schemas/task.py

### Frontend Implementation for User Story 9

- [X] T128 [P] [US9] Create RecurrenceSelector - implemented inline in dialogs using HTML select
- [X] T129 [US9] Add RecurrenceSelector to CreateTaskDialog in frontend/src/components/tasks/create-task-dialog.tsx:145-163
- [X] T130 [US9] Add RecurrenceSelector to EditTaskDialog in frontend/src/components/tasks/edit-task-dialog.tsx:149-167
- [X] T131 [US9] Display recurrence indicator in TaskCard in frontend/src/components/tasks/task-card.tsx:124-141
- [X] T132 [US9] Show toast notification when recurring task creates next instance - toast shown on completion

**Checkpoint**: User Story 9 complete - users can create self-rescheduling recurring tasks

---

## Phase 13: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

### Data Export

- [X] T133 [P] Implement task export endpoint (CSV, JSON) with streaming in backend/app/api/v1/tasks.py
- [X] T134 Create ExportButton component with format selection in frontend/src/components/tasks/export-button.tsx

### Keyboard Shortcuts

- [X] T135 [P] Create useKeyboardShortcuts hook in frontend/src/hooks/use-keyboard-shortcuts.ts
- [X] T136 Create KeyboardShortcutsHelp dialog (? key trigger) in frontend/src/components/keyboard-shortcuts-help.tsx
- [X] T137 Implement task navigation shortcuts (J/K, N, E, Delete, Ctrl+Enter) in frontend/src/app/(dashboard)/tasks/page.tsx

### Mobile Responsiveness

- [X] T138 Create responsive sidebar with mobile slide-out behavior in frontend/src/components/layout/sidebar.tsx
- [X] T139 Create mobile bottom navigation component in frontend/src/components/layout/mobile-nav.tsx
- [X] T140 Add responsive breakpoints to task list and forms in frontend/src/components/tasks/

### Audit Trail Access

- [X] T141 Implement GET /tasks/{id}/audit endpoint in backend/app/api/v1/tasks.py
- [X] T142 Create TaskAuditDialog showing change history in frontend/src/components/tasks/task-audit-dialog.tsx

### Docker Local Testing

- [X] T143 [P] Create backend Dockerfile in backend/Dockerfile
- [X] T144 [P] Create frontend Dockerfile in frontend/Dockerfile
- [X] T145 Create docker-compose.yml with postgres, backend, frontend services in docker-compose.yml
- [X] T146 Create docker-compose.prod.yml for production-like testing in docker-compose.prod.yml
- [X] T147 Test full application in Docker environment per quickstart.md checklist

### Vercel Deployment

- [X] T148 Create vercel.json with build configuration for monorepo in vercel.json
- [X] T149 Add Mangum adapter for FastAPI serverless in backend/app/main.py
- [ ] T150 Configure Vercel-Neon integration and environment variables
- [ ] T151 Test preview deployment and production deployment
- [ ] T152 Verify cold start time < 3 seconds

### Final Validation

- [X] T153 Run quickstart.md verification steps
- [X] T154 Verify all API endpoints match openapi.yaml contract
- [X] T155 Security audit: verify all mutations create audit logs
- [X] T156 Security audit: verify no hard deletes on tasks
- [X] T157 Security audit: verify user_id filter on all queries

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-12)**: All depend on Foundational phase completion
  - US1, US2, US10 are P1 (MVP) - complete these first in order
  - US3, US4, US5, US6 are P2 - complete after P1 stories
  - US7, US8, US9 are P3 - complete after P2 stories
- **Polish (Phase 13)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story | Priority | Dependencies | Notes |
|-------|----------|--------------|-------|
| US1 (Auth) | P1 | Foundational only | Can start immediately after Phase 2 |
| US2 (Task CRUD) | P1 | US1 | Requires auth for protected routes |
| US10 (Data Isolation) | P1 | US2 | Extends US2 with isolation checks |
| US3 (Priority) | P2 | US2 | Extends task model with priority |
| US4 (Tagging) | P2 | US2 | Requires task CRUD working |
| US5 (Search/Filter) | P2 | US2, US3, US4 | Filters require priority and tags |
| US6 (Sorting) | P2 | US2 | Extends list endpoint |
| US7 (Due Dates) | P3 | US2 | Extends task model with due_date |
| US8 (Notifications) | P3 | US7 | Requires due dates implemented |
| US9 (Recurring) | P3 | US2, US7 | Requires due dates for scheduling |

### Within Each User Story

- Models before schemas
- Schemas before repositories
- Repositories before services
- Services before API endpoints
- Backend before frontend integration
- Core implementation before UI polish

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, backend and frontend work within a story can often be parallelized
- Models and schemas marked [P] can run in parallel within a story
- Different user stories can be worked on in parallel by different team members after Phase 2

---

## Parallel Example: Phase 2 Foundational

```bash
# These can all be launched in parallel:
T013: JWT verification middleware in backend/app/middleware/auth.py
T014: Auth dependency in backend/app/api/deps.py
T015: Better Auth client in frontend/src/lib/auth.ts
T018: Base Pydantic schemas in backend/app/schemas/__init__.py
T019: Error handling in backend/app/api/deps.py
T022: Initialize shadcn/ui components in frontend/
T023: Tailwind CSS config in frontend/tailwind.config.js
T024: Global CSS in frontend/src/styles/globals.css
T027: API client in frontend/src/lib/api.ts
T028: TypeScript types in frontend/src/types/
```

---

## Parallel Example: User Story 2

```bash
# Backend models and schemas can run in parallel:
T041: Task model in backend/app/models/task.py
T043: Task Pydantic schemas in backend/app/schemas/task.py

# Frontend types and components can run in parallel:
T048: Task TypeScript types in frontend/src/types/task.ts
T053: TaskCard component in frontend/src/components/tasks/task-card.tsx
T054: TaskList component in frontend/src/components/tasks/task-list.tsx
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 10 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Auth)
4. Complete Phase 4: User Story 2 (Task CRUD)
5. Complete Phase 5: User Story 10 (Data Isolation)
6. **STOP and VALIDATE**: Test auth, task management, and data isolation
7. Deploy MVP if ready

### Incremental Delivery

1. Complete Setup + Foundational -> Foundation ready
2. Add US1 + US2 + US10 -> Test independently -> Deploy MVP
3. Add US3 + US4 -> Test independently -> Deploy (Organization features)
4. Add US5 + US6 -> Test independently -> Deploy (Search/Sort features)
5. Add US7 + US8 + US9 -> Test independently -> Deploy (Advanced features)
6. Add Polish phase -> Final deployment

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Stories 1 + 2 (Auth + Task CRUD)
   - Developer B: User Story 4 backend (Tag model/API)
   - Developer C: Frontend infrastructure polish
3. After US2 complete, US3-9 can be distributed

---

## Summary

| Metric | Count |
|--------|-------|
| Total Tasks | 157 |
| Phase 1 (Setup) | 9 |
| Phase 2 (Foundational) | 22 |
| User Story Tasks | 101 |
| Polish Tasks | 25 |
| MVP Scope (US1+US2+US10) | 33 tasks |
| Parallel Opportunities | ~40% of tasks marked [P] |

### Tasks per User Story

| User Story | Priority | Task Count |
|------------|----------|------------|
| US1 (Auth) | P1 | 9 |
| US2 (Task CRUD) | P1 | 20 |
| US10 (Data Isolation) | P1 | 4 |
| US3 (Priority) | P2 | 6 |
| US4 (Tagging) | P2 | 17 |
| US5 (Search/Filter) | P2 | 15 |
| US6 (Sorting) | P2 | 6 |
| US7 (Due Dates) | P3 | 7 |
| US8 (Notifications) | P3 | 7 |
| US9 (Recurring) | P3 | 10 |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Format validation: ALL tasks follow `- [ ] [ID] [P?] [Story?] Description with file path`
