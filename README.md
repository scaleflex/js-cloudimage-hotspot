# js-cloudimage-hotspot

Interactive image hotspots with zoom, popovers, and accessibility. Zero dependencies.

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
- **< 15 KB gzipped** — Zero runtime dependencies

## Installation

```bash
npm install js-cloudimage-hotspot
```

### CDN

```html
<script src="https://cdn.scaleflex.it/plugins/js-cloudimage-hotspot/latest/js-cloudimage-hotspot.min.js"></script>
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
| `renderPopover` | `(hotspot) => string \| HTMLElement` | — | Custom popover render |
| `onOpen` | `(hotspot) => void` | — | Popover open callback |
| `onClose` | `(hotspot) => void` | — | Popover close callback |
| `onZoom` | `(level) => void` | — | Zoom change callback |
| `onClick` | `(event, hotspot) => void` | — | Marker click callback |
| `cloudimage` | `CloudimageConfig` | — | Cloudimage CDN config |

### HotspotItem

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (required) |
| `x` | `string \| number` | X coordinate: `'65%'` or `650` (px) |
| `y` | `string \| number` | Y coordinate: `'40%'` or `400` (px) |
| `label` | `string` | Accessible label (required) |
| `data` | `PopoverData` | Data for built-in template |
| `content` | `string` | HTML content (sanitized) |
| `trigger` | `'hover' \| 'click' \| 'load'` | Override global trigger |
| `placement` | `Placement` | Override global placement |
| `className` | `string` | Custom CSS class |
| `hidden` | `boolean` | Initially hidden |
| `icon` | `string` | Custom icon |

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

## Theming

All visuals are customizable via CSS variables:

```css
.my-viewer {
  --ci-hotspot-marker-bg: rgba(0, 88, 163, 0.8);
  --ci-hotspot-pulse-color: rgba(0, 88, 163, 0.3);
  --ci-hotspot-cta-bg: #e63946;
  --ci-hotspot-popover-border-radius: 4px;
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

- Chrome 80+
- Firefox 80+
- Safari 14+
- Edge 80+

## License

MIT
