import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import CIHotspot from '../src/index';
import type { CIHotspotConfig, Scene } from '../src/core/types';

let root: HTMLElement;

beforeEach(() => {
  root = document.createElement('div');
  document.body.appendChild(root);
});

afterEach(() => {
  root.remove();
});

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

// #18
describe('Post-destroy API calls', () => {
  it('open() after destroy does not throw', () => {
    const instance = new CIHotspot(root, makeConfig());
    instance.destroy();
    expect(() => instance.open('spot-1')).not.toThrow();
  });

  it('close() after destroy does not throw', () => {
    const instance = new CIHotspot(root, makeConfig());
    instance.destroy();
    expect(() => instance.close('spot-1')).not.toThrow();
  });

  it('closeAll() after destroy does not throw', () => {
    const instance = new CIHotspot(root, makeConfig());
    instance.destroy();
    expect(() => instance.closeAll()).not.toThrow();
  });

  it('addHotspot() after destroy does not throw', () => {
    const instance = new CIHotspot(root, makeConfig());
    instance.destroy();
    expect(() => instance.addHotspot({ id: 'new', x: '10%', y: '10%', label: 'New' })).not.toThrow();
  });

  it('removeHotspot() after destroy does not throw', () => {
    const instance = new CIHotspot(root, makeConfig());
    instance.destroy();
    expect(() => instance.removeHotspot('spot-1')).not.toThrow();
  });

  it('updateHotspot() after destroy does not throw', () => {
    const instance = new CIHotspot(root, makeConfig());
    instance.destroy();
    expect(() => instance.updateHotspot('spot-1', { label: 'New' })).not.toThrow();
  });

  it('setZoom() after destroy does not throw', () => {
    const instance = new CIHotspot(root, makeConfig({ zoom: true }));
    instance.destroy();
    expect(() => instance.setZoom(2)).not.toThrow();
  });

  it('resetZoom() after destroy does not throw', () => {
    const instance = new CIHotspot(root, makeConfig({ zoom: true }));
    instance.destroy();
    expect(() => instance.resetZoom()).not.toThrow();
  });

  it('goToScene() after destroy does not throw', () => {
    const scenes: Scene[] = [
      { id: 's1', src: 'https://example.com/s1.jpg', hotspots: [{ id: 'a', x: '50%', y: '50%', label: 'A' }] },
      { id: 's2', src: 'https://example.com/s2.jpg', hotspots: [{ id: 'b', x: '50%', y: '50%', label: 'B' }] },
    ];
    const instance = new CIHotspot(root, { src: '', hotspots: [], scenes, sceneTransition: 'none' } as CIHotspotConfig);
    instance.destroy();
    expect(() => instance.goToScene('s2')).not.toThrow();
  });
});

// #19
describe('Rapid add/remove hotspot cycles', () => {
  it('rapid add/remove does not throw', () => {
    const instance = new CIHotspot(root, makeConfig({ hotspots: [] }));
    expect(() => {
      for (let i = 0; i < 20; i++) {
        instance.addHotspot({ id: `rapid-${i}`, x: '50%', y: '50%', label: `R${i}` });
        instance.removeHotspot(`rapid-${i}`);
      }
    }).not.toThrow();
    expect(root.querySelectorAll('.ci-hotspot-marker')).toHaveLength(0);
    instance.destroy();
  });

  it('add multiple then remove all leaves clean DOM', () => {
    const instance = new CIHotspot(root, makeConfig({ hotspots: [] }));
    for (let i = 0; i < 10; i++) {
      instance.addHotspot({ id: `h-${i}`, x: `${i * 10}%`, y: '50%', label: `H${i}` });
    }
    expect(root.querySelectorAll('.ci-hotspot-marker')).toHaveLength(10);
    for (let i = 0; i < 10; i++) {
      instance.removeHotspot(`h-${i}`);
    }
    expect(root.querySelectorAll('.ci-hotspot-marker')).toHaveLength(0);
    instance.destroy();
  });

  it('interleaved add/remove maintains correct count', () => {
    const instance = new CIHotspot(root, makeConfig({ hotspots: [] }));
    instance.addHotspot({ id: 'a', x: '10%', y: '10%', label: 'A' });
    instance.addHotspot({ id: 'b', x: '20%', y: '20%', label: 'B' });
    instance.removeHotspot('a');
    instance.addHotspot({ id: 'c', x: '30%', y: '30%', label: 'C' });
    expect(root.querySelectorAll('.ci-hotspot-marker')).toHaveLength(2);
    expect(root.querySelector('[data-hotspot-id="b"]')).toBeTruthy();
    expect(root.querySelector('[data-hotspot-id="c"]')).toBeTruthy();
    expect(root.querySelector('[data-hotspot-id="a"]')).toBeNull();
    instance.destroy();
  });
});

