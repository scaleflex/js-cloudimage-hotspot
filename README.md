<p align="center">
  <img src="https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-360-view/logo_scaleflex_on_white_bg.jpg?vh=91b12d&w=700" alt="Scaleflex" width="350">
</p>

<h1 align="center">js-cloudimage-hotspot</h1>

<p align="center">
  Interactive image hotspots with zoom, popovers, and accessibility. Zero dependencies.
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/js-cloudimage-hotspot"><img src="https://img.shields.io/npm/v/js-cloudimage-hotspot.svg?style=flat-square" alt="npm version"></a>
  <a href="https://www.npmjs.com/package/js-cloudimage-hotspot"><img src="https://img.shields.io/npm/dm/js-cloudimage-hotspot.svg?style=flat-square" alt="npm downloads"></a>
  <a href="https://github.com/scaleflex/js-cloudimage-hotspot/blob/main/LICENSE"><img src="https://img.shields.io/npm/l/js-cloudimage-hotspot.svg?style=flat-square" alt="license"></a>
  <a href="https://bundlephobia.com/package/js-cloudimage-hotspot"><img src="https://img.shields.io/bundlephobia/minzip/js-cloudimage-hotspot?style=flat-square" alt="bundle size"></a>
</p>

<p align="center">
  <a href="https://scaleflex.github.io/js-cloudimage-hotspot/">Live Demo</a> |
  <a href="https://scaleflex.github.io/js-cloudimage-hotspot/editor.html">Visual Editor</a> |
  <a href="https://codesandbox.io/p/devbox/github/scaleflex/js-cloudimage-hotspot/tree/main/examples/vanilla">Vanilla Sandbox</a> |
  <a href="https://codesandbox.io/p/devbox/github/scaleflex/js-cloudimage-hotspot/tree/main/examples/react">React Sandbox</a>
</p>

---

## Why js-cloudimage-hotspot?

Existing hotspot libraries are often heavy, inaccessible, or locked behind paid services. This library was built to fill the gap:

- **Lightweight** — under 15 KB gzipped with zero runtime dependencies
- **Accessible by default** — WCAG 2.1 AA compliant out of the box
- **Framework-agnostic** — works with vanilla JS, React, or any framework
- **Built-in zoom & pan** — no need for a separate zoom library
- **Multi-image scenes** — create virtual tours without extra tooling
- **Optional Cloudimage CDN** — serve optimally-sized images automatically

---

## Features

- **Hotspot markers** — Positioned via percentage or pixel coordinates with pulsing animation
- **Popover system** — Hover, click, or load triggers with built-in flip/shift positioning
- **Zoom & Pan** — CSS transform-based with mouse wheel, pinch-to-zoom, double-click, drag-to-pan
- **WCAG 2.1 AA** — Full keyboard navigation, ARIA attributes, focus management, reduced motion
- **CSS variable theming** — Light and dark themes, fully customizable
- **Two init methods** — JavaScript API and HTML data-attributes
- **React wrapper** — Separate entry point with component, hook, and ref API
- **TypeScript** — Full type definitions
- **Cloudimage CDN** — Optional responsive image loading
- **Multi-image scenes** — Navigate between images with animated transitions

## Installation

```bash
npm install js-cloudimage-hotspot
```

### CDN

```html
<script src="https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-hotspot/1.1.1/js-cloudimage-hotspot.min.js?vh=507727&func=proxy"></script>
```

## Quick Start

### JavaScript API

```js
import CIHotspot from 'js-cloudimage-hotspot';

const viewer = new CIHotspot('#product-image', {
  src: 'https://example.com/living-room.jpg',
  alt: 'Modern living room',
  zoom: true,
  trigger: 'hover',
  hotspots: [
    {
      id: 'sofa',
      x: '40%',
      y: '60%',
      label: 'Modern Sofa',
      data: { title: 'Modern Sofa', originalPrice: '$1,099', price: '$899', description: 'Comfortable 3-seat sofa' },
    },
    {
      id: 'lamp',
      x: '75%',
      y: '25%',
      label: 'Floor Lamp',
      markerStyle: 'dot-label',
      data: { title: 'Arc Floor Lamp', price: '$249' },
    },
  ],
  onOpen(hotspot) {
    console.log('Opened:', hotspot.id);
  },
});
```

### HTML Data-Attributes

