# v1.3 — Multi-Image Navigation (Scenes API)

## Overview

The Scenes API enables navigation between multiple images, each with its own set of hotspots. This powers real-estate tours, product explorers, car configurators, and similar multi-view experiences.

## Configuration

### Scene Interface

```typescript
interface Scene {
  id: string;           // Unique scene identifier
  src: string;          // Image source URL
  alt?: string;         // Alt text for accessibility
  hotspots: HotspotItem[];  // Hotspots specific to this scene
}
```

### New Config Options

```typescript
interface CIHotspotConfig {
  // ... existing options ...
  scenes?: Scene[];                          // Array of scenes
  initialScene?: string;                     // Scene ID to start with (default: first scene)
  sceneTransition?: 'fade' | 'slide' | 'none';  // Transition animation (default: 'fade')
  sceneAspectRatio?: string;                     // Fixed aspect ratio (e.g. '16/9')
  onSceneChange?: (sceneId: string, scene: Scene) => void;  // Scene change callback
}
```

### navigateTo Hotspots

Any hotspot can include a `navigateTo` property to trigger scene navigation on click:

```typescript
{
  id: 'go-kitchen',
  x: '20%', y: '55%',
  label: 'Go to Kitchen',
  navigateTo: 'kitchen'   // Scene ID to navigate to
}
```

`navigateTo` hotspots:
- Display a hover popover with auto-generated destination info (from the hotspot label or scene alt text)
- Display a distinct visual style (chevron arrow marker)
- Trigger `goToScene()` on click or Enter/Space

## Usage

### JavaScript API

```javascript
const viewer = new CIHotspot('#viewer', {
  scenes: [
    {
      id: 'main-hall',
      src: '/images/main-hall.jpg',
      alt: 'Elegant main hall',
      hotspots: [
        { id: 'chandelier', x: '50%', y: '15%', label: 'Chandelier',
          data: { title: 'Crystal Chandelier', price: '$2,400' } },
        { id: 'go-kitchen', x: '20%', y: '55%', label: 'Go to Kitchen',
          navigateTo: 'kitchen' },
      ],
    },
    {
      id: 'kitchen',
      src: '/images/kitchen.jpg',
      alt: 'Modern kitchen',
      hotspots: [
        { id: 'island', x: '50%', y: '70%', label: 'Kitchen Island',
          data: { title: 'Marble Island', price: '$8,500' } },
        { id: 'go-back', x: '10%', y: '50%', label: 'Back to Main Hall',
          navigateTo: 'main-hall' },
      ],
    },
  ],
  initialScene: 'main-hall',
  sceneTransition: 'fade',
  trigger: 'hover',
  onSceneChange: (sceneId, scene) => {
    console.log(`Navigated to: ${scene.alt}`);
  },
});
```

### HTML Data Attributes

```html
<div
  data-ci-hotspot-scenes='[
    {"id":"room-a","src":"/a.jpg","hotspots":[...]},
    {"id":"room-b","src":"/b.jpg","hotspots":[...]}
  ]'
  data-ci-hotspot-initial-scene="room-a"
  data-ci-hotspot-scene-transition="fade"
></div>
<script>CIHotspot.autoInit();</script>
```

### Instance Methods

```javascript
viewer.goToScene('kitchen');           // Navigate to a scene
viewer.getCurrentScene();              // Returns 'main-hall'
viewer.getScenes();                    // Returns ['main-hall', 'kitchen']
```

## Fixed Aspect Ratio

When scenes have different image dimensions (e.g. landscape and portrait), the container height jumps on scene change. Set `sceneAspectRatio` to lock the viewport to a fixed ratio. Images use `object-fit: contain` and may be letterboxed; the markers layer is automatically repositioned to match the rendered image area.

```javascript
new CIHotspot('#viewer', {
  scenes: [...],
  sceneAspectRatio: '16/9',  // Fixed 16:9 container
});
```

Hotspot coordinates are relative to the rendered image area within the viewport, not the full viewport dimensions.

## Scene Transitions

| Transition | Description |
|------------|-------------|
| `'fade'`   | Cross-fade between scenes (default). Old image fades out, new fades in over 400ms. |
| `'slide'`  | Horizontal slide. Old image slides left, new image enters from right. |
| `'none'`   | Instant swap with no animation. |

All transitions respect `prefers-reduced-motion: reduce`.

## Backward Compatibility

The existing single-image API (`src` + `hotspots`) continues to work unchanged. The `scenes` property is entirely optional. When `scenes` is provided, the top-level `src` is not required.

## Accessibility

- Screen reader announces scene changes via ARIA live region
- `navigateTo` markers include descriptive aria-label (e.g., "Go to Kitchen")
- After scene transition, keyboard focus moves to the first marker of the new scene
- Container `aria-label` updates to reflect the current scene's alt text

## React Integration

```tsx
<CIHotspotViewer
  scenes={scenes}
  initialScene="main-hall"
  sceneTransition="fade"
  onSceneChange={(id, scene) => setCurrentRoom(id)}
  ref={viewerRef}
/>

// Imperative navigation
viewerRef.current.goToScene('kitchen');
viewerRef.current.getCurrentScene();  // 'main-hall'
viewerRef.current.getScenes();        // ['main-hall', 'kitchen']
```

## CSS Customization

```css
.ci-hotspot-container {
  --ci-hotspot-scene-transition-duration: 400ms;  /* Transition speed */
}

/* Custom navigateTo marker style */
.ci-hotspot-marker--navigate {
  --ci-hotspot-marker-bg: rgba(0, 88, 163, 0.7);
}
```

## Demo Images

Five real estate scenes for the demo tour:

| Scene | Image | Dimensions |
|-------|-------|------------|
| Main Hall | `andrea-davis-0.jpg?vh=571923` | 2000x1331 |
| Stairs | `andrea-davis-3.jpg?vh=66891d` | 1331x2000 |
| Kitchen | `andrea-davis-2.jpg?vh=039d87` | 1331x2000 |
| Bedroom | `andrea-davis-4.jpg?vh=319871` | 2000x1333 |
| Rest Zone | `andrea-davis-1.jpg?vh=8c0c49` | 1331x2000 |

Base URL: `https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-hotspot/`
