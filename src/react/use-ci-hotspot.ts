import { useRef, useEffect, useCallback } from 'react';
import type { CIHotspotInstance, CIHotspotConfig, HotspotItem } from '../core/types';
import { CIHotspot } from '../core/ci-hotspot';
import type { UseCIHotspotOptions, UseCIHotspotReturn } from './types';

export function useCIHotspot(options: UseCIHotspotOptions): UseCIHotspotReturn {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<CIHotspotInstance | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const config: CIHotspotConfig = {
      src: optionsRef.current.src,
      alt: optionsRef.current.alt,
      hotspots: optionsRef.current.hotspots,
      trigger: optionsRef.current.trigger,
      zoom: optionsRef.current.zoom,
      zoomMax: optionsRef.current.zoomMax,
      zoomMin: optionsRef.current.zoomMin,
      theme: optionsRef.current.theme,
      pulse: optionsRef.current.pulse,
      placement: optionsRef.current.placement,
      zoomControls: optionsRef.current.zoomControls,
      lazyLoad: optionsRef.current.lazyLoad,
      cloudimage: optionsRef.current.cloudimage,
      onOpen: optionsRef.current.onOpen,
      onClose: optionsRef.current.onClose,
      onZoom: optionsRef.current.onZoom,
      onClick: optionsRef.current.onClick,
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

  // Update on options change
  useEffect(() => {
    if (!instanceRef.current) return;

    instanceRef.current.update({
      src: options.src,
      alt: options.alt,
      hotspots: options.hotspots,
      trigger: options.trigger,
      zoom: options.zoom,
      zoomMax: options.zoomMax,
      zoomMin: options.zoomMin,
      theme: options.theme,
      pulse: options.pulse,
      placement: options.placement,
      zoomControls: options.zoomControls,
      lazyLoad: options.lazyLoad,
      cloudimage: options.cloudimage,
      onOpen: options.onOpen,
      onClose: options.onClose,
      onZoom: options.onZoom,
      onClick: options.onClick,
    });
  }, [
    options.src,
    options.alt,
    options.hotspots,
    options.trigger,
    options.zoom,
    options.zoomMax,
    options.zoomMin,
    options.theme,
    options.pulse,
    options.placement,
    options.zoomControls,
    options.lazyLoad,
  ]);

  return { containerRef, instance: instanceRef };
}
