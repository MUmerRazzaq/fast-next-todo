# 1. Design System Foundation

This document outlines the foundational elements of the design system.

## Color Palette

The color system is based on CSS custom properties, allowing for easy theming (e.g., dark mode).

-   **Primary**: Main brand colors for primary actions.
-   **Secondary**: Used for less prominent actions.
-   **Accent**: For highlights and secondary information.
-   **Semantic Colors**:
    -   `destructive`: For error states and destructive actions.
    -   `success`: For success states.
    -   `warning`: For warnings.
    -   `info`: For informational messages.

The colors are defined in `assets/theme/global.css` and consumed by `tailwind.config.js`.

## Typography

A responsive typography scale should be established in `tailwind.config.js`.

-   **Headings**: A hierarchy from `h1` to `h6`.
-   **Body Text**: For main content.
-   **Captions/Subtext**: For less important information.

Use a base font size and scale other sizes using `rem` units for accessibility.

## Spacing

A consistent spacing scale based on a 4px or 8px grid should be used for all margins, paddings, and layout gaps. This is configured in the `spacing` section of `tailwind.config.js`.

## Border Radius & Shadows

-   **Border Radius**: A scale (`sm`, `md`, `lg`) is defined in `tailwind.config.js` using CSS variables for consistency.
-   **Shadows**: A set of elevation levels should be defined to create a sense of depth and hierarchy.

## Icons

-   **Library**: Integrate a tree-shakeable icon library like `lucide-react`.
-   **Custom Icons**: Establish guidelines for creating custom SVG icons to ensure consistency in style, stroke width, and size.
