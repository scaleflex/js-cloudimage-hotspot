# UX Issues To Address

Identified during deep code review. All bugs and code quality issues have been fixed.
These are the remaining items.

---

## Accessibility (low)

### 1. Zoom controls lack `aria-label` on buttons
**File:** `src/core/ci-hotspot.ts` (zoom controls creation)
The zoom +/- and reset buttons have visible text symbols but no `aria-label` for screen readers.

### 2. No keyboard hint for scene navigation hotspots
Hotspots with `navigateTo` behave differently (no popover, scene change) but have no visual/accessible indication beyond the optional navigate class.

### 3. Editor property panel inputs lack `id`/`for` pairing
**File:** `src/editor/property-panel.ts`
Form inputs use `<label>` elements but no `id`/`for` association for accessible label pairing.

---

## UX / CSS (low)

### 4. No `destroyed` guard on editor public methods
**File:** `src/editor/ci-hotspot-editor.ts`
After `destroy()`, calling `addHotspot()`, `removeHotspot()`, etc. could throw. The core viewer has guards now, but the editor doesn't.

### 5. Editor drag manager: no throttle on `pointermove`
**File:** `src/editor/drag-manager.ts`
High-frequency `pointermove` events rebuild the viewer on every move. Could throttle via `requestAnimationFrame`.

### 6. Popover `max-width` clips long content without scroll
**File:** `src/styles/index.css`
Popover has `max-width: 320px` but no max-height or overflow handling. Long content overflows visually.

### 7. CSS: `--ci-hotspot-marker-border` uses shorthand in custom property
**File:** `src/styles/index.css:8`
Full shorthand (`2px solid rgba(...)`) makes it harder to override just the border color or width independently.

### 8. Scene transition images not preloaded on hover
When a user hovers a `navigateTo` marker, the target scene image could start preloading for a faster transition.

### 9. No visual feedback during scene transition loading
If the target scene image takes time to load, there's no loading spinner or progress indicator.

---

## Test Gaps

### 10. Pre-existing: `load trigger` test fails in jsdom
**File:** `tests/core.test.ts`
jsdom doesn't fire image load events, so the test expects visible popovers that never appear. Needs a mock or async test approach.

### 11. Pre-existing: React tests can't run (missing `@testing-library/dom`)
**File:** `tests/react.test.tsx`
The `@testing-library/dom` package is not installed as a dependency.
