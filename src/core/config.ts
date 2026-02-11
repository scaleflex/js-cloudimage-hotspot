import type { CIHotspotConfig, CloudimageConfig } from './types';

export const DEFAULT_CONFIG: Omit<Required<CIHotspotConfig>, 'src' | 'hotspots' | 'cloudimage' | 'renderPopover' | 'onOpen' | 'onClose' | 'onZoom' | 'onClick' | 'scenes' | 'initialScene' | 'onSceneChange' | 'sceneAspectRatio'> = {
  alt: '',
  trigger: 'hover',
  zoom: false,
  zoomMax: 4,
  zoomMin: 1,
  theme: 'light',
  pulse: true,
  zoomControls: true,
  placement: 'top',
  lazyLoad: true,
  sceneTransition: 'fade',
  scrollHint: true,
};

/** Data attribute to config property mapping */
export const DATA_ATTR_MAP: Record<string, { key: string; type: 'string' | 'boolean' | 'number' | 'json'; nested?: string }> = {
  'data-ci-hotspot-src': { key: 'src', type: 'string' },
  'data-ci-hotspot-alt': { key: 'alt', type: 'string' },
  'data-ci-hotspot-items': { key: 'hotspots', type: 'json' },
  'data-ci-hotspot-trigger': { key: 'trigger', type: 'string' },
  'data-ci-hotspot-zoom': { key: 'zoom', type: 'boolean' },
  'data-ci-hotspot-zoom-max': { key: 'zoomMax', type: 'number' },
  'data-ci-hotspot-zoom-min': { key: 'zoomMin', type: 'number' },
  'data-ci-hotspot-theme': { key: 'theme', type: 'string' },
  'data-ci-hotspot-pulse': { key: 'pulse', type: 'boolean' },
  'data-ci-hotspot-placement': { key: 'placement', type: 'string' },
  'data-ci-hotspot-lazy-load': { key: 'lazyLoad', type: 'boolean' },
  'data-ci-hotspot-zoom-controls': { key: 'zoomControls', type: 'boolean' },
  'data-ci-hotspot-scroll-hint': { key: 'scrollHint', type: 'boolean' },
  'data-ci-hotspot-ci-token': { key: 'token', type: 'string', nested: 'cloudimage' },
  'data-ci-hotspot-ci-api-version': { key: 'apiVersion', type: 'string', nested: 'cloudimage' },
  'data-ci-hotspot-ci-domain': { key: 'domain', type: 'string', nested: 'cloudimage' },
  'data-ci-hotspot-ci-limit-factor': { key: 'limitFactor', type: 'number', nested: 'cloudimage' },
  'data-ci-hotspot-ci-params': { key: 'params', type: 'string', nested: 'cloudimage' },
  'data-ci-hotspot-scenes': { key: 'scenes', type: 'json' },
  'data-ci-hotspot-initial-scene': { key: 'initialScene', type: 'string' },
  'data-ci-hotspot-scene-transition': { key: 'sceneTransition', type: 'string' },
  'data-ci-hotspot-scene-aspect-ratio': { key: 'sceneAspectRatio', type: 'string' },
};

/** Parse data attributes from an element into a config object */
export function parseDataAttributes(element: HTMLElement): Partial<CIHotspotConfig> {
  const config: Record<string, unknown> = {};
  const cloudimage: Record<string, unknown> = {};

  for (const [attr, mapping] of Object.entries(DATA_ATTR_MAP)) {
    const value = element.getAttribute(attr);
    if (value === null) continue;

    const parsed = coerceValue(value, mapping.type);

    if (mapping.nested === 'cloudimage') {
      cloudimage[mapping.key] = parsed;
    } else {
      config[mapping.key] = parsed;
    }
  }

  if (Object.keys(cloudimage).length > 0) {
    config.cloudimage = cloudimage as unknown as CloudimageConfig;
  }

  return config as Partial<CIHotspotConfig>;
}

function coerceValue(value: string, type: string): unknown {
  switch (type) {
    case 'boolean':
      return value === 'true';
    case 'number':
      return parseFloat(value);
    case 'json':
      try {
        return JSON.parse(value);
      } catch {
        console.warn(`CIHotspot: failed to parse JSON value "${value}"`);
        return undefined;
      }
    default:
      return value;
  }
}

/** Merge user config with defaults */
export function mergeConfig(userConfig: Partial<CIHotspotConfig>): CIHotspotConfig {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    src: userConfig.src || '',
    hotspots: userConfig.hotspots || [],
  } as CIHotspotConfig;
}

/** Validate config — throws on critical issues */
export function validateConfig(config: CIHotspotConfig): void {
  if (config.scenes && config.scenes.length > 0) {
    const sceneIds = new Set<string>();
    for (const scene of config.scenes) {
      if (!scene.id) throw new Error('CIHotspot: each scene must have an "id"');
      if (sceneIds.has(scene.id)) {
        throw new Error(`CIHotspot: duplicate scene ID "${scene.id}"`);
      }
      sceneIds.add(scene.id);
      if (!scene.src) throw new Error(`CIHotspot: scene "${scene.id}" must have a "src"`);
    }
    for (const scene of config.scenes) {
      for (const hotspot of scene.hotspots || []) {
        if (hotspot.navigateTo && !sceneIds.has(hotspot.navigateTo)) {
          throw new Error(`CIHotspot: hotspot "${hotspot.id}" navigateTo "${hotspot.navigateTo}" is not a valid scene ID`);
        }
      }
    }
    if (config.initialScene) {
      if (!sceneIds.has(config.initialScene)) {
        throw new Error(`CIHotspot: initialScene "${config.initialScene}" not found in scenes`);
      }
    }
  } else if (!config.src) {
    throw new Error('CIHotspot: "src" is required');
  }
}
