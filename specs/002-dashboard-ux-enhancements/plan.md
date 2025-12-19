# Plan: Dashboard UX Enhancements

This document outlines the execution plan for the Dashboard UX Enhancements feature. It incorporates all approved user stories, UI/UX enhancements, accessibility requirements, and authentication integration verification.

## CRITICAL EXECUTION RULES (MANDATORY)

Before executing or modifying any task, MUST:

1.  Read the existing frontend and backend codebases.
2.  Inspect current API utilities, hooks, and fetch/axios wrappers.
3.  Verify how JWT tokens are retrieved and attached.
4.  Validate frontend API calls against backend FastAPI routes.
5.  Read relevant documentation where behavior is unclear.
6.  Avoid re-implementing working logic.
7.  Modify only what is necessary to satisfy requirements.

No assumptions. No blind refactors.

## System Architecture (Locked)

- **Frontend**:
  - Next.js 16+ (App Router)
  - Dashboard route group: `(dashboard)`
  - Better Auth for authentication
  - JWT-based Authorization headers
- **Backend**:
  - FastAPI
  - JWT verification middleware
  - REST API endpoints scoped by authenticated user
- **Database**:
  - Neon Serverless PostgreSQL
  - No schema changes in Phase 2

## Execution Phases

### Phase 2.1 — Codebase & API Integration Audit

- **Objective**: Ensure frontend and backend integration is correct before UI changes.
- **Activities**:
  - Read frontend API client implementation.
  - Identify missing or inconsistent Authorization headers.
  - Verify endpoint paths and HTTP methods.
  - Cross-check backend auth enforcement.
  - Document discrepancies before fixing.
- **Deliverable**: Verified API integration baseline.

### Phase 2.2 — Authenticated API Client Hardening

- **Objective**: Guarantee all authenticated API requests include valid JWT tokens.
- **Activities**:
  - Centralize Authorization header injection.
  - Remove duplicated auth logic.
  - Ensure export, tags, settings, and tasks APIs use the authenticated client.
  - Handle missing or expired tokens gracefully.
- **Validation**:
  - Browser network inspection.
  - No “Missing Authorization header” errors.

### Phase 2.3 — Error Handling & Security Validation

- **Objective**: Ensure consistent, user-friendly, and secure error handling.
- **Activities**:
  - Standardize API error states.
  - Implement sign-in error message: "Invalid credentials".
  - Prevent exposure of backend or security details.
  - Validate password change error handling.

### Phase 2.4 — Dashboard Layout & Responsiveness

- **Objective**: Refactor UI into a full-bleed, responsive SaaS dashboard.
- **Activities**:
  - Full-width fluid layout.
  - Fixed-height, independently scrollable sidebar.
  - Collapsible sidebar (icon rail on desktop).
  - Overlay drawer on mobile.
  - Independent scrolling main content.
  - Distinct visual separation between sidebar and dashboard.
- **Validation**:
  - Desktop, tablet, and mobile breakpoints.
  - No scroll bleed or layout regression.

### Phase 2.5 — Task List UX Enhancements

- **Objective**: Improve task clarity, interaction, and urgency signaling.
- **Activities**:
  - Active tasks sorted to top by default.
  - Fully clickable task cards.
  - Hover and focus states.
  - Context menu ("…") actions.
  - Due date aligned right on desktop.
  - Overdue task visual emphasis.
  - Long text truncation with ellipsis.

### Phase 2.6 — Smart Filters & Sidebar Enhancements

- **Objective**: Increase task visibility and control.
- **Activities**:
  - Dynamic numeric badges (Active, High, Overdue).
  - Live updates based on filters.
  - Verify filter accuracy against backend data.

### Phase 2.7 — Keyboard Shortcuts & Discoverability

- **Objective**: Ensure productivity shortcuts are usable and discoverable.
- **Activities**:
  - Verify existing shortcuts (J/K, N, E, Delete, Ctrl+Enter).
  - Verify '?' help dialog functionality.
  - Add visible UI entry for shortcuts help.
  - Ensure keyboard-only accessibility.

### Phase 2.8 — Settings Page Completion

- **Path**: `frontend/src/app/(dashboard)/settings/page.tsx`
- **Activities**:
  - User profile update.
  - Password change.
  - Theme preference (light/dark/system).
  - Notification toggles (UI-level).
  - Account deletion with confirmation.
  - Authenticated API usage verification.

### Phase 2.9 — Tags Page Completion

- **Path**: `frontend/src/app/(dashboard)/tags/page.tsx`
- **Activities**:
  - Full CRUD UI for tags.
  - Optional color selection.
  - Task count per tag.
  - Confirmation dialogs.
  - Authenticated API usage verification.

### Phase 2.10 — Export Function Validation

- **Objective**: Ensure export works reliably with auth.
- **Activities**:
  - Verify export API call includes Authorization header.
  - Graceful failure messaging.
  - Retry behavior.

### Phase 2.11 — Accessibility Audit & Compliance (WCAG 2.1 AA)

- **Objective**: Ensure accessibility compliance for all modified UI.
- **Activities**:
  - Keyboard navigation audit.
  - ARIA roles and labels.
  - Color contrast validation.
  - Screen reader spot checks.
  - Modal and dialog accessibility.
- **Constraints**:
  - No visual redesign beyond compliance fixes.

### Phase 2.12 — Branding & Polish

- **Activities**:
  - Add favicon.
  - Final visual consistency pass.
  - Typography and spacing polish.

## Testing & Validation Strategy

- All API requests include Authorization headers.
- No unauthorized access to user data.
- No empty dashboard pages.
- All pages responsive.
- Accessibility requirements met.
- Sign-in errors always visible.
- Keyboard shortcuts verified.

## Quality Gate (Non-Negotiable)

Phase 2 is considered complete ONLY IF:

- Existing files were read before changes.
- API usage is verified against backend.
- Authorization headers are correctly attached.
- UI and UX meet professional SaaS standards.
- Accessibility phase is executed.
- No backend or database changes were required.
