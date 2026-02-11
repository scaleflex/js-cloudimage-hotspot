import type { CloudimageConfig, HotspotItem, Placement, TriggerMode } from '../core/types';

/** Editor configuration */
export interface EditorConfig {
  /** Image source URL */
  src: string;
  /** Alt text for the image */
  alt?: string;
  /** Initial hotspots to load into the editor */
  hotspots?: HotspotItem[];
  /** Default trigger mode for new hotspots (default: 'click') */
  defaultTrigger?: TriggerMode;
  /** Default placement for new hotspots (default: 'top') */
  defaultPlacement?: Placement;
  /** Called whenever hotspots change */
  onChange?: (hotspots: HotspotItem[]) => void;
  /** Cloudimage CDN configuration (passed through to the internal viewer) */
  cloudimage?: CloudimageConfig;
  /** Maximum undo history size (default: 50) */
  maxHistory?: number;
}

/** Snapshot of editor state for undo/redo */
export interface EditorSnapshot {
  hotspots: HotspotItem[];
  selectedId: string | null;
}

/** Editor mode */
export type EditorMode = 'select' | 'add';

/** Editor event names */
export type EditorEvent =
  | 'hotspot:add'
  | 'hotspot:remove'
  | 'hotspot:update'
  | 'hotspot:select'
  | 'hotspot:deselect'
  | 'mode:change'
  | 'history:change'
  | 'change';
