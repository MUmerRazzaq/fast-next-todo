# Accessibility Testing Checklist

## Touch & Pointer

- [ ] Interactive elements >= 44x44px (WCAG AAA) or >= 24x24px (AA)
- [ ] Min 8px spacing between adjacent targets
- [ ] `touch-manipulation` on buttons/links (prevents 300ms delay)
- [ ] No hover-only interactions on mobile

## Keyboard

- [ ] All interactive elements focusable via Tab
- [ ] Visible focus indicators (`focus:ring-2 focus:ring-offset-2`)
- [ ] Escape closes modals/dropdowns
- [ ] Focus trapped in modals when open
- [ ] Focus returns to trigger when modal closes

## Screen Readers

- [ ] Images have meaningful `alt` text (or `alt=""` if decorative)
- [ ] Form inputs have associated `<label>`
- [ ] Buttons have accessible names (text or `aria-label`)
- [ ] `aria-expanded` on toggles (menus, accordions)
- [ ] `role="dialog"` and `aria-modal="true"` on modals
- [ ] Skip link to main content: `<a href="#main" class="sr-only focus:not-sr-only">`

## Color & Contrast

- [ ] Text contrast ratio >= 4.5:1 (normal text) or >= 3:1 (large text)
- [ ] UI components contrast >= 3:1 against background
- [ ] Information not conveyed by color alone
- [ ] Dark mode maintains contrast ratios

## Responsive

- [ ] Content readable at 320px width (no horizontal scroll)
- [ ] Text resizable to 200% without content loss
- [ ] Touch targets remain accessible at all breakpoints
- [ ] Orientation changes don't break layout

## Motion

- [ ] Respect `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
  ```
- [ ] No auto-playing video/audio without controls

## Testing Tools

| Tool | Purpose |
|------|---------|
| axe DevTools | Automated a11y audit |
| WAVE | Visual a11y feedback |
| Lighthouse | Performance + a11y |
| VoiceOver/NVDA | Screen reader testing |
| Chrome DevTools | Device emulation, contrast check |

## Quick Tailwind A11y Classes

```html
<!-- Screen reader only (skip links, labels) -->
<span class="sr-only">Hidden text</span>

<!-- Show on focus (skip links) -->
<a href="#main" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4">
  Skip to content
</a>

<!-- Focus styles -->
<button class="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Accessible Button
</button>

<!-- Reduced motion -->
<div class="transition-transform motion-reduce:transition-none">
  Animates unless reduced motion preferred
</div>
```
