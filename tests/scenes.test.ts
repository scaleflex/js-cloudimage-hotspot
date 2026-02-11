import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import CIHotspot from '../src/index';
import type { CIHotspotConfig, Scene } from '../src/core/types';
import { validateConfig } from '../src/core/config';

const SCENES: Scene[] = [
  {
    id: 'scene-a',
    src: 'https://example.com/a.jpg',
    alt: 'Scene A',
    hotspots: [
      { id: 'a1', x: '30%', y: '40%', label: 'Item A1', data: { title: 'A1' } },
      { id: 'a-to-b', x: '80%', y: '50%', label: 'Go to B', navigateTo: 'scene-b' },
    ],
  },
  {
    id: 'scene-b',
    src: 'https://example.com/b.jpg',
    alt: 'Scene B',
    hotspots: [
      { id: 'b1', x: '50%', y: '50%', label: 'Item B1', data: { title: 'B1' } },
      { id: 'b-to-a', x: '10%', y: '50%', label: 'Back to A', navigateTo: 'scene-a' },
    ],
  },
  {
    id: 'scene-c',
    src: 'https://example.com/c.jpg',
    alt: 'Scene C',
    hotspots: [
      { id: 'c1', x: '50%', y: '50%', label: 'Item C1', data: { title: 'C1' } },
    ],
  },
];

function makeScenesConfig(overrides?: Partial<CIHotspotConfig>): CIHotspotConfig {
  return {
    src: '',
    hotspots: [],
    scenes: SCENES,
    sceneTransition: 'none',
    ...overrides,
  } as CIHotspotConfig;
}

function makeConfig(overrides?: Partial<CIHotspotConfig>): CIHotspotConfig {
  return {
    src: 'https://example.com/image.jpg',
    hotspots: [
      { id: 'spot-1', x: '40%', y: '60%', label: 'Spot 1', data: { title: 'Item 1' } },
    ],
    ...overrides,
  };
}

