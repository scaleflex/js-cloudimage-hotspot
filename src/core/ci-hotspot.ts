import type { CIHotspotConfig, CIHotspotInstance, HotspotItem, NormalizedHotspot } from './types';
import { mergeConfig, parseDataAttributes, validateConfig } from './config';
import { getElement, createElement, addClass, removeClass, injectStyles } from '../utils/dom';
import { normalizeToPercent } from '../utils/coordinates';
import { addListener } from '../utils/events';
import { createMarker, setMarkerActive, setMarkerHidden, destroyMarker } from '../markers/marker';
import { setPulseState } from '../markers/pulse';
import { Popover } from '../popover/popover';
import { ZoomPan } from '../zoom/zoom-pan';
import { createZoomControls } from '../zoom/controls';
import { ScrollHint } from '../zoom/scroll-hint';
import { buildCloudimageUrl, createResizeHandler } from '../utils/cloudimage';
import { KeyboardHandler } from '../a11y/keyboard';
import { createFocusTrap } from '../a11y/focus';
import { announceToScreenReader } from '../a11y/aria';
import cssText from '../styles/index.css?inline';

export class CIHotspot implements CIHotspotInstance {
  private config: CIHotspotConfig;
  private rootEl: HTMLElement;
  private containerEl!: HTMLElement;
  private viewportEl!: HTMLElement;
  private imgEl!: HTMLImageElement;
  private markersEl!: HTMLElement;
  private markers = new Map<string, HTMLButtonElement>();
  private popovers = new Map<string, Popover>();
  private normalizedHotspots = new Map<string, NormalizedHotspot>();
  private scrollHint: ScrollHint | null = null;
  private zoomPan: ZoomPan | null = null;
  private zoomControls: { element: HTMLElement; update: () => void; destroy: () => void } | null = null;
  private cloudimageHandler: { observer: ResizeObserver; destroy: () => void } | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private keyboardHandler: KeyboardHandler | null = null;
  private focusTraps = new Map<string, ReturnType<typeof createFocusTrap>>();
  private cleanups: (() => void)[] = [];
  private imageLoaded = false;
  private destroyed = false;

  constructor(element: HTMLElement | string, config: CIHotspotConfig) {
    this.rootEl = getElement(element);
    this.config = mergeConfig(config);
    validateConfig(this.config);

    injectStyles(cssText);
    this.buildDOM();
    this.applyTheme();
    this.setupImage();
    this.initHotspots();

    if (this.config.zoom) {
      this.initZoom();
    }

    this.initKeyboard();
    this.setupResponsive();
  }

  /** Auto-initialize all elements with data-ci-hotspot-src attribute */
  static autoInit(root?: HTMLElement): CIHotspotInstance[] {
    const container = root || document;
    const elements = container.querySelectorAll<HTMLElement>('[data-ci-hotspot-src]');
    const instances: CIHotspotInstance[] = [];

    elements.forEach((el) => {
      const config = parseDataAttributes(el);
      if (config.src) {
        instances.push(new CIHotspot(el, config as CIHotspotConfig));
      }
    });

    return instances;
  }

  private buildDOM(): void {
    this.containerEl = createElement('div', 'ci-hotspot-container');
    this.viewportEl = createElement('div', 'ci-hotspot-viewport');
    this.imgEl = createElement('img', 'ci-hotspot-image', {
      alt: this.config.alt || '',
      draggable: 'false',
    });
    this.markersEl = createElement('div', 'ci-hotspot-markers');

    this.viewportEl.appendChild(this.imgEl);
    this.viewportEl.appendChild(this.markersEl);
    this.containerEl.appendChild(this.viewportEl);

    // Set container role and aria-label for accessibility
    this.containerEl.setAttribute('role', 'img');
    this.containerEl.setAttribute('aria-label', this.config.alt || 'Image with hotspots');

    // Replace root element content
    this.rootEl.innerHTML = '';
    this.rootEl.appendChild(this.containerEl);

    // Loading state
    if (this.config.lazyLoad) {
      addClass(this.containerEl, 'ci-hotspot-loading');
    }
  }

  private applyTheme(): void {
    if (this.config.theme === 'dark') {
      addClass(this.containerEl, 'ci-hotspot-theme-dark');
    }
  }

