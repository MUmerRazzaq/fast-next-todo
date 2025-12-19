---
description: "Task list for Dashboard UX Enhancements feature implementation"
---

# Tasks: Dashboard UX Enhancements

**Input**: Design documents from `/specs/002-dashboard-ux-enhancements/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project readiness.

- [x] T001 Verify frontend and backend development environments are running correctly.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure and critical fixes that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T002 [US4] Refactor `frontend/src/components/tasks/export-button.tsx` to use the central authenticated client from `frontend/src/lib/api-client.ts` to fix export errors.
- [x] T003 [US4] Implement "Invalid credentials" error message on the Sign In page `frontend/src/app/auth/sign-in/page.tsx`.
- [x] T004 [US3] Ensure user theme preference is persisted in `localStorage` and applied on load via `frontend/src/components/theme-provider.tsx`.

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - Professional and Responsive Dashboard Layout (Priority: P1) 🎯 MVP

**Goal**: Implement a professional, modern, and fully responsive dashboard layout for a seamless experience on both desktop and mobile devices.

**Independent Test**: The main dashboard layout can be tested for responsiveness across different screen sizes. The sidebar's collapsible and overlay behavior can be verified independently.

### Implementation for User Story 1

- [x] T005 [P] [US1] Implement a full-viewport, two-column layout in `frontend/src/app/(dashboard)/layout.tsx` with a fixed sidebar and scrollable main content area.
- [x] T006 [P] [US1] Create the collapsible sidebar component `frontend/src/components/dashboard/sidebar.tsx` with desktop (expanded/collapsed) and mobile (overlay) states.
- [x] T007 [US1] Integrate the sidebar into the main dashboard layout, ensuring state (collapsed/expanded) is managed and persisted.
- [x] T008 [US1] Ensure the main content area `(dashboard)/page.tsx` scrolls independently of the sidebar.
- [x] T009 [US1] Add responsive breakpoints to adapt the layout for tablet and mobile views, hiding the sidebar by default on smaller screens.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Clear and Actionable Task List (Priority: P1)

**Goal**: Create a clear and organized task list that visually distinguishes task states and provides easy access to actions.

**Independent Test**: The task list's sorting, grouping, and visual states can be tested with mock data.

### Implementation for User Story 2

- [x] T010 [P] [US2] Update the task list fetching logic in `frontend/src/app/(dashboard)/page.tsx` to sort active tasks to the top and group completed tasks below.
- [x] T011 [P] [US2] Create a `TaskCard` component in `frontend/src/components/tasks/task-card.tsx` with distinct visual styles for active, completed, and overdue states.
- [x] T012 [P] [US2] Implement hover/focus states and a "..." context menu button on the `TaskCard` component.
- [x] T013 [US2] Implement dynamic numeric badges for "Active", "High Priority", and "Overdue" filters in the `frontend/src/components/dashboard/sidebar.tsx`.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - Complete and Functional Dashboard Pages (Priority: P1)

**Goal**: Deliver functional Settings and Tags pages to complete the core dashboard experience.

**Independent Test**: The Settings and Tags pages can be developed and tested independently. UI interactions can be tested without backend changes initially.

### Implementation for User Story 3

- [x] T014 [P] [US3] Build the Settings page UI at `frontend/src/app/(dashboard)/settings/page.tsx` with forms for Profile (Name, Email), Password Change, and Theme Preference.
- [x] T015 [P] [US3] Implement the client-side logic for the theme toggle on the Settings page.
- [x] T016 [P] [US3] Build the Tags page UI at `frontend/src/app/(dashboard)/tags/page.tsx` to display a list of tags and include a form for creating new tags.
- [x] T017 [US3] Implement the "Create" functionality for tags, handling the case where a tag already exists.
- [x] T018 [US3] Implement the "Update" and "Delete" functionality for tags, including confirmation dialogs.
- [x] T019 [P] [US3] Display a helpful message and a "Create New Tag" button on the Tags page when no tags exist.
- [x] T020 [US3] Implement the error handling for an incorrect current password on the password change form as per FR-012.

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: User Story 4 - Seamless Usability and Minor Fixes (Priority: P2)

**Goal**: Improve the overall user experience with polish and clear feedback.

**Independent Test**: Each item can be tested independently.

### Implementation for User Story 4

- [x] T021 [P] [US4] Create a discoverable help dialog for keyboard shortcuts, accessible from a help icon in the UI.
- [ ] T022 [P] [US4] Create and add a favicon (`favicon.ico` and `apple-touch-icon.png`) to `frontend/public/` that is visible in both light and dark modes, and link it in `frontend/src/app/layout.tsx`.
- [x] T023 [P] [US4] Implement graceful error handling for the export function using a non-blocking toast notification.

---

## Phase 7: Final Validation & Polish

**Purpose**: Ensure cross-cutting concerns like accessibility and final polish are addressed.

- [x] T024 Perform an accessibility audit (WCAG 2.1 AA) on all new and modified components, including keyboard navigation, ARIA roles, and color contrast.
- [x] T025 Review all pages for visual consistency, correct text wrapping, and spacing.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories.
- **User Stories (Phase 3+)**: All depend on Foundational phase completion.
- **Final Validation (Phase 7)**: Depends on all user stories being complete.

### User Story Dependencies

- All user stories (US1, US2, US3, US4) can be worked on in parallel after the Foundational phase is complete.

### Parallel Opportunities

- Tasks marked with `[P]` can be executed in parallel within their respective phases.
- Once the Foundational phase is complete, different developers can take on different User Stories simultaneously.