```html
<div
  data-ci-hotspot-src="https://example.com/room.jpg"
  data-ci-hotspot-alt="Living room"
  data-ci-hotspot-zoom="true"
  data-ci-hotspot-trigger="hover"
  data-ci-hotspot-items='[
    {"id":"sofa","x":"40%","y":"60%","label":"Sofa","data":{"title":"Sofa","price":"$899"}}
  ]'
></div>

<script>CIHotspot.autoInit();</script>
```

## API Reference

### Constructor

```ts
new CIHotspot(element: HTMLElement | string, config: CIHotspotConfig)
```

### Config

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `src` | `string` | — | Image source URL (required) |
| `hotspots` | `HotspotItem[]` | — | Array of hotspot definitions (required) |
| `alt` | `string` | `''` | Image alt text |
| `trigger` | `'hover' \| 'click' \| 'load'` | `'hover'` | Popover trigger mode |
| `zoom` | `boolean` | `false` | Enable zoom & pan |
| `zoomMax` | `number` | `4` | Maximum zoom level |
| `zoomMin` | `number` | `1` | Minimum zoom level |
| `theme` | `'light' \| 'dark'` | `'light'` | Theme |
| `pulse` | `boolean` | `true` | Marker pulse animation |
| `placement` | `'top' \| 'bottom' \| 'left' \| 'right' \| 'auto'` | `'top'` | Popover placement |
| `lazyLoad` | `boolean` | `true` | Lazy load image |
| `zoomControls` | `boolean` | `true` | Show zoom control buttons |
| `zoomControlsPosition` | `'top-left' \| 'top-center' \| 'top-right' \| 'bottom-left' \| 'bottom-center' \| 'bottom-right'` | `'bottom-right'` | Zoom controls position |
| `renderPopover` | `(hotspot) => string \| HTMLElement` | — | Custom popover render |
| `onOpen` | `(hotspot) => void` | — | Popover open callback |
| `onClose` | `(hotspot) => void` | — | Popover close callback |
| `onZoom` | `(level) => void` | — | Zoom change callback |
| `onClick` | `(event, hotspot) => void` | — | Marker click callback |
| `cloudimage` | `CloudimageConfig` | — | Cloudimage CDN config |
| `scenes` | `Scene[]` | — | Array of scenes for multi-image navigation |
| `initialScene` | `string` | first scene | Scene ID to display initially |
| `sceneTransition` | `'fade' \| 'slide' \| 'none'` | `'fade'` | Scene transition animation |
| `sceneAspectRatio` | `string` | — | Fixed viewport ratio (e.g. `'16/9'`). Prevents layout jumps. |
| `onSceneChange` | `(id, scene) => void` | — | Scene change callback |

### HotspotItem

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (required) |
| `x` | `string \| number` | X coordinate: `'65%'` or `650` (px) |
| `y` | `string \| number` | Y coordinate: `'40%'` or `400` (px) |
| `label` | `string` | Accessible label (required) |
| `markerStyle` | `'dot' \| 'dot-label'` | Marker style — `'dot-label'` shows a text pill next to the dot |
| `data` | `PopoverData` | Data for built-in template |
| `content` | `string` | HTML content (sanitized) |
| `trigger` | `'hover' \| 'click' \| 'load'` | Override global trigger |
| `placement` | `Placement` | Override global placement |
| `className` | `string` | Custom CSS class |
| `hidden` | `boolean` | Initially hidden |
| `icon` | `string` | Custom icon |
| `navigateTo` | `string` | Scene ID to navigate to on click |

### PopoverData

| Field | Type | Description |
|-------|------|-------------|
| `title` | `string` | Popover heading |
| `originalPrice` | `string` | Strikethrough price shown before current price (e.g. `'$1,499'`) |
| `price` | `string` | Current price |
| `description` | `string` | Description text |
| `image` | `string` | Image URL displayed at top of popover |
| `url` | `string` | Link URL for the CTA button |
| `ctaText` | `string` | CTA button label (default: `'View details'`) |

### Instance Methods

```ts
instance.open(id: string): void
instance.close(id: string): void
instance.closeAll(): void
instance.setZoom(level: number): void
instance.getZoom(): number
instance.resetZoom(): void
instance.addHotspot(hotspot: HotspotItem): void
instance.removeHotspot(id: string): void
instance.updateHotspot(id: string, updates: Partial<HotspotItem>): void
instance.update(config: Partial<CIHotspotConfig>): void
instance.destroy(): void
instance.goToScene(sceneId: string): void
instance.getCurrentScene(): string | undefined
instance.getScenes(): string[]
```

