# UX Issues To Address

Identified during deep code review. Critical/high/medium severity bugs have been fixed.
These are the remaining items.

---

## Code Quality (medium)

### 1. Popover hover listeners not cleaned via cleanup pattern
**File:** `src/popover/popover.ts:51-54`
The `mouseenter`/`mouseleave` listeners on `this.element` aren't stored for cleanup. Functionally safe (element removal detaches them), but inconsistent with the cleanup pattern used everywhere else.

### 2. `updateHotspot()` could update marker in-place for simple changes
**File:** `src/core/ci-hotspot.ts`
Currently uses remove-and-re-add with DOM order tracking. For simple property changes (position, label, class), an in-place update would avoid the brief DOM detach/reattach.

### 3. `showLoadTriggerPopovers` and `setupResponsive` use `.find()` loops
**Files:** `src/core/ci-hotspot.ts`
Both iterate over `this.config.hotspots` with `.find()` for each entry. Could use `normalizedHotspots` map for O(1) lookup. Negligible at typical hotspot counts (<50).

### 4. React `JSON.stringify` on every render for deps comparison
**File:** `src/react/use-ci-hotspot.ts:61-62`
`JSON.stringify(options.scenes)` and `JSON.stringify(options.hotspots)` run on every render. Could use a deep-equal utility for large datasets.

### 5. `bindTrigger` method is ~100 lines long
**File:** `src/core/ci-hotspot.ts`
Could benefit from extraction into smaller helper functions for readability.

---

## Accessibility (low)

### 6. Zoom controls lack `aria-label` on buttons
**File:** `src/core/ci-hotspot.ts` (zoom controls creation)
The zoom +/- and reset buttons have visible text symbols but no `aria-label` for screen readers.

### 7. No keyboard hint for scene navigation hotspots
Hotspots with `navigateTo` behave differently (no popover, scene change) but have no visual/accessible indication beyond the optional navigate class.

### 8. Editor property panel inputs lack `id`/`for` pairing
**File:** `src/editor/property-panel.ts`
Form inputs use `<label>` elements but no `id`/`for` association for accessible label pairing.

---

## UX / CSS (low)

### 9. No `destroyed` guard on editor public methods
**File:** `src/editor/ci-hotspot-editor.ts`
After `destroy()`, calling `addHotspot()`, `removeHotspot()`, etc. could throw. The core viewer has guards now, but the editor doesn't.

### 10. Editor drag manager: no throttle on `pointermove`
**File:** `src/editor/drag-manager.ts`
High-frequency `pointermove` events rebuild the viewer on every move. Could throttle via `requestAnimationFrame`.

### 11. Popover `max-width` clips long content without scroll
**File:** `src/styles/index.css`
Popover has `max-width: 320px` but no max-height or overflow handling. Long content overflows visually.

### 12. CSS: `--ci-hotspot-marker-border` uses shorthand in custom property
**File:** `src/styles/index.css:8`
Full shorthand (`2px solid rgba(...)`) makes it harder to override just the border color or width independently.

### 13. Scene transition images not preloaded on hover
When a user hovers a `navigateTo` marker, the target scene image could start preloading for a faster transition.

### 14. No visual feedback during scene transition loading
If the target scene image takes time to load, there's no loading spinner or progress indicator.

---

## Test Gaps

### 15. Pre-existing: `load trigger` test fails in jsdom
**File:** `tests/core.test.ts`
jsdom doesn't fire image load events, so the test expects visible popovers that never appear. Needs a mock or async test approach.

### 16. Pre-existing: React tests can't run (missing `@testing-library/dom`)
**File:** `tests/react.test.tsx`
The `@testing-library/dom` package is not installed as a dependency.
