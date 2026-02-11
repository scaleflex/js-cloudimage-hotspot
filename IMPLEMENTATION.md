# Implementation Record: js-cloudimage-hotspot

## Summary

Built `js-cloudimage-hotspot` from scratch — a zero-dependency TypeScript library for interactive image hotspots with zoom, popovers, and WCAG 2.1 AA accessibility. All 10 phases completed successfully.

## Actual Metrics

| Metric | Value |
|--------|-------|
| Tests | 187 across 15 test files, all passing |
| ESM bundle | 10.41 KB gzipped |
| CJS bundle | 9.38 KB gzipped |
| UMD bundle | 9.48 KB gzipped |
| Total files | ~50: 28 source, 13 test, 7 demo, 6 config/meta |
| Runtime dependencies | Zero |

## Issues Encountered & Resolved

| Issue | File | Resolution |
|-------|------|------------|
| Floating-point precision in coordinate conversion | `coordinates.test.ts` | Used `toBeCloseTo(299.97)` instead of exact equality |
| Pan-at-zoom-1 test asserting wrong condition | `zoom.test.ts` | Changed test to compare transform before/after pan attempt instead of checking for absence of `translate` |
| Rollup named/default export warning | `vite.config.ts` | Added `rollupOptions.output.exports: 'named'` to suppress warning |

---

## Phase 1: Project Scaffolding, Build Pipeline & Types

**Status: COMPLETED**

**Goal:** Established Vite build toolchain, TypeScript config, linting, testing infra, and all core type definitions.

### Files

| File | Action | Description |
|------|--------|-------------|
| `package.json` | Modified | Full rewrite: added vite, vitest, eslint, jsdom, react peer deps; defined all npm scripts; set up `exports` map with `"."` and `"./react"`; added `main`, `module`, `unpkg`, `types`, `files`, `peerDependencies`, `sideEffects: false` |
| `tsconfig.json` | Modified | Target ES2020, module ESNext, moduleResolution bundler, jsx react-jsx, declaration true, dom/dom.iterable libs, strict |
| `tsconfig.react.json` | Created | Extends base, scoped to `src/react/**` |
| `config/vite.config.ts` | Created | Library mode: entry `src/index.ts` → ESM (.esm.js) + CJS (.cjs.js) + UMD (.min.js), name `CIHotspot`, CSS inline injection |
| `config/vite.react.config.ts` | Created | Library mode: entry `src/react/index.ts`, externalized react/react-dom, output ESM + CJS to `dist/react/` |
| `config/vite.demo.config.ts` | Created | App mode targeting `demo/index.html` → `dist-demo/` |
| `.eslintrc.cjs` | Created | TypeScript-eslint recommended rules |
| `vitest.config.ts` | Created | jsdom environment, coverage settings |
| `src/core/types.ts` | Created | All TypeScript interfaces: `CIHotspotConfig`, `CIHotspotInstance`, `HotspotItem`, `CloudimageConfig`, `PopoverData`, `Placement`, `TriggerMode`, `Theme`, internal types (`NormalizedHotspot`, `Rect`, `Point`, `ZoomState`) |
| `src/index.ts` | Modified | Stub CIHotspot class + static autoInit, re-exported types |
| `tests/setup.ts` | Created | jsdom setup, global mocks |
| `tests/types.test.ts` | Created | Type-level validation tests |

### Results
- `npm install` succeeded
- `npm run build` produced 3 bundle files in `dist/`
- `npm run typecheck` passed
- `npm test` ran and passed
- UMD bundle exposed `window.CIHotspot`

---

## Phase 2: Utility Layer & CSS Foundation

**Status: COMPLETED**

**Goal:** Built all shared utility modules and the complete CSS stylesheet.

### Files