### Static Methods

```ts
CIHotspot.autoInit(root?: HTMLElement): CIHotspotInstance[]
```

## React Usage

```tsx
import { CIHotspotViewer, useCIHotspot } from 'js-cloudimage-hotspot/react';

// Component
function ProductImage() {
  return (
    <CIHotspotViewer
      src="/living-room.jpg"
      alt="Living room"
      zoom
      hotspots={[
        { id: 'sofa', x: '40%', y: '60%', label: 'Sofa', data: { title: 'Sofa', price: '$899' } },
      ]}
      onOpen={(h) => console.log('Opened:', h.id)}
    />
  );
}

// Hook
function ProductImage() {
  const { containerRef, instance } = useCIHotspot({
    src: '/room.jpg',
    hotspots: [...],
    zoom: true,
  });

  return (
    <>
      <div ref={containerRef} />
      <button onClick={() => instance.current?.setZoom(2)}>Zoom 2x</button>
    </>
  );
}

// Ref API
function ProductImage() {
  const ref = useRef<CIHotspotViewerRef>(null);
  return (
    <>
      <CIHotspotViewer ref={ref} src="/room.jpg" hotspots={[...]} zoom />
      <button onClick={() => ref.current?.open('sofa')}>Show Sofa</button>
    </>
  );
}
```

## Multi-Image Scenes

Navigate between multiple images, each with its own hotspots:

```js
const viewer = new CIHotspot('#tour', {
  scenes: [
    {
      id: 'living-room',
      src: '/living-room.jpg',
      alt: 'Living room',
      hotspots: [
        { id: 'sofa', x: '40%', y: '60%', label: 'Sofa', data: { title: 'Modern Sofa' } },
        { id: 'go-kitchen', x: '85%', y: '50%', label: 'Go to Kitchen', navigateTo: 'kitchen' },
      ],
    },
    {
      id: 'kitchen',
      src: '/kitchen.jpg',
      alt: 'Kitchen',
      hotspots: [
        { id: 'island', x: '50%', y: '65%', label: 'Island', data: { title: 'Marble Island' } },
        { id: 'go-back', x: '10%', y: '50%', label: 'Back', navigateTo: 'living-room' },
      ],
    },
  ],
  sceneTransition: 'fade',  // 'fade' | 'slide' | 'none'
});

// Programmatic navigation
viewer.goToScene('kitchen');
viewer.getCurrentScene(); // 'kitchen'
viewer.getScenes();       // ['living-room', 'kitchen']
```

Hotspots with `navigateTo` display as arrow markers and switch scenes on click.

## Theming

All visuals are customizable via CSS variables:

```css
.my-viewer {
  --ci-hotspot-marker-bg: rgba(0, 88, 163, 0.8);
  --ci-hotspot-pulse-color: rgba(0, 88, 163, 0.3);
  --ci-hotspot-cta-bg: #e63946;
  --ci-hotspot-popover-border-radius: 4px;
  --ci-hotspot-popover-text-align: center; /* left (default) | center | right */
}
```

Set `theme: 'dark'` for the built-in dark theme.

## Accessibility

- All markers are `<button>` elements with `aria-label`
- `Tab` / `Shift+Tab` navigates between markers
- `Enter` / `Space` toggles popovers
- `Escape` closes popovers and returns focus
- `Arrow keys` pan when zoomed
- `+` / `-` / `0` zoom controls
- Focus trapping in popovers with interactive content
- `prefers-reduced-motion` disables animations

## Cloudimage Integration

```js
new CIHotspot('#el', {
  src: 'https://example.com/room.jpg',
  cloudimage: {
    token: 'demo',
    limitFactor: 100,
    params: 'q=80',
  },
  hotspots: [...],
});
```

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 80+     |
| Firefox | 80+     |
| Safari  | 14+     |
| Edge    | 80+     |

## License

[MIT](./LICENSE)

---

## Support

If this library helped your project, consider buying me a coffee!

<a href="https://buymeacoffee.com/dzmitry.stramavus">
  <img src="https://img.shields.io/badge/Buy%20Me%20a%20Coffee-ffdd00?style=for-the-badge&logo=buy-me-a-coffee&logoColor=black" alt="Buy Me A Coffee">
</a>

---

<p align="center">
  Made with care by the <a href="https://www.scaleflex.com">Scaleflex</a> team
</p>