  private setupImage(): void {
    const onLoad = () => {
      removeClass(this.containerEl, 'ci-hotspot-loading');
      this.imageLoaded = true;
      // Normalize pixel coordinates now that we know natural dimensions
      this.renormalizePixelCoordinates();
      // Now that the image defines the container size, show load-trigger popovers
      this.showLoadTriggerPopovers();
    };

    this.imgEl.addEventListener('load', onLoad);
    this.cleanups.push(() => this.imgEl.removeEventListener('load', onLoad));

    if (this.config.lazyLoad && typeof IntersectionObserver !== 'undefined') {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            this.loadImage();
            observer.disconnect();
          }
        },
        { threshold: 0.1 },
      );
      observer.observe(this.containerEl);
      this.cleanups.push(() => observer.disconnect());
    } else {
      this.loadImage();
    }
  }

  private loadImage(): void {
    if (this.config.cloudimage?.token) {
      const containerWidth = this.containerEl.offsetWidth || 300;
      const dpr = window.devicePixelRatio || 1;
      const zoomLevel = this.zoomPan?.getZoom() || 1;
      this.imgEl.src = buildCloudimageUrl(
        this.config.src,
        this.config.cloudimage,
        containerWidth,
        zoomLevel,
        dpr,
      );

      this.cloudimageHandler = createResizeHandler(
        this.imgEl,
        this.config.src,
        this.config.cloudimage,
        () => this.zoomPan?.getZoom() || 1,
      );
      this.cloudimageHandler.observer.observe(this.containerEl);
      this.cleanups.push(() => this.cloudimageHandler?.destroy());
    } else {
      this.imgEl.src = this.config.src;
    }
  }

  private initHotspots(): void {
    for (const hotspot of this.config.hotspots) {
      this.addHotspotInternal(hotspot);
    }
  }

  private addHotspotInternal(hotspot: HotspotItem): void {
    // Normalize coordinates
    const { x, y } = normalizeToPercent(
      hotspot.x,
      hotspot.y,
      this.imgEl.naturalWidth || 1000,
      this.imgEl.naturalHeight || 1000,
    );

    const normalized: NormalizedHotspot = { ...hotspot, x, y };
    this.normalizedHotspots.set(hotspot.id, normalized);

    // Create marker
    const pulse = this.config.pulse !== false;
    const marker = createMarker(normalized, pulse);
    this.markers.set(hotspot.id, marker);
    this.markersEl.appendChild(marker);

    // Create popover
    const triggerMode = hotspot.trigger || this.config.trigger || 'hover';
    const placement = hotspot.placement || this.config.placement || 'top';

    const popover = new Popover(hotspot, {
      placement,
      triggerMode,
      renderFn: this.config.renderPopover,
      onOpen: this.config.onOpen,
      onClose: this.config.onClose,
    });
    this.popovers.set(hotspot.id, popover);
    popover.mount(this.containerEl, marker);

    // Bind triggers
    this.bindTrigger(hotspot, marker, popover, triggerMode);

    // Handle per-hotspot trigger override for 'load'
    if (triggerMode === 'load' && this.imageLoaded) {
      popover.show();
      setMarkerActive(marker, true);
    }
  }

  private bindTrigger(
    hotspot: HotspotItem,
    marker: HTMLButtonElement,
    popover: Popover,
    triggerMode: string,
  ): void {
    if (triggerMode === 'hover') {
      // Show on mouse enter marker
      const enterCleanup = addListener(marker, 'mouseenter', () => {
        popover.clearHideTimer();
        popover.show();
        setMarkerActive(marker, true);
      });

      // Schedule hide on mouse leave marker
      const leaveCleanup = addListener(marker, 'mouseleave', () => {
        popover.scheduleHide(200);
        // After hide delay, deactivate marker
        setTimeout(() => {
          if (!popover.isVisible()) {
            setMarkerActive(marker, false);
          }
        }, 250);
      });

      this.cleanups.push(enterCleanup, leaveCleanup);

    } else if (triggerMode === 'click') {
      const clickCleanup = addListener(marker, 'click', (e) => {
        e.stopPropagation();
        this.config.onClick?.(e, hotspot);
        hotspot.onClick?.(e, hotspot);

        if (popover.isVisible()) {
          popover.hide();
          setMarkerActive(marker, false);
        } else {
          // Close all other popovers first
          this.closeAll();
          popover.show();
          setMarkerActive(marker, true);
        }
      });

      // Click outside to close
      const outsideCleanup = addListener(document, 'click', () => {
        if (popover.isVisible() && !hotspot.keepOpen) {
          popover.hide();
          setMarkerActive(marker, false);
        }
      });

      this.cleanups.push(clickCleanup, outsideCleanup);
    }

    // Keyboard: focus/blur for hover-like behavior regardless of trigger
    const focusCleanup = addListener(marker, 'focus', () => {
      if (triggerMode === 'hover') {
        popover.clearHideTimer();
        popover.show();
        setMarkerActive(marker, true);
      }
    });

    const blurCleanup = addListener(marker, 'blur', () => {
      if (triggerMode === 'hover') {
        popover.scheduleHide(200);
        setTimeout(() => {
          if (!popover.isVisible()) setMarkerActive(marker, false);
        }, 250);
      }
    });

    // Enter/Space toggle
    const keyCleanup = addListener(marker, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.config.onClick?.(e as unknown as MouseEvent, hotspot);
        if (popover.isVisible()) {
          popover.hide();
          setMarkerActive(marker, false);
        } else {
          this.closeAll();
          popover.show();
          setMarkerActive(marker, true);
        }
      } else if (e.key === 'Escape') {
        if (popover.isVisible()) {
          popover.hide();
          setMarkerActive(marker, false);
          marker.focus();
        }
      }
    });

    this.cleanups.push(focusCleanup, blurCleanup, keyCleanup);
  }

  private renormalizePixelCoordinates(): void {
    const naturalWidth = this.imgEl.naturalWidth;
    const naturalHeight = this.imgEl.naturalHeight;
    if (!naturalWidth || !naturalHeight) return;

    for (const hotspot of this.config.hotspots) {
      if (typeof hotspot.x === 'number' || typeof hotspot.y === 'number') {
        const { x, y } = normalizeToPercent(hotspot.x, hotspot.y, naturalWidth, naturalHeight);
        const marker = this.markers.get(hotspot.id);
        if (marker) {
          marker.style.left = `${x}%`;
          marker.style.top = `${y}%`;
        }
        const normalized = this.normalizedHotspots.get(hotspot.id);
        if (normalized) {
          normalized.x = x;
          normalized.y = y;
        }
      }
    }
  }

  private showLoadTriggerPopovers(): void {
    for (const [id, popover] of this.popovers) {
      const hotspot = this.config.hotspots.find((h) => h.id === id);
      const triggerMode = hotspot?.trigger || this.config.trigger || 'hover';
      if (triggerMode === 'load' && !popover.isVisible()) {
        popover.show();
        const marker = this.markers.get(id);
        if (marker) setMarkerActive(marker, true);
      }
    }
  }

  private initZoom(): void {
    if (this.config.scrollHint !== false) {
      this.scrollHint = new ScrollHint(this.containerEl);
    }

    this.zoomPan = new ZoomPan(this.viewportEl, this.containerEl, {
      zoomMin: this.config.zoomMin || 1,
      zoomMax: this.config.zoomMax || 4,
      onZoom: (level) => {
        this.config.onZoom?.(level);
        this.zoomControls?.update();
        // Update all popover positions
        for (const [, popover] of this.popovers) {
          if (popover.isVisible()) {
            popover.updatePosition();
          }
        }
      },
      onScrollWithoutZoom: () => this.scrollHint?.show(),
    });

    if (this.config.zoomControls !== false) {
      this.zoomControls = createZoomControls(this.containerEl, this.zoomPan, {
        zoomMin: this.config.zoomMin || 1,
        zoomMax: this.config.zoomMax || 4,
      });
    }
  }

  private setupResponsive(): void {
    if (typeof ResizeObserver === 'undefined') return;

    this.resizeObserver = new ResizeObserver(() => {
      // Check responsive hotspot visibility
      const containerWidth = this.containerEl.offsetWidth;
      for (const [id, hotspot] of this.normalizedHotspots) {
        const original = this.config.hotspots.find((h) => h.id === id);
        if (original?.responsive) {
          const marker = this.markers.get(id);
          if (!marker) continue;
          const shouldHide =
            (original.responsive.maxWidth && containerWidth > original.responsive.maxWidth) ||
            (original.responsive.minWidth && containerWidth < original.responsive.minWidth);
          setMarkerHidden(marker, !!shouldHide);
        }
      }
    });

    this.resizeObserver.observe(this.containerEl);
    this.cleanups.push(() => this.resizeObserver?.disconnect());
  }

  private initKeyboard(): void {
    this.keyboardHandler = new KeyboardHandler({
      container: this.containerEl,
      getZoomPan: () => this.zoomPan,
      onEscape: () => {
        // Close all popovers and return focus
        this.closeAll();
      },
    });
  }

  // === Public API ===

  /** Get references to the internal DOM elements */
  getElements(): {
    container: HTMLElement;
    viewport: HTMLElement;
    image: HTMLImageElement;
    markers: HTMLElement;
  } {
    return {
      container: this.containerEl,
      viewport: this.viewportEl,
      image: this.imgEl,
      markers: this.markersEl,
    };
  }

  open(id: string): void {
    const popover = this.popovers.get(id);
    const marker = this.markers.get(id);
    if (popover && marker) {
      popover.show();
      setMarkerActive(marker, true);
    }
  }

  close(id: string): void {
    const popover = this.popovers.get(id);
    const marker = this.markers.get(id);
    if (popover && marker) {
      popover.hide();
      setMarkerActive(marker, false);
    }
  }

  closeAll(): void {
    for (const [id, popover] of this.popovers) {
      if (popover.isVisible()) {
        popover.hide();
        const marker = this.markers.get(id);
        if (marker) setMarkerActive(marker, false);
      }
    }
  }

  setZoom(level: number): void {
    this.zoomPan?.setZoom(level);
  }

  getZoom(): number {
    return this.zoomPan?.getZoom() || 1;
  }

  resetZoom(): void {
    this.zoomPan?.resetZoom();
  }

  addHotspot(hotspot: HotspotItem): void {
    this.config.hotspots.push(hotspot);
    this.addHotspotInternal(hotspot);
  }

  removeHotspot(id: string): void {
    const marker = this.markers.get(id);
    const popover = this.popovers.get(id);

    if (popover) {
      popover.destroy();
      this.popovers.delete(id);
    }
    if (marker) {
      destroyMarker(marker);
      this.markers.delete(id);
    }
    this.normalizedHotspots.delete(id);
    this.config.hotspots = this.config.hotspots.filter((h) => h.id !== id);
  }

  updateHotspot(id: string, updates: Partial<HotspotItem>): void {
    const idx = this.config.hotspots.findIndex((h) => h.id === id);
    if (idx === -1) return;

    // Remove and re-add with updated config
    const current = this.config.hotspots[idx];
    const updated = { ...current, ...updates };
    this.removeHotspot(id);
    this.config.hotspots.splice(idx, 0, updated);
    this.addHotspotInternal(updated);
  }

  update(config: Partial<CIHotspotConfig>): void {
    // Destroy current state and rebuild
    this.destroyInternal();
    this.config = mergeConfig({ ...this.config, ...config });
    validateConfig(this.config);
    this.buildDOM();
    this.applyTheme();
    this.setupImage();
    this.initHotspots();
    if (this.config.zoom) {
      this.initZoom();
    }
    this.initKeyboard();
    this.setupResponsive();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.destroyInternal();
    this.rootEl.innerHTML = '';
  }

  private destroyInternal(): void {
    this.imageLoaded = false;

    // Run all cleanup functions
    this.cleanups.forEach((fn) => fn());
    this.cleanups = [];

    // Destroy popovers
    for (const [, popover] of this.popovers) {
      popover.destroy();
    }
    this.popovers.clear();

    // Destroy markers
    for (const [, marker] of this.markers) {
      destroyMarker(marker);
    }
    this.markers.clear();
    this.normalizedHotspots.clear();

    // Destroy focus traps
    for (const [, trap] of this.focusTraps) {
      trap.destroy();
    }
    this.focusTraps.clear();

    // Destroy keyboard handler
    this.keyboardHandler?.destroy();
    this.keyboardHandler = null;

    // Destroy zoom
    this.zoomPan?.destroy();
    this.zoomPan = null;
    this.zoomControls?.destroy();
    this.zoomControls = null;
    this.scrollHint?.destroy();
    this.scrollHint = null;

    // Destroy cloudimage handler
    this.cloudimageHandler?.destroy();
    this.cloudimageHandler = null;

    // Destroy resize observer
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
  }
}
