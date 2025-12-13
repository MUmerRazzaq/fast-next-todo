# 9. Design Handoff & Prototyping

This guide covers the process of translating design artifacts into code.

## Figma/Sketch to Code

-   **Design Tokens**: Extract design tokens (colors, fonts, spacing) from the design file as the single source of truth. There are plugins and tools that can automate this.
-   **Naming Conventions**: Ensure component names in the codebase match the names in the design file to create a shared language between designers and developers.

## Responsive Behavior

-   Design files should include mockups for different breakpoints (mobile, tablet, desktop).
-   Annotations in the design file should clarify responsive behavior that is not obvious from the mockups.

## Interactive Prototyping

-   **Storybook**: Use Storybook to create an interactive component library. This serves as living documentation and a playground for testing components in isolation.
-   The asset components provided in this skill are a starting point for a Storybook library.

## Design-Dev Feedback Loop

-   Establish a clear process for designers to review implemented UI and provide feedback.
-   Tools like Chromatic or Percy for visual regression testing can help automate this.

## Visual Regression Testing

-   Set up automated visual regression testing to catch unintended UI changes.
-   Integrate this into your CI/CD pipeline to run on every pull request.
-   This ensures that changes to one component don't unexpectedly break another.
