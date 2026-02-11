# Fix Trackpad Zoom UX: Pinch-to-Zoom Instead of Scroll-to-Zoom

## Context

The current zoom implementation intercepts **all** wheel events on the container and converts them to zoom. On MacBook trackpads, two-finger scrolling emits wheel events, so users cannot scroll past the widget without accidentally zooming. This is the exact problem you experienced.

Every major web tool (Figma, Google Maps, Miro, Mapbox) solves this the same way: **only zoom on pinch gestures or Ctrl+scroll, let regular scroll pass through**. On trackpads, browsers synthesize pinch gestures as `wheel` events with `ctrlKey: true`, making detection straightforward.

## Changes

### 1. Gate wheel zoom behind `ctrlKey` (`src/zoom/ZoomPan.ts`)

Replace the current wheel handler (lines 36-46) that zooms on every wheel event:

- Only zoom when `e.ctrlKey` is true (catches trackpad pinch + Ctrl+scroll)
- Only call `e.preventDefault()` when actually handling zoom (let normal scroll pass through)
- Use proportional delta (`-e.deltaY * 0.01`) instead of flat `+/-0.2` for smoother pinch feel
- Normalize `deltaMode` for cross-browser consistency (Firefox uses line-based deltas)
- Add `onScrollWithoutZoom` optional callback to `ZoomPanOptions` for the scroll hint

### 2. Add Safari GestureEvent support (`src/zoom/ZoomPan.ts`)

Safari doesn't use the `ctrlKey` wheel trick. Instead it fires proprietary `gesturestart`/`gesturechange`/`gestureend` events with a `scale` property. Add a `bindSafariGestures()` method that:

- Feature-detects `GestureEvent` (only exists in Safari)
- Tracks the zoom level at `gesturestart`
- Applies `gestureStartZoom * event.scale` during `gesturechange`
- Sets an `isGesturing` flag to prevent double-zoom if Safari also fires `ctrlKey` wheel events
- Includes TypeScript type declarations for the non-standard `GestureEvent`

### 3. Scroll hint toast (`src/zoom/ScrollHint.ts`)

Like Google Maps' "Use Ctrl+scroll to zoom" message. Shows a small toast pill at the bottom center of the container for 1.5s when users scroll without the modifier:

- Platform-aware text: "Cmd Scroll or pinch to zoom" on Mac, "Ctrl + scroll to zoom" elsewhere
- Compact bottom-center pill design (doesn't obscure image content)
- Fades in with subtle slide-up animation, fades out via CSS class toggle
- `aria-hidden="true"` (decorative)
- Auto-hides after timeout, resets on repeated scrolls
- Configurable via `scrollHint` option (default: `true` when zoom is enabled)
  - Set `scrollHint: false` to disable the hint entirely

### 4. CSS for scroll hint (`src/styles/index.css`)

- Bottom-center positioned pill with `border-radius: 20px`
- `background: rgba(0, 0, 0, 0.7)` for readability on a small element
- Opacity + translateY transition for fade + slide-up effect
- `pointer-events: none` so it doesn't block interaction
- Reduced-motion support

### 5. Wire up in CIHotspot (`src/core/CIHotspot.ts`)

- Import and instantiate `ScrollHint` in `initZoom()` (gated behind `config.scrollHint !== false`)
- Pass `onScrollWithoutZoom: () => this.scrollHint?.show()` to `ZoomPan`
- Clean up in `destroyInternal()`

## What stays the same

- Touch pinch/pan (`gestures.ts`) — separate code path for touch screens, unaffected
- Zoom buttons (`controls.ts`) — unchanged
- Keyboard zoom (`keyboard.ts`) — `+`/`-`/`0` shortcuts unchanged
- Double-click toggle — unchanged
- Mouse drag panning — unchanged
- All internal zoom math (`setZoom`, `clampPan`, `applyTransform`) — unchanged

## Files modified

| File | Change |
|------|--------|
| `src/zoom/ZoomPan.ts` | Replace wheel handler, add Safari GestureEvent, add GestureEvent types |
| `src/zoom/ScrollHint.ts` | **New file** — scroll hint toast |
| `src/styles/index.css` | Add scroll-hint toast CSS |
| `src/core/types.ts` | Add `scrollHint?: boolean` to `CIHotspotConfig` |
| `src/core/CIHotspot.ts` | Wire ScrollHint into initZoom/destroyInternal, gate behind config |
| `docs/zoom-trackpad-fix.md` | **New file** — this plan as project documentation |
| `tests/zoom.test.ts` | Add new test cases |

## Verification

1. `npm run build` — TypeScript compiles without errors
2. `npm test` — all existing + new tests pass
3. Manual test on trackpad: two-finger scroll should scroll the page, pinch should zoom
4. Manual test with mouse: Ctrl+scroll zooms, regular scroll scrolls page
5. Open demo in Safari: pinch-to-zoom works via GestureEvent
6. Scroll on widget without modifier: hint toast appears at bottom center and fades
7. Config: `{ zoom: true, scrollHint: false }` — no hint shown on scroll
