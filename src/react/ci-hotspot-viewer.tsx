import React, { forwardRef, useImperativeHandle, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useCIHotspot } from './use-ci-hotspot';
import type { CIHotspotViewerProps, CIHotspotViewerRef } from './types';

export const CIHotspotViewer = forwardRef<CIHotspotViewerRef, CIHotspotViewerProps>(
  function CIHotspotViewer(props, ref) {
    const { className, style, renderPopover, ...options } = props;
    const { containerRef, instance } = useCIHotspot(options);
    const [portalTargets, setPortalTargets] = React.useState<Map<string, HTMLElement>>(new Map());

    useImperativeHandle(ref, () => ({
      open: (id: string) => instance.current?.open(id),
      close: (id: string) => instance.current?.close(id),
      closeAll: () => instance.current?.closeAll(),
      setZoom: (level: number) => instance.current?.setZoom(level),
      getZoom: () => instance.current?.getZoom() ?? 1,
      resetZoom: () => instance.current?.resetZoom(),
      addHotspot: (hotspot) => instance.current?.addHotspot(hotspot),
      removeHotspot: (id: string) => instance.current?.removeHotspot(id),
      updateHotspot: (id, updates) => instance.current?.updateHotspot(id, updates),
      goToScene: (sceneId: string) => instance.current?.goToScene(sceneId),
      getCurrentScene: () => instance.current?.getCurrentScene(),
      getScenes: () => instance.current?.getScenes() ?? [],
      enterFullscreen: () => instance.current?.enterFullscreen(),
      exitFullscreen: () => instance.current?.exitFullscreen(),
      isFullscreen: () => instance.current?.isFullscreen() ?? false,
    }));

    // Find portal targets for React rendering
    useEffect(() => {
      if (!containerRef.current || !renderPopover) return;

      const observer = new MutationObserver(() => {
        const targets = containerRef.current?.querySelectorAll<HTMLElement>('[data-react-portal]');
        if (!targets) return;

        const newMap = new Map<string, HTMLElement>();
        targets.forEach((el) => {
          const id = el.dataset.reactPortal;
          if (id) newMap.set(id, el);
        });

        // Only update state if the portal targets actually changed
        setPortalTargets((prev) => {
          if (prev.size !== newMap.size) return newMap;
          for (const [id, el] of newMap) {
            if (prev.get(id) !== el) return newMap;
          }
          return prev;
        });
      });

      observer.observe(containerRef.current, { childList: true, subtree: true });
      return () => observer.disconnect();
    }, [renderPopover]);

    return (
      <>
        <div ref={containerRef} className={className} style={style} />
        {renderPopover && Array.from(portalTargets.entries()).map(([id, target]) => {
          const hotspot = props.hotspots?.find((h) => h.id === id);
          if (!hotspot) return null;
          return createPortal(
            <>{renderPopover(hotspot)}</>,
            target,
            id,
          );
        })}
      </>
    );
  },
);