describe('Scenes API', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    root.id = 'test-root';
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  it('creates correct DOM for initial scene', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    const img = root.querySelector('.ci-hotspot-image') as HTMLImageElement;
    expect(img.src).toContain('a.jpg');
    expect(img.alt).toBe('Scene A');
    instance.destroy();
  });

  it('creates markers for initial scene hotspots', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    const markers = root.querySelectorAll('.ci-hotspot-marker');
    expect(markers).toHaveLength(2);
    instance.destroy();
  });

  it('getCurrentScene returns initial scene ID', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    expect(instance.getCurrentScene()).toBe('scene-a');
    instance.destroy();
  });

  it('getScenes returns all scene IDs', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    expect(instance.getScenes()).toEqual(['scene-a', 'scene-b', 'scene-c']);
    instance.destroy();
  });

  it('goToScene switches image src', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    instance.goToScene('scene-b');
    const img = root.querySelector('.ci-hotspot-image') as HTMLImageElement;
    expect(img.src).toContain('b.jpg');
    instance.destroy();
  });

  it('goToScene replaces markers', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    instance.goToScene('scene-b');
    const markers = root.querySelectorAll('.ci-hotspot-marker');
    expect(markers).toHaveLength(2);
    // Check for scene-b marker IDs
    const ids = Array.from(markers).map((m) => m.getAttribute('data-hotspot-id'));
    expect(ids).toContain('b1');
    expect(ids).toContain('b-to-a');
    instance.destroy();
  });

  it('goToScene updates getCurrentScene', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    instance.goToScene('scene-b');
    expect(instance.getCurrentScene()).toBe('scene-b');
    instance.destroy();
  });

  it('goToScene with invalid ID does nothing', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    instance.goToScene('nonexistent');
    expect(instance.getCurrentScene()).toBe('scene-a');
    const img = root.querySelector('.ci-hotspot-image') as HTMLImageElement;
    expect(img.src).toContain('a.jpg');
    instance.destroy();
  });

  it('goToScene to current scene is no-op', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    const img = root.querySelector('.ci-hotspot-image') as HTMLImageElement;
    const originalSrc = img.src;
    instance.goToScene('scene-a');
    expect(img.src).toBe(originalSrc);
    instance.destroy();
  });

  it('navigateTo marker has ci-hotspot-marker--navigate class', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    const navMarkers = root.querySelectorAll('.ci-hotspot-marker--navigate');
    expect(navMarkers).toHaveLength(1);
    instance.destroy();
  });

  it('navigateTo marker creates a hover popover', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    const popovers = root.querySelectorAll('.ci-hotspot-popover');
    // scene-a has 1 regular hotspot (a1) + 1 navigateTo (a-to-b), both get popovers
    expect(popovers).toHaveLength(2);
    instance.destroy();
  });

  it('navigateTo popover shows destination scene info', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    const navPopover = root.querySelector('#ci-hotspot-popover-a-to-b');
    // Should auto-generate title from the hotspot label
    expect(navPopover?.textContent).toContain('Go to B');
    instance.destroy();
  });

  it('respects initialScene config', () => {
    const instance = new CIHotspot(root, makeScenesConfig({ initialScene: 'scene-b' }));
    expect(instance.getCurrentScene()).toBe('scene-b');
    const img = root.querySelector('.ci-hotspot-image') as HTMLImageElement;
    expect(img.src).toContain('b.jpg');
    instance.destroy();
  });

  it('defaults to first scene when initialScene not specified', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    expect(instance.getCurrentScene()).toBe('scene-a');
    instance.destroy();
  });

  it('fires onSceneChange callback', () => {
    const onSceneChange = vi.fn();
    const instance = new CIHotspot(root, makeScenesConfig({ onSceneChange }));
    instance.goToScene('scene-b');
    expect(onSceneChange).toHaveBeenCalledWith('scene-b', SCENES[1]);
    instance.destroy();
  });

  it('backward compat: single-image mode works without scenes', () => {
    const instance = new CIHotspot(root, makeConfig());
    expect(instance.getCurrentScene()).toBeUndefined();
    expect(instance.getScenes()).toEqual([]);
    const img = root.querySelector('.ci-hotspot-image') as HTMLImageElement;
    expect(img.src).toContain('image.jpg');
    instance.destroy();
  });

  it('goToScene is no-op in single-image mode', () => {
    const instance = new CIHotspot(root, makeConfig());
    instance.goToScene('anything');
    expect(instance.getCurrentScene()).toBeUndefined();
    instance.destroy();
  });

  it('updates aria-label on scene change', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    instance.goToScene('scene-b');
    const container = root.querySelector('.ci-hotspot-container');
    expect(container?.getAttribute('aria-label')).toBe('Scene B');
    instance.destroy();
  });

  it('destroy cleans up scene state', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    instance.destroy();
    expect(instance.getCurrentScene()).toBeUndefined();
    expect(instance.getScenes()).toEqual([]);
  });

  it('applies fixed aspect ratio when sceneAspectRatio is set', () => {
    const instance = new CIHotspot(root, makeScenesConfig({ sceneAspectRatio: '16/9' }));
    const container = root.querySelector('.ci-hotspot-container');
    const viewport = root.querySelector('.ci-hotspot-viewport') as HTMLElement;
    expect(container?.classList.contains('ci-hotspot-container--fixed-ratio')).toBe(true);
    expect(viewport?.style.aspectRatio).toBe('16/9');
    instance.destroy();
  });

  it('does not apply fixed ratio class without sceneAspectRatio', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    const container = root.querySelector('.ci-hotspot-container');
    expect(container?.classList.contains('ci-hotspot-container--fixed-ratio')).toBe(false);
    instance.destroy();
  });

  it('navigateTo with custom data uses that data for popover', () => {
    const customScenes: Scene[] = [
      {
        id: 's1',
        src: 'https://example.com/s1.jpg',
        hotspots: [
          { id: 'nav', x: '50%', y: '50%', label: 'Nav', navigateTo: 's2', data: { title: 'Custom Title' } },
        ],
      },
      {
        id: 's2',
        src: 'https://example.com/s2.jpg',
        hotspots: [],
      },
    ];
    const instance = new CIHotspot(root, { src: '', hotspots: [], scenes: customScenes, sceneTransition: 'none' } as CIHotspotConfig);
    const popover = root.querySelector('#ci-hotspot-popover-nav');
    expect(popover?.textContent).toContain('Custom Title');
    instance.destroy();
  });

  it('navigateTo in single-image mode does not create empty popover', () => {
    const instance = new CIHotspot(root, makeConfig({
      hotspots: [
        { id: 'nav', x: '50%', y: '50%', label: 'Go somewhere', navigateTo: 'nonexistent' },
      ],
    }));
    // No popover should be created since there's no scene data to show
    const popovers = root.querySelectorAll('.ci-hotspot-popover');
    expect(popovers).toHaveLength(0);
    // But navigate marker class should still be applied
    const navMarkers = root.querySelectorAll('.ci-hotspot-marker--navigate');
    expect(navMarkers).toHaveLength(1);
    instance.destroy();
  });

  it('fade transition applies transitioning state and updates currentScene', () => {
    vi.useFakeTimers();
    const instance = new CIHotspot(root, makeScenesConfig({ sceneTransition: 'fade' }));
    instance.goToScene('scene-b');
    // Transitioning class should be applied immediately
    const container = root.querySelector('.ci-hotspot-container');
    expect(container?.classList.contains('ci-hotspot-scene-transitioning')).toBe(true);
    // currentScene reflects target immediately (fix #10)
    expect(instance.getCurrentScene()).toBe('scene-b');
    // Cleanup
    vi.advanceTimersByTime(500);
    instance.destroy();
    vi.useRealTimers();
  });

  it('destroy during transition does not throw', () => {
    vi.useFakeTimers();
    const instance = new CIHotspot(root, makeScenesConfig({ sceneTransition: 'fade' }));
    instance.goToScene('scene-b');
    // Destroy while transition is in progress
    expect(() => instance.destroy()).not.toThrow();
    // Advance timers — the setTimeout callback should be guarded
    expect(() => vi.advanceTimersByTime(500)).not.toThrow();
    vi.useRealTimers();
  });

  it('goToScene during active transition is ignored', () => {
    vi.useFakeTimers();
    const instance = new CIHotspot(root, makeScenesConfig({ sceneTransition: 'fade' }));
    instance.goToScene('scene-b');
    // While transitioning to scene-b, try to navigate to scene-c
    instance.goToScene('scene-c');
    // Should still be scene-b (the second call was ignored, not overridden to scene-c)
    expect(instance.getCurrentScene()).toBe('scene-b');
    // The container should still have the transitioning class from the first call
    const container = root.querySelector('.ci-hotspot-container');
    expect(container?.classList.contains('ci-hotspot-scene-transitioning')).toBe(true);
    vi.advanceTimersByTime(500);
    instance.destroy();
    vi.useRealTimers();
  });

  it('getCurrentScene returns new scene during transition', () => {
    vi.useFakeTimers();
    const instance = new CIHotspot(root, makeScenesConfig({ sceneTransition: 'fade' }));
    instance.goToScene('scene-b');
    // currentSceneId is set before transition starts
    expect(instance.getCurrentScene()).toBe('scene-b');
    vi.advanceTimersByTime(500);
    instance.destroy();
    vi.useRealTimers();
  });

  it('update() with new scenes rebuilds correctly', () => {
    const instance = new CIHotspot(root, makeScenesConfig());
    const newScenes: Scene[] = [
      {
        id: 'new-1',
        src: 'https://example.com/new1.jpg',
        alt: 'New Scene 1',
        hotspots: [{ id: 'n1', x: '50%', y: '50%', label: 'N1' }],
      },
    ];
    instance.update({ scenes: newScenes, sceneTransition: 'none' });
    expect(instance.getCurrentScene()).toBe('new-1');
    expect(instance.getScenes()).toEqual(['new-1']);
    instance.destroy();
  });
});

