# 4. User Flow & Interaction Design

This guide covers best practices for designing intuitive user flows and interactions.

## Information Architecture

-   **Navigation**: Design clear and consistent navigation patterns. See `references/10-ui-pattern-library.md` for examples like top navs, side navs, and breadcrumbs.
-   **Menu Structures**: Organize menu items logically. Use progressive disclosure for complex menus.

## Form Design

-   **Grouping**: Group related fields into sections (`fieldset`).
-   **Progressive Disclosure**: For long forms, consider breaking them into multiple steps with a progress indicator.
-   **Clear Labels**: Every input must have a corresponding `<label>`. See `assets/components/Label.tsx`.
-   **Validation**: Provide clear, inline validation feedback. Indicate which fields are required.

## Feedback Patterns

Provide immediate and clear feedback for user actions.

-   **Error Prevention**: Design interfaces that prevent errors in the first place (e.g., disabling a submit button until a form is valid).
-   **Error Messages**: When errors occur, display helpful, human-readable messages.
-   **Loading States**:
    -   `Spinners`: For short, indeterminate waits.
    -   `Skeletons`: To show the shape of the content that is loading.
    -   `Progress Bars`: For longer, determinate processes.
-   **Empty States**: Design for when there is no data to display. An empty state should explain what the content is and how to create it.
-   **Success/Confirmation**:
    -   `Toasts/Notifications`: For non-modal feedback.
    -   `Modals`: For critical confirmations.
    -   `Inline Messages`: For context-specific feedback.
