# 12. Design Tools & Technologies

This guide lists the recommended tools and technologies for this UI/UX design skill.

## Core Technologies

-   **Framework**: React 18+ with TypeScript.
-   **Styling**: Tailwind CSS 3+.
-   **Icons**: `lucide-react` (tree-shakeable and highly customizable).
-   **Animation**: `framer-motion` (a declarative and performant animation library for React).

## Styling Setup

-   **Tailwind CSS**: The provided `tailwind.config.ts` includes a custom theme structure.
-   **CSS-in-JS**: While Tailwind is primary, libraries like Styled Components or Emotion can be used for dynamic styles that are difficult to handle with Tailwind alone.
-   **`class-variance-authority`**: For creating component variants. See `assets/components/Button.tsx`.
-   **`clsx` & `tailwind-merge`**: For conditionally merging class names. See `assets/utils/cn.ts`.

## Documentation

-   **Storybook**: For creating an interactive component library and documentation.
-   **Docusaurus / Nextra**: For more extensive, static documentation sites.

## Design Tool Integration

-   **Figma Tokens Plugin**: To automate the process of syncing design tokens from Figma to code.
-   **Color Palette Generators**: Tools like `coolors.co` or `huemint.com` can help create color palettes.
-   **Contrast Checkers**: Use tools like WebAIM's Contrast Checker or browser devtools to ensure accessibility.
-   **Icon Optimization**: Use `SVGO` to optimize custom SVG icons.
