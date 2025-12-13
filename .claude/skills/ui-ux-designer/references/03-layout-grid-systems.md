# 3. Layout & Grid Systems

This document provides guidelines for creating responsive and consistent layouts.

## Responsive Grids

-   **Flexbox & CSS Grid**: Use these modern CSS layout tools as the primary methods for building layouts. Tailwind CSS provides comprehensive utilities for both.
-   **12-Column Grid**: While not always necessary with Flexbox/Grid, a conceptual 12-column grid can be useful for complex layouts, especially for aligning content across different sections.

## Container Widths

-   **Fixed**: The container has a fixed `max-width` and is centered on the page.
-   **Fluid**: The container spans the full width of the viewport.
-   **Hybrid**: The container is fluid up to a certain breakpoint, then becomes fixed.

The `container` class in Tailwind can be configured for this in `tailwind.config.js`.

## Breakpoint System

-   **Mobile-First**: Design for mobile screens first, then use `min-width` media queries (e.g., `md:`, `lg:`) to add complexity for larger screens. This is the default approach in Tailwind CSS.
-   **Standard Breakpoints**: Use a standard set of breakpoints (e.g., `sm`, `md`, `lg`, `xl`, `2xl`) defined in `tailwind.config.js`.

## Whitespace

-   **Principle of Proximity**: Group related items closer together.
-   **Negative Space**: Use whitespace intentionally to reduce clutter and improve readability.
-   **Spacing Scale**: Always use the defined spacing scale from the design system for margins, padding, and gaps.

## Visual Hierarchy

Use a combination of size, color, spacing, and typography to guide the user's eye and indicate the importance of different elements.

## Z-Index Management

For complex layouts with overlapping elements (modals, dropdowns, sticky headers), establish a z-index scale in `tailwind.config.js` to avoid conflicts.

-   `10`: Dropdowns, popovers
-   `20`: Sticky headers/footers
-   `30`: Drawers, sidebars
-   `40`: Modals
-   `50`: Toasts, notifications
