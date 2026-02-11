import type { CIHotspotConfig, CIHotspotInstance, HotspotItem, NormalizedHotspot, Scene, SceneTransition, TriggerMode } from './types';
import { mergeConfig, parseDataAttributes, validateConfig } from './config';
import { getElement, createElement, addClass, removeClass, injectStyles } from '../utils/dom';
import { normalizeToPercent } from '../utils/coordinates';
import { addListener } from '../utils/events';
import { createMarker, setMarkerActive, setMarkerHidden, destroyMarker } from '../markers/marker';
import { Popover } from '../popover/popover';
import { ZoomPan } from '../zoom/zoom-pan';
import { createZoomControls } from '../zoom/controls';
import { ScrollHint } from '../zoom/scroll-hint';
import { buildCloudimageUrl, createResizeHandler } from '../utils/cloudimage';
import { KeyboardHandler } from '../a11y/keyboard';
import { createFocusTrap } from '../a11y/focus';
import { announceToScreenReader, acquireLiveRegion, releaseLiveRegion } from '../a11y/aria';
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
  private hotspotCleanups = new Map<string, (() => void)[]>();
  private imageLoaded = false;
  private destroyed = false;
  private currentSceneId: string | undefined;
  private scenesMap = new Map<string, Scene>();
  private isTransitioning = false;
  private transitionTimer: ReturnType<typeof setTimeout> | undefined;
  private activeTimers = new Set<ReturnType<typeof setTimeout>>();
  private sceneHotspotOverrides = new Map<string, HotspotItem[]>();

  constructor(element: HTMLElement | string, config: CIHotspotConfig) {
    this.rootEl = getElement(element);
    this.config = mergeConfig(config);
    validateConfig(this.config);

    if (this.config.scenes && this.config.scenes.length > 0) {
      this.initScenes();
    }

    acquireLiveRegion();
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

  /** Auto-initialize all elements with data-ci-hotspot-src or data-ci-hotspot-scenes attribute */
  static autoInit(root?: HTMLElement): CIHotspotInstance[] {
    const container = root || document;
    const elements = container.querySelectorAll<HTMLElement>(
      '[data-ci-hotspot-src], [data-ci-hotspot-scenes]',
    );
    const instances: CIHotspotInstance[] = [];

    elements.forEach((el) => {
      const config = parseDataAttributes(el);
      if (config.src || config.scenes) {
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
    this.containerEl.setAttribute('role', 'group');
    this.containerEl.setAttribute('aria-label', this.config.alt || 'Image with hotspots');

    // Fixed aspect-ratio for scenes mode
    if (this.config.sceneAspectRatio) {
      addClass(this.containerEl, 'ci-hotspot-container--fixed-ratio');
      this.viewportEl.style.aspectRatio = this.config.sceneAspectRatio;
    }

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
      // Position markers to match rendered image in fixed-ratio mode
      this.syncMarkersToImage();
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
    // Remove existing hotspot with same ID to prevent orphaned DOM
    if (this.markers.has(hotspot.id)) {
      const oldMarker = this.markers.get(hotspot.id)!;
      destroyMarker(oldMarker);
      this.markers.delete(hotspot.id);
      this.popovers.get(hotspot.id)?.destroy();
      this.popovers.delete(hotspot.id);
      const fns = this.hotspotCleanups.get(hotspot.id);
      if (fns) { fns.forEach((fn) => fn()); this.hotspotCleanups.delete(hotspot.id); }
      const trap = this.focusTraps.get(hotspot.id);
      if (trap) { trap.destroy(); this.focusTraps.delete(hotspot.id); }
    }

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

    const triggerMode = hotspot.trigger || this.config.trigger || 'hover';

    // navigateTo hotspots: hover shows destination info, click navigates
    if (hotspot.navigateTo) {
      const popoverHotspot = this.enrichNavigateHotspot(hotspot);
      const hasContent = !!(popoverHotspot.data || popoverHotspot.content || this.config.renderPopover);

      if (hasContent) {
        const placement = hotspot.placement || this.config.placement || 'top';
        const popover = new Popover(popoverHotspot, {
          placement,
          triggerMode: 'hover',
          renderFn: this.config.renderPopover,
          onOpen: this.config.onOpen,
          onClose: this.config.onClose,
        });
        this.popovers.set(hotspot.id, popover);
        popover.mount(this.containerEl, marker);
        this.bindNavigateTrigger(hotspot, marker, popover);
      } else {
        this.bindNavigateTrigger(hotspot, marker);
      }
      return;
    }

    // Create popover for regular hotspots
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

  /** For navigateTo hotspots without explicit data/content, generate popover content from the destination scene */
  private enrichNavigateHotspot(hotspot: HotspotItem): HotspotItem {
    if (hotspot.data || hotspot.content) return hotspot;
    const destScene = this.scenesMap.get(hotspot.navigateTo!);
    if (!destScene) return hotspot;
    return {
      ...hotspot,
      data: { title: hotspot.label || destScene.alt || destScene.id },
    };
  }

  private bindNavigateTrigger(hotspot: HotspotItem, marker: HTMLButtonElement, popover?: Popover): void {
    addClass(marker, 'ci-hotspot-marker--navigate');
    const sceneLabel = hotspot.label || hotspot.navigateTo!;
    marker.setAttribute('aria-label', `Navigate to ${sceneLabel}`);
    marker.setAttribute('aria-roledescription', 'navigation hotspot');

    // Hover: show/hide popover (only if popover exists) + preload target scene
    if (popover) {
      const enterCleanup = addListener(marker, 'mouseenter', () => {
        this.preloadSceneImage(hotspot.navigateTo!);
        popover.clearHideTimer();
        popover.show();
        setMarkerActive(marker, true);
      });

      const leaveCleanup = addListener(marker, 'mouseleave', () => {
        popover.scheduleHide(200);
        this.trackedTimeout(() => {
          if (!popover.isVisible()) {
            setMarkerActive(marker, false);
          }
        }, 250);
      });

      const focusCleanup = addListener(marker, 'focus', () => {
        this.preloadSceneImage(hotspot.navigateTo!);
        popover.clearHideTimer();
        popover.show();
        setMarkerActive(marker, true);
      });

      const blurCleanup = addListener(marker, 'blur', () => {
        popover.scheduleHide(200);
        this.trackedTimeout(() => {
          if (!popover.isVisible()) setMarkerActive(marker, false);
        }, 250);
      });

      this.addHotspotCleanups(hotspot.id, enterCleanup, leaveCleanup, focusCleanup, blurCleanup);
    } else {
      // No popover — still preload on hover/focus
      const preloadEnter = addListener(marker, 'mouseenter', () => {
        this.preloadSceneImage(hotspot.navigateTo!);
      });
      const preloadFocus = addListener(marker, 'focus', () => {
        this.preloadSceneImage(hotspot.navigateTo!);
      });
      this.addHotspotCleanups(hotspot.id, preloadEnter, preloadFocus);
    }

    // Click: hide popover and navigate
    const clickCleanup = addListener(marker, 'click', (e) => {
      e.stopPropagation();
      popover?.hide();
      setMarkerActive(marker, false);
      this.config.onClick?.(e, hotspot);
      hotspot.onClick?.(e, hotspot);
      this.goToScene(hotspot.navigateTo!);
    });

    // Keyboard: Enter/Space navigates (fire onClick for parity with click handler)
    const keyCleanup = addListener(marker, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        popover?.hide();
        setMarkerActive(marker, false);
        this.config.onClick?.(e, hotspot);
        hotspot.onClick?.(e, hotspot);
        this.goToScene(hotspot.navigateTo!);
      }
    });

    this.addHotspotCleanups(hotspot.id, clickCleanup, keyCleanup);
  }

  private bindTrigger(
    hotspot: HotspotItem,
    marker: HTMLButtonElement,
    popover: Popover,
    triggerMode: TriggerMode,
  ): void {
    if (triggerMode === 'hover') {
      this.bindHoverTrigger(hotspot, marker, popover);
    } else if (triggerMode === 'click') {
      this.bindClickTrigger(hotspot, marker, popover);
    }
    this.bindKeyboardTrigger(hotspot, marker, popover, triggerMode);
  }

  private bindHoverTrigger(hotspot: HotspotItem, marker: HTMLButtonElement, popover: Popover): void {
    const enterCleanup = addListener(marker, 'mouseenter', () => {
      popover.clearHideTimer();
      popover.show();
      setMarkerActive(marker, true);
    });

    const leaveCleanup = addListener(marker, 'mouseleave', () => {
      popover.scheduleHide(200);
      this.trackedTimeout(() => {
        if (!popover.isVisible()) setMarkerActive(marker, false);
      }, 250);
    });

    this.addHotspotCleanups(hotspot.id, enterCleanup, leaveCleanup);
  }

  private bindClickTrigger(hotspot: HotspotItem, marker: HTMLButtonElement, popover: Popover): void {
    const trap = createFocusTrap(popover.element, marker);
    this.focusTraps.set(hotspot.id, trap);

    const clickCleanup = addListener(marker, 'click', (e) => {
      e.stopPropagation();
      this.config.onClick?.(e, hotspot);
      hotspot.onClick?.(e, hotspot);

      if (popover.isVisible()) {
        popover.hide();
        setMarkerActive(marker, false);
        trap.deactivate();
      } else {
        this.closeAll();
        popover.show();
        setMarkerActive(marker, true);
        trap.activate();
      }
    });

    const outsideCleanup = addListener(document, 'click', (e) => {
      if (
        popover.isVisible() &&
        !hotspot.keepOpen &&
        !popover.element.contains(e.target as Node) &&
        !marker.contains(e.target as Node)
      ) {
        popover.hide();
        setMarkerActive(marker, false);
        trap.deactivate();
      }
    });

    this.addHotspotCleanups(hotspot.id, clickCleanup, outsideCleanup);
  }

  private bindKeyboardTrigger(
    hotspot: HotspotItem,
    marker: HTMLButtonElement,
    popover: Popover,
    triggerMode: TriggerMode,
  ): void {
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
        this.trackedTimeout(() => {
          if (!popover.isVisible()) setMarkerActive(marker, false);
        }, 250);
      }
    });

    const keyCleanup = addListener(marker, 'keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.config.onClick?.(e, hotspot);
        if (popover.isVisible()) {
          popover.hide();
          setMarkerActive(marker, false);
          this.focusTraps.get(hotspot.id)?.deactivate();
        } else {
          this.closeAll();
          popover.show();
          setMarkerActive(marker, true);
          this.ensureFocusTrap(hotspot.id, popover.element, marker);
          this.focusTraps.get(hotspot.id)?.activate();
        }
      } else if (e.key === 'Escape') {
        if (popover.isVisible()) {
          popover.hide();
          setMarkerActive(marker, false);
          this.focusTraps.get(hotspot.id)?.deactivate();
          marker.focus();
        }
      }
    });

    this.addHotspotCleanups(hotspot.id, focusCleanup, blurCleanup, keyCleanup);
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
      const hotspot = this.normalizedHotspots.get(id);
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

    let rafId = 0;
    this.resizeObserver = new ResizeObserver(() => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        if (this.destroyed) return;
        // Re-sync markers position in fixed-ratio mode
        this.syncMarkersToImage();
        // Check responsive hotspot visibility
        const containerWidth = this.containerEl.offsetWidth;
        for (const [id, hotspot] of this.normalizedHotspots) {
          if (hotspot.responsive) {
            const marker = this.markers.get(id);
            if (!marker) continue;
            const shouldHide =
              (hotspot.responsive.maxWidth && containerWidth > hotspot.responsive.maxWidth) ||
              (hotspot.responsive.minWidth && containerWidth < hotspot.responsive.minWidth);
            setMarkerHidden(marker, !!shouldHide);
          }
        }
      });
    });
    this.cleanups.push(() => { if (rafId) cancelAnimationFrame(rafId); });

    this.resizeObserver.observe(this.containerEl);
    this.cleanups.push(() => this.resizeObserver?.disconnect());
  }

  /** Position the markers layer to match the rendered image area within a fixed-ratio viewport */
  private syncMarkersToImage(): void {
    if (!this.config.sceneAspectRatio) return;

    const vw = this.viewportEl.offsetWidth;
    const vh = this.viewportEl.offsetHeight;
    const nw = this.imgEl.naturalWidth;
    const nh = this.imgEl.naturalHeight;
    if (!vw || !vh || !nw || !nh) return;

    const viewportRatio = vw / vh;
    const imageRatio = nw / nh;

    let renderedWidth: number;
    let renderedHeight: number;
    let offsetX: number;
    let offsetY: number;

    if (imageRatio > viewportRatio) {
      // Image is wider than viewport — fills width, vertical padding
      renderedWidth = vw;
      renderedHeight = vw / imageRatio;
      offsetX = 0;
      offsetY = (vh - renderedHeight) / 2;
    } else {
      // Image is taller than viewport — fills height, horizontal padding
      renderedHeight = vh;
      renderedWidth = vh * imageRatio;
      offsetX = (vw - renderedWidth) / 2;
      offsetY = 0;
    }

    this.markersEl.style.left = `${offsetX}px`;
    this.markersEl.style.top = `${offsetY}px`;
    this.markersEl.style.width = `${renderedWidth}px`;
    this.markersEl.style.height = `${renderedHeight}px`;
    // Override inset:0 from base CSS
    this.markersEl.style.right = 'auto';
    this.markersEl.style.bottom = 'auto';
  }

  private initScenes(): void {
    for (const scene of this.config.scenes!) {
      this.scenesMap.set(scene.id, scene);
    }
    const initialId = this.config.initialScene || this.config.scenes![0].id;
    const initialScene = this.scenesMap.get(initialId)!;
    this.config.src = initialScene.src;
    this.config.alt = initialScene.alt || '';
    this.config.hotspots = [...initialScene.hotspots];
    this.currentSceneId = initialId;
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

  private preloadedScenes = new Set<string>();

  private preloadSceneImage(sceneId: string): void {
    if (this.preloadedScenes.has(sceneId)) return;
    const scene = this.scenesMap.get(sceneId);
    if (!scene) return;
    this.preloadedScenes.add(sceneId);
    const img = new Image();
    if (this.config.cloudimage?.token) {
      const containerWidth = this.containerEl.offsetWidth || 300;
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      img.src = buildCloudimageUrl(scene.src, this.config.cloudimage, containerWidth, 1, dpr);
    } else {
      img.src = scene.src;
    }
  }

  private ensureFocusTrap(id: string, popoverEl: HTMLElement, markerEl: HTMLButtonElement): void {
    if (!this.focusTraps.has(id)) {
      this.focusTraps.set(id, createFocusTrap(popoverEl, markerEl));
    }
  }

  /** Create a setTimeout that is automatically cleared on destroy */
  private trackedTimeout(fn: () => void, delay: number): void {
    const id = setTimeout(() => {
      this.activeTimers.delete(id);
      fn();
    }, delay);
    this.activeTimers.add(id);
  }

  /** Sync current hotspots back to scene override map so navigating away and back preserves changes */
  private syncCurrentSceneHotspots(): void {
    if (!this.currentSceneId) return;
    this.sceneHotspotOverrides.set(this.currentSceneId, [...this.config.hotspots]);
  }

  private addHotspotCleanups(id: string, ...fns: (() => void)[]): void {
    let arr = this.hotspotCleanups.get(id);
    if (!arr) {
      arr = [];
      this.hotspotCleanups.set(id, arr);
    }
    arr.push(...fns);
  }

  private clearHotspots(): void {
    for (const fns of this.hotspotCleanups.values()) {
      fns.forEach((fn) => fn());
    }
    this.hotspotCleanups.clear();

    for (const [, popover] of this.popovers) {
      popover.destroy();
    }
    this.popovers.clear();

    for (const [, marker] of this.markers) {
      destroyMarker(marker);
    }
    this.markers.clear();
    this.normalizedHotspots.clear();

    for (const [, trap] of this.focusTraps) {
      trap.destroy();
    }
    this.focusTraps.clear();
  }

  /** Read scene transition duration from CSS variable (handles both ms and s units) */
  private getSceneTransitionDuration(): number {
    if (typeof getComputedStyle === 'undefined') return 400;
    const val = getComputedStyle(this.containerEl).getPropertyValue('--ci-hotspot-scene-transition-duration').trim();
    const num = parseFloat(val);
    if (isNaN(num)) return 400;
    // If the value ends with 's' but not 'ms', it's in seconds
    if (val.endsWith('s') && !val.endsWith('ms')) return num * 1000;
    return num;
  }

  private performSceneTransition(
    scene: Scene,
    transition: SceneTransition,
    onComplete: () => void,
  ): void {
    if (transition === 'none') {
      this.clearHotspots();
      this.switchToScene(scene);
      onComplete();
      return;
    }

    const transitionDuration = this.getSceneTransitionDuration();

    addClass(this.containerEl, 'ci-hotspot-scene-transitioning');

    const incomingImg = createElement('img', 'ci-hotspot-scene-incoming', {
      alt: scene.alt || '',
      draggable: 'false',
    }) as HTMLImageElement;

    if (this.config.cloudimage?.token) {
      const containerWidth = this.containerEl.offsetWidth || 300;
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      incomingImg.src = buildCloudimageUrl(scene.src, this.config.cloudimage, containerWidth, 1, dpr);
    } else {
      incomingImg.src = scene.src;
    }

    const doTransition = () => {
      if (this.destroyed) return;

      if (transition === 'fade') {
        addClass(incomingImg, 'ci-hotspot-scene-fade-in');
        addClass(this.imgEl, 'ci-hotspot-scene-fade-out');
      } else if (transition === 'slide') {
        addClass(incomingImg, 'ci-hotspot-scene-slide-in');
        addClass(this.imgEl, 'ci-hotspot-scene-slide-out');
      }

      this.viewportEl.insertBefore(incomingImg, this.markersEl);

      this.transitionTimer = setTimeout(() => {
        this.transitionTimer = undefined;
        if (this.destroyed) return;

        this.clearHotspots();
        this.switchToScene(scene);
        incomingImg.remove();

        removeClass(this.imgEl, 'ci-hotspot-scene-fade-out');
        removeClass(this.imgEl, 'ci-hotspot-scene-slide-out');
        removeClass(this.containerEl, 'ci-hotspot-scene-transitioning');

        onComplete();
      }, transitionDuration);
    };

    if (incomingImg.complete) {
      doTransition();
    } else {
      addClass(this.containerEl, 'ci-hotspot-scene-loading');
      incomingImg.onload = () => {
        removeClass(this.containerEl, 'ci-hotspot-scene-loading');
        doTransition();
      };
      incomingImg.onerror = () => {
        if (this.destroyed) return;
        removeClass(this.containerEl, 'ci-hotspot-scene-loading');
        incomingImg.remove();
        removeClass(this.containerEl, 'ci-hotspot-scene-transitioning');
        this.clearHotspots();
        this.switchToScene(scene);
        onComplete();
      };
    }
  }

  private switchToScene(scene: Scene): void {
    this.config.src = scene.src;
    this.config.alt = scene.alt || '';
    this.config.hotspots = this.sceneHotspotOverrides.get(scene.id) ?? [...scene.hotspots];

    this.imgEl.alt = scene.alt || '';

    this.containerEl.setAttribute('aria-label', scene.alt || 'Image with hotspots');

    this.imageLoaded = false;
    const onLoad = () => {
      this.imageLoaded = true;
      this.renormalizePixelCoordinates();
      this.syncMarkersToImage();
      this.showLoadTriggerPopovers();
    };
    // Attach listener BEFORE setting src to avoid missing synchronous cache loads
    this.imgEl.addEventListener('load', onLoad, { once: true });

    if (this.config.cloudimage?.token) {
      const containerWidth = this.containerEl.offsetWidth || 300;
      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      this.imgEl.src = buildCloudimageUrl(scene.src, this.config.cloudimage, containerWidth, 1, dpr);
    } else {
      this.imgEl.src = scene.src;
    }

    // If image loaded synchronously from cache, the listener may have already fired.
    // If not, trigger the handler manually.
    if (this.imgEl.complete && this.imgEl.naturalWidth > 0 && !this.imageLoaded) {
      this.imgEl.removeEventListener('load', onLoad);
      onLoad();
    }

    this.initHotspots();
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
    if (this.destroyed) return;
    const popover = this.popovers.get(id);
    const marker = this.markers.get(id);
    if (!popover || !marker) return;
    if (popover.isVisible()) return;
    this.closeAll();
    popover.show();
    setMarkerActive(marker, true);
    this.focusTraps.get(id)?.activate();
  }

  close(id: string): void {
    if (this.destroyed) return;
    const popover = this.popovers.get(id);
    const marker = this.markers.get(id);
    if (popover && marker) {
      popover.hide();
      setMarkerActive(marker, false);
      this.focusTraps.get(id)?.deactivate();
    }
  }

  closeAll(): void {
    if (this.destroyed) return;
    for (const [id, popover] of this.popovers) {
      if (popover.isVisible()) {
        popover.hide();
        const marker = this.markers.get(id);
        if (marker) setMarkerActive(marker, false);
        this.focusTraps.get(id)?.deactivate();
      }
    }
  }

  setZoom(level: number): void {
    if (this.destroyed) return;
    this.zoomPan?.setZoom(level);
  }

  getZoom(): number {
    return this.zoomPan?.getZoom() || 1;
  }

  resetZoom(): void {
    if (this.destroyed) return;
    this.zoomPan?.resetZoom();
  }

  goToScene(sceneId: string): void {
    if (this.destroyed) return;
    if (this.isTransitioning) return;
    if (!this.scenesMap.size) return;
    if (sceneId === this.currentSceneId) return;

    const scene = this.scenesMap.get(sceneId);
    if (!scene) return;

    const transition = this.config.sceneTransition || 'fade';
    this.isTransitioning = true;

    if (this.zoomPan && this.zoomPan.getZoom() > 1) {
      this.zoomPan.resetZoom();
    }

    this.currentSceneId = sceneId;

    this.performSceneTransition(scene, transition, () => {
      this.isTransitioning = false;

      announceToScreenReader(`Navigated to ${scene.alt || sceneId}`);
      this.config.onSceneChange?.(sceneId, scene);

      // Focus first marker if keyboard user
      const firstHotspot = scene.hotspots[0];
      if (firstHotspot) {
        const firstMarker = this.markers.get(firstHotspot.id);
        if (firstMarker && document.activeElement && this.containerEl.contains(document.activeElement)) {
          firstMarker.focus();
        }
      }
    });
  }

  getCurrentScene(): string | undefined {
    return this.currentSceneId;
  }

  getScenes(): string[] {
    return Array.from(this.scenesMap.keys());
  }

  addHotspot(hotspot: HotspotItem): void {
    if (this.destroyed) return;
    this.config.hotspots.push(hotspot);
    this.addHotspotInternal(hotspot);
    this.syncCurrentSceneHotspots();
  }

  removeHotspot(id: string): void {
    if (this.destroyed) return;

    // Clean up per-hotspot listeners
    const fns = this.hotspotCleanups.get(id);
    if (fns) {
      fns.forEach((fn) => fn());
      this.hotspotCleanups.delete(id);
    }

    // Clean up focus trap
    const trap = this.focusTraps.get(id);
    if (trap) {
      trap.destroy();
      this.focusTraps.delete(id);
    }

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
    this.syncCurrentSceneHotspots();
  }

  updateHotspot(id: string, updates: Partial<HotspotItem>): void {
    if (this.destroyed) return;
    const idx = this.config.hotspots.findIndex((h) => h.id === id);
    if (idx === -1) return;

    // Track marker's DOM position before removal
    const oldMarker = this.markers.get(id);
    const nextSibling = oldMarker?.nextElementSibling || null;

    // Remove and re-add with updated config
    const current = this.config.hotspots[idx];
    const updated = { ...current, ...updates };
    this.removeHotspot(id);
    this.config.hotspots.splice(idx, 0, updated);
    this.addHotspotInternal(updated);

    // Restore DOM order
    const newMarker = this.markers.get(id);
    if (newMarker && nextSibling && this.markersEl.contains(nextSibling)) {
      this.markersEl.insertBefore(newMarker, nextSibling);
    }
    this.syncCurrentSceneHotspots();
  }

  update(config: Partial<CIHotspotConfig>): void {
    if (this.destroyed) return;
    // Destroy current state and rebuild
    this.destroyInternal();
    this.config = mergeConfig({ ...this.config, ...config });
    validateConfig(this.config);

    if (this.config.scenes && this.config.scenes.length > 0) {
      this.initScenes();
    }

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

    // Clear all tracked timers
    for (const id of this.activeTimers) clearTimeout(id);
    this.activeTimers.clear();

    // Run all per-hotspot cleanup functions
    for (const fns of this.hotspotCleanups.values()) {
      fns.forEach((fn) => fn());
    }
    this.hotspotCleanups.clear();
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

    // Clear scenes state
    this.scenesMap.clear();
    this.preloadedScenes.clear();
    this.sceneHotspotOverrides.clear();
    this.currentSceneId = undefined;
    this.isTransitioning = false;
    if (this.transitionTimer !== undefined) {
      clearTimeout(this.transitionTimer);
      this.transitionTimer = undefined;
    }

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

    // Release shared live region
    releaseLiveRegion();
  }
}
