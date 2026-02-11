import { describe, it, expect } from 'vitest';
import { parseCoordinate, normalizeToPercent } from '../src/utils/coordinates';

describe('parseCoordinate', () => {
  it('parses percentage strings', () => {
    expect(parseCoordinate('65%')).toEqual({ value: 65, isPercent: true });
    expect(parseCoordinate('0%')).toEqual({ value: 0, isPercent: true });
    expect(parseCoordinate('100%')).toEqual({ value: 100, isPercent: true });
    expect(parseCoordinate(' 50% ')).toEqual({ value: 50, isPercent: true });
  });

  it('parses numbers as pixel values', () => {
    expect(parseCoordinate(650)).toEqual({ value: 650, isPercent: false });
    expect(parseCoordinate(0)).toEqual({ value: 0, isPercent: false });
  });

  it('parses numeric strings as pixel values', () => {
    expect(parseCoordinate('650')).toEqual({ value: 650, isPercent: false });
  });

  it('handles decimal percentages', () => {
    expect(parseCoordinate('33.33%')).toEqual({ value: 33.33, isPercent: true });
  });
});

describe('normalizeToPercent', () => {
  it('passes through percentage values', () => {
    const result = normalizeToPercent('65%', '40%', 1000, 800);
    expect(result).toEqual({ x: 65, y: 40 });
  });

  it('converts pixel values to percentages', () => {
    const result = normalizeToPercent(650, 400, 1000, 800);
    expect(result).toEqual({ x: 65, y: 50 });
  });

  it('handles zero values', () => {
    const result = normalizeToPercent(0, 0, 1000, 800);
    expect(result).toEqual({ x: 0, y: 0 });
  });

  it('handles mixed coordinate types', () => {
    const result = normalizeToPercent('50%', 400, 1000, 800);
    expect(result).toEqual({ x: 50, y: 50 });
  });
});

