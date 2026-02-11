# Implementation Record: js-cloudimage-hotspot

## Summary

Built `js-cloudimage-hotspot` from scratch — a zero-dependency TypeScript library for interactive image hotspots with zoom, popovers, and WCAG 2.1 AA accessibility. All 10 phases completed successfully.

## Actual Metrics

| Metric | Value |
|--------|-------|
| Tests | 187+ across 17 test files, all passing |
| ESM bundle | 10.41 KB gzipped |
| CJS bundle | 9.38 KB gzipped |
| UMD bundle | 9.48 KB gzipped |
| Total files | ~65: 37 source, 17 test, 9 demo, 7 config/meta |
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

## Post-Implementation Updates

After the initial 10-phase implementation, several refinements and fixes were applied.

---

### Update 1: Scroll Hint & Trackpad Zoom Gating

**Commits:** `87bdab4`, `dcbb636`

**Goal:** Prevent accidental zoom when users intend to scroll the page, and guide them to use Ctrl/Cmd+scroll for zoom. Fix pan clamping to prevent white offset at zoom edges.

#### Files

| File | Action | Description |
|------|--------|-------------|
| `src/zoom/ScrollHint.ts` | Created | New UI component: toast-style hint at bottom-center of container. Platform-aware messaging (⌘ on Mac, Ctrl otherwise). Auto-hides after 1.5s. `aria-hidden="true"` for a11y |
| `src/zoom/ZoomPan.ts` | Modified | Added scroll gating: regular `wheel` events pass through without zooming; only `ctrlKey`/`metaKey` wheel events trigger zoom. Added `onScrollWithoutZoom` callback to trigger scroll hint. Added Safari `GestureEvent` support for native trackpad pinch. Fixed `clampPan()` to use `maxPan = containerSize * (zoom - 1) / zoom` preventing white offset. Added cursor management (`grab`/`grabbing`) |
| `src/core/CIHotspot.ts` | Modified | Integrated `ScrollHint` into `initZoom()` when `config.scrollHint !== false`. Added cleanup in `destroyInternal()` |
| `src/core/types.ts` | Modified | Added `scrollHint?: boolean` config option |
| `src/styles/index.css` | Modified | Added `.ci-hotspot-scroll-hint` styles: absolute bottom-center toast with slide-up animation, dark semi-transparent bg, 300ms transitions, reduced-motion support |
| `tests/zoom.test.ts` | Modified | Added 171 lines of tests: scroll hint creation/show/hide/auto-hide/destroy, wheel gating (regular scroll vs Ctrl+scroll), `onScrollWithoutZoom` callback, disabled state, Firefox `deltaMode` handling |
| `docs/zoom-trackpad-fix.md` | Created | Technical documentation for the trackpad zoom fix |

#### Results
- Regular page scrolling passes through unblocked when cursor is over the hotspot container
- Ctrl/Cmd+scroll zooms as expected
- Scroll hint appears and auto-hides when user attempts to scroll over the container
- Pan clamping prevents image from offsetting beyond edges at any zoom level
- All new tests passing

---

### Update 2: Load-Trigger Popover Deferred Positioning

**Commit:** `6bf152d`

**Goal:** Fix popovers with `trigger: 'load'` rendering at incorrect positions because they were shown before the image had loaded (image dimensions unknown).

#### Files

| File | Action | Description |
|------|--------|-------------|
| `src/core/CIHotspot.ts` | Modified | Added `showLoadTriggerPopovers()` method called after image `load` event. Added `imageLoaded` flag. Load-trigger popovers are now deferred until image dimensions are available for accurate positioning |

#### Results
- Load-triggered popovers now position correctly relative to their markers
- No visual jump or misplacement on initial render

---

### Update 3: Demo Page Redesign

**Commits:** `8b4c670`, `5b4fb6a`

**Goal:** Redesign demo page with polished UI, streamlined sections, scroll-aware navigation, and a better configurator layout.

#### Files