| File | Action | Description |
|------|--------|-------------|
| `src/utils/dom.ts` | Created | `createElement`, `addClass/removeClass/toggleClass`, `getElement`, `injectStyles` (idempotent `<style>` injection), `isBrowser` (SSR guard) |
| `src/utils/coordinates.ts` | Created | `parseCoordinate` (% string or px number), `normalizeToPercent` (convert any format to %), `percentToPixel` — all pure functions |
| `src/utils/events.ts` | Created | Minimal typed `EventEmitter` (on/off/emit/once), `addListener` (returns cleanup fn), `debounce`, `throttle` |
| `src/utils/cloudimage.ts` | Created | `buildCloudimageUrl`, `roundToLimitFactor`, `getOptimalWidth`, `createResizeHandler` (ResizeObserver + debounced URL updates) — pure URL builders + one DOM function |
| `src/styles/index.css` | Created | Complete stylesheet: 40+ CSS variables, container/viewport/image/markers layout, marker styles + hover/active/focus-visible, pulse + breathe keyframes, popover styles + entrance animation + arrow, built-in template classes, zoom controls, cluster indicator, dark theme overrides, reduced motion media query, loading state |
| `tests/coordinates.test.ts` | Created | Parse %, px, normalization, edge cases |
| `tests/events.test.ts` | Created | EventEmitter lifecycle, debounce/throttle |
| `tests/cloudimage.test.ts` | Created | URL construction, limit factor rounding, DPR, disabled state |
| `tests/dom.test.ts` | Created | Element creation, class ops, style injection, SSR guard |

### Results
- All utility unit tests passed
- `normalizeToPercent(650, 400, 1000, 800)` → `{ x: 65, y: 50 }` confirmed
- `buildCloudimageUrl(src, { token: 'demo' }, 373, 1, 2)` → URL with `width=800` confirmed
- CSS built and importable as string

---

## Phase 3: Marker System & HTML Sanitizer

**Status: COMPLETED**

**Goal:** Implemented marker creation, positioning, pulse animation control, and XSS sanitization.

### Files

| File | Action | Description |
|------|--------|-------------|
| `src/markers/Marker.ts` | Created | `createMarker` → `<button>` with correct left/top %, ARIA attrs, optional icon; `setMarkerActive`, `setMarkerHidden`, `setMarkerCounterScale`, `destroyMarker` |
| `src/markers/pulse.ts` | Created | `enablePulse/disablePulse/setPulseState` — CSS class toggles + reduced-motion check |
| `src/popover/sanitize.ts` | Created | `sanitizeHTML` using DOMParser: allowlisted tags, allowlisted attrs, blocks `javascript:` URLs, strips event handlers |
| `tests/sanitize.test.ts` | Created | XSS vectors: script tags, event handlers, javascript: URLs, iframe, form, preserves safe HTML |
| `tests/markers.test.ts` | Created | Element creation, positioning, ARIA, active/hidden toggle, counter-scale |

### Results
- `sanitizeHTML('<p>safe</p><script>alert(1)</script>')` → `'<p>safe</p>'` confirmed
- `createMarker` produced `<button>` with correct `aria-label`, `aria-expanded="false"`, position styles
- All tests passed

---

## Phase 4: Popover System

**Status: COMPLETED**

**Goal:** Built complete popover subsystem: positioning engine (flip/shift), built-in product template, custom content, popover lifecycle (show/hide with triggers).

### Files

| File | Action | Description |
|------|--------|-------------|
| `src/popover/position.ts` | Created | `computePosition(marker, popover, container, { placement })` → `{ x, y, placement, arrowOffset }`. Internal: `getAvailableSpace`, `flip`, `shift`, `getAutoPlacement`. Uses `getBoundingClientRect()` for accuracy through zoom transforms |
| `src/popover/template.ts` | Created | `renderBuiltInTemplate(data: PopoverData)` → HTML from data fields; `renderPopoverContent(hotspot, renderFn?)` — priority: renderFn > content string > data template |
| `src/popover/Popover.ts` | Created | `class Popover`: `show()`, `hide()`, `destroy()`, `updatePosition()`, `isVisible()`. Created `.ci-hotspot-popover` with arrow + content. Managed 200ms hide delay for hover mode. Appended to container (not viewport) |
| `tests/popover.test.ts` | Created | Positioning: flip, shift, auto; template rendering; ARIA toggles; hide delay; callbacks |

