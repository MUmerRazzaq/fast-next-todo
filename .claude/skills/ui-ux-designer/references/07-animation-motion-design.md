# 7. Animation & Motion Design

This guide provides principles for creating meaningful and performant animations.

## Principles

-   **Purposeful**: Animation should guide the user, provide feedback, and improve the user experience, not just be decorative.
-   **Easing**: Use easing functions (e.g., `ease-in-out`, `ease-out`) to make animations feel more natural. Avoid linear motion.
-   **Duration**: Keep animations short and snappy (typically between 100ms and 300ms).

## Micro-interactions

Use subtle animations for small interactions to provide feedback.
-   Button clicks (e.g., a slight scale transform).
-   Form submissions (e.g., a spinner appearing).
-   Navigation link clicks.

## Page Transitions

Use libraries like `framer-motion` to create smooth transitions between pages (e.g., fade, slide). This can help create a more fluid, app-like experience.

## Loading & Skeleton Animations

-   Use subtle pulsing or shimmer animations for skeleton loaders to indicate that content is loading.

## Scroll-triggered Animations

-   Use the `IntersectionObserver` API to trigger animations as elements enter the viewport.
-   Use this technique sparingly to highlight key information, not to animate everything on the page.

## Reduced Motion

-   Always respect the `prefers-reduced-motion` media query. Disable or reduce non-essential animations when this preference is enabled.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

## Performance

-   **CSS Transforms**: Prefer animating `transform` (`translate`, `scale`, `rotate`) and `opacity` as they are hardware-accelerated and don't trigger browser reflows.
-   **`will-change`**: Use the `will-change` CSS property as a hint to the browser that an element will be animated, but use it sparingly.
-   **Animation Libraries**: Use performant animation libraries like `Framer Motion` or `GSAP`.
