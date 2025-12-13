# 11. Performance & Optimization

This guide outlines best practices for building a performant UI.

## CSS Optimization

-   **Critical CSS**: Consider inlining critical CSS (the CSS needed for the above-the-fold content) to improve First Contentful Paint (FCP).
-   **Purge Unused Styles**: Use Tailwind's `purge` (`content` in v3+) option to remove unused CSS classes from the production build, significantly reducing file size. The provided `tailwind.config.ts` is already configured for this.

## Image Optimization

-   **Next-Gen Formats**: Serve images in modern formats like `WebP` or `AVIF`.
-   **Responsive Images**: Use `srcset` to provide different image sizes for different screen resolutions.
-   **Lazy Loading**: Lazy load images that are below the fold to speed up initial page load.

## Font Loading

-   **FOUT/FOIT Prevention**:
    -   `font-display: swap;`: Tells the browser to use a fallback font while the custom font is loading.
    -   Preload key fonts: `<link rel="preload" href="/fonts/myfont.woff2" as="font" type="font/woff2" crossorigin>`.

## Animation Performance

-   **60fps**: Strive for 60 frames per second animations for a smooth user experience.
-   **Animate `transform` and `opacity`**: These properties are hardware-accelerated and less costly to animate. Avoid animating layout properties like `width`, `height`, or `margin`.

## Bundle Size

-   **Monitor**: Regularly check your JavaScript bundle size using tools like Webpack Bundle Analyzer.
-   **Code Splitting**: Split your code into smaller chunks (e.g., by route or component) that can be loaded on demand.
-   **Tree Shaking**: Ensure your build process is configured to remove unused code (tree-shake).

## Lazy Loading Content

-   Not just for images. Lazy load components, sections of the page, or any resource that is not needed for the initial view. Use `React.lazy` and `Suspense` or framework-specific features (like `next/dynamic`).
