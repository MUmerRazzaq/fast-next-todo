---
id: 0002
title: Generate Dashboard UX Enhancement Plan
stage: plan
date: 2025-12-19
surface: agent
model: claude-sonnet-4-5-20250929
feature: 002-dashboard-ux-enhancements
branch: 002-dashboard-ux-enhancements
user: user
command: /sp.plan
labels: [planning, frontend, ux]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - specs/002-dashboard-ux-enhancements/plan.md
  - specs/002-dashboard-ux-enhancements/research.md
tests:
  []
---

## Prompt

Create a verification-first, frontend-focused execution plan for Phase 2 that refines UI/UX, completes empty dashboard pages, ensures full responsiveness, and CORRECTLY integrates frontend API calls with the existing backend by attaching authentication headers and validating all API usage against the current project.

This plan MUST be grounded in the CURRENT CODEBASE and MUST NOT assume missing functionality. Claude Code must read, verify, and align with existing frontend and backend implementations before making changes.

────────────────────────
CRITICAL EXECUTION RULES (MANDATORY)
────────────────────────

Before planning or implementing ANY changes, Claude Code MUST:

1. Read the existing frontend codebase
2. Identify:
   - API utility functions
   - Fetch / axios wrappers
   - How JWT tokens are currently retrieved
3. Verify:
   - Whether Authorization headers are attached
   - Which requests are missing headers
4. Inspect backend API routes and auth requirements
5. Cross-check frontend endpoints with backend FastAPI routes
6. Read relevant documentation if behavior is unclear
7. Avoid re-implementing existing working logic
8. Modify ONLY what is necessary

No assumptions. No blind refactors.

────────────────────────
Current Architecture (Verified Before Changes)
────────────────────────

Frontend:
- Next.js 16+ (App Router)
- Dashboard route group: (dashboard)
- Auth handled via Better Auth
- API calls made from frontend to FastAPI backend

Backend (Reference Only):
- FastAPI
- JWT-based authentication
- Authorization: Bearer <token> required for ALL protected endpoints

Database:
- Neon PostgreSQL (NO changes in Phase 2)

────────────────────────
Phase Breakdown (Detailed Execution Plan)
────────────────────────

────────────────────────
Phase 2.1 — Codebase & API Integration Audit
────────────────────────

Tasks:
- Read frontend API client code:
  - Fetch wrappers
  - Utility functions
  - Hooks or services used for API calls
- Identify:
  - Where JWT token is stored (session, cookie, localStorage, Better Auth helper)
  - Which requests include Authorization headers
  - Which requests do NOT include headers
- Read backend FastAPI route definitions:
  - Confirm protected routes
  - Confirm expected headers
- Verify frontend endpoint URLs match backend routes exactly

Deliverable:
- Written audit summary:
  - Correct API calls
  - Broken or incomplete API calls
  - Header attachment gaps

────────────────────────
Phase 2.2 — Frontend API Client Fix (Authorization Header)
────────────────────────

Objective:
Ensure ALL authenticated API requests include a valid Authorization header.

Tasks:
- Update frontend API utilities to:
  - Automatically attach:
    Authorization: Bearer <JWT>
- Ensure:
  - Export
  - Tags
  - Tasks
  - Settings-related calls
  all use the same authenticated client
- Prevent duplicated auth logic across components
- Gracefully handle missing or expired tokens

Verification:
- Inspect network requests in browser
- Confirm Authorization header exists
- Confirm backend no longer returns:
  “Missing Authorization header”

────────────────────────
Phase 2.3 — Error Handling & API Validation
────────────────────────

Tasks:
- Standardize API error handling:
  - 401 → user-friendly auth message
  - 403 → access denied message
- Ensure frontend:
  - Displays user-friendly errors
  - Logs technical details to console only
- Validate request/response structures against backend schemas

Verification:
- Force auth failures
- Confirm correct UI feedback
- Confirm no raw backend errors exposed

────────────────────────
Phase 2.4 — Layout & Responsiveness Refactor
────────────────────────

Tasks:
- Refactor dashboard to full-bleed layout
- Sidebar:
  - h-screen
  - Independently scrollable
  - Collapsible (icon rail on desktop)
  - Overlay drawer on mobile
- Main content:
  - Fills remaining width
  - Independent scroll

Verification:
- Desktop, tablet, mobile viewports
- No scroll bleed
- Sidebar toggle works correctly

────────────────────────
Phase 2.5 — Task List UX Enhancements
────────────────────────

