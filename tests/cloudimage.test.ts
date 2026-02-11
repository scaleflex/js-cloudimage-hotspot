import { describe, it, expect } from 'vitest';
import {
  roundToLimitFactor,
  getOptimalWidth,
  buildCloudimageUrl,
} from '../src/utils/cloudimage';

describe('roundToLimitFactor', () => {
  it('rounds up to nearest 100 by default', () => {
    expect(roundToLimitFactor(373)).toBe(400);
    expect(roundToLimitFactor(400)).toBe(400);
    expect(roundToLimitFactor(401)).toBe(500);
    expect(roundToLimitFactor(1)).toBe(100);
  });

  it('rounds to custom limit factor', () => {
    expect(roundToLimitFactor(373, 50)).toBe(400);
    expect(roundToLimitFactor(351, 50)).toBe(400);
    expect(roundToLimitFactor(350, 50)).toBe(350);
  });
});

describe('getOptimalWidth', () => {
  it('returns rounded width for simple case', () => {
    expect(getOptimalWidth(373, 1, 1, 100)).toBe(400);
  });

  it('accounts for device pixel ratio', () => {
    expect(getOptimalWidth(373, 2, 1, 100)).toBe(800);
  });

  it('accounts for zoom level', () => {
    expect(getOptimalWidth(400, 1, 2, 100)).toBe(800);
  });

  it('accounts for both DPR and zoom', () => {
    expect(getOptimalWidth(373, 2, 2, 100)).toBe(1500);
  });
});

describe('buildCloudimageUrl', () => {
  it('builds URL with default domain and version', () => {
    const url = buildCloudimageUrl(
      'https://example.com/room.jpg',
      { token: 'demo' },
      373,
      1,
      1,
    );
    expect(url).toBe(
      'https://demo.cloudimg.io/v7/https://example.com/room.jpg?width=400',
    );
  });

  it('accounts for DPR', () => {
    const url = buildCloudimageUrl(
      'https://example.com/room.jpg',
      { token: 'demo' },
      373,
      1,
      2,
    );
    expect(url).toBe(
      'https://demo.cloudimg.io/v7/https://example.com/room.jpg?width=800',
    );
  });

  it('includes custom params', () => {
    const url = buildCloudimageUrl(
      'https://example.com/room.jpg',
      { token: 'demo', params: 'q=80&org_if_sml=1' },
      400,
      1,
      1,
    );
    expect(url).toContain('&q=80&org_if_sml=1');
  });

  it('uses custom domain and version', () => {
    const url = buildCloudimageUrl(
      'image.jpg',
      { token: 'mytoken', domain: 'custom.cdn.io', apiVersion: 'v6' },
      500,
      1,
      1,
    );
    expect(url).toMatch(/^https:\/\/mytoken\.custom\.cdn\.io\/v6\//);
  });

  it('accounts for zoom level', () => {
    const url = buildCloudimageUrl(
      'image.jpg',
      { token: 'demo' },
      400,
      2,
      1,
    );
    expect(url).toContain('width=800');
  });
});
