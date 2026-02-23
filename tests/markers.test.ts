import { describe, it, expect } from 'vitest';
import { createMarker, setMarkerActive, setMarkerHidden, destroyMarker } from '../src/markers/marker';
import type { NormalizedHotspot } from '../src/core/types';

function makeHotspot(overrides?: Partial<NormalizedHotspot>): NormalizedHotspot {
  return {
    id: 'test-1',
    x: 50,
    y: 60,
    label: 'Test Hotspot',
    ...overrides,
  };
}

describe('createMarker', () => {
  it('creates a button element', () => {
    const marker = createMarker(makeHotspot(), true);
    expect(marker.tagName).toBe('BUTTON');
  });

  it('sets correct position styles', () => {
    const marker = createMarker(makeHotspot({ x: 40, y: 65 }), true);
    expect(marker.style.left).toBe('40%');
    expect(marker.style.top).toBe('65%');
  });

  it('sets aria-label from hotspot label', () => {
    const marker = createMarker(makeHotspot({ label: 'Modern Sofa' }), true);
    expect(marker.getAttribute('aria-label')).toBe('Modern Sofa');
  });

  it('sets aria-expanded to false initially', () => {
    const marker = createMarker(makeHotspot(), true);
    expect(marker.getAttribute('aria-expanded')).toBe('false');
  });

  it('sets data-hotspot-id', () => {
    const marker = createMarker(makeHotspot({ id: 'sofa-1' }), true);
    expect(marker.dataset.hotspotId).toBe('sofa-1');
  });

  it('adds pulse class when enabled', () => {
    const marker = createMarker(makeHotspot(), true);
    expect(marker.classList.contains('ci-hotspot-marker--pulse')).toBe(true);
  });

  it('omits pulse class when disabled', () => {
    const marker = createMarker(makeHotspot(), false);
    expect(marker.classList.contains('ci-hotspot-marker--pulse')).toBe(false);
  });

  it('adds custom className', () => {
    const marker = createMarker(makeHotspot({ className: 'my-custom' }), true);
    expect(marker.classList.contains('my-custom')).toBe(true);
  });

  it('applies hidden class when hidden=true', () => {
    const marker = createMarker(makeHotspot({ hidden: true }), true);
    expect(marker.classList.contains('ci-hotspot-marker--hidden')).toBe(true);
  });

  it('has tabindex=0 for keyboard access', () => {
    const marker = createMarker(makeHotspot(), true);
    expect(marker.getAttribute('tabindex')).toBe('0');
  });

  it('adds dot-label class and label span for markerStyle dot-label', () => {
    const marker = createMarker(makeHotspot({ markerStyle: 'dot-label', label: 'Side Table' }), true);
    expect(marker.classList.contains('ci-hotspot-marker--dot-label')).toBe(true);
    const labelSpan = marker.querySelector('.ci-hotspot-marker-label');
    expect(labelSpan).toBeTruthy();
    expect(labelSpan!.textContent).toBe('Side Table');
  });

  it('does not add dot-label class for default marker style', () => {
    const marker = createMarker(makeHotspot(), true);
    expect(marker.classList.contains('ci-hotspot-marker--dot-label')).toBe(false);
    expect(marker.querySelector('.ci-hotspot-marker-label')).toBeNull();
  });

  it('does not add dot-label class when markerStyle is dot', () => {
    const marker = createMarker(makeHotspot({ markerStyle: 'dot' }), true);
    expect(marker.classList.contains('ci-hotspot-marker--dot-label')).toBe(false);
    expect(marker.querySelector('.ci-hotspot-marker-label')).toBeNull();
  });
});

describe('setMarkerActive', () => {
  it('adds active class and sets aria-expanded', () => {
    const marker = createMarker(makeHotspot(), true);
    setMarkerActive(marker, true);
    expect(marker.classList.contains('ci-hotspot-marker--active')).toBe(true);
    expect(marker.getAttribute('aria-expanded')).toBe('true');
  });

  it('removes active class and resets aria-expanded', () => {
    const marker = createMarker(makeHotspot(), true);
    setMarkerActive(marker, true);
    setMarkerActive(marker, false);
    expect(marker.classList.contains('ci-hotspot-marker--active')).toBe(false);
    expect(marker.getAttribute('aria-expanded')).toBe('false');
  });
});

describe('setMarkerHidden', () => {
  it('toggles hidden class', () => {
    const marker = createMarker(makeHotspot(), true);
    setMarkerHidden(marker, true);
    expect(marker.classList.contains('ci-hotspot-marker--hidden')).toBe(true);
    setMarkerHidden(marker, false);
    expect(marker.classList.contains('ci-hotspot-marker--hidden')).toBe(false);
  });
});

describe('destroyMarker', () => {
  it('removes marker from DOM', () => {
    const marker = createMarker(makeHotspot(), true);
    document.body.appendChild(marker);
    expect(document.body.contains(marker)).toBe(true);
    destroyMarker(marker);
    expect(document.body.contains(marker)).toBe(false);
  });
});
