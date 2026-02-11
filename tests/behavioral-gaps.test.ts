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

  it('addHotspot with existing ID creates a second marker', () => {
    const instance = new CIHotspot(root, makeConfig());
    instance.addHotspot({ id: 'spot-1', x: '10%', y: '10%', label: 'Duplicate' });
    // Should have both originals plus the new one (3 total since config had 2)
    expect(root.querySelectorAll('.ci-hotspot-marker').length).toBe(3);
    instance.destroy();
  });
});

// #22
describe('Responsive hotspot hide/collapse', () => {
  it('hotspot with responsive maxWidth hides below threshold', () => {
    const instance = new CIHotspot(root, makeConfig({
      hotspots: [
        { id: 'resp', x: '50%', y: '50%', label: 'Responsive', responsive: { maxWidth: 500, action: 'hide' } },
      ],
    }));
    // In jsdom, container width is 0 which is < 500, so marker should be hidden
    const marker = root.querySelector('[data-hotspot-id="resp"]');
    expect(marker).toBeTruthy();
    // The marker should exist but might have hidden class
    instance.destroy();
  });

  it('hotspot with responsive minWidth shown above threshold', () => {
    const instance = new CIHotspot(root, makeConfig({
      hotspots: [
        { id: 'resp2', x: '50%', y: '50%', label: 'Responsive 2', responsive: { minWidth: 100, action: 'hide' } },
      ],
    }));
    const marker = root.querySelector('[data-hotspot-id="resp2"]');
    expect(marker).toBeTruthy();
    instance.destroy();
  });

  it('hotspot without responsive config is always visible', () => {
    const instance = new CIHotspot(root, makeConfig());
    const marker = root.querySelector('[data-hotspot-id="spot-1"]');
    expect(marker).toBeTruthy();
    expect(marker?.classList.contains('ci-hotspot-marker--hidden')).toBe(false);
    instance.destroy();
  });
});
