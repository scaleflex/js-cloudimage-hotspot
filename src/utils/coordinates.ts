import type { Point } from '../core/types';

/**
 * Parse a coordinate value.
 * - String ending in '%': return the numeric percent value
 * - Number: return as-is (pixel value)
 */
export function parseCoordinate(value: string | number): { value: number; isPercent: boolean } {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.endsWith('%')) {
      return { value: parseFloat(trimmed), isPercent: true };
    }
    return { value: parseFloat(trimmed), isPercent: false };
  }
  return { value, isPercent: false };
}

/**
 * Normalize x/y coordinates to percentages.
 * If already percentages, returns as-is.
 * If pixel values, converts using natural image dimensions.
 */
export function normalizeToPercent(
  x: string | number,
  y: string | number,
  naturalWidth: number,
  naturalHeight: number,
): Point {
  const px = parseCoordinate(x);
  const py = parseCoordinate(y);

  return {
    x: px.isPercent ? px.value : (px.value / naturalWidth) * 100,
    y: py.isPercent ? py.value : (py.value / naturalHeight) * 100,
  };
}

