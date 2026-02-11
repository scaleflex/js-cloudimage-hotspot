import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import CIHotspot from '../src/index';
import type { CIHotspotConfig } from '../src/core/types';

function makeConfig(overrides?: Partial<CIHotspotConfig>): CIHotspotConfig {
  return {
    src: 'https://example.com/image.jpg',
    hotspots: [
      { id: 'spot-1', x: '40%', y: '60%', label: 'Spot 1', data: { title: 'Item 1' } },
      { id: 'spot-2', x: '75%', y: '25%', label: 'Spot 2', data: { title: 'Item 2' } },
    ],
    ...overrides,
  };
}

describe('CIHotspot', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    root.id = 'test-root';
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  it('creates correct DOM structure', () => {
    const instance = new CIHotspot(root, makeConfig());
    const container = root.querySelector('.ci-hotspot-container');
    const viewport = root.querySelector('.ci-hotspot-viewport');
    const img = root.querySelector('.ci-hotspot-image');
    const markers = root.querySelector('.ci-hotspot-markers');

    expect(container).toBeTruthy();
    expect(viewport).toBeTruthy();
    expect(img).toBeTruthy();
    expect(markers).toBeTruthy();

    instance.destroy();
  });

  it('creates markers for each hotspot', () => {
    const instance = new CIHotspot(root, makeConfig());
    const markers = root.querySelectorAll('.ci-hotspot-marker');
    expect(markers).toHaveLength(2);
    instance.destroy();
  });

  it('creates popovers for each hotspot', () => {
    const instance = new CIHotspot(root, makeConfig());
    const popovers = root.querySelectorAll('.ci-hotspot-popover');
    expect(popovers).toHaveLength(2);
    instance.destroy();
  });

  it('sets image src', () => {
    const instance = new CIHotspot(root, makeConfig());
    const img = root.querySelector('.ci-hotspot-image') as HTMLImageElement;
    expect(img.src).toContain('example.com/image.jpg');
    instance.destroy();
  });

  it('sets image alt text', () => {
    const instance = new CIHotspot(root, makeConfig({ alt: 'Living room' }));
    const img = root.querySelector('.ci-hotspot-image') as HTMLImageElement;
    expect(img.alt).toBe('Living room');
    instance.destroy();
  });

  it('applies dark theme class', () => {
    const instance = new CIHotspot(root, makeConfig({ theme: 'dark' }));
    const container = root.querySelector('.ci-hotspot-container');
    expect(container?.classList.contains('ci-hotspot-theme-dark')).toBe(true);
    instance.destroy();
  });

  it('sets container role and aria-label', () => {
    const instance = new CIHotspot(root, makeConfig({ alt: 'Test image' }));
    const container = root.querySelector('.ci-hotspot-container');
    expect(container?.getAttribute('role')).toBe('group');
    expect(container?.getAttribute('aria-label')).toBe('Test image');
    instance.destroy();
  });

  it('programmatic open/close works', () => {
    const instance = new CIHotspot(root, makeConfig({ trigger: 'click' }));
    const popover = root.querySelector('#ci-hotspot-popover-spot-1');

    expect(popover?.getAttribute('aria-hidden')).toBe('true');

    instance.open('spot-1');
    expect(popover?.classList.contains('ci-hotspot-popover--visible')).toBe(true);
    expect(popover?.getAttribute('aria-hidden')).toBe('false');

    instance.close('spot-1');
    expect(popover?.classList.contains('ci-hotspot-popover--visible')).toBe(false);
    expect(popover?.getAttribute('aria-hidden')).toBe('true');

    instance.destroy();
  });

  it('closeAll closes all open popovers', () => {
    const instance = new CIHotspot(root, makeConfig({ trigger: 'click' }));

    // open() calls closeAll() first (single-popover-at-a-time), so open both via direct calls
    instance.open('spot-1');
    const popover1 = root.querySelector('#ci-hotspot-popover-spot-1');
    expect(popover1?.classList.contains('ci-hotspot-popover--visible')).toBe(true);

    // Opening spot-2 closes spot-1 (correct click-mode behavior)
    instance.open('spot-2');
    const popover2 = root.querySelector('#ci-hotspot-popover-spot-2');
    expect(popover1?.classList.contains('ci-hotspot-popover--visible')).toBe(false);
    expect(popover2?.classList.contains('ci-hotspot-popover--visible')).toBe(true);

    instance.closeAll();
    expect(popover2?.classList.contains('ci-hotspot-popover--visible')).toBe(false);

    instance.destroy();
  });

  it('addHotspot adds a new marker and popover', () => {
    const instance = new CIHotspot(root, makeConfig());
    expect(root.querySelectorAll('.ci-hotspot-marker')).toHaveLength(2);

    instance.addHotspot({
      id: 'spot-3',
      x: '10%',
      y: '10%',
      label: 'Spot 3',
    });

    expect(root.querySelectorAll('.ci-hotspot-marker')).toHaveLength(3);
    expect(root.querySelectorAll('.ci-hotspot-popover')).toHaveLength(3);

    instance.destroy();
  });

  it('removeHotspot removes marker and popover', () => {
    const instance = new CIHotspot(root, makeConfig());
    expect(root.querySelectorAll('.ci-hotspot-marker')).toHaveLength(2);

    instance.removeHotspot('spot-1');

    expect(root.querySelectorAll('.ci-hotspot-marker')).toHaveLength(1);
    expect(root.querySelectorAll('.ci-hotspot-popover')).toHaveLength(1);
    expect(root.querySelector('[data-hotspot-id="spot-1"]')).toBeNull();

    instance.destroy();
  });

  it('destroy cleans up all DOM', () => {
    const instance = new CIHotspot(root, makeConfig());
    expect(root.querySelector('.ci-hotspot-container')).toBeTruthy();

    instance.destroy();
    expect(root.innerHTML).toBe('');
  });

  it('destroy is idempotent', () => {
    const instance = new CIHotspot(root, makeConfig());
    instance.destroy();
    instance.destroy(); // Should not throw
    expect(root.innerHTML).toBe('');
  });

  it('zoom controls appear when zoom enabled', () => {
    const instance = new CIHotspot(root, makeConfig({ zoom: true }));
    expect(root.querySelector('.ci-hotspot-zoom-controls')).toBeTruthy();
    instance.destroy();
  });

  it('no zoom controls when zoom disabled', () => {
    const instance = new CIHotspot(root, makeConfig({ zoom: false }));
    expect(root.querySelector('.ci-hotspot-zoom-controls')).toBeNull();
    instance.destroy();
  });

  it('setZoom/getZoom/resetZoom work when zoom enabled', () => {
    const instance = new CIHotspot(root, makeConfig({ zoom: true }));
    expect(instance.getZoom()).toBe(1);
    instance.setZoom(2);
    expect(instance.getZoom()).toBe(2);
    instance.resetZoom();
    expect(instance.getZoom()).toBe(1);
    instance.destroy();
  });

  it('throws on missing src', () => {
    expect(() => {
      new CIHotspot(root, { src: '', hotspots: [] });
    }).toThrow('src');
  });

  it('throws on invalid element selector', () => {
    expect(() => {
      new CIHotspot('#nonexistent', makeConfig());
    }).toThrow('not found');
  });

  it('pulse markers by default', () => {
    const instance = new CIHotspot(root, makeConfig());
    const marker = root.querySelector('.ci-hotspot-marker');
    expect(marker?.classList.contains('ci-hotspot-marker--pulse')).toBe(true);
    instance.destroy();
  });

  it('no pulse when pulse=false', () => {
    const instance = new CIHotspot(root, makeConfig({ pulse: false }));
    const marker = root.querySelector('.ci-hotspot-marker');
    expect(marker?.classList.contains('ci-hotspot-marker--pulse')).toBe(false);
    instance.destroy();
  });

  it('load trigger shows only first popover after image load', () => {
    const instance = new CIHotspot(root, makeConfig({ trigger: 'load' }));
    // jsdom doesn't fire image load events, so simulate it
    const img = root.querySelector('.ci-hotspot-image') as HTMLImageElement;
    img.dispatchEvent(new Event('load'));
    const popovers = root.querySelectorAll('.ci-hotspot-popover--visible');
    expect(popovers.length).toBe(1);
    instance.destroy();
  });
});

