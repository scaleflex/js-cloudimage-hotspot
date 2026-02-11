import type { Placement, PositionResult } from '../core/types';

interface AvailableSpace {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/** Compute the best position for a popover relative to a marker within a container */
export function computePosition(
  markerEl: HTMLElement,
  popoverEl: HTMLElement,
  containerEl: HTMLElement,
  options: { placement: Placement },
): PositionResult {
  const markerRect = markerEl.getBoundingClientRect();
  const containerRect = containerEl.getBoundingClientRect();
  const popoverWidth = popoverEl.offsetWidth;
  const popoverHeight = popoverEl.offsetHeight;

  // Marker position relative to container
  const markerCenterX = markerRect.left + markerRect.width / 2 - containerRect.left;
  const markerCenterY = markerRect.top + markerRect.height / 2 - containerRect.top;
  const markerTop = markerRect.top - containerRect.top;
  const markerBottom = markerRect.bottom - containerRect.top;
  const markerLeft = markerRect.left - containerRect.left;
  const markerRight = markerRect.right - containerRect.left;

  const containerWidth = containerEl.offsetWidth;
  const containerHeight = containerEl.offsetHeight;
  const gap = 8; // gap between marker and popover

  const space: AvailableSpace = {
    top: markerTop - gap,
    bottom: containerHeight - markerBottom - gap,
    left: markerLeft - gap,
    right: containerWidth - markerRight - gap,
  };

  let placement = options.placement;
  if (placement === 'auto') {
    placement = getAutoPlacement(space);
  }

  // Flip if not enough space
  placement = flip(placement, popoverWidth, popoverHeight, space);

  // Calculate position
  let x: number;
  let y: number;
  let arrowOffset = 0;

  switch (placement) {
    case 'top':
      x = markerCenterX - popoverWidth / 2;
      y = markerTop - gap - popoverHeight;
      break;
    case 'bottom':
      x = markerCenterX - popoverWidth / 2;
      y = markerBottom + gap;
      break;
    case 'left':
      x = markerLeft - gap - popoverWidth;
      y = markerCenterY - popoverHeight / 2;
      break;
    case 'right':
      x = markerRight + gap;
      y = markerCenterY - popoverHeight / 2;
      break;
    default:
      x = markerCenterX - popoverWidth / 2;
      y = markerTop - gap - popoverHeight;
  }

  // Shift to stay within container
  const shifted = shift(x, y, popoverWidth, popoverHeight, containerWidth, containerHeight);
  arrowOffset = (placement === 'top' || placement === 'bottom')
    ? x - shifted.x
    : y - shifted.y;

  return {
    x: shifted.x,
    y: shifted.y,
    placement,
    arrowOffset,
  };
}

function getAutoPlacement(space: AvailableSpace): Exclude<Placement, 'auto'> {
  const max = Math.max(space.top, space.bottom, space.left, space.right);
  if (max === space.top) return 'top';
  if (max === space.bottom) return 'bottom';
  if (max === space.right) return 'right';
  return 'left';
}

function flip(
  placement: Placement,
  popoverWidth: number,
  popoverHeight: number,
  space: AvailableSpace,
): Exclude<Placement, 'auto'> {
  const p = placement as Exclude<Placement, 'auto'>;
  switch (p) {
    case 'top':
      if (space.top < popoverHeight && space.bottom > space.top) return 'bottom';
      break;
    case 'bottom':
      if (space.bottom < popoverHeight && space.top > space.bottom) return 'top';
      break;
    case 'left':
      if (space.left < popoverWidth && space.right > space.left) return 'right';
      break;
    case 'right':
      if (space.right < popoverWidth && space.left > space.right) return 'left';
      break;
  }
  return p;
}

function shift(
  x: number,
  y: number,
  width: number,
  height: number,
  containerWidth: number,
  containerHeight: number,
): { x: number; y: number } {
  const padding = 4;
  let sx = x;
  let sy = y;

  // Horizontal: center if popover wider than container, otherwise clamp
  if (width > containerWidth - 2 * padding) {
    sx = (containerWidth - width) / 2;
  } else {
    if (sx < padding) sx = padding;
    if (sx + width > containerWidth - padding) sx = containerWidth - padding - width;
  }

  // Vertical: center if popover taller than container, otherwise clamp
  if (height > containerHeight - 2 * padding) {
    sy = (containerHeight - height) / 2;
  } else {
    if (sy < padding) sy = padding;
    if (sy + height > containerHeight - padding) sy = containerHeight - padding - height;
  }

  return { x: sx, y: sy };
}
