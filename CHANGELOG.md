# Changelog

All notable changes to this project will be documented in this file.

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

[1.1.4]: https://github.com/scaleflex/js-cloudimage-hotspot/releases/tag/v1.1.4
[1.1.3]: https://github.com/scaleflex/js-cloudimage-hotspot/releases/tag/v1.1.3
[1.1.2]: https://github.com/scaleflex/js-cloudimage-hotspot/releases/tag/v1.1.2
[1.0.0]: https://github.com/scaleflex/js-cloudimage-hotspot/releases/tag/v1.0.0