describe('CIHotspot load trigger close mechanisms', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    root.id = 'test-root';
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  function createLoadInstance(overrides?: Partial<CIHotspotConfig>) {
    const instance = new CIHotspot(root, makeConfig({ trigger: 'load', ...overrides }));
    const img = root.querySelector('.ci-hotspot-image') as HTMLImageElement;
    img.dispatchEvent(new Event('load'));
    return instance;
  }

  it('clicking the marker closes the load popover', () => {
    const instance = createLoadInstance();
    const marker = root.querySelector('.ci-hotspot-marker') as HTMLElement;
    marker.click();
    const visible = root.querySelectorAll('.ci-hotspot-popover--visible');
    expect(visible.length).toBe(0);
    instance.destroy();
  });

  it('clicking outside closes the load popover', () => {
    const instance = createLoadInstance();
    expect(root.querySelectorAll('.ci-hotspot-popover--visible').length).toBe(1);
    document.body.click();
    expect(root.querySelectorAll('.ci-hotspot-popover--visible').length).toBe(0);
    instance.destroy();
  });

  it('clicking the marker again reopens the load popover', () => {
    const instance = createLoadInstance();
    const marker = root.querySelector('.ci-hotspot-marker') as HTMLElement;
    // Close
    marker.click();
    expect(root.querySelectorAll('.ci-hotspot-popover--visible').length).toBe(0);
    // Reopen
    marker.click();
    expect(root.querySelectorAll('.ci-hotspot-popover--visible').length).toBe(1);
    instance.destroy();
  });

  it('keepOpen prevents outside click from closing', () => {
    const instance = createLoadInstance({
      hotspots: [
        { id: 'spot-1', x: '40%', y: '60%', label: 'Spot 1', data: { title: 'Item 1' }, keepOpen: true },
        { id: 'spot-2', x: '75%', y: '25%', label: 'Spot 2', data: { title: 'Item 2' } },
      ],
    });
    expect(root.querySelectorAll('.ci-hotspot-popover--visible').length).toBe(1);
    document.body.click();
    // Should still be visible because keepOpen is true
    expect(root.querySelectorAll('.ci-hotspot-popover--visible').length).toBe(1);
    instance.destroy();
  });

  it('load popover has dialog ARIA attributes', () => {
    const instance = createLoadInstance();
    const popover = root.querySelector('.ci-hotspot-popover') as HTMLElement;
    expect(popover.getAttribute('role')).toBe('dialog');
    const marker = root.querySelector('.ci-hotspot-marker') as HTMLElement;
    expect(marker.getAttribute('aria-haspopup')).toBe('dialog');
    expect(marker.hasAttribute('aria-controls')).toBe(true);
    instance.destroy();
  });

  it('clicking a different hotspot marker closes the first load popover', () => {
    const instance = createLoadInstance();
    const markers = root.querySelectorAll('.ci-hotspot-marker');
    // First popover is open
    expect(root.querySelectorAll('.ci-hotspot-popover--visible').length).toBe(1);
    // Click the second marker
    (markers[1] as HTMLElement).click();
    // The second popover should now be open (and first closed)
    const visible = root.querySelectorAll('.ci-hotspot-popover--visible');
    expect(visible.length).toBe(1);
    // Verify it's the second popover that's visible
    const allPopovers = root.querySelectorAll('.ci-hotspot-popover');
    expect(allPopovers[1]?.classList.contains('ci-hotspot-popover--visible')).toBe(true);
    instance.destroy();
  });
});
