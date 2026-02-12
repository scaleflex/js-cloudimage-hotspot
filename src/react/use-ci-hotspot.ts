import { useRef, useEffect } from 'react';
import type { CIHotspotInstance, CIHotspotConfig, HotspotItem } from '../core/types';
import { CIHotspot } from '../core/ci-hotspot';
import type { UseCIHotspotOptions, UseCIHotspotReturn } from './types';

/** Returns a stable string key for a value, only re-stringifying when the reference changes */
function useStableKey(value: unknown): string {
  const ref = useRef({ value, key: JSON.stringify(value) });
  if (value !== ref.current.value) {
    const key = JSON.stringify(value);
    if (key !== ref.current.key) {
      ref.current = { value, key };
    } else {
      ref.current.value = value;
    }
  }
  return ref.current.key;
}

export function useCIHotspot(options: UseCIHotspotOptions): UseCIHotspotReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<CIHotspotInstance | null>(null);
  const initializedRef = useRef(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const config: CIHotspotConfig = {
      src: optionsRef.current.src || '',
      alt: optionsRef.current.alt,
      hotspots: optionsRef.current.hotspots || [],
      trigger: optionsRef.current.trigger,
      zoom: optionsRef.current.zoom,
      zoomMax: optionsRef.current.zoomMax,
      zoomMin: optionsRef.current.zoomMin,
      theme: optionsRef.current.theme,
      pulse: optionsRef.current.pulse,
      placement: optionsRef.current.placement,
      zoomControls: optionsRef.current.zoomControls,
      lazyLoad: optionsRef.current.lazyLoad,
      scrollHint: optionsRef.current.scrollHint,
      cloudimage: optionsRef.current.cloudimage,
      onOpen: optionsRef.current.onOpen,
      onClose: optionsRef.current.onClose,
      onZoom: optionsRef.current.onZoom,
      onClick: optionsRef.current.onClick,
      scenes: optionsRef.current.scenes,
      initialScene: optionsRef.current.initialScene,
      sceneTransition: optionsRef.current.sceneTransition,
      sceneAspectRatio: optionsRef.current.sceneAspectRatio,
      onSceneChange: optionsRef.current.onSceneChange,
      fullscreenButton: optionsRef.current.fullscreenButton,
      onFullscreenChange: optionsRef.current.onFullscreenChange,
    };

    // If renderPopover is provided, adapt ReactNode -> HTMLElement
    if (optionsRef.current.renderPopover) {
      config.renderPopover = (hotspot: HotspotItem) => {
        // Return an empty div that React can portal into
        const portalTarget = document.createElement('div');
        portalTarget.dataset.reactPortal = hotspot.id;
        return portalTarget;
      };
    }

    const instance = new CIHotspot(el, config);
    instanceRef.current = instance;

    return () => {
      instance.destroy();
      instanceRef.current = null;
    };
  }, []);

  // Stabilize object/array references for dependency comparison
  const scenesKey = useStableKey(options.scenes);
  const hotspotsKey = useStableKey(options.hotspots);
  const cloudimageKey = useStableKey(options.cloudimage);

  // Update on options change (skip initial mount — instance was just created)
  useEffect(() => {
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }
    if (!instanceRef.current) return;

    instanceRef.current.update({
      src: options.src || '',
      alt: options.alt,
      hotspots: options.hotspots || [],
      trigger: options.trigger,
      zoom: options.zoom,
      zoomMax: options.zoomMax,
      zoomMin: options.zoomMin,
      theme: options.theme,
      pulse: options.pulse,
      placement: options.placement,
      zoomControls: options.zoomControls,
      lazyLoad: options.lazyLoad,
      scrollHint: options.scrollHint,
      cloudimage: options.cloudimage,
      onOpen: options.onOpen,
      onClose: options.onClose,
      onZoom: options.onZoom,
      onClick: options.onClick,
      scenes: options.scenes,
      initialScene: options.initialScene,
      sceneTransition: options.sceneTransition,
      sceneAspectRatio: options.sceneAspectRatio,
      onSceneChange: options.onSceneChange,
      fullscreenButton: options.fullscreenButton,
      onFullscreenChange: options.onFullscreenChange,
    });
  }, [
    options.src,
    options.alt,
    hotspotsKey,
    options.trigger,
    options.zoom,
    options.zoomMax,
    options.zoomMin,
    options.theme,
    options.pulse,
    options.placement,
    options.zoomControls,
    options.lazyLoad,
    options.scrollHint,
    cloudimageKey,
    scenesKey,
    options.initialScene,
    options.sceneTransition,
    options.sceneAspectRatio,
    options.fullscreenButton,
    // Note: Callback props (onOpen, onClose, onZoom, onClick, onSceneChange, onFullscreenChange) are
    // intentionally excluded from this dependency array. They are read from optionsRef
    // at call time, so they always reflect the latest value without triggering re-init.
  ]);

  return { containerRef, instance: instanceRef };
}
