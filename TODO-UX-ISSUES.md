# UX Issues To Address

Identified during deep code review. All bugs, code quality, and accessibility issues have been fixed.
These are the remaining items.

---

## UX / CSS (low)

### 1. No `destroyed` guard on editor public methods
**File:** `src/editor/ci-hotspot-editor.ts`
After `destroy()`, calling `addHotspot()`, `removeHotspot()`, etc. could throw. The core viewer has guards now, but the editor doesn't.

### 2. Editor drag manager: no throttle on `pointermove`
**File:** `src/editor/drag-manager.ts`
High-frequency `pointermove` events rebuild the viewer on every move. Could throttle via `requestAnimationFrame`.

### 3. Popover `max-width` clips long content without scroll
**File:** `src/styles/index.css`
Popover has `max-width: 320px` but no max-height or overflow handling. Long content overflows visually.

### 4. CSS: `--ci-hotspot-marker-border` uses shorthand in custom property
**File:** `src/styles/index.css:8`
Full shorthand (`2px solid rgba(...)`) makes it harder to override just the border color or width independently.

### 5. Scene transition images not preloaded on hover
When a user hovers a `navigateTo` marker, the target scene image could start preloading for a faster transition.

### 6. No visual feedback during scene transition loading
If the target scene image takes time to load, there's no loading spinner or progress indicator.

---

## Test Gaps

### 7. Pre-existing: `load trigger` test fails in jsdom
**File:** `tests/core.test.ts`
jsdom doesn't fire image load events, so the test expects visible popovers that never appear. Needs a mock or async test approach.

### 8. Pre-existing: React tests can't run (missing `@testing-library/dom`)
**File:** `tests/react.test.tsx`
The `@testing-library/dom` package is not installed as a dependency.
