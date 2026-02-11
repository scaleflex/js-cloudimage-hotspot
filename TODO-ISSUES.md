# TODO Issues

Final review findings, organized by severity.

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
