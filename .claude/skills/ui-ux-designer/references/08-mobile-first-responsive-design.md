# 8. Mobile-First & Responsive Design

This guide outlines the approach to building interfaces that work across all screen sizes.

## Mobile-First Approach

-   **Start Small**: Begin by designing and building for the smallest screen size (mobile).
-   **Progressive Enhancement**: Add more complex features and layout adjustments for larger screens using `min-width` media queries (e.g., `md:`, `lg:` in Tailwind).

## Navigation Patterns

-   **Mobile**: Use patterns like a hamburger menu, a bottom navigation bar, or a slide-out drawer.
-   **Desktop**: As screen size increases, navigation can become more visible, e.g., a top navigation bar or a persistent sidebar.

## Touch Gesture Support

-   Ensure interactive elements have adequate touch target sizes (minimum 44x44px).
-   Implement touch gestures like swipe for carousels or pinch-to-zoom for images where appropriate.

## Responsive Images

-   **`srcset` attribute**: Provide multiple image sizes to allow the browser to select the most appropriate one.
-   **`<picture>` element**: Use for art direction, where you need to show a different image crop or aspect ratio at different breakpoints.
-   **Modern Formats**: Use next-gen image formats like `WebP` and `AVIF` for better compression.

## Viewport Meta Tag

Ensure the following meta tag is present in the `<head>` of your HTML to control the viewport's size and scale.

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

## Performance Optimization

-   **Lazy Loading**: Lazy load images and other media that are below the fold.
-   **Code Splitting**: Split your code by route or component to reduce the initial bundle size.

## Safe Area Insets

For devices with notches or dynamic islands, use CSS environment variables (`safe-area-inset-top`, `safe-area-inset-right`, etc.) to ensure content is not obscured.