describe('Scenes validation', () => {
  it('scenes without src per scene throws', () => {
    expect(() =>
      validateConfig({
        src: '',
        hotspots: [],
        scenes: [{ id: 'test', src: '', hotspots: [] }],
      } as CIHotspotConfig),
    ).toThrow('must have a "src"');
  });

  it('scenes without id throws', () => {
    expect(() =>
      validateConfig({
        src: '',
        hotspots: [],
        scenes: [{ id: '', src: 'https://example.com/a.jpg', hotspots: [] }],
      } as CIHotspotConfig),
    ).toThrow('must have an "id"');
  });

  it('invalid initialScene throws', () => {
    expect(() =>
      validateConfig({
        src: '',
        hotspots: [],
        scenes: [{ id: 'a', src: 'https://example.com/a.jpg', hotspots: [] }],
        initialScene: 'nonexistent',
      } as CIHotspotConfig),
    ).toThrow('not found in scenes');
  });

  it('scenes mode does not require top-level src', () => {
    expect(() =>
      validateConfig({
        src: '',
        hotspots: [],
        scenes: [{ id: 'a', src: 'https://example.com/a.jpg', hotspots: [] }],
      } as CIHotspotConfig),
    ).not.toThrow();
  });

  it('duplicate scene IDs throws', () => {
    expect(() =>
      validateConfig({
        src: '',
        hotspots: [],
        scenes: [
          { id: 'dup', src: 'https://example.com/a.jpg', hotspots: [] },
          { id: 'dup', src: 'https://example.com/b.jpg', hotspots: [] },
        ],
      } as CIHotspotConfig),
    ).toThrow('duplicate scene ID "dup"');
  });

  it('navigateTo pointing to invalid scene ID throws', () => {
    expect(() =>
      validateConfig({
        src: '',
        hotspots: [],
        scenes: [
          {
            id: 'a',
            src: 'https://example.com/a.jpg',
            hotspots: [{ id: 'h1', x: '50%', y: '50%', label: 'Go', navigateTo: 'nonexistent' }],
          },
        ],
      } as CIHotspotConfig),
    ).toThrow('navigateTo "nonexistent" is not a valid scene ID');
  });

  it('no scenes and no src throws', () => {
    expect(() =>
      validateConfig({ src: '', hotspots: [] } as CIHotspotConfig),
    ).toThrow('"src" is required');
  });
});

describe('Scenes data attributes', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.appendChild(root);
  });

  afterEach(() => {
    root.remove();
  });

  it('autoInit picks up data-ci-hotspot-scenes', () => {
    const el = document.createElement('div');
    el.setAttribute(
      'data-ci-hotspot-scenes',
      JSON.stringify([
        { id: 's1', src: 'https://example.com/s1.jpg', hotspots: [] },
      ]),
    );
    el.setAttribute('data-ci-hotspot-scene-transition', 'none');
    root.appendChild(el);

    const instances = CIHotspot.autoInit(root);
    expect(instances).toHaveLength(1);
    expect(instances[0].getCurrentScene()).toBe('s1');
    instances[0].destroy();
  });
});