Tasks:
- Verify current task sorting logic
- Enforce:
  - Active tasks shown first
- Update task cards:
  - Fully clickable
  - Hover & active states
  - Context menu (“…”)
- Place due date:
  - Right-aligned on desktop
  - Secondary position on mobile
- Highlight overdue tasks

Verification:
- Confirm UI matches actual task data
- No regression in task actions

────────────────────────
Phase 2.6 — Smart Filters & Sidebar Badges
────────────────────────

Tasks:
- Verify existing filtering logic
- Add live numeric badges:
  - Active
  - High priority
  - Overdue
- Ensure counts update dynamically

Verification:
- Badge counts match filtered task list

────────────────────────
Phase 2.7 — Keyboard Shortcuts Verification & UX
────────────────────────

Verify:
- KeyboardShortcutsHelp dialog (? trigger)
- Navigation shortcuts:
  - J / K
  - N
  - E
  - Delete
  - Ctrl + Enter

Enhancements:
- Add visible Help entry (icon or sidebar)
- Ensure mobile accessibility

Verification:
- Shortcuts function correctly
- Help dialog reflects actual behavior

────────────────────────
Phase 2.8 — Signin Error Handling (Bug Fix)
────────────────────────

Tasks:
- Inspect signin flow
- Identify why error is not displayed
- Implement explicit error state
- Display ONLY:
  “Invalid credentials”

Rules:
- No technical details exposed
- Message visible on all screen sizes
- Clears on retry

Verification:
- Wrong email
- Wrong password
- Consistent messaging

────────────────────────
Phase 2.9 — Export Error Resolution
────────────────────────

Tasks:
- Verify export API call
- Ensure Authorization header is attached
- Catch and handle failures
- Display friendly error message:
  “Export failed. Please make sure you are signed in and try again.”

Verification:
- Retry export
- Confirm no auth header error

────────────────────────
Phase 2.10 — Settings Page Completion
────────────────────────

Path:
frontend/src/app/(dashboard)/settings/page.tsx

Tasks:
- Read existing page content
- Implement:
  - Profile update form
  - Password change form
  - Theme preferences
  - Notification toggles (UI-only)
  - Account deletion with confirmation only soft delete
- Ensure API calls use authenticated client

Verification:
- No empty sections
- Responsive layout
- Correct API usage

────────────────────────
Phase 2.11 — Tags Page Completion
────────────────────────

Path:
frontend/src/app/(dashboard)/tags/page.tsx

Tasks:
- Verify how tags are currently stored/used
- Implement CRUD UI:
  - Create
  - Read
  - Update
  - Delete
- Display task count per tag
- Ensure API calls are authenticated

Verification:
- CRUD works correctly
- Task counts accurate
- Responsive table

────────────────────────
Phase 2.12 — Branding & Polish
────────────────────────

Tasks:
- Add favicon
- Verify favicon loads correctly
- Visual consistency across sidebar & content
- SaaS-level spacing & typography

────────────────────────
Testing Strategy (Strict)
────────────────────────

- All API calls include Authorization header
- No “Missing Authorization header” errors
- No empty dashboard pages
- Responsive across devices
- Signin error always visible
- Keyboard shortcuts discoverable
- No backend or DB changes

────────────────────────
Quality Gate (Non-Negotiable)
────────────────────────

Phase 2 is COMPLETE ONLY IF:
- Existing files were read before changes
- API usage is verified against backend
- Authorization headers are correctly attached
- UI and UX meet professional SaaS standards

## Response snapshot

The planning phase is now complete, based on the instructions you provided.

**Branch**: `002-dashboard-ux-enhancements`

**Generated Artifacts**:
-   **Implementation Plan**: `specs/002-dashboard-ux-enhancements/plan.md`
-   **Research Summary**: `specs/002-dashboard-ux-enhancements/research.md`

I have finished the /sp.plan command and am ready for your next instruction.

## Outcome

- ✅ Impact: Successfully generated a detailed implementation plan and research summary.
- 🧪 Tests: No tests were run.
- 📁 Files: Created plan.md and research.md.
- 🔁 Next prompts: Awaiting user command, likely /sp.tasks or /sp.implement.
- 🧠 Reflection: The process was interrupted multiple times, requiring restarts. The final plan was generated successfully after the user clarified the intent was to plan only, not execute.

## Evaluation notes (flywheel)

- Failure modes observed: Interruption by user
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): null
- Next experiment (smallest change to try): N/A