| File | Action | Description |
|------|--------|-------------|
| `demo/index.html` | Modified | Restructured to: sticky nav with scroll-aware styling, hero section with gradient text and feature pills, getting started with npm/CDN side-by-side, trigger modes 3-column grid, themes section, interactive configurator, modern footer. Clean semantic HTML with `<nav>`, `<main>`, `<footer>`, `<section>` landmarks |
| `demo/demo.css` | Modified | Complete CSS overhaul (+429 lines): sticky nav with backdrop-filter blur, hero gradient bg, card components with hover effects, responsive grid layouts (768px/640px breakpoints), code block dark theme, button variants (primary/outline/small), form controls with focus states, Inter font with `clamp()` sizing, blue (#0058a3) primary palette |
| `demo/demo.ts` | Modified | Updated initialization to match new HTML structure, scroll-aware nav active link highlighting |

#### Results
- Professional, polished demo page with modern UI patterns
- Configurator options panel moved to full-width row below preview for better usability
- Fully responsive down to mobile widths

---

### Update 4: Dark Theme Popover Title Fix

**Commit:** `65a7286`

**Goal:** Fix popover title color in dark theme being overridden by demo card styles.

#### Files

| File | Action | Description |
|------|--------|-------------|
| `demo/demo.css` | Modified | Scoped card title styles to prevent bleeding into popover title elements when dark theme is active |

#### Results
- Dark theme popover titles render with correct color

---

### Update 5: Visual Editor Mode (v1.2)

**Commit:** `acee4f1`

**Goal:** Add a visual hotspot editor as a separate opt-in module. Enables click-to-place, drag-to-reposition, inline property editing, undo/redo, and JSON export/import.

#### Files

| File | Action | Description |
|------|--------|-------------|
| `src/editor/ci-hotspot-editor.ts` | Created | Core `CIHotspotEditor` class: manages editor lifecycle, hotspot CRUD, viewer integration, keyboard shortcuts (A/V/Del/Esc/Ctrl+Z/Ctrl+Shift+Z), toast notifications, snapshot-based undo/redo |
| `src/editor/editor-toolbar.ts` | Created | Toolbar UI: Add/Select mode toggle buttons, Undo/Redo buttons with disabled-state tracking |
| `src/editor/property-panel.ts` | Created | Sidebar panel: hotspot list view, inline form for editing selected hotspot properties (ID, label, coordinates, trigger, placement, data fields, className, hidden/keepOpen) |
| `src/editor/selection-manager.ts` | Created | Tracks selected hotspot, emits selection change events, applies visual marker highlighting |
| `src/editor/drag-manager.ts` | Created | Handles mouse drag to reposition hotspot markers on the viewer canvas, emits update events with new coordinates |
| `src/editor/undo-manager.ts` | Created | Manages undo/redo stack via hotspot + selection snapshots, configurable max history (default 50), emits `history:change` events |
| `src/editor/types.ts` | Created | `EditorConfig`, `EditorSnapshot`, `EditorMode`, `EditorEvent` type definitions |
| `src/editor/editor.css` | Created | Complete editor layout: sidebar + canvas body, toolbar buttons, property panel forms, status bar, toast notifications |
| `src/editor/index.ts` | Created | Entry point: exports `CIHotspotEditor` class and editor types |
| `config/vite.editor.config.ts` | Created | Library build: entry `src/editor/index.ts` → ESM + CJS + UMD to `dist/editor/`, library name `CIHotspotEditor` |
| `demo/editor.html` | Created | Dedicated editor demo page with header, keyboard shortcuts guide, and live JSON output display |
| `demo/editor-demo.ts` | Created | Initializes editor with sample real estate hotspots, wires `onChange` to JSON output panel |
| `demo/index.html` | Modified | Added Visual Editor link to navigation bar |
| `package.json` | Modified | Added `./editor` export map entry, added `build:editor` script, updated `build` to include editor |
| `tests/editor.test.ts` | Created | Editor functionality tests: add, remove, update, select, deselect, undo/redo, mode switching, export/import |

#### Results
- Visual editor fully functional: click image to place markers, drag to reposition, edit properties in sidebar
- Keyboard shortcuts: `A` (add mode), `V` (select mode), `Delete` (remove), `Escape` (deselect/exit add mode), `Ctrl+Z` / `Ctrl+Shift+Z` (undo/redo)
- Editor ships as separate entry point (`js-cloudimage-hotspot/editor`) — core bundle unaffected
- All editor tests passing

---

### Update 6: Kebab-Case File Rename

**Commit:** `64fdcd6`

**Goal:** Rename all PascalCase/camelCase source files to kebab-case for consistent naming convention across the project.

#### Files

| File | Action | Description |
|------|--------|-------------|
| `src/core/CIHotspot.ts` | Renamed | → `ci-hotspot.ts` |
| `src/markers/Marker.ts` | Renamed | → `marker.ts` |
| `src/popover/Popover.ts` | Renamed | → `popover.ts` |
| `src/zoom/ZoomPan.ts` | Renamed | → `zoom-pan.ts` |
| `src/zoom/ScrollHint.ts` | Renamed | → `scroll-hint.ts` |
| `src/react/CIHotspotViewer.tsx` | Renamed | → `ci-hotspot-viewer.tsx` |
| `src/react/useCIHotspot.ts` | Renamed | → `use-ci-hotspot.ts` |
| `src/editor/CIHotspotEditor.ts` | Renamed | → `ci-hotspot-editor.ts` |
| `src/editor/EditorToolbar.ts` | Renamed | → `editor-toolbar.ts` |
| `src/editor/PropertyPanel.ts` | Renamed | → `property-panel.ts` |
| `src/editor/SelectionManager.ts` | Renamed | → `selection-manager.ts` |
| `src/editor/DragManager.ts` | Renamed | → `drag-manager.ts` |
| `src/editor/UndoManager.ts` | Renamed | → `undo-manager.ts` |
| `demo/react-demo/App.tsx` | Renamed | → `app.tsx` |
| All importing files | Modified | Updated all import paths across source, tests, and demo files |

#### Results
- 24 files renamed, all imports updated
- No PascalCase source files remain
- Build, typecheck, and tests all pass

---

### Update 7: Real Estate Demo Images

**Commit:** `9288716`

**Goal:** Replace placeholder demo images with high-quality real estate photography served via Scaleflex CDN, with descriptive hotspot labels.

#### Files

| File | Action | Description |
|------|--------|-------------|
| `demo/demo.ts` | Modified | Updated all demo instances to use `spacejoy-unsplash.jpg` from Scaleflex CDN with descriptive hotspots (furniture names, positions) |
| `demo/editor-demo.ts` | Modified | Updated editor demo to use real estate image with leather armchair, arc floor lamp, walnut coffee table hotspots |
| `demo/react-demo/app.tsx` | Modified | Updated React demo to use real estate photography |

#### Results
- All demos use `https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-hotspot/spacejoy-unsplash.jpg`
- Hotspot labels are descriptive and match the image content

---

### Update 8: Cloudimage CDN Support in Visual Editor

**Commit:** `65be147`

**Goal:** Pass Cloudimage CDN configuration through to the editor's internal viewer, and rename user-facing text to "Cloudimage Hotspot".

#### Files

| File | Action | Description |
|------|--------|-------------|
| `src/editor/types.ts` | Modified | Added `cloudimage?: CloudimageConfig` to `EditorConfig` interface |
| `src/editor/ci-hotspot-editor.ts` | Modified | Passes `config.cloudimage` to the internal `CIHotspot` viewer on rebuild |
| `demo/editor.html` | Modified | Updated title/branding to "Cloudimage Hotspot Visual Editor" |

#### Results
- Editor can use Cloudimage CDN for responsive image delivery
- Branding consistent across demo pages

---

### Update 9: Image URL Input in Visual Editor

**Commit:** `eca3671`

**Goal:** Allow switching images at runtime in the visual editor via a URL input field in the toolbar.

#### Files

| File | Action | Description |
|------|--------|-------------|
| `src/editor/ci-hotspot-editor.ts` | Modified | Added `getSrc()` and `setSrc(url)` methods for programmatic image switching |
| `src/editor/editor-toolbar.ts` | Modified | Added URL input bar with text field and "Load" button below toolbar buttons |
| `src/editor/editor.css` | Modified | Added `.ci-editor-url-bar` styles for the URL input area |

#### Results
- Users can type a new image URL and click "Load" to switch images
- Existing hotspots are preserved when changing images
- Works with both direct URLs and Cloudimage CDN URLs

---

## Update 10: Multi-Image Navigation — v1.3 Scenes API

Implemented the Scenes API for multi-image navigation with per-image hotspot sets.

### New Types (`src/core/types.ts`)
- `SceneTransition` type: `'fade' | 'slide' | 'none'`
- `Scene` interface: `{ id, src, alt?, hotspots[] }`
- Extended `CIHotspotConfig` with `scenes?`, `initialScene?`, `sceneTransition?`, `onSceneChange?`
- Extended `CIHotspotInstance` with `goToScene()`, `getCurrentScene()`, `getScenes()`

### Core Implementation (`src/core/ci-hotspot.ts`)
- **Surgical scene switching**: Keeps container/viewport/zoom/keyboard intact, only swaps image + markers
- **Cleanup separation**: Split `cleanups[]` into global `cleanups[]` and `hotspotCleanups[]` for per-hotspot listeners
- `initScenes()` — Populates scenes map, sets initial scene's src/hotspots before DOM build
- `clearHotspots()` — Removes markers, popovers, and hotspot-level event listeners
- `performSceneTransition()` — Creates temporary incoming `<img>`, applies CSS animation classes, swaps on completion
- `switchToScene()` — Updates image src, aria-label, re-initializes hotspots
- `goToScene()` — Public API: validates, closes popovers, resets zoom, runs transition, announces to screen reader
- `bindNavigateTrigger()` — Handles `navigateTo` hotspots: adds navigate marker class, binds click/keyboard to `goToScene()`
- `navigateTo` hotspots display hover popovers with auto-generated destination info, and navigate on click

### Config (`src/core/config.ts`)
- New data-attributes: `data-ci-hotspot-scenes`, `data-ci-hotspot-initial-scene`, `data-ci-hotspot-scene-transition`
- Updated `validateConfig()`: scenes mode doesn't require top-level `src`, validates scene `id`/`src`, validates `initialScene`
- Updated `autoInit()` selector: `[data-ci-hotspot-src], [data-ci-hotspot-scenes]`

### CSS (`src/styles/index.css`)
- Scene transition animations: fade-in/fade-out, slide-in/slide-out keyframes
- `.ci-hotspot-marker--navigate` styling with chevron arrow via `::after`
- `.ci-hotspot-scene-transitioning` hides markers during transition
- Reduced-motion overrides for scene transitions

### React Wrapper
- Updated `CIHotspotViewerProps` with `scenes?`, `initialScene?`, `sceneTransition?`, `onSceneChange?`
- Made `src` and `hotspots` optional (not needed when scenes is provided)
- Updated `CIHotspotViewerRef` with `goToScene()`, `getCurrentScene()`, `getScenes()`
- Updated hook and component to pass through scene config and expose scene methods

### Demo
- New "Multi-Image Navigation" section with 5-scene real estate tour (Main Hall, Stairs, Kitchen, Bedroom, Rest Zone)
- `navigateTo` hotspots link rooms together; info hotspots show descriptions on hover
- External scene navigation buttons wired to `goToScene()`

### Tests (`tests/scenes.test.ts`)
- 35+ tests covering: scene initialization, `goToScene()`, marker creation, `navigateTo` behavior, popovers, `initialScene` config, `onSceneChange` callback, backward compatibility, validation, data-attribute support, destroy cleanup, transitions, aspect ratio

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
