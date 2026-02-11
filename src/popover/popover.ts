import type { HotspotItem, Placement } from '../core/types';
import { createElement, addClass, removeClass } from '../utils/dom';
import { computePosition } from './position';
import { renderPopoverContent } from './template';

export interface PopoverOptions {
  placement: Placement;
  triggerMode: 'hover' | 'click' | 'load';
  renderFn?: (hotspot: HotspotItem) => string | HTMLElement;
  onOpen?: (hotspot: HotspotItem) => void;
  onClose?: (hotspot: HotspotItem) => void;
}

export class Popover {
  readonly element: HTMLElement;
  private arrowEl: HTMLElement;
  private contentEl: HTMLElement;
  private visible = false;
  private hideTimer: ReturnType<typeof setTimeout> | undefined;
  private hotspot: HotspotItem;
  private markerEl: HTMLElement | null = null;
  private containerEl: HTMLElement | null = null;
  private options: PopoverOptions;

  constructor(hotspot: HotspotItem, options: PopoverOptions) {
    this.hotspot = hotspot;
    this.options = options;

    const isDialog = options.triggerMode === 'click';
    this.element = createElement('div', 'ci-hotspot-popover', {
      'role': isDialog ? 'dialog' : 'tooltip',
      'id': `ci-hotspot-popover-${hotspot.id}`,
      'aria-hidden': 'true',
      'data-placement': options.placement === 'auto' ? 'top' : options.placement,
      ...(isDialog && hotspot.label ? { 'aria-label': hotspot.label } : {}),
    });

    this.arrowEl = createElement('div', 'ci-hotspot-popover-arrow');
    this.contentEl = createElement('div', 'ci-hotspot-popover-content');

    this.element.appendChild(this.arrowEl);
    this.element.appendChild(this.contentEl);

    // Render content
    const content = renderPopoverContent(hotspot, options.renderFn);
    if (typeof content === 'string') {
      this.contentEl.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      this.contentEl.appendChild(content);
    }

    // Hover delay: clear hide timer when mouse enters popover
    if (options.triggerMode === 'hover') {
      this.element.addEventListener('mouseenter', () => this.clearHideTimer());
      this.element.addEventListener('mouseleave', () => this.scheduleHide());
    }
  }

  /** Mount the popover to a container, associating it with a marker */
  mount(containerEl: HTMLElement, markerEl: HTMLElement): void {
    this.containerEl = containerEl;
    this.markerEl = markerEl;
    containerEl.appendChild(this.element);

    // Set appropriate ARIA relationship on marker
    if (this.options.triggerMode === 'click') {
      markerEl.setAttribute('aria-haspopup', 'dialog');
      markerEl.setAttribute('aria-controls', this.element.id);
    } else {
      markerEl.setAttribute('aria-describedby', this.element.id);
    }
  }

  /** Show the popover */
  show(): void {
    this.clearHideTimer();
    if (this.visible) return;
    this.visible = true;

    addClass(this.element, 'ci-hotspot-popover--visible');
    this.element.setAttribute('aria-hidden', 'false');

    this.updatePosition();
    this.options.onOpen?.(this.hotspot);
  }

  /** Schedule hide with delay (for hover mode) */
  scheduleHide(delay: number = 200): void {
    this.clearHideTimer();
    this.hideTimer = setTimeout(() => {
      this.hide();
    }, delay);
  }

  /** Hide the popover immediately */
  hide(): void {
    this.clearHideTimer();
    if (!this.visible) return;
    this.visible = false;

    removeClass(this.element, 'ci-hotspot-popover--visible');
    this.element.setAttribute('aria-hidden', 'true');

    this.options.onClose?.(this.hotspot);
  }

  /** Clear any pending hide timer */
  clearHideTimer(): void {
    if (this.hideTimer !== undefined) {
      clearTimeout(this.hideTimer);
      this.hideTimer = undefined;
    }
  }

  /** Update popover position relative to marker */
  updatePosition(): void {
    if (!this.markerEl || !this.containerEl || !this.visible) return;

    const result = computePosition(
      this.markerEl,
      this.element,
      this.containerEl,
      { placement: this.options.placement },
    );

    this.element.style.left = `${result.x}px`;
    this.element.style.top = `${result.y}px`;
    this.element.setAttribute('data-placement', result.placement);

    // Position arrow
    this.positionArrow(result.placement, result.arrowOffset);
  }

  private positionArrow(placement: Placement, offset: number): void {
    const arrow = this.arrowEl;
    // Reset
    arrow.style.left = '';
    arrow.style.top = '';

    if (placement === 'top' || placement === 'bottom') {
      arrow.style.left = `calc(50% - var(--ci-hotspot-arrow-size) + ${offset}px)`;
    } else {
      arrow.style.top = `calc(50% - var(--ci-hotspot-arrow-size) + ${offset}px)`;
    }
  }

  /** Check if popover is currently visible */
  isVisible(): boolean {
    return this.visible;
  }

  /** Get the hotspot associated with this popover */
  getHotspot(): HotspotItem {
    return this.hotspot;
  }

  /** Destroy the popover and clean up */
  destroy(): void {
    this.clearHideTimer();
    this.markerEl?.removeAttribute('aria-describedby');
    this.markerEl?.removeAttribute('aria-controls');
    this.markerEl?.removeAttribute('aria-haspopup');
    this.element.remove();
    this.markerEl = null;
    this.containerEl = null;
  }
}
