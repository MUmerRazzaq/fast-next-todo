# 5. Accessibility (a11y) Standards

This document provides a checklist for ensuring compliance with WCAG 2.1 Level AA.

## Semantic HTML

-   **Landmarks**: Use HTML5 landmark elements (`<main>`, `<nav>`, `<header>`, `<footer>`, `<aside>`) to structure the page.
-   **Heading Hierarchy**: Ensure headings (`<h1>` - `<h6>`) are in a logical order and not used for purely stylistic purposes.
-   **Lists**: Use `<ul>`, `<ol>`, and `<dl>` for lists.

## ARIA (Accessible Rich Internet Applications)

-   **Use Sparingly**: Use native HTML elements first. Only use ARIA when an element's semantics cannot be conveyed natively.
-   **Roles**: Use ARIA roles (e.g., `role="dialog"`) for custom components that don't have a native HTML equivalent.
-   **Labels & Descriptions**: Use `aria-label` or `aria-labelledby` to provide accessible names for elements that need them (e.g., an icon-only button).

## Color & Contrast

-   **Text Contrast**: Text should have a contrast ratio of at least `4.5:1` against its background.
-   **UI Element Contrast**: UI elements like buttons and icons should have a contrast ratio of at least `3:1`.
-   **Tools**: Use browser developer tools or online contrast checkers to validate color choices.
-   **Don't Rely on Color Alone**: Convey information using more than just color (e.g., use an icon and text for an error message).

## Keyboard Navigation

-   **All functionality** must be accessible via keyboard.
-   **Logical Tab Order**: The focus order should follow the visual flow of the page.
-   **Focus Indicators**: All interactive elements must have a visible focus state.
-   **Custom Components**: For custom components like modals or dropdowns, manage focus appropriately (e.g., trap focus within a modal).
-   **Standard Keys**: Use standard keys for interactions (`Enter`/`Space` to activate buttons, `Escape` to close modals, arrow keys for menus).

## Screen Reader Testing

-   **Test Regularly**: Use a screen reader (e.g., VoiceOver on macOS, NVDA on Windows) to test components and user flows.
-   **Check for**:
    -   All interactive elements are focusable and have accessible names.
    -   Images have appropriate `alt` text.
    -   Form inputs are correctly associated with their labels.
