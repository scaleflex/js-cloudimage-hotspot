import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import CIHotspot from '../src/index';
import type { CIHotspotConfig } from '../src/core/types';
import { getFocusableElements, createFocusTrap } from '../src/a11y/focus';
import { announceToScreenReader } from '../src/a11y/aria';

function makeConfig(overrides?: Partial<CIHotspotConfig>): CIHotspotConfig {
  return {
    src: 'https://example.com/image.jpg',
    hotspots: [
      { id: 'spot-1', x: '40%', y: '60%', label: 'Spot 1', data: { title: 'Item 1', url: 'https://example.com' } },
      { id: 'spot-2', x: '75%', y: '25%', label: 'Spot 2', data: { title: 'Item 2' } },
    ],
    ...overrides,
  };
}

describe('Accessibility — ARIA', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  it('container has role="group" and aria-label', () => {
    const instance = new CIHotspot(root, makeConfig({ alt: 'My image' }));
    const container = root.querySelector('.ci-hotspot-container');
    expect(container?.getAttribute('role')).toBe('group');
    expect(container?.getAttribute('aria-label')).toBe('My image');
    instance.destroy();
  });

  it('markers have correct ARIA attributes', () => {
    const instance = new CIHotspot(root, makeConfig());
    const marker = root.querySelector('[data-hotspot-id="spot-1"]') as HTMLElement;

    expect(marker.getAttribute('aria-label')).toBe('Spot 1');
    expect(marker.getAttribute('aria-expanded')).toBe('false');
    expect(marker.getAttribute('tabindex')).toBe('0');
    expect(marker.getAttribute('aria-describedby')).toBe('ci-hotspot-popover-spot-1');

    instance.destroy();
  });

  it('popover has correct initial ARIA attributes', () => {
    const instance = new CIHotspot(root, makeConfig());
    const popover = root.querySelector('#ci-hotspot-popover-spot-1');

    expect(popover?.getAttribute('role')).toBe('tooltip');
    expect(popover?.getAttribute('aria-hidden')).toBe('true');

    instance.destroy();
  });

  it('ARIA states update when popover opens/closes', () => {
    const instance = new CIHotspot(root, makeConfig({ trigger: 'click' }));
    const marker = root.querySelector('[data-hotspot-id="spot-1"]') as HTMLElement;
    const popover = root.querySelector('#ci-hotspot-popover-spot-1');

    instance.open('spot-1');
    expect(marker.getAttribute('aria-expanded')).toBe('true');
    expect(popover?.getAttribute('aria-hidden')).toBe('false');

    instance.close('spot-1');
    expect(marker.getAttribute('aria-expanded')).toBe('false');
    expect(popover?.getAttribute('aria-hidden')).toBe('true');

    instance.destroy();
  });
});

describe('Accessibility — Keyboard', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  it('Enter key toggles popover', () => {
    const instance = new CIHotspot(root, makeConfig({ trigger: 'click' }));
    const marker = root.querySelector('[data-hotspot-id="spot-1"]') as HTMLElement;
    const popover = root.querySelector('#ci-hotspot-popover-spot-1');

    // Simulate Enter keydown
    marker.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(popover?.classList.contains('ci-hotspot-popover--visible')).toBe(true);

    // Enter again to close
    marker.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    expect(popover?.classList.contains('ci-hotspot-popover--visible')).toBe(false);

    instance.destroy();
  });

  it('Space key toggles popover', () => {
    const instance = new CIHotspot(root, makeConfig({ trigger: 'click' }));
    const marker = root.querySelector('[data-hotspot-id="spot-1"]') as HTMLElement;
    const popover = root.querySelector('#ci-hotspot-popover-spot-1');

    marker.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    expect(popover?.classList.contains('ci-hotspot-popover--visible')).toBe(true);

    instance.destroy();
  });

  it('Escape key closes popover', () => {
    const instance = new CIHotspot(root, makeConfig({ trigger: 'click' }));
    const marker = root.querySelector('[data-hotspot-id="spot-1"]') as HTMLElement;
    const popover = root.querySelector('#ci-hotspot-popover-spot-1');

    instance.open('spot-1');
    expect(popover?.classList.contains('ci-hotspot-popover--visible')).toBe(true);

    marker.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(popover?.classList.contains('ci-hotspot-popover--visible')).toBe(false);

    instance.destroy();
  });

  it('markers are tabbable (tabindex=0)', () => {
    const instance = new CIHotspot(root, makeConfig());
    const markers = root.querySelectorAll('.ci-hotspot-marker');
    markers.forEach((marker) => {
      expect(marker.getAttribute('tabindex')).toBe('0');
    });
    instance.destroy();
  });
});

describe('Accessibility — Focus Management', () => {
  it('getFocusableElements finds interactive elements', () => {
    const container = document.createElement('div');
    container.innerHTML = `
      <a href="#">Link</a>
      <button>Button</button>
      <input type="text" />
      <div>Not focusable</div>
      <button disabled>Disabled</button>
    `;
    document.body.appendChild(container);

    const focusable = getFocusableElements(container);
    expect(focusable).toHaveLength(3); // link, button, input (not disabled button)

    container.remove();
  });

  it('createFocusTrap traps focus within element', () => {
    const popover = document.createElement('div');
    popover.innerHTML = `
      <a href="#" id="link1">Link 1</a>
      <a href="#" id="link2">Link 2</a>
    `;
    document.body.appendChild(popover);

    const returnEl = document.createElement('button');
    document.body.appendChild(returnEl);

    const trap = createFocusTrap(popover, returnEl);
    trap.activate();

    // First element should be focused
    expect(document.activeElement?.id).toBe('link1');

    trap.deactivate();
    // Focus should return to the return element
    expect(document.activeElement).toBe(returnEl);

    trap.destroy();
    popover.remove();
    returnEl.remove();
  });
});

describe('Accessibility — ARIA utilities', () => {
  it('announceToScreenReader creates live region', () => {
    announceToScreenReader('Test announcement');
    const region = document.querySelector('[aria-live="polite"]');
    expect(region).toBeTruthy();
    region?.remove();
  });
});
