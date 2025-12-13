# 10. UI Pattern Library

This document describes common UI patterns and when to use them.

## Navigation
- **Top Nav**: For main site navigation, usually on larger screens.
- **Side Nav**: For app-like interfaces with many sections, like a dashboard.
- **Breadcrumbs**: To show the user's location in a nested hierarchy.
- **Tabs**: To switch between different views within the same context.
- **Pagination**: To break up long lists of items into separate pages.

## Data Display
- **Tables**: For dense, structured data that needs to be scanned and compared.
- **Cards**: For collections of items that have mixed media (images, text) and actions.
- **Lists**: For simple lists of items.
- **Grids**: For visually-driven collections, like a photo gallery.

## Inputs
- **Text Fields**: For freeform text entry.
- **Selects/Dropdowns**: For selecting from a list of options.
- **Checkboxes**: For selecting one or more options from a list.
- **Radio Buttons**: For selecting a single option from a list.
- **Switches/Toggles**: For binary on/off states.
- **Sliders**: For selecting a value from a continuous range.

## Feedback
- **Alerts/Banners**: For persistent, page-level messages.
- **Toasts/Snackbars**: For temporary, non-critical feedback (e.g., "Item saved").
- **Modals**: For critical information or actions that require the user's full attention.
- **Tooltips**: To provide additional information on hover.
- **Popovers**: For more complex content that appears on click.

## Actions
- **Buttons**: For primary, secondary, and other actions. See `assets/components/Button.tsx`.
- **Button Groups**: To group related actions together.
- **Floating Action Buttons (FABs)**: For a primary, persistent action on a screen.

## Overlays
- **Modals**: A dialog that disables the main content.
- **Drawers/Bottom Sheets**: Panels that slide in from the side or bottom of the screen.

## Progress
- **Progress Bars**: For determinate loading processes.
- **Spinners/Loading Indicators**: For indeterminate loading.
- **Steppers**: To show progress through a multi-step process.
- **Skeleton Screens**: To show the shape of the UI while content is loading.
