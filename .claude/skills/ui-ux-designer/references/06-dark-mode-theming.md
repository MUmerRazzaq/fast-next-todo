# 6. Dark Mode & Theming

This guide covers the implementation of a robust dark mode and theming system.

## CSS Custom Properties

The core of the theming system is CSS custom properties (variables), defined in `assets/theme/global.css`.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... other light theme variables */
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... other dark theme variables */
}
```

Components use these variables via Tailwind's color configuration in `tailwind.config.js`.

## Color Palette Adaptation

-   **Avoid Simple Inversion**: Don't just invert colors. Dark mode palettes should be carefully chosen to reduce eye strain and maintain readability.
-   **Desaturate Colors**: Bright, saturated colors can be overwhelming in a dark theme. Use slightly desaturated versions.
-   **Maintain Contrast**: Ensure accessibility contrast ratios are met in both light and dark themes.

## User Preference Detection

-   **`prefers-color-scheme`**: Use the CSS media query to automatically apply the user's system preference.
-   **Manual Toggle**: Provide a UI control (e.g., a button or switch) to allow users to manually override their system preference.

## Theme Persistence

-   **`localStorage`**: Store the user's selected theme (`'light'`, `'dark'`, or `'system'`) in `localStorage` to persist their choice across sessions.
-   **Initial Load**: A script should run before the page renders to apply the saved theme, preventing a "flash of incorrect theme" (FOIT).

## Smooth Transitions

Apply a CSS transition to color and background-color properties on a global level to create a smooth animation when the theme changes.

```css
body {
  transition: color 0.2s, background-color 0.2s;
}
```

## Images & Icons

-   **CSS Filters**: Use CSS filters (`invert()`, `brightness()`) on images or icons that need to adapt to the theme.
-   **Separate Assets**: For complex images or logos, consider providing separate versions for light and dark themes.
