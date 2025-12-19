# Frontend Implementation Plan

**Branch**: `002-dashboard-ux-enhancements`
**Created**: 2025-12-19
**Status**: Planning

---

## Current Issues & Errors

### Issue 1: Duplicate Sidebars
**Location**: `/tasks` page
**Problem**: Two sidebars are rendered:
- Navigation Sidebar (`layout.tsx` → `components/dashboard/sidebar.tsx`)
- Filter Sidebar (`tasks/page.tsx` → `components/tasks/filter-sidebar.tsx`)

**Visual (Current - Broken)**:
```
┌──────────┐┌──────────┐┌─────────────────────┐
│ Nav      ││ Filter   ││ Task List           │
│ Sidebar  ││ Sidebar  ││                     │
│          ││          ││                     │
│ Tasks    ││ Status   ││                     │
│ Tags     ││ Priority ││                     │
│ Settings ││ Tags     ││                     │
└──────────┘└──────────┘└─────────────────────┘
```

**Solution**: Combine into single unified sidebar (Option A from discussion)

---

### Issue 2: Settings URL Inconsistency
**Problem**:
- Sidebar link: `/settings`
- Header UserButton (BetterAuth): `/accounts/setting` (or similar)

**Files Affected**:
- `components/dashboard/sidebar.tsx` - has `/settings` link
- `components/layout/user-button.tsx` - uses BetterAuth UserButton

**Solution**: Remove Settings from sidebar since it's accessible via header profile dropdown

---

### Issue 3: Filter Sidebar Disappears on ESC
**Location**: `app/(dashboard)/tasks/page.tsx:155-160`
**Problem**:
```tsx
{
  ...TASK_SHORTCUTS.ESCAPE,
  handler: () => {
    setShowCreateDialog(false);
    setShowShortcutsHelp(false);
    if (showFilters) {
      setShowFilters(false);  // <-- THIS IS THE PROBLEM
    }
  },
}
```

**Solution**: ESC should only close dialogs, not the filter sidebar

---

### Issue 4: Keyboard Shortcuts Not Fully Implemented
**Location**:
- `hooks/use-keyboard-shortcuts.ts` - defines shortcuts
- `components/layout/keyboard-shortcuts-dialog.tsx` - shows shortcuts help

**Problem**: Mismatch between defined and implemented shortcuts:

| Shortcut | Defined | Implemented | Working |
|----------|---------|-------------|---------|
| `?` | Show help | Yes | Yes |
| `n` | New task | Yes | Yes |
| `/` | Focus search | Yes | Partial |
| `j` | Navigate down | Yes | No |
| `k` | Navigate up | Yes | No |
| `e` | Edit task | Yes | No |
| `Delete` | Delete task | Yes | No |
| `Ctrl+Enter` | Toggle complete | Yes | No |
| `t` | Go to Tags | In dialog only | No |
| `s` | Go to Settings | In dialog only | No |
| `Escape` | Close dialog | Yes | Yes (but breaks filter) |

**Solution**:
1. Implement all shortcuts properly
2. Add task selection state for j/k/e/Delete
3. Align dialog with hook definitions

---

### Issue 5: No Dynamic Numbers on Filters
**Location**: `components/dashboard/sidebar.tsx`
**Problem**: Filters don't show task counts

**Solution**: Add counts to each filter item:
```
• Active Tasks    (24)
• High Priority    (5)
• Overdue          (2)
```

---

### Issue 6: Dashboard Shows All Tasks by Default
**Location**: `app/(dashboard)/tasks/page.tsx`
**Problem**: No default filter for uncompleted tasks

**Solution**: Set default filter to `isCompleted: false`

---

### Issue 7: Completed Tasks Don't Move/Hide
**Problem**: When task is completed, it stays in place instead of moving to completed section or hiding

**Current Behavior**: Task stays in list with strikethrough
**Expected Behavior**: Task should move to "Completed" section or be hidden based on filter

**Note**: Task toggle (complete/uncomplete) already works via `task-card.tsx:41-47`

---

## Target Layout (Option A - Unified Sidebar)

