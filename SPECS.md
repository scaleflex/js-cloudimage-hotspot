# js-cloudimage-hotspot — Specification

> Interactive image hotspots with zoom, popovers, and accessibility.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Core Features](#2-core-features)
3. [API Design](#3-api-design)
4. [Hotspot Configuration](#4-hotspot-configuration)
5. [Visual Design](#5-visual-design)
6. [Zoom & Pan](#6-zoom--pan)
7. [Popover System](#7-popover-system)
8. [React Wrapper API](#8-react-wrapper-api)
9. [Accessibility](#9-accessibility)
10. [Build & Distribution](#10-build--distribution)
11. [Project Structure](#11-project-structure)
12. [GitHub Pages Demo](#12-github-pages-demo)
13. [Additional Features](#13-additional-features)
14. [Competitor Feature Matrix](#14-competitor-feature-matrix)
15. [Roadmap](#15-roadmap)
16. [Appendices](#16-appendices)

---

## 1. Project Overview

### What

`js-cloudimage-hotspot` is an open-source JavaScript library for adding interactive hotspots to images. It provides IKEA-style product exploration interfaces where users can hover, click, or tap markers placed on an image to reveal popovers with rich content — product details, prices, descriptions, and call-to-action buttons.

### Why

The existing ecosystem for image hotspots is fragmented and outdated:

- Most libraries are **jQuery-based** and unmaintained (3+ years without updates)
- **No library combines zoom/pan with hotspots** in a single, cohesive package
- **TypeScript support** is virtually nonexistent
- **Mobile-first design** and proper touch handling are rare
- **Accessibility** (WCAG compliance, keyboard navigation, screen readers) is poorly covered or absent
- No modern library offers **both vanilla JS and React** with a proper build pipeline
- **HTML data-attribute initialization** is not supported by any modern alternative

### Positioning

`js-cloudimage-hotspot` fills these gaps by providing:

- A **zero-dependency**, TypeScript-first library
- **Combined zoom/pan + hotspots** in a single package
- **Two equal initialization methods** — JavaScript API and HTML data-attributes
- **WCAG 2.1 AA** accessibility compliance out of the box
- **CSS variable theming** for easy customization
- A **React wrapper** with SSR support (v1.0), Vue/Svelte wrappers planned (v1.2+)
- **Modern build output** — ESM, CJS, and UMD in a single package
- **< 15 KB gzipped** bundle size

### Key Inspirations

- **IKEA product pages** — pulsing dot markers, clean white popovers, smooth hover transitions
- **Scaleflex `cloudimage-360`** — same build system pattern, React wrapper architecture, deployment pipeline

---

## 2. Core Features

### v1.0 Feature Set

| Feature | Description |
|---|---|
| **Image Display** | Responsive container with configurable aspect ratio, lazy loading via `IntersectionObserver` |
| **Hotspot Markers** | Positioned via percentage or pixel coordinates; pulsing dot animation with radiating ring |
| **Popovers** | Triggered on hover, click, or shown on load; built-in positioning with flip/shift; built-in templates and custom HTML content |
| **Zoom & Pan** | CSS transform-based, GPU-accelerated; mouse wheel, pinch-to-zoom, programmatic API |
| **Accessibility** | WCAG 2.1 AA; full keyboard navigation; ARIA attributes; focus management; reduced motion support |
| **Theming** | CSS variables as primary customization method; light (default) and dark themes |
| **Two Init Methods** | JavaScript API (`new CIHotspot()`) and HTML data-attributes (`data-ci-hotspot-*`) — fully equivalent |
| **React Wrapper** | Separate entry point with SSR support, hook API, ref-based instance access |
| **TypeScript** | Full type definitions, exported interfaces and types |
| **Cloudimage Integration** | Optional responsive image loading via Scaleflex Cloudimage CDN; auto-detects container width and device pixel ratio |
| **Build Formats** | ESM + CJS + UMD; single CDN file; `window.CIHotspot` global |

---

## 3. API Design

The library provides two fully equivalent initialization methods. Every configuration option available in the JavaScript API is also expressible via HTML data-attributes.

### 3.1 JavaScript API

```js
const instance = new CIHotspot(element, config);
```

**Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `element` | `HTMLElement \| string` | Container element or CSS selector |
| `config` | `CIHotspotConfig` | Configuration object |

**`CIHotspotConfig` interface:**

```ts
interface CIHotspotConfig {
  /** Image source URL */
  src: string;

  /** Alt text for the image */
  alt?: string;

  /** Array of hotspot definitions */
  hotspots: HotspotItem[];

  /** Popover trigger mode */
  trigger?: 'hover' | 'click' | 'load';

  /** Enable zoom & pan */
  zoom?: boolean;

  /** Maximum zoom level (default: 4) */
  zoomMax?: number;

  /** Minimum zoom level (default: 1) */
  zoomMin?: number;

  /** Theme — applies a preset of CSS variable values */
  theme?: 'light' | 'dark';

  /** Custom popover render function */
  renderPopover?: (hotspot: HotspotItem) => string | HTMLElement;

  /** Called when a hotspot is activated (popover opens) */
  onOpen?: (hotspot: HotspotItem) => void;

  /** Called when a hotspot is deactivated (popover closes) */
  onClose?: (hotspot: HotspotItem) => void;

  /** Called on zoom level change */
  onZoom?: (level: number) => void;

  /** Called when a hotspot marker is clicked */
  onClick?: (event: MouseEvent, hotspot: HotspotItem) => void;

  /** Enable/disable marker pulse animation (default: true) */
  pulse?: boolean;

  /** Show zoom controls UI (default: true when zoom is enabled) */
  zoomControls?: boolean;

  /** Popover placement preference */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';

  /** Enable lazy loading of the image (default: true) */
  lazyLoad?: boolean;

  /** Optional Cloudimage integration for responsive image loading */
  cloudimage?: {
    /** Cloudimage customer token (e.g. 'demo'). Enables Cloudimage when set. */
    token: string;

    /** API version (default: 'v7') */
    apiVersion?: string;

    /** Custom Cloudimage domain (default: 'cloudimg.io') */
    domain?: string;

    /**
     * Round requested width to nearest N pixels for better CDN caching.
     * Default: 100. E.g. container=373px → requests 400px.
     */
    limitFactor?: number;

    /** Custom URL transformation params appended to the Cloudimage URL (e.g. 'q=80&org_if_sml=1') */
    params?: string;

    /** Supported device pixel ratios (default: [1, 1.5, 2]) */
    devicePixelRatioList?: number[];
  };
}
```

**Instance methods:**

```ts
interface CIHotspotInstance {
  /** Open a specific hotspot popover by ID */
  open(id: string): void;

  /** Close a specific hotspot popover by ID */
  close(id: string): void;

  /** Close all open popovers */
  closeAll(): void;

  /** Set zoom level programmatically */
  setZoom(level: number): void;

  /** Get current zoom level */
  getZoom(): number;

  /** Reset zoom and pan to initial state */
  resetZoom(): void;

  /** Add a hotspot dynamically */
  addHotspot(hotspot: HotspotItem): void;

  /** Remove a hotspot by ID */
  removeHotspot(id: string): void;

  /** Update hotspot configuration */
  updateHotspot(id: string, updates: Partial<HotspotItem>): void;

  /** Destroy the instance and clean up DOM/listeners */
  destroy(): void;

  /** Update the entire configuration */
  update(config: Partial<CIHotspotConfig>): void;
}
```

**Usage example:**

```js
import CIHotspot from 'js-cloudimage-hotspot';

const viewer = new CIHotspot('#product-image', {
  src: 'https://example.com/living-room.jpg',
  alt: 'Modern living room',
  zoom: true,
  zoomMax: 4,
  trigger: 'hover',
  hotspots: [
    {
      id: 'sofa',
      x: '40%',
      y: '60%',
      label: 'Modern Sofa',
      data: { title: 'Modern Sofa', price: '$899', description: 'Comfortable 3-seat sofa' },
    },
    {
      id: 'lamp',
      x: '75%',
      y: '25%',
      label: 'Floor Lamp',
      data: { title: 'Arc Floor Lamp', price: '$249' },
    },
  ],
  onOpen(hotspot) {
    console.log('Opened:', hotspot.id);
  },
});
```

### 3.2 HTML Data-Attribute Initialization

All configuration is expressed via `data-ci-hotspot-*` attributes on the container element. Hotspot items are passed as a JSON array in `data-ci-hotspot-items`.

```html
<div
  data-ci-hotspot-src="https://example.com/room.jpg"
  data-ci-hotspot-alt="Living room"
  data-ci-hotspot-zoom="true"
  data-ci-hotspot-zoom-max="4"
  data-ci-hotspot-trigger="hover"
  data-ci-hotspot-theme="dark"
  data-ci-hotspot-pulse="true"
  data-ci-hotspot-placement="top"
  data-ci-hotspot-lazy-load="true"
  data-ci-hotspot-ci-token="demo"
  data-ci-hotspot-ci-params="q=80"
  data-ci-hotspot-items='[
    {"id":"sofa","x":"40%","y":"60%","label":"Sofa","data":{"title":"Modern Sofa","price":"$899"}},
    {"id":"lamp","x":"75%","y":"25%","label":"Floor Lamp","data":{"title":"Arc Lamp","price":"$249"}}
  ]'
></div>
```

**Auto-initialization (CDN usage):**

```html
<script src="https://cdn.scaleflex.it/plugins/js-cloudimage-hotspot/latest/js-cloudimage-hotspot.min.js"></script>
<script>CIHotspot.autoInit();</script>
```

`CIHotspot.autoInit()` scans the DOM for all elements with `data-ci-hotspot-src` and initializes each one. It returns an array of `CIHotspotInstance` objects.

```ts
CIHotspot.autoInit(root?: HTMLElement): CIHotspotInstance[];
```

**Attribute mapping:**

| HTML Attribute | Config Property | Type |
|---|---|---|
| `data-ci-hotspot-src` | `src` | `string` |
| `data-ci-hotspot-alt` | `alt` | `string` |
| `data-ci-hotspot-items` | `hotspots` | `JSON string → HotspotItem[]` |
| `data-ci-hotspot-trigger` | `trigger` | `'hover' \| 'click' \| 'load'` |
| `data-ci-hotspot-zoom` | `zoom` | `'true' \| 'false'` |
| `data-ci-hotspot-zoom-max` | `zoomMax` | `string → number` |
| `data-ci-hotspot-zoom-min` | `zoomMin` | `string → number` |
| `data-ci-hotspot-theme` | `theme` | `'light' \| 'dark'` |
| `data-ci-hotspot-pulse` | `pulse` | `'true' \| 'false'` |
| `data-ci-hotspot-placement` | `placement` | `'top' \| 'bottom' \| 'left' \| 'right' \| 'auto'` |
| `data-ci-hotspot-lazy-load` | `lazyLoad` | `'true' \| 'false'` |
| `data-ci-hotspot-zoom-controls` | `zoomControls` | `'true' \| 'false'` |
| `data-ci-hotspot-ci-token` | `cloudimage.token` | `string` |
| `data-ci-hotspot-ci-api-version` | `cloudimage.apiVersion` | `string` |
| `data-ci-hotspot-ci-domain` | `cloudimage.domain` | `string` |
| `data-ci-hotspot-ci-limit-factor` | `cloudimage.limitFactor` | `string → number` |
| `data-ci-hotspot-ci-params` | `cloudimage.params` | `string` |

> **Note:** Callback options (`onOpen`, `onClose`, `onClick`, `onZoom`, `renderPopover`) are only available via the JavaScript API, as functions cannot be expressed as HTML attributes. To attach callbacks to HTML-initialized instances, retrieve the instance from `autoInit()` return value and call methods on it.

---

## 4. Hotspot Configuration

### 4.1 `HotspotItem` Interface

```ts
interface HotspotItem {
  /** Unique identifier (required) */
  id: string;

  /**
   * X coordinate.
   * - Percentage string: '65%' (relative to image width)
   * - Number: 650 (pixels, will be internally normalized to %)
   */
  x: string | number;

  /**
   * Y coordinate.
   * - Percentage string: '40%' (relative to image height)
   * - Number: 400 (pixels, will be internally normalized to %)
   */
  y: string | number;

  /** Accessible label displayed as marker tooltip and used by screen readers */
  label: string;

  /** Arbitrary data passed to the popover template */
  data?: Record<string, unknown>;

  /** Raw HTML content for the popover (sanitized before rendering) */
  content?: string;

  /** Custom CSS class added to this marker element */
  className?: string;

  /** Override global trigger for this specific hotspot */
  trigger?: 'hover' | 'click' | 'load';

  /** Keep popover open until explicitly closed (default: false) */
  keepOpen?: boolean;

  /** Override global placement for this specific hotspot's popover */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';

  /** Custom click handler for this hotspot */
  onClick?: (event: MouseEvent, hotspot: HotspotItem) => void;

  /** Whether this hotspot marker is initially hidden (default: false) */
  hidden?: boolean;

  /** Custom icon — CSS class name, SVG string, or image URL */
  icon?: string;

  /** Scene ID to navigate to on click (v1.3 multi-image) */
  navigateTo?: string;
}
```

### 4.2 Coordinate System

**Percentage coordinates (recommended):**

```js
{ x: '65%', y: '40%' }
```

Percentages are relative to the image's natural dimensions. A hotspot at `x: '50%', y: '50%'` is always centered on the image regardless of display size.

**Pixel coordinates:**

```js
{ x: 650, y: 400 }
```

Pixel values reference the image's natural width/height. They are internally converted to percentages on initialization:

```
percentX = (pixelX / image.naturalWidth) * 100
percentY = (pixelY / image.naturalHeight) * 100
```

**Internal storage:** All coordinates are normalized to percentages internally. This ensures hotspots remain correctly positioned at any display size. Markers are rendered using `position: absolute` with `left` and `top` set to the computed percentage values within the image wrapper.

---

## 5. Visual Design

### 5.1 CSS Variables (Primary Theming Mechanism)

All visual customization is done via CSS custom properties. Consumers override colors and sizes by setting CSS variables on the container or any ancestor element.

```css
/* === Marker === */
--ci-hotspot-marker-size: 24px;
--ci-hotspot-marker-color: #ffffff;
--ci-hotspot-marker-bg: rgba(0, 0, 0, 0.6);
--ci-hotspot-marker-border: 2px solid rgba(255, 255, 255, 0.8);
--ci-hotspot-marker-border-radius: 50%;
--ci-hotspot-marker-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

/* === Marker Pulse Animation === */
--ci-hotspot-pulse-color: rgba(0, 0, 0, 0.2);
--ci-hotspot-pulse-size: 40px;
--ci-hotspot-pulse-duration: 1.8s;

/* === Popover === */
--ci-hotspot-popover-bg: #ffffff;
--ci-hotspot-popover-color: #1a1a1a;
--ci-hotspot-popover-border: 1px solid rgba(0, 0, 0, 0.1);
--ci-hotspot-popover-border-radius: 12px;
--ci-hotspot-popover-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
--ci-hotspot-popover-padding: 16px;
--ci-hotspot-popover-max-width: 320px;
--ci-hotspot-popover-font-family: inherit;
--ci-hotspot-popover-font-size: 14px;
--ci-hotspot-popover-line-height: 1.5;
--ci-hotspot-popover-z-index: 1000;

/* === Popover Arrow === */
--ci-hotspot-arrow-size: 8px;
--ci-hotspot-arrow-color: var(--ci-hotspot-popover-bg);

/* === Popover Content (built-in template) === */
--ci-hotspot-title-font-size: 16px;
--ci-hotspot-title-font-weight: 600;
--ci-hotspot-title-color: var(--ci-hotspot-popover-color);
--ci-hotspot-price-color: #2d8c3c;
--ci-hotspot-price-font-size: 18px;
--ci-hotspot-price-font-weight: 700;
--ci-hotspot-description-color: #666666;
--ci-hotspot-cta-bg: #0058a3;
--ci-hotspot-cta-color: #ffffff;
--ci-hotspot-cta-border-radius: 8px;
--ci-hotspot-cta-padding: 8px 16px;

/* === Transitions === */
--ci-hotspot-hover-transition: 200ms ease;
--ci-hotspot-popover-transition: 300ms ease;

/* === Zoom Controls === */
--ci-hotspot-zoom-controls-bg: rgba(255, 255, 255, 0.9);
--ci-hotspot-zoom-controls-color: #333333;
--ci-hotspot-zoom-controls-border-radius: 8px;
--ci-hotspot-zoom-controls-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
```

**Custom theming example:**

```css
/* Brand-colored hotspots */
.my-product-viewer {
  --ci-hotspot-marker-bg: rgba(0, 88, 163, 0.8);
  --ci-hotspot-pulse-color: rgba(0, 88, 163, 0.3);
  --ci-hotspot-cta-bg: #e63946;
  --ci-hotspot-popover-border-radius: 4px;
}
```

### 5.2 Light & Dark Themes

Themes are implemented as sets of CSS variable overrides. Setting `theme: 'dark'` (or `data-ci-hotspot-theme="dark"`) applies the `ci-hotspot-theme-dark` class to the container, which activates dark variable values.

**Dark theme overrides:**

```css
.ci-hotspot-theme-dark {
  --ci-hotspot-marker-bg: rgba(255, 255, 255, 0.8);
  --ci-hotspot-marker-color: #1a1a1a;
  --ci-hotspot-marker-border: 2px solid rgba(255, 255, 255, 0.4);
  --ci-hotspot-pulse-color: rgba(255, 255, 255, 0.2);
  --ci-hotspot-popover-bg: #1a1a1a;
  --ci-hotspot-popover-color: #f0f0f0;
  --ci-hotspot-popover-border: 1px solid rgba(255, 255, 255, 0.1);
  --ci-hotspot-popover-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  --ci-hotspot-description-color: #aaaaaa;
  --ci-hotspot-zoom-controls-bg: rgba(30, 30, 30, 0.9);
  --ci-hotspot-zoom-controls-color: #f0f0f0;
}
```

### 5.3 Marker Animations (IKEA-Style)

**Pulse animation:**

```css
@keyframes ci-hotspot-pulse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.8);
    opacity: 0;
  }
}
```

The marker element uses a `::before` pseudo-element for the radiating ring effect. The main dot itself has a subtle scale oscillation:

```css
@keyframes ci-hotspot-breathe {
  0%, 100% {
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    transform: translate(-50%, -50%) scale(1.15);
  }
}
```

**Hover state:** On hover, markers scale up slightly (`scale(1.2)`) with a `200ms ease` transition, and the cursor changes to `pointer`.

**Popover entrance:** Popovers use a `fade + slight shift` animation:

```css
@keyframes ci-hotspot-popover-in {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### 5.4 Reduced Motion

All animations respect the `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  .ci-hotspot-marker,
  .ci-hotspot-marker::before,
  .ci-hotspot-popover {
    animation: none !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 6. Zoom & Pan

### 6.1 Implementation

Zoom and pan use CSS transforms on an inner wrapper element for GPU-accelerated rendering:

```
<div class="ci-hotspot-container">          ← outer container (overflow: hidden)
  <div class="ci-hotspot-viewport">         ← receives transform: scale() translate()
    <img class="ci-hotspot-image" />
    <div class="ci-hotspot-markers">        ← marker layer
      <button class="ci-hotspot-marker" />
      <button class="ci-hotspot-marker" />
    </div>
  </div>
</div>
```

The viewport element receives:

```css
.ci-hotspot-viewport {
  transform: scale(var(--zoom)) translate(var(--pan-x), var(--pan-y));
  transform-origin: 0 0;
  will-change: transform;
}
```

### 6.2 Input Methods

| Input | Behavior |
|---|---|
| **Mouse wheel** | Zoom in/out centered on cursor position |
| **Pinch gesture** | Zoom in/out centered between two touch points |
| **Double-click / Double-tap** | Toggle between 1x and 2x zoom |
| **Click-drag / Touch-drag** | Pan when zoomed in (zoom level > 1) |
| **Zoom controls UI** | `+` and `−` buttons, reset button |
| **Programmatic** | `instance.setZoom(level)`, `instance.resetZoom()` |

### 6.3 Zoom Constraints

- **Min zoom:** 1 (default) — configurable via `zoomMin`
- **Max zoom:** 4 (default) — configurable via `zoomMax`
- **Pan boundaries:** The image cannot be panned beyond its edges; the visible area always shows image content
- **Smooth transitions:** Zoom level changes animate with `transition: transform 300ms ease`

### 6.4 Marker Behavior During Zoom

Hotspot markers maintain their visual size during zoom using a **counter-scale** technique:

```css
.ci-hotspot-marker {
  transform: translate(-50%, -50%) scale(calc(1 / var(--zoom)));
}
```

This keeps markers at a consistent clickable/tappable size regardless of zoom level while preserving their correct position on the image.

### 6.5 Zoom Controls UI

When `zoomControls` is enabled (default when `zoom: true`), a floating control bar appears at the bottom-right of the container:

```
┌─────────────────────────────────────────┐
│                                         │
│              [image]                    │
│                                         │
│                            ┌───────┐    │
│                            │ + − ⟲ │    │
│                            └───────┘    │
└─────────────────────────────────────────┘
```

Buttons: zoom in (`+`), zoom out (`−`), reset (`⟲`). Styled via `--ci-hotspot-zoom-controls-*` CSS variables.

---

## 7. Popover System

### 7.1 Trigger Modes

| Mode | Desktop | Mobile (touch) | Keyboard |
|---|---|---|---|
| `'hover'` (default) | Show on `mouseenter`, hide on `mouseleave` | Show on `tap`, hide on tap-outside | Show on `focus`, hide on `blur` |
| `'click'` | Show/hide on `click` | Show/hide on `tap` | Show/hide on `Enter` / `Space` |
| `'load'` | Show immediately on init | Show immediately on init | Show immediately; focus on `Tab` |

**Keyboard behavior is always active** regardless of trigger mode — `focus` shows the popover, `blur` hides it. This ensures accessibility.

**Hide delay:** Popovers have a configurable hide delay (default `200ms`) to prevent flickering when moving between the marker and popover content. The delay is cleared if the cursor enters the popover.

### 7.2 Positioning Algorithm

The library includes a built-in popover positioning engine — **no external dependency** (no Floating UI, no Popper.js). This keeps the bundle at zero runtime dependencies.

**Algorithm:**

1. **Preferred placement:** Use the `placement` option (default: `'top'`)
2. **Measure:** Calculate popover dimensions and available space on each side of the marker
3. **Flip:** If the popover overflows the container on the preferred side, flip to the opposite side
4. **Shift:** If the popover overflows horizontally (for top/bottom placement) or vertically (for left/right placement), shift it along the cross-axis to stay within bounds
5. **Arrow:** Position the arrow element to point at the marker, adjusting for any shift offset

**Placement options:** `'top'` | `'bottom'` | `'left'` | `'right'` | `'auto'`

- `'auto'` chooses the side with the most available space

### 7.3 Popover Structure

```html
<div class="ci-hotspot-popover" role="tooltip" data-placement="top">
  <div class="ci-hotspot-popover-arrow"></div>
  <div class="ci-hotspot-popover-content">
    <!-- Built-in template OR custom content -->
  </div>
</div>
```

### 7.4 Built-in Template

When `hotspot.data` is provided (and no custom `content` or `renderPopover` is used), the built-in template renders:

```html
<div class="ci-hotspot-popover-content">
  <img class="ci-hotspot-popover-image" src="{data.image}" alt="{data.title}" />
  <div class="ci-hotspot-popover-body">
    <h3 class="ci-hotspot-popover-title">{data.title}</h3>
    <span class="ci-hotspot-popover-price">{data.price}</span>
    <p class="ci-hotspot-popover-description">{data.description}</p>
    <a class="ci-hotspot-popover-cta" href="{data.url}">{data.ctaText || 'View details'}</a>
  </div>
</div>
```

Only elements with corresponding data fields are rendered. For example, if `data.image` is not provided, the `<img>` is omitted.

**Built-in template data fields:**

| Field | Type | Description |
|---|---|---|
| `data.title` | `string` | Product/item title |
| `data.price` | `string` | Price display text |
| `data.description` | `string` | Short description |
| `data.image` | `string` | Product image URL |
| `data.url` | `string` | Link URL for the CTA button |
| `data.ctaText` | `string` | CTA button text (default: `'View details'`) |

### 7.5 Custom Content

**HTML string via `content`:**

```js
{
  id: 'custom-spot',
  x: '50%',
  y: '50%',
  label: 'Custom',
  content: '<div class="my-popover"><h3>Custom Title</h3><p>Custom content here.</p></div>'
}
```

**Render function via `renderPopover`:**

```js
new CIHotspot(el, {
  src: '/image.jpg',
  hotspots: [...],
  renderPopover(hotspot) {
    const el = document.createElement('div');
    el.innerHTML = `<strong>${hotspot.data.title}</strong>`;
    return el;
  }
});
```

### 7.6 XSS Sanitization

All user-provided HTML content (`content` field, `data` values rendered in the built-in template) is sanitized before DOM insertion:

- HTML tags are restricted to a safe allowlist: `<a>`, `<b>`, `<br>`, `<div>`, `<em>`, `<h1>`–`<h6>`, `<i>`, `<img>`, `<li>`, `<ol>`, `<p>`, `<span>`, `<strong>`, `<ul>`
- Attributes are restricted: `class`, `href`, `src`, `alt`, `title`, `target`, `rel`
- `href` values must use `http:`, `https:`, or `mailto:` protocols — `javascript:` is blocked
- Event handler attributes (`onclick`, `onerror`, etc.) are stripped

The `renderPopover` function bypasses sanitization since it returns controlled DOM elements.

---

## 8. React Wrapper API

### 8.1 Entry Point

```ts
import { CIHotspotViewer, useCIHotspot } from 'js-cloudimage-hotspot/react';
```

The React wrapper is a **separate entry point** to avoid bundling React for vanilla JS consumers. React is an **optional peer dependency**.

### 8.2 `<CIHotspotViewer>` Component

```tsx
interface CIHotspotViewerProps {
  src: string;
  alt?: string;
  hotspots: HotspotItem[];
  trigger?: 'hover' | 'click' | 'load';
  zoom?: boolean;
  zoomMax?: number;
  zoomMin?: number;
  theme?: 'light' | 'dark';
  pulse?: boolean;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  zoomControls?: boolean;
  lazyLoad?: boolean;
  cloudimage?: CIHotspotConfig['cloudimage'];
  renderPopover?: (hotspot: HotspotItem) => React.ReactNode;
  onOpen?: (hotspot: HotspotItem) => void;
  onClose?: (hotspot: HotspotItem) => void;
  onZoom?: (level: number) => void;
  onClick?: (event: React.MouseEvent, hotspot: HotspotItem) => void;
  className?: string;
  style?: React.CSSProperties;
}
```

**Usage example:**

```tsx
import { CIHotspotViewer } from 'js-cloudimage-hotspot/react';

function ProductImage() {
  return (
    <CIHotspotViewer
      src="/living-room.jpg"
      alt="Living room"
      zoom
      zoomMax={4}
      trigger="hover"
      hotspots={[
        { id: 'sofa', x: '40%', y: '60%', label: 'Sofa', data: { title: 'Modern Sofa', price: '$899' } },
        { id: 'lamp', x: '75%', y: '25%', label: 'Lamp', data: { title: 'Arc Lamp', price: '$249' } },
      ]}
      onOpen={(hotspot) => console.log('Opened:', hotspot.id)}
      renderPopover={(hotspot) => (
        <div className="custom-popover">
          <h3>{hotspot.data?.title}</h3>
          <p>{hotspot.data?.price}</p>
        </div>
      )}
    />
  );
}
```

### 8.3 `useCIHotspot` Hook

Provides direct access to the vanilla `CIHotspotInstance` for imperative control:

```tsx
import { useCIHotspot } from 'js-cloudimage-hotspot/react';

function ProductImage() {
  const { containerRef, instance } = useCIHotspot({
    src: '/room.jpg',
    hotspots: [...],
    zoom: true,
  });

  return (
    <>
      <div ref={containerRef} />
      <button onClick={() => instance.current?.setZoom(2)}>Zoom to 2x</button>
      <button onClick={() => instance.current?.resetZoom()}>Reset</button>
    </>
  );
}
```

### 8.4 Ref API

The `<CIHotspotViewer>` component forwards a ref exposing instance methods:

```tsx
import { useRef } from 'react';
import { CIHotspotViewer, CIHotspotViewerRef } from 'js-cloudimage-hotspot/react';

function ProductImage() {
  const viewerRef = useRef<CIHotspotViewerRef>(null);

  return (
    <>
      <CIHotspotViewer ref={viewerRef} src="/room.jpg" hotspots={[...]} zoom />
      <button onClick={() => viewerRef.current?.open('sofa')}>Show Sofa</button>
      <button onClick={() => viewerRef.current?.setZoom(3)}>Zoom 3x</button>
    </>
  );
}
```

### 8.5 SSR Safety

The React wrapper is SSR-safe:

- The vanilla core is instantiated inside `useEffect` (client-only)
- No `window`, `document`, or `navigator` access during server rendering
- The component renders an empty container `<div>` on the server; hydration attaches the hotspot viewer

---

## 9. Accessibility

### 9.1 WCAG 2.1 AA Compliance

The library targets WCAG 2.1 Level AA conformance across all interactive elements.

### 9.2 Keyboard Navigation

| Key | Action |
|---|---|
| `Tab` | Move focus to the next hotspot marker (in DOM order) |
| `Shift + Tab` | Move focus to the previous hotspot marker |
| `Enter` / `Space` | Open/close the popover for the focused marker |
| `Escape` | Close the currently open popover; return focus to marker |
| Arrow keys | Pan the image when zoomed in |
| `+` / `=` | Zoom in |
| `-` | Zoom out |
| `0` | Reset zoom |

### 9.3 ARIA Attributes

**Marker buttons:**

```html
<button
  class="ci-hotspot-marker"
  role="button"
  aria-label="{hotspot.label}"
  aria-expanded="false"
  aria-describedby="ci-hotspot-popover-{id}"
  tabindex="0"
>
  <!-- marker visual -->
</button>
```

**Popover:**

```html
<div
  class="ci-hotspot-popover"
  id="ci-hotspot-popover-{id}"
  role="tooltip"
  aria-hidden="true"
>
  <!-- popover content -->
</div>
```

When a popover is open:
- `aria-expanded` on the marker is set to `"true"`
- `aria-hidden` on the popover is set to `"false"`

### 9.4 Focus Management

- **Focus always shows popover:** Regardless of trigger mode, focusing a marker via keyboard always opens its popover. Blurring always closes it.
- **Focus trap in popovers:** When a popover contains interactive elements (links, buttons), `Tab` cycles within the popover. `Escape` exits the trap and returns focus to the marker.
- **Focus ring:** Markers display a visible focus ring when focused via keyboard (`:focus-visible`), styled with `outline` to ensure visibility against any background.

### 9.5 Screen Reader Support

- All markers are `<button>` elements with descriptive `aria-label` text
- Popovers are associated via `aria-describedby`
- The container has `role="img"` with an `aria-label` matching the `alt` text
- Hidden decorative elements use `aria-hidden="true"`
- Dynamic state changes (popover open/close) use `aria-expanded` and `aria-hidden` toggles, announced by screen readers

### 9.6 Reduced Motion

All animations and transitions respect the `prefers-reduced-motion: reduce` media query (see [Section 5.4](#54-reduced-motion)). When reduced motion is preferred:

- Pulse and breathe animations are disabled
- Popover transitions are instant
- Zoom transitions are instant

---

## 10. Build & Distribution

### 10.1 Build Tool

**Vite** is used as the build tool, following the pattern established by Scaleflex's `cloudimage-360` project.

### 10.2 Output Formats

| Format | File | Use Case |
|---|---|---|
| **ESM** | `dist/js-cloudimage-hotspot.esm.js` | Modern bundlers (Webpack, Vite, Rollup) |
| **CJS** | `dist/js-cloudimage-hotspot.cjs.js` | Node.js, legacy bundlers |
| **UMD** | `dist/js-cloudimage-hotspot.min.js` | CDN `<script>` tag, exposes `window.CIHotspot` |
| **TypeScript** | `dist/index.d.ts` | Type definitions |
| **React ESM** | `dist/react/index.js` | React wrapper (ESM) |
| **React CJS** | `dist/react/index.cjs` | React wrapper (CJS) |
| **React Types** | `dist/react/index.d.ts` | React wrapper type definitions |

### 10.3 `package.json` Configuration

```json
{
  "name": "js-cloudimage-hotspot",
  "version": "1.0.0",
  "description": "Interactive image hotspots with zoom, popovers, and accessibility",
  "license": "MIT",
  "main": "dist/js-cloudimage-hotspot.cjs.js",
  "module": "dist/js-cloudimage-hotspot.esm.js",
  "unpkg": "dist/js-cloudimage-hotspot.min.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/js-cloudimage-hotspot.esm.js",
      "require": "./dist/js-cloudimage-hotspot.cjs.js"
    },
    "./react": {
      "types": "./dist/react/index.d.ts",
      "import": "./dist/react/index.js",
      "require": "./dist/react/index.cjs"
    }
  },
  "files": [
    "dist"
  ],
  "peerDependencies": {
    "react": ">=17.0.0",
    "react-dom": ">=17.0.0"
  },
  "peerDependenciesMeta": {
    "react": { "optional": true },
    "react-dom": { "optional": true }
  },
  "sideEffects": false
}
```

### 10.4 npm Scripts

| Script | Description |
|---|---|
| `dev` | Start Vite dev server with demo page |
| `dev:react` | Start Vite dev server with React demo |
| `build` | Build all formats (main bundle + React wrapper) |
| `build:bundle` | Build main bundle only (ESM + CJS + UMD) |
| `build:react` | Build React wrapper only |
| `build:demo` | Build GitHub Pages demo site |
| `deploy:demo` | Deploy demo to `gh-pages` branch |
| `test` | Run tests with Vitest |
| `test:watch` | Run tests in watch mode |
| `lint` | Run ESLint |
| `typecheck` | Run TypeScript type checking |

### 10.5 Bundle Size Targets

| Bundle | Target |
|---|---|
| Core (UMD, minified + gzipped) | < 15 KB |
| Core (ESM, minified + gzipped) | < 12 KB |
| React wrapper (ESM, minified + gzipped) | < 3 KB |

### 10.6 CDN

The UMD bundle is available via Scaleflex CDN:

```
https://cdn.scaleflex.it/plugins/js-cloudimage-hotspot/latest/js-cloudimage-hotspot.min.js
```

Version-specific URLs:

```
https://cdn.scaleflex.it/plugins/js-cloudimage-hotspot/1.0.0/js-cloudimage-hotspot.min.js
```

### 10.7 Zero Runtime Dependencies

The library has **zero runtime dependencies**. All functionality — popover positioning, zoom/pan, animations, sanitization — is implemented within the library itself.

---

## 11. Project Structure

```
js-cloudimage-hotspot/
├── src/
│   ├── index.ts                    # Main entry — CIHotspot class + autoInit
│   ├── core/
│   │   ├── CIHotspot.ts            # Core class implementation
│   │   ├── config.ts               # Config parsing, defaults, data-attr mapping
│   │   └── types.ts                # TypeScript interfaces and types
│   ├── markers/
│   │   ├── Marker.ts               # Marker element creation and positioning
│   │   └── pulse.ts                # Pulse animation logic
│   ├── popover/
│   │   ├── Popover.ts              # Popover creation and lifecycle
│   │   ├── position.ts             # Built-in flip/shift positioning engine
│   │   ├── template.ts             # Built-in popover templates
│   │   └── sanitize.ts             # HTML sanitization
│   ├── zoom/
│   │   ├── ZoomPan.ts              # Zoom and pan controller
│   │   ├── controls.ts             # Zoom controls UI
│   │   └── gestures.ts             # Touch gesture handling (pinch, drag)
│   ├── a11y/
│   │   ├── keyboard.ts             # Keyboard navigation handler
│   │   ├── focus.ts                # Focus management and focus trap
│   │   └── aria.ts                 # ARIA attribute management
│   ├── utils/
│   │   ├── dom.ts                  # DOM utilities
│   │   ├── cloudimage.ts          # Cloudimage URL builder and responsive sizing
│   │   ├── coordinates.ts          # Coordinate parsing and normalization
│   │   └── events.ts               # Event emitter / listener helpers
│   ├── styles/
│   │   └── index.css               # All styles (injected at runtime or importable)
│   └── react/
│       ├── index.ts                # React entry point
│       ├── CIHotspotViewer.tsx      # React component
│       ├── useCIHotspot.ts          # React hook
│       └── types.ts                # React-specific types
├── demo/
│   ├── index.html                  # Vanilla JS demo page
│   ├── assets/                     # Demo images and assets
│   └── react-demo/
│       ├── index.html              # React demo entry
│       ├── App.tsx                  # React demo application
│       └── main.tsx                # React demo mount
├── tests/
│   ├── core.test.ts                # Core functionality tests
│   ├── popover.test.ts             # Popover system tests
│   ├── zoom.test.ts                # Zoom & pan tests
│   ├── a11y.test.ts                # Accessibility tests
│   ├── sanitize.test.ts            # XSS sanitization tests
│   ├── coordinates.test.ts         # Coordinate system tests
│   ├── data-attr.test.ts           # HTML data-attribute init tests
│   └── react.test.tsx              # React wrapper tests
├── config/
│   ├── vite.config.ts              # Main bundle build config
│   ├── vite.react.config.ts        # React wrapper build config
│   └── vite.demo.config.ts         # Demo build config
├── package.json
├── tsconfig.json
├── .eslintrc.js
├── .gitignore
├── LICENSE
├── README.md
└── SPECS.md                        # This file
```

---

## 12. GitHub Pages Demo

The demo site is hosted at `https://scaleflex.github.io/js-cloudimage-hotspot/` and deployed via the `gh-pages` npm package.

### 12.1 Demo Sections

| Section | Description |
|---|---|
| **Hero** | Full-width IKEA-style living room image with 4–5 hotspots; interactive and immediately engaging |
| **Getting Started** | Installation instructions (npm + CDN), minimal code example |
| **Trigger Modes** | Side-by-side comparison of hover, click, and load triggers |
| **Zoom & Pan** | Image with zoom enabled; demonstrates mouse wheel, pinch, and controls |
| **Custom Styling** | Same image with multiple theme variations (light, dark, brand colors) via CSS variable overrides |
| **HTML Initialization** | Complete working example using only data-attributes — zero JavaScript |
| **React Example** | Code snippet and live preview of the React wrapper |
| **Accessibility** | Demonstrates keyboard navigation with on-screen key indicator |
| **API Playground** | Interactive configurator (see below) |

### 12.2 Interactive Configurator

A panel that lets visitors:

- Toggle configuration options: trigger mode, zoom, pulse, theme, placement
- Add/remove/reposition hotspots by clicking on the image
- Edit hotspot data (title, price, description)
- See the generated JavaScript and HTML code update in real-time
- Copy the generated code to clipboard

### 12.3 Demo Images

Demo images should be high-quality, royalty-free photographs:

- **Living room** — primary showcase (IKEA-style furniture scene)
- **Product close-up** — demonstrates zoom capability
- **Kitchen** — multi-hotspot scene
- **Automobile** — future multi-image navigation demo (v1.3)

All demo images should be served via Scaleflex CDN with responsive sizing.

---

## 13. Additional Features

### 13.1 Clustering (v1.0)

When many hotspots are close together at low zoom levels, markers can overlap. Optional grid-based clustering groups nearby markers into a single cluster indicator showing the count.

- Clustering is disabled by default
- Enable via `clustering: true` in config or `data-ci-hotspot-clustering="true"`
- As the user zooms in, clusters split into individual markers
- Cluster indicators show the number of contained hotspots
- Clicking a cluster zooms to fit all contained hotspots

### 13.2 Lazy Loading (v1.0)

The image uses `IntersectionObserver` to defer loading until the container enters the viewport. A lightweight placeholder (blurred thumbnail or solid color) is shown while the image loads.

- Enabled by default (`lazyLoad: true`)
- The container element has a defined aspect ratio to prevent layout shift

### 13.3 Cloudimage Integration (v1.0)

When a `cloudimage` configuration is provided with a valid `token`, the library automatically requests optimally-sized images from the Scaleflex Cloudimage CDN instead of using the raw `src` URL. This is entirely optional — when no `cloudimage` config is provided (or `token` is falsy), the `src` is used as-is with zero overhead.

#### How it works

1. **Detect container width:** Read `container.offsetWidth` to determine the displayed image width
2. **Multiply by device pixel ratio:** `requestedWidth = containerWidth * window.devicePixelRatio`
3. **Round to `limitFactor`:** Round `requestedWidth` up to the nearest `limitFactor` (default: 100px) for better CDN cache hit rates. E.g. container=373px, DPR=2 → raw=746px → rounded=800px
4. **Build Cloudimage URL:** Construct the optimized image URL
5. **Set as `<img>` src:** The built URL replaces the raw `src` on the image element

#### URL construction

```
https://{token}.{domain}/{apiVersion}/{src}?width={requestedWidth}&{params}
```

With defaults:

```
https://demo.cloudimg.io/v7/https://example.com/room.jpg?width=800
```

With custom params:

```
https://demo.cloudimg.io/v7/https://example.com/room.jpg?width=800&q=80&org_if_sml=1
```

#### When disabled

If `cloudimage` is not provided in the config, or `cloudimage.token` is falsy (empty string, `undefined`), the library uses the raw `src` URL unchanged. There is no Cloudimage-related code executed at runtime — the feature is fully tree-shakeable when not configured.

#### Resize handling

A `ResizeObserver` monitors the container element. When the container width changes such that the rounded requested width crosses a `limitFactor` boundary, a new Cloudimage URL is built and the image `src` is updated. This is debounced (default: 100ms) to avoid excessive requests during window resizing.

```
Container: 400px → 500px (same limitFactor bucket at DPR=1) → no new request
Container: 400px → 550px (crosses to next bucket at DPR=2: 800→1100→1200) → new request
```

#### Interaction with zoom

When zoom level > 1, the requested image width accounts for the zoom level to maintain sharpness:

```
requestedWidth = containerWidth * zoomLevel * devicePixelRatio
```

This is rounded to `limitFactor` and capped at the image's natural dimensions if known (to avoid upscaling beyond the original resolution). As the user zooms in, a higher-resolution image is requested from Cloudimage.

#### Interaction with scenes (v1.3)

When multi-image navigation is enabled, each scene's `src` is independently processed through the Cloudimage URL builder. Navigating to a new scene triggers a fresh width calculation and Cloudimage URL construction for that scene's image.

#### JavaScript example

```js
const viewer = new CIHotspot('#product-image', {
  src: 'https://example.com/living-room.jpg',
  alt: 'Modern living room',
  zoom: true,
  cloudimage: {
    token: 'demo',
    limitFactor: 100,
    params: 'q=80&org_if_sml=1',
  },
  hotspots: [
    { id: 'sofa', x: '40%', y: '60%', label: 'Modern Sofa', data: { title: 'Sofa', price: '$899' } },
  ],
});
```

#### HTML-only example

```html
<div
  data-ci-hotspot-src="https://example.com/living-room.jpg"
  data-ci-hotspot-alt="Modern living room"
  data-ci-hotspot-zoom="true"
  data-ci-hotspot-ci-token="demo"
  data-ci-hotspot-ci-params="q=80&org_if_sml=1"
  data-ci-hotspot-items='[
    {"id":"sofa","x":"40%","y":"60%","label":"Sofa","data":{"title":"Sofa","price":"$899"}}
  ]'
></div>
```

### 13.4 Analytics Hooks (v1.0)

Event callbacks enable integration with analytics platforms:

```js
new CIHotspot(el, {
  src: '/room.jpg',
  hotspots: [...],
  onOpen(hotspot) {
    analytics.track('hotspot_view', { id: hotspot.id, label: hotspot.label });
  },
  onClick(event, hotspot) {
    analytics.track('hotspot_click', { id: hotspot.id });
  },
  onZoom(level) {
    analytics.track('image_zoom', { level });
  },
});
```

### 13.5 Responsive Breakpoints (v1.0)

Hotspot visibility can be controlled per breakpoint:

```js
{
  id: 'detail',
  x: '80%',
  y: '20%',
  label: 'Small detail',
  responsive: {
    maxWidth: 768,  // Hide on screens narrower than 768px
    action: 'hide'  // 'hide' | 'collapse' (show marker, no popover)
  }
}
```

The library listens to `ResizeObserver` on the container (not `window.resize`) for container-query-like behavior.

### 13.6 Editor Mode (v1.2+)

A visual hotspot editor that enables:

- Click on the image to place a new hotspot marker
- Drag existing markers to reposition them
- Edit hotspot properties via an inline form
- Delete hotspots
- Export the current configuration as JSON
- Import/load a configuration from JSON

The editor is a separate opt-in module to avoid increasing the core bundle size.

### 13.7 Multi-Image Navigation (v1.3)

Scenes allow navigation between multiple images, each with its own set of hotspots. This enables experiences like:

- **Room exploration:** Navigate from living room to bedroom to kitchen
- **Car configurator:** Exterior → open door → interior → dashboard close-up
- **Product 360:** Front → side → back views with relevant hotspots per view

**Configuration:**

```js
new CIHotspot(element, {
  scenes: [
    {
      id: 'exterior',
      src: '/car-exterior.jpg',
      hotspots: [
        { id: 'door', x: '45%', y: '50%', label: 'Open Door', navigateTo: 'interior' },
        { id: 'hood', x: '20%', y: '40%', label: 'Engine', data: { title: 'V8 Engine' } },
      ]
    },
    {
      id: 'interior',
      src: '/car-interior.jpg',
      hotspots: [
        { id: 'back', x: '5%', y: '50%', label: 'Back to Exterior', navigateTo: 'exterior' },
        { id: 'dash', x: '50%', y: '30%', label: 'Dashboard', data: { title: 'Digital Cockpit' } },
      ]
    }
  ],
  initialScene: 'exterior',
  sceneTransition: 'fade', // 'fade' | 'slide' | 'none'
});
```

**Scene interface:**

```ts
interface Scene {
  /** Unique scene identifier */
  id: string;

  /** Image source URL for this scene */
  src: string;

  /** Alt text for this scene's image */
  alt?: string;

  /** Hotspots specific to this scene */
  hotspots: HotspotItem[];
}
```

**`navigateTo` behavior:** When a hotspot with `navigateTo` is activated, the viewer transitions to the target scene using the configured `sceneTransition` animation. The new scene's image loads (with a loading state), and the new hotspots are rendered.

**Scene transition types:**

| Transition | Effect |
|---|---|
| `'fade'` | Cross-fade between scenes (default) |
| `'slide'` | Slide horizontally (old scene exits left, new enters right) |
| `'none'` | Instant switch, no animation |

**Instance methods for scenes:**

```ts
interface CIHotspotInstance {
  /** Navigate to a scene by ID */
  goToScene(sceneId: string): void;

  /** Get the current scene ID */
  getCurrentScene(): string;

  /** Get all scene IDs */
  getScenes(): string[];
}
```

### 13.8 SSR Compatibility (v1.0)

The vanilla core gracefully handles server-side rendering environments:

- No top-level `window`, `document`, or `navigator` access
- All DOM operations are guarded with environment checks
- The React wrapper initializes the viewer in `useEffect` only (client-side)

---

## 14. Competitor Feature Matrix

| Feature | js-cloudimage-hotspot | image-hotspot | jquery-hotspot | POI.js | react-image-hotspots | Annotorious | AJAX-ZOOM | @hogrid/react-hotspot-viewer | image-map-resizer |
|---|---|---|---|---|---|---|---|---|---|
| **TypeScript** | Yes (first-class) | No | No | No | No | Yes (v3) | No | Yes | No |
| **Zoom & Pan** | Yes (CSS transforms) | No | No | No | Yes (basic) | No | Yes (advanced) | No | No |
| **Mobile Touch** | Yes (pinch, tap) | Limited | No | Yes | Basic | Yes | Yes | Yes | No |
| **Accessibility (WCAG)** | AA compliant | None | None | None | None | Partial | None | None | None |
| **Popover Triggers** | hover, click, load | click only | hover, click, none | callback | click | click | click | hover (desktop), drawer (mobile) | N/A |
| **Theming** | CSS variables | Inline styles | CSS classes | CSS | Props | CSS | Skins | Tailwind | N/A |
| **React Support** | Yes (wrapper) | No | No | No | Yes (native) | Plugin | No | Yes (native) | No |
| **Vue Support** | v1.2+ | No | No | No | No | Plugin | No | No | No |
| **Bundle Format** | ESM + CJS + UMD | CJS | jQuery plugin | UMD | ESM | ESM + UMD | Proprietary | ESM | UMD |
| **Maintained** | Active | Last update 2019 | Last update 2018 | Active (Amplience) | Last update 2020 | Active | Active (commercial) | Active | Last update 2020 |
| **Bundle Size** | < 15 KB gz | ~5 KB | ~8 KB + jQuery | ~3 KB | ~12 KB | ~45 KB | Large (commercial) | ~15 KB | ~2 KB |
| **Coordinate System** | % + px | % (top/left) | px | % | px | W3C fragments | px + % | % | HTML map coords |
| **HTML Init** | Yes (data-attrs) | No | jQuery init | No | No (JSX) | HTML annotations | HTML config | No (JSX) | HTML attributes |
| **Multi-Image** | v1.3 (scenes) | No | No | No | No | No | Yes | No | No |
| **Editor Mode** | v1.2+ | No | Yes (admin mode) | No | No | Yes (annotation) | Yes (commercial) | No | No |
| **Clustering** | Yes (optional) | No | No | No | No | No | No | No | No |
| **Zero Dependencies** | Yes | No (depends on libs) | jQuery required | No | React required | No | Many | React + Shadcn | jQuery recommended |

### Key Differentiators

1. **Only library combining zoom/pan + hotspots + accessibility** in a zero-dependency package
2. **Dual initialization** (JS API + HTML data-attributes) — no competitor offers both
3. **CSS variable theming** — most competitors use inline styles or proprietary config
4. **TypeScript-first** with full type definitions — only Annotorious offers comparable TS support
5. **Mobile-first touch handling** — pinch-to-zoom, tap-to-open, drawer-friendly popovers
6. **Multi-image scenes** (v1.3) — only AJAX-ZOOM offers this, and it's a heavy commercial product

---

## 15. Roadmap

### v1.0 — Core Release

- Core viewer with image display and responsive container
- Hotspot markers with percentage and pixel coordinate support
- Popover system with hover, click, and load triggers
- Built-in popover positioning (flip/shift, zero dependencies)
- Built-in popover template for product data
- Custom popover content (HTML string and render function)
- XSS sanitization
- Zoom and pan (CSS transforms, GPU-accelerated)
- Touch support (pinch-to-zoom, tap, drag-to-pan)
- Zoom controls UI
- Full keyboard navigation
- WCAG 2.1 AA accessibility (ARIA, focus management, screen reader)
- Reduced motion support
- CSS variable theming (light and dark themes)
- JavaScript API initialization (`new CIHotspot()`)
- HTML data-attribute initialization (`CIHotspot.autoInit()`)
- React wrapper (`CIHotspotViewer` component, `useCIHotspot` hook, ref API)
- SSR compatibility
- TypeScript type definitions
- ESM + CJS + UMD build output
- CDN distribution via Scaleflex CDN
- Optional marker clustering
- Optional Cloudimage CDN integration (responsive image sizing, DPR-aware)
- Lazy loading via `IntersectionObserver`
- Analytics hooks (onOpen, onClose, onClick, onZoom callbacks)
- Responsive breakpoints for hotspot visibility
- GitHub Pages demo site with interactive configurator
- Vitest test suite
- < 15 KB gzipped bundle

### v1.1 — Polish & Community Feedback

- Performance optimizations based on real-world usage
- Additional popover templates
- Improved touch gesture handling
- Additional CSS variable hooks for deeper customization
- Community-requested features and bug fixes
- Expanded test coverage
- Documentation improvements

### v1.2 — Editor Mode & Framework Wrappers

- **Visual editor mode** — click-to-place, drag-to-reposition, inline edit, export/import JSON
- **Vue wrapper** — `<CIHotspotViewer>` component for Vue 3
- **Svelte wrapper** — `<CIHotspotViewer>` component for Svelte
- Editor mode as a separate opt-in import to keep core bundle lean

### v1.3 — Multi-Image Navigation

- **Scenes API** — multiple images with per-image hotspot sets
- **`navigateTo` hotspots** — click a hotspot to switch scenes
- **Scene transitions** — fade, slide, none
- **Scene instance methods** — `goToScene()`, `getCurrentScene()`, `getScenes()`
- **HTML data-attribute support for scenes** — `data-ci-hotspot-scenes` JSON attribute

### v2.0 — Future Vision

- WebGL-based rendering for complex scenes
- 3D model hotspot support
- Video hotspots (markers on video frames)
- Collaborative editing (real-time multi-user editor)
- AI-assisted hotspot placement suggestions
- Plugin system for community extensions

---

## 16. Appendices

### A. CSS Class Reference

All CSS classes use the `ci-hotspot` prefix.

| Class | Element | Description |
|---|---|---|
| `.ci-hotspot-container` | Outer wrapper | Root container; `position: relative; overflow: hidden` |
| `.ci-hotspot-viewport` | Inner wrapper | Receives zoom/pan transforms |
| `.ci-hotspot-image` | `<img>` | The displayed image |
| `.ci-hotspot-markers` | Marker layer | `position: absolute; inset: 0` overlay for markers |
| `.ci-hotspot-marker` | `<button>` | Individual hotspot marker |
| `.ci-hotspot-marker--active` | `<button>` | Marker with open popover |
| `.ci-hotspot-marker--hidden` | `<button>` | Hidden marker (responsive breakpoint) |
| `.ci-hotspot-pulse` | `::before` pseudo | Pulse ring animation |
| `.ci-hotspot-popover` | Popover wrapper | The popover container |
| `.ci-hotspot-popover--visible` | Popover wrapper | Popover is currently shown |
| `.ci-hotspot-popover-arrow` | Arrow element | Popover directional arrow |
| `.ci-hotspot-popover-content` | Content wrapper | Inner content area of popover |
| `.ci-hotspot-popover-image` | `<img>` | Product image in built-in template |
| `.ci-hotspot-popover-body` | Content body | Text content area in built-in template |
| `.ci-hotspot-popover-title` | `<h3>` | Product title in built-in template |
| `.ci-hotspot-popover-price` | `<span>` | Price display in built-in template |
| `.ci-hotspot-popover-description` | `<p>` | Description text in built-in template |
| `.ci-hotspot-popover-cta` | `<a>` | Call-to-action button in built-in template |
| `.ci-hotspot-zoom-controls` | Controls wrapper | Zoom button container |
| `.ci-hotspot-zoom-in` | `<button>` | Zoom in button |
| `.ci-hotspot-zoom-out` | `<button>` | Zoom out button |
| `.ci-hotspot-zoom-reset` | `<button>` | Reset zoom button |
| `.ci-hotspot-cluster` | `<button>` | Cluster indicator when markers are grouped |
| `.ci-hotspot-loading` | Container | Applied while image is loading |
| `.ci-hotspot-theme-dark` | Container | Dark theme modifier class |

### B. Event Reference

Events are delivered via callback functions in the configuration object. No custom DOM events are dispatched (to keep the API surface minimal and tree-shakeable).

| Callback | Signature | Trigger |
|---|---|---|
| `onOpen` | `(hotspot: HotspotItem) => void` | Popover opens (any trigger mode) |
| `onClose` | `(hotspot: HotspotItem) => void` | Popover closes |
| `onClick` | `(event: MouseEvent, hotspot: HotspotItem) => void` | Marker is clicked/tapped |
| `onZoom` | `(level: number) => void` | Zoom level changes |
| `hotspot.onClick` | `(event: MouseEvent, hotspot: HotspotItem) => void` | Per-hotspot click handler |

### C. Data Attribute Reference

All data attributes use the `data-ci-hotspot-` prefix.

| Attribute | Type | Maps to |
|---|---|---|
| `data-ci-hotspot-src` | `string` | `config.src` |
| `data-ci-hotspot-alt` | `string` | `config.alt` |
| `data-ci-hotspot-items` | `JSON string` | `config.hotspots` |
| `data-ci-hotspot-trigger` | `string` | `config.trigger` |
| `data-ci-hotspot-zoom` | `boolean string` | `config.zoom` |
| `data-ci-hotspot-zoom-max` | `number string` | `config.zoomMax` |
| `data-ci-hotspot-zoom-min` | `number string` | `config.zoomMin` |
| `data-ci-hotspot-theme` | `string` | `config.theme` |
| `data-ci-hotspot-pulse` | `boolean string` | `config.pulse` |
| `data-ci-hotspot-placement` | `string` | `config.placement` |
| `data-ci-hotspot-lazy-load` | `boolean string` | `config.lazyLoad` |
| `data-ci-hotspot-zoom-controls` | `boolean string` | `config.zoomControls` |
| `data-ci-hotspot-clustering` | `boolean string` | `config.clustering` |
| `data-ci-hotspot-ci-token` | `string` | `config.cloudimage.token` |
| `data-ci-hotspot-ci-api-version` | `string` | `config.cloudimage.apiVersion` |
| `data-ci-hotspot-ci-domain` | `string` | `config.cloudimage.domain` |
| `data-ci-hotspot-ci-limit-factor` | `number string` | `config.cloudimage.limitFactor` |
| `data-ci-hotspot-ci-params` | `string` | `config.cloudimage.params` |
