import { addClass, removeClass } from '../utils/dom';

/** Enable pulse animation on a marker */
export function enablePulse(marker: HTMLElement): void {
  addClass(marker, 'ci-hotspot-marker--pulse');
}

/** Disable pulse animation on a marker */
export function disablePulse(marker: HTMLElement): void {
  removeClass(marker, 'ci-hotspot-marker--pulse');
}

/** Set pulse state on a marker */
export function setPulseState(marker: HTMLElement, enabled: boolean): void {
  if (enabled) {
    enablePulse(marker);
  } else {
    disablePulse(marker);
  }
}

/** Set pulse state on all markers in a container */
export function setPulseStateAll(container: HTMLElement, enabled: boolean): void {
  const markers = container.querySelectorAll<HTMLElement>('.ci-hotspot-marker');
  markers.forEach((marker) => setPulseState(marker, enabled));
}
