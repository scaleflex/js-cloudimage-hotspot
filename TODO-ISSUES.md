# TODO Issues

Final review findings, organized by severity.

---

## Medium

### 3. React MutationObserver recreates portal Map on every DOM change
**File:** `src/react/ci-hotspot-viewer.tsx:31-40`
The observer callback rebuilds the entire `portalTargets` Map on any mutation, causing unnecessary re-renders and potential portal remounting.

### 4. Undo manager: first hotspot addition can't be undone
**File:** `src/editor/undo-manager.ts:32-38`
`undo()` returns early when `undoStack.length <= 1`, meaning the first action after `saveInitial()` can't be reversed.

### 5. Editor import modal has no focus trap
**File:** `src/editor/editor-toolbar.ts:147-195`
The JSON import modal doesn't use `createFocusTrap()`, so Tab escapes the modal.

### 6. SVG `<image>` element not blocked in marker sanitizer
**File:** `src/markers/marker.ts`
`SVG_BLOCKED_ELEMENTS` doesn't include `image`. An `<image href="data:image/svg+xml,...">` could nest an unsanitized SVG.

### 7. `getHotspotsRef()` exposes mutable internal array
**File:** `src/editor/ci-hotspot-editor.ts:260-262`
Returns a direct reference to the internal `hotspots` array. External mutation bypasses undo tracking.

### 8. Editor toolbar buttons lack `aria-pressed` and `aria-label`
**File:** `src/editor/editor-toolbar.ts`
Mode toggle buttons don't communicate pressed state to screen readers. No `aria-label` on icon-only buttons.

---

## Low

### 9. Sanitizer `rel` attribute not validated
**File:** `src/popover/sanitize.ts:6-8`
The `rel` attribute is allowed without value validation. Values like `dns-prefetch` could trigger prefetch attacks.

### 10. React hook: callback props not in dependency array
**File:** `src/react/use-ci-hotspot.ts:100-119`
`onOpen`, `onClose`, `onZoom`, `onClick`, `onSceneChange` aren't in the deps array. Intentional (uses `optionsRef`), but worth documenting.

### 11. `KeyboardEvent` cast to `MouseEvent` in keyboard handler
**File:** `src/core/ci-hotspot.ts:428`
`e as unknown as MouseEvent` is a lossy cast. The `onClick` type should accept `MouseEvent | KeyboardEvent`.

### 12. No editor dark theme CSS
**File:** `src/editor/editor.css`
Editor uses hardcoded colors with no `.ci-hotspot-theme-dark` overrides.

---

## Test Gaps

### 13. Gesture recognition — 0% coverage
**File:** `src/zoom/gestures.ts`

### 14. Popover position computation — 0% coverage
**File:** `src/popover/position.ts`

### 15. Editor drag manager — 0% coverage
**File:** `src/editor/drag-manager.ts`

### 16. Editor property panel — 0% coverage
**File:** `src/editor/property-panel.ts`

### 17. Pulse animation functions — 0% coverage
**File:** `src/markers/pulse.ts`

### 18. Post-destroy API calls not tested
**File:** `src/core/ci-hotspot.ts`

### 19. Rapid add/remove hotspot cycles not tested
**File:** `src/core/ci-hotspot.ts`

### 20. Scenes + zoom integration not tested
**File:** `src/core/ci-hotspot.ts`

### 21. Duplicate hotspot ID handling not tested
**File:** `src/core/ci-hotspot.ts`

### 22. Responsive hotspot hide/collapse not tested
**File:** `src/core/ci-hotspot.ts`
