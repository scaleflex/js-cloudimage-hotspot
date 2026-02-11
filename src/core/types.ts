/** Popover trigger mode */
export type TriggerMode = 'hover' | 'click' | 'load';

/** Popover placement preference */
export type Placement = 'top' | 'bottom' | 'left' | 'right' | 'auto';

/** Theme name */
export type Theme = 'light' | 'dark';

/** Scene transition animation type */
export type SceneTransition = 'fade' | 'slide' | 'none';

/** A scene in multi-image navigation */
export interface Scene {
  /** Unique scene identifier */
  id: string;
  /** Image source URL for this scene */
  src: string;
  /** Alt text for this scene's image */
  alt?: string;
  /** Hotspots specific to this scene */
  hotspots: HotspotItem[];
}

/** Data fields for the built-in popover template */
export interface PopoverData {
  title?: string;
  price?: string;
  description?: string;
  image?: string;
  url?: string;
  ctaText?: string;
  [key: string]: unknown;
}

/** Cloudimage CDN integration configuration */
export interface CloudimageConfig {
  /** Cloudimage customer token (e.g. 'demo'). Enables Cloudimage when set. */
  token: string;
  /** API version (default: 'v7') */
  apiVersion?: string;
  /** Custom Cloudimage domain (default: 'cloudimg.io') */
  domain?: string;
  /** Round requested width to nearest N pixels for better CDN caching. Default: 100 */
  limitFactor?: number;
  /** Custom URL transformation params (e.g. 'q=80&org_if_sml=1') */
  params?: string;
  /** Supported device pixel ratios (default: [1, 1.5, 2]) */
  devicePixelRatioList?: number[];
}

/** Responsive breakpoint configuration for individual hotspots */
export interface ResponsiveConfig {
  maxWidth?: number;
  minWidth?: number;
  action: 'hide' | 'collapse';
}

/** Individual hotspot definition */
export interface HotspotItem {
  /** Unique identifier (required) */
  id: string;
  /** X coordinate: percentage string ('65%') or pixel number (650) */
  x: string | number;
  /** Y coordinate: percentage string ('40%') or pixel number (400) */
  y: string | number;
  /** Accessible label displayed as marker tooltip and used by screen readers */
  label: string;
  /** Arbitrary data passed to the popover template */
  data?: PopoverData;
  /** Raw HTML content for the popover (sanitized before rendering) */
  content?: string;
  /** Custom CSS class added to this marker element */
  className?: string;
  /** Override global trigger for this specific hotspot */
  trigger?: TriggerMode;
  /** Keep popover open until explicitly closed (default: false) */
  keepOpen?: boolean;
  /** Override global placement for this specific hotspot's popover */
  placement?: Placement;
  /** Custom click handler for this hotspot */
  onClick?: (event: MouseEvent, hotspot: HotspotItem) => void;
  /** Whether this hotspot marker is initially hidden (default: false) */
  hidden?: boolean;
  /** Custom icon — CSS class name, SVG string, or image URL */
  icon?: string;
  /** Scene ID to navigate to on click (v1.3 multi-image) */
  navigateTo?: string;
  /** Responsive breakpoint configuration */
  responsive?: ResponsiveConfig;
}

/** Main library configuration */
export interface CIHotspotConfig {
  /** Image source URL */
  src: string;
  /** Alt text for the image */
  alt?: string;
  /** Array of hotspot definitions */
  hotspots: HotspotItem[];
  /** Popover trigger mode (default: 'hover') */
  trigger?: TriggerMode;
  /** Enable zoom & pan (default: false) */
  zoom?: boolean;
  /** Maximum zoom level (default: 4) */
  zoomMax?: number;
  /** Minimum zoom level (default: 1) */
  zoomMin?: number;
  /** Theme — applies a preset of CSS variable values (default: 'light') */
  theme?: Theme;
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
  /** Show scroll-to-zoom hint when user scrolls without modifier key (default: true when zoom is enabled) */
  scrollHint?: boolean;
  /** Popover placement preference (default: 'top') */
  placement?: Placement;
  /** Enable lazy loading of the image (default: true) */
  lazyLoad?: boolean;
  /** Optional Cloudimage integration for responsive image loading */
  cloudimage?: CloudimageConfig;
  /** Array of scenes for multi-image navigation (v1.3) */
  scenes?: Scene[];
  /** Initial scene ID to display (defaults to first scene) */
  initialScene?: string;
  /** Scene transition animation type (default: 'fade') */
  sceneTransition?: SceneTransition;
  /** Fixed aspect ratio for the scene container (e.g. '16/9'). Prevents layout jumps between scenes with different image dimensions. Images use object-fit: contain. */
  sceneAspectRatio?: string;
  /** Called when the active scene changes */
  onSceneChange?: (sceneId: string, scene: Scene) => void;
}

/** Instance methods returned by CIHotspot */
export interface CIHotspotInstance {
  /** Get references to internal DOM elements */
  getElements(): {
    container: HTMLElement;
    viewport: HTMLElement;
    image: HTMLImageElement;
    markers: HTMLElement;
  };
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
  /** Navigate to a scene by ID */
  goToScene(sceneId: string): void;
  /** Get the current scene ID (returns undefined if not in scenes mode) */
  getCurrentScene(): string | undefined;
  /** Get all scene IDs (returns empty array if not in scenes mode) */
  getScenes(): string[];
}

// --- Internal types (not exported from main entry) ---

/** Hotspot with coordinates normalized to percentages */
export interface NormalizedHotspot extends Omit<HotspotItem, 'x' | 'y'> {
  x: number;
  y: number;
}

/** Bounding rectangle */
export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** 2D point */
export interface Point {
  x: number;
  y: number;
}

/** Internal zoom/pan state */
export interface ZoomState {
  zoom: number;
  panX: number;
  panY: number;
}

/** Computed popover position result */
export interface PositionResult {
  x: number;
  y: number;
  placement: Placement;
  arrowOffset: number;
}
