import type { HotspotItem, PopoverData } from '../core/types';
import { sanitizeHTML } from './sanitize';

/** Render the built-in product template from data fields */
export function renderBuiltInTemplate(data: PopoverData): string {
  const parts: string[] = [];

  if (data.image) {
    parts.push(`<div class="ci-hotspot-popover-image-wrapper"><img class="ci-hotspot-popover-image" src="${escapeAttr(data.image)}" alt="${escapeAttr(data.title || '')}"></div>`);
  }

  const bodyParts: string[] = [];

  if (data.title) {
    bodyParts.push(`<h3 class="ci-hotspot-popover-title">${escapeHtml(data.title)}</h3>`);
  }

  if (data.originalPrice || data.price) {
    let priceHtml = '';
    if (data.originalPrice) {
      priceHtml += `<span class="ci-hotspot-popover-original-price">${escapeHtml(data.originalPrice)}</span>`;
    }
    if (data.price) {
      priceHtml += `<span class="ci-hotspot-popover-price">${escapeHtml(data.price)}</span>`;
    }
    bodyParts.push(`<div class="ci-hotspot-popover-price-row">${priceHtml}</div>`);
  }

  if (data.description) {
    bodyParts.push(`<p class="ci-hotspot-popover-description">${escapeHtml(data.description)}</p>`);
  }

  if (data.url && isSafeUrl(data.url)) {
    const ctaText = data.ctaText || 'View details';
    const productAttr = data.id ? ` data-product-id="${escapeAttr(data.id)}"` : '';
    bodyParts.push(
      `<a class="ci-hotspot-popover-cta" href="${escapeAttr(data.url)}" target="_top"${productAttr}>${escapeHtml(String(ctaText))}</a>`,
    );
  } else if (data.id) {
    const ctaText = data.ctaText || 'View details';
    bodyParts.push(
      `<button class="ci-hotspot-popover-cta" data-product-id="${escapeAttr(data.id)}">${escapeHtml(String(ctaText))}</button>`,
    );
  }

  if (bodyParts.length > 0) {
    parts.push(`<div class="ci-hotspot-popover-body">${bodyParts.join('')}</div>`);
  }

  return parts.join('');
}

/**
 * Render popover content with priority: renderFn > content string > data template.
 * Returns HTML string or DOM element.
 */
export function renderPopoverContent(
  hotspot: HotspotItem,
  renderFn?: (hotspot: HotspotItem) => string | HTMLElement,
): string | HTMLElement {
  // Priority 1: Custom render function (bypasses sanitization)
  if (renderFn) {
    return renderFn(hotspot);
  }

  // Priority 2: HTML content string (sanitized)
  if (hotspot.content) {
    return sanitizeHTML(hotspot.content);
  }

  // Priority 3: Built-in template from data
  if (hotspot.data) {
    return renderBuiltInTemplate(hotspot.data);
  }

  return '';
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Check that a URL uses a safe protocol (allowlist approach) */
function isSafeUrl(url: string): boolean {
  const normalized = url.replace(/[\s\x00-\x1f]/g, '');
  return /^https?:\/\//i.test(normalized) || /^\/(?!\/)/.test(normalized) || /^#/.test(normalized);
}

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
