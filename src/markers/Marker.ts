import type { NormalizedHotspot } from '../core/types';
import { createElement, addClass, removeClass } from '../utils/dom';

/** Create a marker button element for a hotspot */
export function createMarker(hotspot: NormalizedHotspot, pulse: boolean): HTMLButtonElement {
  const marker = createElement('button', 'ci-hotspot-marker', {
    'aria-label': hotspot.label,
    'aria-expanded': 'false',
    'data-hotspot-id': hotspot.id,
    'tabindex': '0',
  });

  marker.style.left = `${hotspot.x}%`;
  marker.style.top = `${hotspot.y}%`;

  if (hotspot.className) {
    addClass(marker, hotspot.className);
  }

  if (hotspot.hidden) {
    addClass(marker, 'ci-hotspot-marker--hidden');
  }

  if (pulse) {
    addClass(marker, 'ci-hotspot-marker--pulse');
  }

  if (hotspot.icon) {
    setMarkerIcon(marker, hotspot.icon);
  }

  return marker;
}

/** Set marker icon content */
function setMarkerIcon(marker: HTMLButtonElement, icon: string): void {
  if (icon.startsWith('<svg') || icon.startsWith('<SVG')) {
    marker.innerHTML = icon;
  } else if (icon.match(/\.(png|jpg|jpeg|gif|svg|webp)$/i) || icon.startsWith('http') || icon.startsWith('/')) {
    const img = createElement('img', undefined, {
      src: icon,
      alt: '',
      'aria-hidden': 'true',
    });
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    marker.appendChild(img);
  } else {
    // CSS class name
    const iconEl = createElement('span', icon, { 'aria-hidden': 'true' });
    marker.appendChild(iconEl);
  }
}

/** Set marker as active (popover open) */
export function setMarkerActive(marker: HTMLButtonElement, active: boolean): void {
  if (active) {
    addClass(marker, 'ci-hotspot-marker--active');
    marker.setAttribute('aria-expanded', 'true');
  } else {
    removeClass(marker, 'ci-hotspot-marker--active');
    marker.setAttribute('aria-expanded', 'false');
  }
}

/** Set marker as hidden */
export function setMarkerHidden(marker: HTMLButtonElement, hidden: boolean): void {
  if (hidden) {
    addClass(marker, 'ci-hotspot-marker--hidden');
  } else {
    removeClass(marker, 'ci-hotspot-marker--hidden');
  }
}

/** Destroy a marker element */
export function destroyMarker(marker: HTMLButtonElement): void {
  marker.remove();
}
