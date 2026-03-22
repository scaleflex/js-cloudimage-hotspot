# Changelog

All notable changes to this project will be documented in this file.

## [1.1.11] - 2026-03-22

### Added

- `popoverTextAlign` config option (`'left'` | `'center'` | `'right'`) — controls text alignment inside popovers via `--ci-hotspot-popover-text-align` CSS variable (default: `'left'`)
- Configurable via `data-ci-hotspot-popover-text-align` data attribute

## [1.1.10] - 2026-03-22

### Fixed

- Navigate hotspots with a `label` but no matching destination scene now show the label as popover title instead of being silently skipped

## [1.1.9] - 2026-03-22

### Added

- Inner dot indicator for product (non-navigation) markers — adds a subtle `::after` pseudo-element dot to distinguish product markers from navigation markers

### Fixed

- Light (inverted) theme pulse color now uses a white-based `rgba(255, 255, 255, 0.5)` instead of inheriting the brand color, for better contrast on light markers

## [1.1.8] - 2026-03-21

### Added

- Per-marker `markerTheme` override — individual hotspots can now set `markerTheme: 'default' | 'inverted' | 'brand'` to override the container-level theme
- `markerTheme: 'default'` reset allows markers to opt out of a container-level inverted/brand theme

### Fixed

- `brandColor` CSS variable is now always set when provided, so per-marker `markerTheme: 'brand'` works even when the container theme is not brand
- Deduplicated container-level and per-marker theme CSS rules into shared selectors

## [1.1.7] - 2026-03-18

### Fixed

- Fixed popover content stacking by adding `position: relative` and `z-index: 1` to `.ci-hotspot-popover-content`

## [1.1.6] - 2026-03-13

### Added

- `onNavigate` callback — when set, `goToScene()` delegates scene switching to the host application instead of handling it internally, enabling custom navigation flows

## [1.1.5] - 2026-03-01

### Fixed

- Fire `onProductClick` for all CTA clicks, not only those with a product ID (falls back to empty string)
- CTA links now open in the top-level frame (`target="_top"`) instead of inside iframes

## [1.1.4] - 2026-02-28

### Fixed

- Fixed fullscreen layout for fixed-ratio scenes: override inline `padding-bottom` so viewport fills the screen correctly
- Added explicit `object-fit: contain` on fullscreen fixed-ratio image

## [1.1.3] - 2026-02-26

### Added

- Brand marker theme (`markerTheme: 'brand'`) with configurable `brandColor`
- Brand option in Interactive Configurator theme selector

### Fixed

- Navigate (arrow) dots now follow the active theme instead of using hardcoded blue

## [1.1.2] - 2026-02-24

### Fixed

- Fixed aspect-ratio collapse in flex/dialog layouts by replacing CSS `aspect-ratio` with padding-bottom percentage approach

## [1.0.0] - 2026-02-12

### Features

- **Core hotspot viewer** — interactive image hotspots with click, hover, and load trigger modes
- **Popovers** — built-in popover template with title, description, price, image, and CTA; custom HTML support
- **Themes** — light and dark built-in themes with full CSS custom property override support
- **Zoom & pan** — mouse-wheel and pinch-to-zoom, drag panning, configurable zoom controls position (6 placements)
- **Multi-image scenes** — scene navigation with fade, slide, and none transitions; directional arrows based on hotspot position
- **Fullscreen mode** — native Fullscreen API toggle
- **Accessibility** — full keyboard navigation, ARIA roles and live regions, screen-reader support
- **React wrapper** — `<CIHotspotViewer>` component with ref API and `useCIHotspot` hook
- **Visual editor** — drag-and-drop hotspot editor with React UI, undo/redo, and dark theme
- **Cloudimage CDN integration** — automatic responsive `srcset` generation with token-based URLs
- **Zero runtime dependencies**
- **Output formats** — ESM, CJS, and UMD bundles with full TypeScript declarations

[1.1.11]: https://github.com/scaleflex/cloudimage-hotspot/releases/tag/v1.1.11
[1.1.10]: https://github.com/scaleflex/cloudimage-hotspot/releases/tag/v1.1.10
[1.1.9]: https://github.com/scaleflex/cloudimage-hotspot/releases/tag/v1.1.9
[1.1.8]: https://github.com/scaleflex/cloudimage-hotspot/releases/tag/v1.1.8
[1.1.7]: https://github.com/scaleflex/cloudimage-hotspot/releases/tag/v1.1.7
[1.1.6]: https://github.com/scaleflex/cloudimage-hotspot/releases/tag/v1.1.6
[1.1.5]: https://github.com/scaleflex/cloudimage-hotspot/releases/tag/v1.1.5
[1.1.4]: https://github.com/scaleflex/cloudimage-hotspot/releases/tag/v1.1.4
[1.1.3]: https://github.com/scaleflex/cloudimage-hotspot/releases/tag/v1.1.3
[1.1.2]: https://github.com/scaleflex/cloudimage-hotspot/releases/tag/v1.1.2
[1.0.0]: https://github.com/scaleflex/cloudimage-hotspot/releases/tag/v1.0.0
