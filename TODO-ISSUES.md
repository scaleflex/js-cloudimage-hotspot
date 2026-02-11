# TODO Issues

Final deep review findings, organized by severity.

---

## High

### ~~1. Untracked `setTimeout` callbacks fire after destroy~~ FIXED
Added `trackedTimeout()` helper with `activeTimers` Set, all cleared on destroy.

### ~~2. `update()` + `initScenes()` corrupts config via destructive mutation~~ FALSE POSITIVE
`initScenes()` always runs after the spread in `update()` and overwrites the scene-derived values. The hotspot array was already cloned (`[...initialScene.hotspots]`). No actual corruption occurs.

### ~~3. Hotspot mutations silently lost on scene transitions~~ FIXED
Added `sceneHotspotOverrides` Map. Dynamic add/remove/update syncs back via `syncCurrentSceneHotspots()`. `switchToScene()` checks overrides before falling back to original scene data.

### ~~4. SVG sanitizer allows `<feImage>` with external URLs~~ FIXED
Added `'feimage'` to `SVG_BLOCKED_ELEMENTS`.

### ~~5. SVG sanitizer preserves `style` attributes — UI redress~~ FIXED
Added `style` to the attribute strip list in `cleanSVGNode`.

### ~~6. Pan drift accumulation in touch gestures~~ FIXED
Changed touch pan from incremental `+= dx/zoom` to total-delta approach: `panX = startPanX + totalDx/zoom`, matching mouse drag pattern. Added `onPanStart`/`onPanEnd` callbacks to `GestureRecognizer`.

### ~~7. Zoom origin ignores current pan offset~~ FALSE POSITIVE
The formula `panX = panX - originX * (scaleChange - 1) / newZoom` is mathematically correct. Derivation: for `screen_x = zoom * (p + panX)`, solving for `panX_new` such that the image point at `originX` stays fixed yields exactly the current formula.

### ~~8. Double-tap fires after pinch release~~ FIXED
Added `wasPinching` flag that suppresses both double-tap detection and trailing-finger panning after a pinch ends. Cleared on next fresh single-touch start.

### ~~9. Popover position errors during zoom (mixed coordinate spaces)~~ FALSE POSITIVE
Popovers are children of `containerEl` (not the zoomed `viewportEl`). `getBoundingClientRect()` returns visual coordinates, and since the popover's CSS `left/top` is relative to the unzoomed container, the visual marker coordinates are the correct values to use. `offsetWidth/Height` on both popover and container are in the same unzoomed space.

---

## Medium

### ~~10. Duplicate hotspot IDs create orphaned DOM~~ FIXED
`addHotspotInternal()` now checks for existing marker with same ID and cleans up old DOM/listeners/popovers/traps before creating the new one.

### ~~11. `ResizeObserver` callback not throttled~~ FIXED
Wrapped callback in `requestAnimationFrame` with deduplication. Cancels pending frame on cleanup.

### ~~12. `ResponsiveConfig.action: 'collapse'` is dead code~~ FIXED
Made `action` optional in the type definition since the code always uses 'hide' behavior.

### ~~13. `getHotspot()` returns mutable reference (editor)~~ FIXED
Now returns `structuredClone(hotspot)` like `getHotspots()`.

### ~~14. Editor keyboard shortcuts are global, not scoped~~ FIXED
Non-modifier shortcuts (`a`, `v`, Delete, Escape) now require `focusInEditor` check. Modifier shortcuts (Ctrl+Z, Ctrl+Y) remain global for UX parity.

### ~~15. Editor import modal missing `role="dialog"` and `aria-modal`~~ FIXED
Added `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` linked to the title element.

### ~~16. Sidebar hotspot list items not keyboard accessible~~ FIXED
Added `role="option"`, `tabindex="0"`, and Enter/Space keyboard handlers. List uses `role="listbox"`.

### ~~17. Protocol-relative URLs bypass `isSafeUrl`~~ FIXED
Changed `/^\//.test()` to `/^\/(?!\/)/.test()` to reject `//attacker.com` while allowing `/path`.

### ~~18. `hotspot.className` with spaces throws DOMException~~ FIXED
Split className on whitespace before passing to `classList.add()`.

### ~~19. Trailing finger after pinch triggers unwanted panning~~ FIXED
`wasPinching` flag now suppresses pan moves from the trailing finger after a pinch ends.

### ~~20. `shift()` produces negative positions for narrow containers~~ FIXED
When popover is wider/taller than container, centers it instead of producing negative positions from conflicting clamps.

### ~~21. Scene transition clears markers before animation completes~~ FIXED
Moved `clearHotspots()` from transition start to inside the timer callback (just before `switchToScene`). Old markers stay visible during fade-out via CSS `ci-hotspot-scene-transitioning` opacity rule.

---

## Low

### 22. Floating-point equality in zoom controls (`zoom === 1`)
**File:** `src/zoom/controls.ts:63`

### 23. Safari gesture always zooms toward container center
**File:** `src/zoom/zoom-pan.ts:185-188`

### 24. `parseFloat` returns silent NaN for invalid data attributes
**File:** `src/core/config.ts:74`

### 25. `navigator.platform` is deprecated
**File:** `src/zoom/scroll-hint.ts:1-2`

### 26. `buildCloudimageUrl` doesn't encode `src` path
**File:** `src/utils/cloudimage.ts:37`

### 27. Zero-duration CSS transition overridden by fallback
**File:** `src/core/ci-hotspot.ts:665-673`

### 28. Toast timer not cleared on editor destroy
**File:** `src/editor/ci-hotspot-editor.ts:388-397`

### 29. Live region singleton never cleaned up
**File:** `src/a11y/aria.ts:35-54`

### 30. `triggerMode` typed as `string` instead of `TriggerMode`
**File:** `src/core/ci-hotspot.ts:343`

### 31. Focus ring color hardcoded, not from theme variable
**Files:** `src/editor/editor.css:182`, `src/styles/index.css:140`

### 32. Toast and modal both use `z-index: 10000`
**File:** `src/editor/editor.css:390, 411`

---

## Test Issues

### 33. Responsive hide test is a false positive
**File:** `tests/behavioral-gaps.test.ts:196`
`ResizeObserver` never fires in jsdom, test passes trivially.

### 34. `pan works when zoomed` test is vacuous
**File:** `tests/zoom.test.ts:65`
Pans positive which clamps to 0, assertion meaningless.

### ~~35. Duplicate ID test documents bug as expected behavior~~ FIXED
Updated test to verify new correct behavior: duplicate IDs replace old marker instead of creating orphaned DOM.

### 36. Missing: Firefox `deltaMode` wheel events
### 37. Missing: `setZoom` with origin parameters
### 38. Missing: Scene transition image load error
### 39. Missing: Double-click blocked when ZoomPan disabled
### 40. Missing: `ZoomPan.destroy()` removes document listeners
