import type { CIHotspotConfig, CIHotspotInstance, HotspotItem, Scene, SceneTransition } from '../core/types';
import type { CSSProperties, ReactNode, RefObject } from 'react';

export interface CIHotspotViewerProps {
  src?: string;
  alt?: string;
  hotspots?: HotspotItem[];
  trigger?: CIHotspotConfig['trigger'];
  zoom?: boolean;
  zoomMax?: number;
  zoomMin?: number;
  theme?: CIHotspotConfig['theme'];
  pulse?: boolean;
  placement?: CIHotspotConfig['placement'];
  zoomControls?: boolean;
  lazyLoad?: boolean;
  scrollHint?: boolean;
  cloudimage?: CIHotspotConfig['cloudimage'];
  renderPopover?: (hotspot: HotspotItem) => ReactNode;
  onOpen?: (hotspot: HotspotItem) => void;
  onClose?: (hotspot: HotspotItem) => void;
  onZoom?: (level: number) => void;
  onClick?: (event: MouseEvent | KeyboardEvent, hotspot: HotspotItem) => void;
  scenes?: Scene[];
  initialScene?: string;
  sceneTransition?: SceneTransition;
  sceneAspectRatio?: string;
  onSceneChange?: (sceneId: string, scene: Scene) => void;
  fullscreenButton?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
  className?: string;
  style?: CSSProperties;
}

export interface CIHotspotViewerRef {
  open(id: string): void;
  close(id: string): void;
  closeAll(): void;
  setZoom(level: number): void;
  getZoom(): number;
  resetZoom(): void;
  addHotspot(hotspot: HotspotItem): void;
  removeHotspot(id: string): void;
  updateHotspot(id: string, updates: Partial<HotspotItem>): void;
  goToScene(sceneId: string): void;
  getCurrentScene(): string | undefined;
  getScenes(): string[];
  enterFullscreen(): void;
  exitFullscreen(): void;
  isFullscreen(): boolean;
}

export interface UseCIHotspotOptions extends Omit<CIHotspotViewerProps, 'className' | 'style'> {}

export interface UseCIHotspotReturn {
  containerRef: RefObject<HTMLDivElement | null>;
  instance: RefObject<CIHotspotInstance | null>;
}