// #20
describe('Scenes + zoom integration', () => {
  const scenes: Scene[] = [
    { id: 'sa', src: 'https://example.com/a.jpg', alt: 'A', hotspots: [{ id: 'a1', x: '50%', y: '50%', label: 'A1' }] },
    { id: 'sb', src: 'https://example.com/b.jpg', alt: 'B', hotspots: [{ id: 'b1', x: '50%', y: '50%', label: 'B1' }] },
  ];

  it('zoom is reset when navigating to a new scene', () => {
    const instance = new CIHotspot(root, { src: '', hotspots: [], scenes, zoom: true, sceneTransition: 'none' } as CIHotspotConfig);
    instance.setZoom(2);
    expect(instance.getZoom()).toBe(2);
    instance.goToScene('sb');
    // After scene change, zoom should be reset to 1
    expect(instance.getZoom()).toBe(1);
    instance.destroy();
  });

  it('zoom works after scene change', () => {
    const instance = new CIHotspot(root, { src: '', hotspots: [], scenes, zoom: true, sceneTransition: 'none' } as CIHotspotConfig);
    instance.goToScene('sb');
    instance.setZoom(3);
    expect(instance.getZoom()).toBe(3);
    instance.destroy();
  });

  it('goToScene to same scene is no-op', () => {
    const onSceneChange = vi.fn();
    const instance = new CIHotspot(root, { src: '', hotspots: [], scenes, sceneTransition: 'none', onSceneChange } as CIHotspotConfig);
    instance.goToScene('sa'); // already on sa (initial scene)
    expect(onSceneChange).not.toHaveBeenCalled();
    instance.destroy();
  });

  it('goToScene to nonexistent scene is no-op', () => {
    const instance = new CIHotspot(root, { src: '', hotspots: [], scenes, sceneTransition: 'none' } as CIHotspotConfig);
    expect(() => instance.goToScene('nonexistent')).not.toThrow();
    expect(instance.getCurrentScene()).toBe('sa');
    instance.destroy();
  });
});

// #21
describe('Duplicate hotspot ID handling', () => {
  it('duplicate IDs in config still renders markers', () => {
    const instance = new CIHotspot(root, makeConfig({
      hotspots: [
        { id: 'dup', x: '30%', y: '40%', label: 'First' },
        { id: 'dup', x: '70%', y: '60%', label: 'Second' },
      ],
    }));
    // The behavior with duplicates is that the last one wins in the Map
    const markers = root.querySelectorAll('[data-hotspot-id="dup"]');
    // Both markers are created in the DOM, but internal map only has the last
    expect(markers.length).toBeGreaterThanOrEqual(1);
    instance.destroy();
  });

  it('addHotspot with existing ID replaces the old marker', () => {
    const instance = new CIHotspot(root, makeConfig());
    instance.addHotspot({ id: 'spot-1', x: '10%', y: '10%', label: 'Replacement' });
    // Old marker with same ID is cleaned up, so total stays at 2
    expect(root.querySelectorAll('.ci-hotspot-marker').length).toBe(2);
    instance.destroy();
  });
});

// #22
describe('Responsive hotspot hide/collapse', () => {
  let resizeCallbacks: (() => void)[];
  let OriginalResizeObserver: typeof ResizeObserver;
  let origRAF: typeof requestAnimationFrame;

  beforeEach(() => {
    resizeCallbacks = [];
    OriginalResizeObserver = globalThis.ResizeObserver;
    origRAF = globalThis.requestAnimationFrame;
    // Mock ResizeObserver to capture callbacks and allow manual trigger
    globalThis.ResizeObserver = class MockResizeObserver {
      constructor(cb: ResizeObserverCallback) {
        resizeCallbacks.push(() => cb([] as unknown as ResizeObserverEntry[], this as unknown as ResizeObserver));
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
    // Mock requestAnimationFrame to execute synchronously
    globalThis.requestAnimationFrame = (cb: FrameRequestCallback) => { cb(0); return 0; };
  });

  afterEach(() => {
    globalThis.ResizeObserver = OriginalResizeObserver;
    globalThis.requestAnimationFrame = origRAF;
  });

  it('hotspot with responsive maxWidth hides when container is wider', () => {
    const containerEl = root;
    Object.defineProperty(containerEl, 'offsetWidth', { value: 800, configurable: true });

    const instance = new CIHotspot(root, makeConfig({
      hotspots: [
        { id: 'resp', x: '50%', y: '50%', label: 'Responsive', responsive: { maxWidth: 500 } },
      ],
    }));

    // The CI container is inside root — find it and mock its offsetWidth too
    const ciContainer = root.querySelector('.ci-hotspot-container') as HTMLElement;
    if (ciContainer) Object.defineProperty(ciContainer, 'offsetWidth', { value: 800, configurable: true });

    // Fire the ResizeObserver callback
    resizeCallbacks.forEach((cb) => cb());

    const marker = root.querySelector('[data-hotspot-id="resp"]') as HTMLElement;
    expect(marker).toBeTruthy();
    // Container is 800px, maxWidth is 500 → should be hidden
    expect(marker.classList.contains('ci-hotspot-marker--hidden')).toBe(true);
    instance.destroy();
  });

  it('hotspot with responsive minWidth hides when container is narrower', () => {
    const containerEl = root;
    Object.defineProperty(containerEl, 'offsetWidth', { value: 50, configurable: true });

    const instance = new CIHotspot(root, makeConfig({
      hotspots: [
        { id: 'resp2', x: '50%', y: '50%', label: 'Responsive 2', responsive: { minWidth: 100 } },
      ],
    }));

    const ciContainer = root.querySelector('.ci-hotspot-container') as HTMLElement;
    if (ciContainer) Object.defineProperty(ciContainer, 'offsetWidth', { value: 50, configurable: true });

    resizeCallbacks.forEach((cb) => cb());

    const marker = root.querySelector('[data-hotspot-id="resp2"]') as HTMLElement;
    expect(marker).toBeTruthy();
    // Container is 50px, minWidth is 100 → should be hidden
    expect(marker.classList.contains('ci-hotspot-marker--hidden')).toBe(true);
    instance.destroy();
  });

  it('hotspot without responsive config is always visible', () => {
    const instance = new CIHotspot(root, makeConfig());

    resizeCallbacks.forEach((cb) => cb());

    const marker = root.querySelector('[data-hotspot-id="spot-1"]');
    expect(marker).toBeTruthy();
    expect(marker?.classList.contains('ci-hotspot-marker--hidden')).toBe(false);
    instance.destroy();
  });
});