### Results
- Popover flipped from top to bottom when insufficient space above
- Built-in template rendered only provided fields
- Hide delay prevented flicker
- All tests passed

---

## Phase 5: Zoom & Pan System

**Status: COMPLETED**

**Goal:** Implemented CSS transform-based zoom, all input methods (wheel, pinch, double-click, drag, controls UI), marker counter-scaling.

### Files

| File | Action | Description |
|------|--------|-------------|
| `src/zoom/gestures.ts` | Created | `class GestureRecognizer`: touch event processing → `onPinch`, `onPan`, `onDoubleTap` callbacks |
| `src/zoom/ZoomPan.ts` | Created | `class ZoomPan`: `setZoom(level, originX?, originY?)`, `getZoom()`, `resetZoom()`, `pan(dx, dy)`, `enable/disable()`, `destroy()`. Applied `scale(zoom) translate(panX, panY)` on viewport. Pan boundary clamping. Updated `--zoom` CSS variable |
| `src/zoom/controls.ts` | Created | `createZoomControls(container, zoomPan)` → floating bar with +/−/reset buttons, aria-labels, disabled at limits |
| `tests/zoom.test.ts` | Created | Zoom clamping, pan boundaries, transform application, double-click toggle, controls, counter-scale variable |

### Results
- `setZoom(2)` → viewport had `scale(2)` transform
- `setZoom(5)` clamped to zoomMax (4)
- Pan at zoom=1 correctly disabled (verified by comparing transform before/after)
- Double-click alternated 1x ↔ 2x
- All tests passed

---

## Phase 6: Core CIHotspot Class, Config Parsing & autoInit

**Status: COMPLETED**

**Goal:** Built central orchestrator tying markers + popovers + zoom + CSS injection together. Implemented config parsing with defaults, data-attribute mapping, and autoInit.

### Files

| File | Action | Description |
|------|--------|-------------|
| `src/core/config.ts` | Created | `DEFAULT_CONFIG`, `mergeConfig(userConfig)`, `parseDataAttributes(element)`, `validateConfig`, `DATA_ATTR_MAP` |
| `src/core/CIHotspot.ts` | Created | Core class. Constructor: resolved element, merged config, injected CSS, built DOM, applied theme, lazy loading, normalized coordinates, created markers + popovers, bound triggers, initialized zoom, initialized cloudimage, responsive breakpoints. Instance methods: `open/close/closeAll`, `setZoom/getZoom/resetZoom`, `addHotspot/removeHotspot/updateHotspot`, `update(config)`, `destroy()` |
| `src/index.ts` | Modified | Default export CIHotspot class, static `autoInit(root?)`, named type exports |
| `tests/core.test.ts` | Created | Instantiation, DOM structure, trigger modes, programmatic open/close, dynamic add/remove, destroy cleanup, theme |
| `tests/data-attr.test.ts` | Created | Attribute parsing, boolean/number coercion, JSON items, cloudimage assembly, autoInit discovery |

### Results
- `new CIHotspot('#el', { src, hotspots })` created full DOM structure
- Hover/click/load triggers worked correctly
- `instance.destroy()` removed all created DOM
- `CIHotspot.autoInit()` initialized all `data-ci-hotspot-src` elements

---

## Phase 7: Accessibility Layer

**Status: COMPLETED**

**Goal:** Implemented full WCAG 2.1 AA: keyboard navigation, focus management, focus trapping, ARIA management.

### Files

| File | Action | Description |
|------|--------|-------------|
| `src/a11y/keyboard.ts` | Created | `class KeyboardHandler`: Tab, Enter/Space, Escape, Arrow keys, +/-/0 |
| `src/a11y/focus.ts` | Created | `createFocusTrap(popover, marker)`, `moveFocusToMarker`, `getFocusableElements` |
| `src/a11y/aria.ts` | Created | `setMarkerAria`, `updatePopoverAria`, `setContainerAria`, `announceToScreenReader` |
| `src/core/CIHotspot.ts` | Modified | Integrated KeyboardHandler, focus traps, ARIA calls |
| `tests/a11y.test.ts` | Created | Keyboard nav, focus trap, Escape flow, ARIA states, container role |