### Desktop View
```
┌─────────────────────────────────────────────────────────────────────┐
│ ☰ Fast Next Todo                              [?] [Profile ▼]      │
├─────────────────────┬───────────────────────────────────────────────┤
│                     │                                               │
│  📋 Todo App        │  Tasks                         [Export] [Add] │
│  ─────────────────  │  ┌─────────────────────────────────────────┐  │
│                     │  │ 🔍 Search tasks...                      │  │
│  NAVIGATION         │  └─────────────────────────────────────────┘  │
│  ─────────────────  │                                               │
│  📝 Tasks           │  ┌─────────────────────────────────────────┐  │
│  🏷️  Tags            │  │ □ Task 1                    Due: Dec 20 │  │
│                     │  │   Description...            [High] [...] │  │
│  ─────────────────  │  └─────────────────────────────────────────┘  │
│                     │                                               │
│  FILTERS (on /tasks)│  ┌─────────────────────────────────────────┐  │
│  ─────────────────  │  │ □ Task 2                    Due: Dec 22 │  │
│                     │  │   Description...                  [...] │  │
│  Status             │  └─────────────────────────────────────────┘  │
│  ○ All Tasks   (26) │                                               │
│  ● Active      (18) │  ─── Completed ───────────────────────────── │
│  ○ Completed    (8) │                                               │
│                     │  ┌─────────────────────────────────────────┐  │
│  Priority           │  │ ✓ Task 3 (strikethrough)              │  │
│  □ High         (5) │  └─────────────────────────────────────────┘  │
│  □ Medium      (10) │                                               │
│  □ Low          (3) │                                               │
│                     │                                               │
│  Tags               │                                               │
│  □ Work         (8) │                                               │
│  □ Personal     (6) │                                               │
│  □ Urgent       (2) │                                               │
│                     │                                               │
│  ─────────────────  │                                               │
│  ◀ Collapse         │                                               │
└─────────────────────┴───────────────────────────────────────────────┘
```

### Mobile View
```
┌─────────────────────────────────┐
│ ☰  Fast Next Todo    [?] [👤]  │
├─────────────────────────────────┤
│                                 │
│  Tasks              [+] [Export]│
│  ┌─────────────────────────────┐│
│  │ 🔍 Search...        [Filter]││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ □ Task 1                    ││
│  │   Due: Dec 20  [High]       ││
│  └─────────────────────────────┘│
│                                 │
│  ┌─────────────────────────────┐│
│  │ □ Task 2                    ││
│  │   Due: Dec 22               ││
│  └─────────────────────────────┘│
│                                 │
├─────────────────────────────────┤
│  📝 Tasks  🏷️ Tags              │  ← Bottom Nav
└─────────────────────────────────┘

Mobile Sidebar Overlay (on ☰ tap):
┌─────────────────────────────────┐
│ ✕  📋 Todo App                  │
├─────────────────────────────────┤
│  📝 Tasks                       │
│  🏷️  Tags                        │
│                                 │
│  ─────────────────              │
│  FILTERS                        │
│  Status                         │
│  ○ All  ● Active  ○ Completed  │
│  ...                            │
└─────────────────────────────────┘
```

---

## Implementation Tasks

### Task 1: Create Unified Sidebar Component
**File**: `components/dashboard/unified-sidebar.tsx` (new)

**Structure**:
```tsx
interface UnifiedSidebarProps {
  isCollapsed: boolean;
  onCollapse: () => void;
  // Filter props (only used on /tasks)
  filters?: TaskFilters;
  onFiltersChange?: (filters: TaskFilters) => void;
  filterCounts?: {
    all: number;
    active: number;
    completed: number;
    highPriority: number;
    overdue: number;
  };
  tags?: Tag[];
  className?: string;
}
```

**Behavior**:
- Always show: Navigation (Tasks, Tags)
- Contextually show: Filters section (only on `/tasks` route)
- Dynamic counts on all filter options
- Collapsible on desktop
- Overlay on mobile

---

### Task 2: Update Dashboard Layout
**File**: `app/(dashboard)/layout.tsx`

**Changes**:
1. Replace `Sidebar` import with `UnifiedSidebar`
2. Pass filter state and counts from context/props
3. Keep mobile overlay behavior

---

### Task 3: Refactor Tasks Page
**File**: `app/(dashboard)/tasks/page.tsx`

