import type { CloudimageConfig } from '../core/types';

const DEFAULT_DOMAIN = 'cloudimg.io';
const DEFAULT_API_VERSION = 'v7';
const DEFAULT_LIMIT_FACTOR = 100;

/** Round a width up to the nearest limitFactor */
export function roundToLimitFactor(width: number, limitFactor: number = DEFAULT_LIMIT_FACTOR): number {
  return Math.ceil(width / limitFactor) * limitFactor;
}

/** Get the optimal image width for the container */
export function getOptimalWidth(
  containerWidth: number,
  dpr: number = 1,
  zoomLevel: number = 1,
  limitFactor: number = DEFAULT_LIMIT_FACTOR,
): number {
  const raw = containerWidth * dpr * zoomLevel;
  return roundToLimitFactor(raw, limitFactor);
}

/** Build a Cloudimage CDN URL */
export function buildCloudimageUrl(
  src: string,
  config: CloudimageConfig,
  containerWidth: number,
  zoomLevel: number = 1,
  dpr: number = 1,
): string {
  const domain = config.domain || DEFAULT_DOMAIN;
  const apiVersion = config.apiVersion || DEFAULT_API_VERSION;
  const limitFactor = config.limitFactor || DEFAULT_LIMIT_FACTOR;

  const width = getOptimalWidth(containerWidth, dpr, zoomLevel, limitFactor);

  let url = `https://${config.token}.${domain}/${apiVersion}/${src}?width=${width}`;
  if (config.params) {
    url += `&${config.params}`;
  }
  return url;
}

/**
 * Create a ResizeObserver-based handler that updates img src when
 * the container width crosses a limitFactor boundary.
 */
export function createResizeHandler(
  img: HTMLImageElement,
  src: string,
  config: CloudimageConfig,
  getZoomLevel: () => number,
): { observer: ResizeObserver; destroy: () => void } {
  const limitFactor = config.limitFactor || DEFAULT_LIMIT_FACTOR;
  let lastRequestedWidth = 0;

  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const containerWidth = entry.contentRect.width;
      if (containerWidth === 0) continue;

      const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      const newWidth = getOptimalWidth(containerWidth, dpr, getZoomLevel(), limitFactor);

      if (newWidth !== lastRequestedWidth) {
        lastRequestedWidth = newWidth;
        img.src = buildCloudimageUrl(src, config, containerWidth, getZoomLevel(), dpr);
      }
    }
  });

  return {
    observer,
    destroy: () => observer.disconnect(),
  };
}
