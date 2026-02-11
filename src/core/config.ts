import type { CIHotspotConfig, CloudimageConfig } from './types';

export const DEFAULT_CONFIG: Omit<Required<CIHotspotConfig>, 'src' | 'hotspots' | 'cloudimage' | 'renderPopover' | 'onOpen' | 'onClose' | 'onZoom' | 'onClick'> = {
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
  'data-ci-hotspot-ci-token': { key: 'token', type: 'string', nested: 'cloudimage' },
  'data-ci-hotspot-ci-api-version': { key: 'apiVersion', type: 'string', nested: 'cloudimage' },
  'data-ci-hotspot-ci-domain': { key: 'domain', type: 'string', nested: 'cloudimage' },
  'data-ci-hotspot-ci-limit-factor': { key: 'limitFactor', type: 'number', nested: 'cloudimage' },
  'data-ci-hotspot-ci-params': { key: 'params', type: 'string', nested: 'cloudimage' },
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
  if (!config.src) {
    throw new Error('CIHotspot: "src" is required');
  }
}