**Changes**:
1. Remove inline `FilterSidebar` component
2. Lift filter state to layout or use URL params
3. Set default filter: `isCompleted: false`
4. Fix ESC key handler (don't close filters)
5. Group tasks: Active first, then Completed section

---

### Task 4: Fix Keyboard Shortcuts
**File**: `hooks/use-keyboard-shortcuts.ts`, `app/(dashboard)/tasks/page.tsx`

**Changes**:
1. Add `selectedTaskIndex` state
2. Implement `j`/`k` for navigation
3. Implement `e` for edit (opens edit dialog)
4. Implement `Delete` for delete (opens confirm)
5. Implement `Ctrl+Enter` for toggle complete
6. Fix ESC to only close dialogs
7. Update keyboard-shortcuts-dialog.tsx to match

---

### Task 5: Add Filter Counts
**File**: `components/dashboard/unified-sidebar.tsx`

**Changes**:
1. Use `useTasks` hook with different params to get counts
2. Memoize date values to prevent 429 errors
3. Display counts next to each filter option

**Implementation**:
```tsx
// Memoize to prevent re-fetching
const today = useMemo(() => new Date().toISOString().split('T')[0], []);

const { pagination: allTasks } = useTasks({ pageSize: 1 });
const { pagination: activeTasks } = useTasks({ isCompleted: false, pageSize: 1 });
const { pagination: completedTasks } = useTasks({ isCompleted: true, pageSize: 1 });
const { pagination: highPriorityTasks } = useTasks({ priority: "high", isCompleted: false, pageSize: 1 });
const { pagination: overdueTasks } = useTasks({ dueTo: today, isCompleted: false, pageSize: 1 });
```

---

### Task 6: Update Default Task Filter
**File**: `app/(dashboard)/tasks/page.tsx`

**Change**:
```tsx
// Before
const [filters, setFilters] = useState<TaskFilters>(getDefaultFilters());

// After
const [filters, setFilters] = useState<TaskFilters>({
  ...getDefaultFilters(),
  isCompleted: false, // Show active tasks by default
});
```

---

### Task 7: Task List Grouping
**File**: `components/tasks/task-list.tsx`

**Changes**:
1. Group tasks into Active and Completed sections
2. Add section headers
3. Animate task movement on completion toggle

**Structure**:
```tsx
export function TaskList({ tasks }: TaskListProps) {
  const activeTasks = tasks.filter(t => !t.isCompleted);
  const completedTasks = tasks.filter(t => t.isCompleted);

  return (
    <div className="space-y-6">
      {/* Active Tasks */}
      <section>
        <div className="space-y-3">
          {activeTasks.map(task => <TaskCard key={task.id} task={task} />)}
        </div>
      </section>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <section>
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            Completed ({completedTasks.length})
          </h3>
          <div className="space-y-3 opacity-60">
            {completedTasks.map(task => <TaskCard key={task.id} task={task} />)}
          </div>
        </section>
      )}
    </div>
  );
}
```

---

### Task 8: Remove Settings from Sidebar
**File**: `components/dashboard/sidebar.tsx` or `unified-sidebar.tsx`

**Change**: Remove Settings nav item (already in header via UserButton)

```tsx
// Before
const navItems = [
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/tags", label: "Tags", icon: Tags },
  { href: "/settings", label: "Settings", icon: Settings }, // REMOVE
];

// After
const navItems = [
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/tags", label: "Tags", icon: Tags },
];
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `components/dashboard/unified-sidebar.tsx` | CREATE | New unified sidebar with nav + contextual filters |
| `components/dashboard/sidebar.tsx` | DELETE | Replace with unified-sidebar |
| `components/tasks/filter-sidebar.tsx` | KEEP | Use logic in unified-sidebar |
| `app/(dashboard)/layout.tsx` | MODIFY | Use UnifiedSidebar, pass filter context |
| `app/(dashboard)/tasks/page.tsx` | MODIFY | Remove FilterSidebar, fix ESC, default filter |
| `components/tasks/task-list.tsx` | MODIFY | Add Active/Completed grouping |
| `hooks/use-keyboard-shortcuts.ts` | MODIFY | Add task selection state |
| `components/layout/keyboard-shortcuts-dialog.tsx` | MODIFY | Align with implemented shortcuts |

---

## Keyboard Shortcuts (Final)

| Key | Action | Scope |
|-----|--------|-------|
| `?` | Open shortcuts help | Global |
| `n` | Create new task | Tasks page |
| `/` | Focus search input | Tasks page |
| `j` | Select next task | Tasks page |
| `k` | Select previous task | Tasks page |
| `e` | Edit selected task | Tasks page (with selection) |
| `Delete` | Delete selected task | Tasks page (with selection) |
| `Ctrl+Enter` | Toggle task completion | Tasks page (with selection) |
| `Escape` | Close dialogs / Clear selection | Global |

---

## Testing Checklist

- [ ] Single sidebar displays on all pages
- [ ] Filters section only shows on `/tasks`
- [ ] Filter counts update dynamically
- [ ] No 429 errors (dates memoized)
- [ ] ESC closes dialogs only, not filters
- [ ] All keyboard shortcuts work
- [ ] Default view shows active tasks
- [ ] Completed tasks move to completed section
- [ ] Can toggle task complete/uncomplete
- [ ] Mobile sidebar overlay works
- [ ] Sidebar collapse state persists
- [ ] Settings accessible only via header profile

---

## Execution Order

1. **Task 8**: Remove Settings from current sidebar
2. **Task 1**: Create UnifiedSidebar component
3. **Task 2**: Update layout to use UnifiedSidebar
4. **Task 3**: Refactor tasks page (remove FilterSidebar)
5. **Task 5**: Add filter counts to sidebar
6. **Task 6**: Set default filter to active tasks
7. **Task 7**: Add task list grouping
8. **Task 4**: Fix keyboard shortcuts
9. **Testing**: Run through checklist

---

## Notes

- Task complete/uncomplete functionality already exists in `task-card.tsx`
- BetterAuth UserButton handles profile/settings - don't duplicate
- Use `useMemo` for date values to prevent query key changes
- Consider using URL params for filter state (shareable links)