### Results
- Tab navigated between markers
- Enter/Space toggled popover
- Escape closed popover + returned focus to marker
- All ARIA attributes correct in all states

---

## Phase 8: React Wrapper

**Status: COMPLETED**

**Goal:** Built separate entry point with `<CIHotspotViewer>` component, `useCIHotspot` hook, ref API. SSR-safe.

### Files

| File | Action | Description |
|------|--------|-------------|
| `src/react/types.ts` | Created | `CIHotspotViewerProps`, `CIHotspotViewerRef`, `UseCIHotspotOptions`, `UseCIHotspotReturn` |
| `src/react/useCIHotspot.ts` | Created | Hook: created containerRef + instance ref, initialized CIHotspot in useEffect |
| `src/react/CIHotspotViewer.tsx` | Created | `forwardRef` component using useCIHotspot. React portals for popovers. `useImperativeHandle` |
| `src/react/index.ts` | Created | Named exports: component, hook, types |
| `tests/react.test.tsx` | Created | Render, mount lifecycle, ref API, renderPopover with JSX, unmount cleanup |

### Results
- Component rendered, markers appeared after mount
- Ref API methods worked
- React build externalized react/react-dom
- All React tests passed

---

## Phase 9: Demo Site

**Status: COMPLETED**

**Goal:** Built comprehensive demo site with all sections from spec.

### Files

| File | Action | Description |
|------|--------|-------------|
| `demo/index.html` | Created | Single-page layout with sticky nav, all demo sections |
| `demo/demo.css` | Created | Demo-specific layout styles |
| `demo/demo.ts` | Created | Initialized all demo instances |
| `demo/configurator.ts` | Created | Interactive playground with code generation |
| `demo/react-demo/index.html` | Created | React demo entry |
| `demo/react-demo/main.tsx` | Created | React demo mount |
| `demo/react-demo/App.tsx` | Created | React demo showcasing component, hook, ref API |

### Results
- `npm run dev` started local dev server with working demo
- All demo sections functional
- `npm run build:demo` produced static site

---

## Phase 10: Testing, Documentation, Polish & Release

**Status: COMPLETED**

**Goal:** Achieved comprehensive test coverage, wrote README, added LICENSE, verified bundle sizes, handled edge cases.

### Files

| File | Action | Description |
|------|--------|-------------|
| `README.md` | Created | Features, installation, API reference, React usage, theming, accessibility |
| `LICENSE` | Created | MIT license |
| `.gitignore` | Modified | Added dist/, dist-demo/, coverage/ |
| `tests/integration.test.ts` | Created | End-to-end: init → markers → hover → popover → zoom → keyboard → destroy |
| `tests/edge-cases.test.ts` | Created | Empty hotspots, boundary coordinates, rapid open/close, multiple instances, SSR |
| `package.json` | Modified | Final: repository/bugs/homepage fields, keywords |

### Results
- All tests passed, coverage exceeded 80% on critical paths
- `npm run typecheck` + `npm run lint` clean
- Bundle sizes within targets (ESM 10.41 KB, CJS 9.38 KB, UMD 9.48 KB gzipped)

---

## Dependency Graph (Execution Order)

```
Phase 1:  Types + Build Pipeline              ✅
    ↓
Phase 2:  Utilities + CSS                     ✅
    ↓
Phase 3:  Markers + Sanitizer                 ✅
    ↓
Phase 4:  Popover System                      ✅
    ↓
Phase 5:  Zoom & Pan                          ✅
    ↓
Phase 6:  Core CIHotspot Class + Config       ✅
    ↓
Phase 7:  Accessibility Layer                 ✅
    ↓
Phase 8:  React Wrapper                       ✅
    ↓
Phase 9:  Demo Site                           ✅
    ↓
Phase 10: Testing + Docs + Release            ✅
```
