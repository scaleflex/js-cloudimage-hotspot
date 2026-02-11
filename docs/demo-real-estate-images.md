# Demo: Real Estate Images with Realistic Hotspots

## Goal

Replace the current generic demo images and placeholder hotspot data with appealing real estate photography (houses/flats) and realistic property information.

## Current State

- **Hero image**: `https://scaleflex.cloudimg.io/v7/demo/stephen-walker-unsplash.jpg` (living room)
- **Trigger demos**: `https://scaleflex.cloudimg.io/v7/demo/redcharlie.jpg`
- **Hotspot data**: Generic placeholders like "Product A / $199", "Modern Sofa / $1,299"
- **Sections using images**: Hero viewer, trigger mode cards, light/dark theme cards, interactive configurator

## Plan

### 1. Source & upload images

- Find attractive photos of houses/flats (Unsplash, Pexels, or internal assets)
- Upload them to the Scaleflex account so they're served via Cloudimage CDN
- Aim for 2-3 distinct images (e.g., a modern living room, a kitchen, a bedroom or exterior)

### 2. Update demo with new images

**Files to modify:**
- `demo/demo.ts` — image URLs and hotspot configurations
- `demo/index.html` — any hardcoded image references
- `demo/configurator.ts` — configurator default image/hotspots
- `demo/react-demo/` — React demo if it uses its own image refs

### 3. Write realistic hotspot data

For each image, place hotspots on actual visible features with real-estate-style info:

**Example hotspot data format:**
```typescript
{
  id: 'kitchen-island',
  x: '45%',
  y: '60%',
  label: 'Kitchen Island',
  data: {
    title: 'Kitchen Island',
    description: 'Quartz countertop with waterfall edge, integrated storage, seats 4.',
    price: 'Included',
  }
}
```

**Types of hotspot info to include:**
- Room name & dimensions (e.g., "Master Bedroom — 22 m^2")
- Key features (flooring type, fixtures, appliances)
- Materials & finishes
- Pricing or "Included" labels where appropriate

### 4. Position hotspots accurately

- View each uploaded image to identify key features
- Set `x%` / `y%` coordinates to point at actual items in the photo
- Ensure hotspots don't overlap and popovers have room to display

## Status

- [ ] Upload images to Scaleflex and collect CDN URLs
- [ ] Share URLs so hotspots can be positioned on actual image content
- [ ] Update demo code with new images and hotspot data
- [ ] Verify demo looks good across all sections
