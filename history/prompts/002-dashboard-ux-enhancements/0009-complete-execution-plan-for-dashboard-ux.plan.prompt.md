---
id: 0009
title: Complete execution plan for dashboard UX
stage: plan
date: 2025-12-19
surface: agent
model: claude-sonnet-4-5-20250929
feature: 002-dashboard-ux-enhancements
branch: 002-dashboard-ux-enhancements
user: coder
command: /sp.plan
labels: [plan, dashboard, ux]
links:
  spec: specs/002-dashboard-ux-enhancements/spec.md
  ticket: null
  adr: null
  pr: null
files:
- specs/002-dashboard-ux-enhancements/plan.md
tests:
- "N/A"
---

## Prompt

Purpose:
Produce a complete, end-to-end execution plan of the application that incorporates all approved user stories, UI/UX enhancements, accessibility requirements, authentication integration verification, and dashboard page completion.

This plan supersedes any previous plan versions and is intended to be the final authoritative execution plan. It must remain fully aligned with the existing specification, tasks, architecture, and codebase.

────────────────────────
CRITICAL EXECUTION RULES (MANDATORY)
────────────────────────

Before executing or modifying any task, Claude Code MUST:

1. Read the existing frontend and backend codebases
2. Inspect current API utilities, hooks, and fetch/axios wrappers
3. Verify how JWT tokens are retrieved and attached
4. Validate frontend API calls against backend FastAPI routes
5. Read relevant documentation where behavior is unclear
6. Avoid re-implementing working logic
7. Modify only what is necessary to satisfy requirements

No assumptions. No blind refactors.

────────────────────────
System Architecture (Locked)
────────────────────────

Frontend:
- Next.js 16+ (App Router)
- Dashboard route group: (dashboard)
- Better Auth for authentication
- JWT-based Authorization headers

Backend:
- FastAPI
- JWT verification middleware
- REST API endpoints scoped by authenticated user

Database:
- Neon Serverless PostgreSQL
- No schema changes in Phase 2

────────────────────────
Execution Phases
────────────────────────

────────────────────────
Phase 2.1 — Codebase & API Integration Audit
────────────────────────

Objective:
Ensure frontend and backend integration is correct before UI changes.

Activities:
- Read frontend API client implementation
- Identify missing or inconsistent Authorization headers
- Verify endpoint paths and HTTP methods
- Cross-check backend auth enforcement
- Document discrepancies before fixing

Deliverable:
- Verified API integration baseline

────────────────────────
Phase 2.2 — Authenticated API Client Hardening
────────────────────────

Objective:
Guarantee all authenticated API requests include valid JWT tokens.

Activities:
- Centralize Authorization header injection
- Remove duplicated auth logic
- Ensure export, tags, settings, and tasks APIs use the authenticated client
- Handle missing or expired tokens gracefully

Validation:
- Browser network inspection
- No “Missing Authorization header” errors

────────────────────────
Phase 2.3 — Error Handling & Security Validation
────────────────────────

Objective:
Ensure consistent, user-friendly, and secure error handling.

Activities:
- Standardize API error states
- Implement sign-in error message:
  "Invalid credentials"
- Prevent exposure of backend or security details
- Validate password change error handling

────────────────────────
Phase 2.4 — Dashboard Layout & Responsiveness
────────────────────────

Objective:
Refactor UI into a full-bleed, responsive SaaS dashboard.

Activities:
- Full-width fluid layout
- Fixed-height, independently scrollable sidebar
- Collapsible sidebar (icon rail on desktop)
- Overlay drawer on mobile
- Independent scrolling main content
- Distinct visual separation between sidebar and dashboard

Validation:
- Desktop, tablet, and mobile breakpoints
- No scroll bleed or layout regression

────────────────────────
Phase 2.5 — Task List UX Enhancements
────────────────────────

Objective:
Improve task clarity, interaction, and urgency signaling.

Activities:
- Active tasks sorted to top by default
- Fully clickable task cards
- Hover and focus states
- Context menu ("…") actions
- Due date aligned right on desktop
- Overdue task visual emphasis
- Long text truncation with ellipsis

────────────────────────
Phase 2.6 — Smart Filters & Sidebar Enhancements
────────────────────────

Objective:
Increase task visibility and control.

Activities:
- Dynamic numeric badges (Active, High, Overdue)
- Live updates based on filters
- Verify filter accuracy against backend data

────────────────────────
Phase 2.7 — Keyboard Shortcuts & Discoverability
────────────────────────

Objective:
Ensure productivity shortcuts are usable and discoverable.

Activities:
- Verify existing shortcuts (J/K, N, E, Delete, Ctrl+Enter)
- Verify '?' help dialog functionality
- Add visible UI entry for shortcuts help
- Ensure keyboard-only accessibility

────────────────────────
Phase 2.8 — Settings Page Completion
────────────────────────

Path:
frontend/src/app/(dashboard)/settings/page.tsx

Activities:
- User profile update
- Password change
- Theme preference (light/dark/system)
- Notification toggles (UI-level)
- Account deletion with confirmation
- Authenticated API usage verification

────────────────────────
Phase 2.9 — Tags Page Completion
────────────────────────

Path:
frontend/src/app/(dashboard)/tags/page.tsx

Activities:
- Full CRUD UI for tags
- Optional color selection
- Task count per tag
- Confirmation dialogs
- Authenticated API usage verification

────────────────────────
Phase 2.10 — Export Function Validation
────────────────────────

Objective:
Ensure export works reliably with auth.

Activities:
- Verify export API call includes Authorization header
- Graceful failure messaging
- Retry behavior

────────────────────────
Phase 2.11 — Accessibility Audit & Compliance (WCAG 2.1 AA)
────────────────────────

Objective:
Ensure accessibility compliance for all modified UI.

Activities:
- Keyboard navigation audit
- ARIA roles and labels
- Color contrast validation
- Screen reader spot checks
- Modal and dialog accessibility

Constraints:
- No visual redesign beyond compliance fixes

────────────────────────
Phase 2.12 — Branding & Polish
────────────────────────

Activities:
- Add favicon
- Final visual consistency pass
- Typography and spacing polish

────────────────────────
Testing & Validation Strategy
────────────────────────

- All API requests include Authorization headers
- No unauthorized access to user data
- No empty dashboard pages
- All pages responsive
- Accessibility requirements met
- Sign-in errors always visible
- Keyboard shortcuts verified

────────────────────────
Quality Gate (Non-Negotiable)
────────────────────────

Phase 2 is considered complete ONLY IF:
- Existing files were read before changes
- API usage is verified against backend
- Authorization headers are correctly attached
- UI and UX meet professional SaaS standards
- Specification issues (A1–A5) are resolved
- Accessibility phase is executed
- /sp.analyze reports no HIGH or MEDIUM severity issues
- No backend or database changes were required

## Response snapshot

I have successfully generated the execution plan and saved it to `specs/002-dashboard-ux-enhancements/plan.md`. I have also created this Prompt History Record.

## Outcome

- ✅ Impact: The execution plan for the 'Dashboard UX Enhancements' feature was created.
- 🧪 Tests: No tests were run.
- 📁 Files: `plan.md` was created with the full execution plan.
- 🔁 Next prompts: Next step is to start implementing Phase 2.1 of the plan: Codebase & API Integration Audit.
- 🧠 Reflection: The user provided a very detailed plan, which made the process straightforward. The main task was to ensure the plan was correctly saved to the right file and the PHR was generated.

## Evaluation notes (flywheel)

- Failure modes observed: None observed.
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
