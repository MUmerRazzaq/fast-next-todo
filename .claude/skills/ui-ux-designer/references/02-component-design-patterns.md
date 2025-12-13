# 2. Component Design Patterns

This guide covers patterns for building robust and consistent components.

## Design Tokens

Design tokens are the single source of truth for visual styles. They are stored in CSS custom properties and/or a theme file (`assets/tokens/theme.ts`).

-   **Formats**: The skill provides templates for exporting tokens to CSS, JS, and JSON. See `assets/tokens/`.
-   **Usage**: Components should always use design tokens for color, spacing, typography, etc., instead of hard-coded values.

## Atomic Design

Structure components using the atomic design methodology to promote reusability.

-   **Atoms**: Basic building blocks (e.g., `Button`, `Input`, `Label`). See `assets/components/`.
-   **Molecules**: Groups of atoms (e.g., a search form with an input and a button).
-   **Organisms**: More complex components made of molecules (e.g., a site header).
-   **Templates**: Page-level structures (e.g., `DashboardLayout`). See `assets/layouts/`.

## Component Variants and States

Components must account for all possible states.

-   **Variants**: Different styles of a component (e.g., primary, secondary, ghost buttons). Use a library like `class-variance-authority` to manage variants. See `assets/components/Button.tsx` for an example.
-   **States**:
    -   `default`: The standard state.
    -   `hover`: When the user's cursor is over the component.
    -   `active`/`focus`: When the component is being interacted with or focused via keyboard.
    -   `disabled`: When the component is not interactive.
    -   `loading`: When the component is waiting for an action to complete.
    -   `error`: When the component is in an error state.

## Interactivity and Animation

-   **Micro-interactions**: Provide subtle feedback for user actions (e.g., button clicks).
-   **Focus States**: All interactive elements must have a clear focus indicator for keyboard navigation.
-   **Touch Targets**: Ensure interactive elements have a minimum size of 44x44px on mobile.
