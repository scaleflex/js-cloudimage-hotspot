import CIHotspot from '../src/index';
import type { CIHotspotConfig, MarkerStyle } from '../src';

const DEMO_IMAGE = 'https://scaleflex.cloudimg.io/v7/plugins/js-cloudimage-hotspot/alexandra-gorn-unsplash.jpg';

let instance: CIHotspot | null = null;

const defaultHotspots = [
  {
    id: 'cfg-1',
    x: '50%',
    y: '82%',
    label: 'Emerald Dresser',
    data: { title: 'Emerald Dresser', originalPrice: '$699', price: '$549', description: 'Hand-painted vintage four-drawer chest in deep emerald green with original round knobs.' },
  },
  {
    id: 'cfg-2',
    x: '40%',
    y: '24%',
    label: 'Botanical Gallery',
    markerStyle: 'dot-label' as const,
    data: { title: 'Botanical Gallery', price: '$129', description: 'Pair of framed watercolor leaf prints on a white-painted exposed-brick wall.' },
  },
];

export function initConfigurator(): void {
  const viewerEl = document.getElementById('configurator-viewer');
  if (!viewerEl) return;

  const cfgZoom = document.getElementById('cfg-zoom') as HTMLInputElement;
  const cfgPulse = document.getElementById('cfg-pulse') as HTMLInputElement;
  const cfgFullscreen = document.getElementById('cfg-fullscreen') as HTMLInputElement;
  const cfgInvertMarker = document.getElementById('cfg-invert-marker') as HTMLInputElement;
  const cfgTrigger = document.getElementById('cfg-trigger') as HTMLSelectElement;
  const cfgTheme = document.getElementById('cfg-theme') as HTMLSelectElement;
  const cfgPlacement = document.getElementById('cfg-placement') as HTMLSelectElement;
  const cfgMarkerStyle = document.getElementById('cfg-marker-style') as HTMLSelectElement;
  const cfgTextAlign = document.getElementById('cfg-text-align') as HTMLSelectElement;
  const cfgZoomControlsPosition = document.getElementById('cfg-zoom-controls-position') as HTMLSelectElement;
  const cfgZoomControlsPositionLabel = cfgZoomControlsPosition.closest('label') as HTMLElement;
  const cfgCode = document.querySelector('#cfg-code code') as HTMLElement;
  const cfgCopy = document.getElementById('cfg-copy') as HTMLButtonElement;

  function syncZoomVisibility(): void {
    cfgZoomControlsPositionLabel.style.display = cfgZoom.checked ? '' : 'none';
  }

  function getConfig(): CIHotspotConfig {
    const style = cfgMarkerStyle.value as MarkerStyle;
    const hotspots = defaultHotspots.map((h) => ({
      ...h,
      markerStyle: style !== 'dot' ? style : undefined,
    }));
    return {
      src: DEMO_IMAGE,
      alt: 'Luxury high-rise bedroom with channel-tufted bed and city skyline view',
      zoom: cfgZoom.checked,
      pulse: cfgPulse.checked,
      fullscreenButton: cfgFullscreen.checked,
      invertMarkerTheme: cfgInvertMarker.checked,
      trigger: cfgTrigger.value as CIHotspotConfig['trigger'],
      theme: cfgTheme.value as CIHotspotConfig['theme'],
      placement: cfgPlacement.value as CIHotspotConfig['placement'],
      zoomControlsPosition: cfgZoomControlsPosition.value as CIHotspotConfig['zoomControlsPosition'],
      hotspots,
    };
  }

  function generateCode(config: CIHotspotConfig): string {
    const opts: string[] = [];
    opts.push(`  src: '${config.src}',`);
    if (config.trigger !== 'hover') opts.push(`  trigger: '${config.trigger}',`);
    if (config.zoom) opts.push(`  zoom: true,`);
    if (!config.pulse) opts.push(`  pulse: false,`);
    if (!config.fullscreenButton) opts.push(`  fullscreenButton: false,`);
    if (config.invertMarkerTheme) opts.push(`  invertMarkerTheme: true,`);
    if (config.theme !== 'light') opts.push(`  theme: '${config.theme}',`);
    if (config.placement !== 'top') opts.push(`  placement: '${config.placement}',`);
    if (config.zoom && config.zoomControlsPosition !== 'bottom-right') opts.push(`  zoomControlsPosition: '${config.zoomControlsPosition}',`);
    opts.push(`  hotspots: ${JSON.stringify(config.hotspots, null, 4).split('\n').map((l, i) => i === 0 ? l : '  ' + l).join('\n')},`);

    let code = `const viewer = new CIHotspot('#my-image', {\n${opts.join('\n')}\n});`;
    const textAlign = cfgTextAlign.value;
    if (textAlign !== 'left') {
      code += `\n\n/* Popover text alignment (CSS variable) */\n// .ci-hotspot-container { --ci-hotspot-popover-text-align: ${textAlign}; }`;
    }
    return code;
  }

  function rebuild(): void {
    syncZoomVisibility();
    const textAlign = cfgTextAlign.value;
    const config = getConfig();
    if (instance) {
      viewerEl!.style.minHeight = `${viewerEl!.offsetHeight}px`;
      (instance as { update(c: Partial<CIHotspotConfig>): void }).update(config);
      const img = viewerEl!.querySelector('img');
      const release = () => { viewerEl!.style.minHeight = ''; };
      if (img && !img.complete) {
        img.addEventListener('load', release, { once: true });
        img.addEventListener('error', release, { once: true });
      } else {
        requestAnimationFrame(release);
      }
    } else {
      instance = new CIHotspot(viewerEl!, config);
    }
    // Set text-align AFTER update/init since update() recreates the container
    const container = viewerEl!.querySelector('.ci-hotspot-container') as HTMLElement | null;
    container?.style.setProperty('--ci-hotspot-popover-text-align', textAlign);
    cfgCode.textContent = generateCode(config);
    cfgCode.classList.add('language-javascript');
    if (typeof (window as any).Prism !== 'undefined') {
      (window as any).Prism.highlightElement(cfgCode);
    }
  }

  // Bind controls
  [cfgZoom, cfgPulse, cfgFullscreen, cfgInvertMarker].forEach((el) => el.addEventListener('change', rebuild));
  [cfgTrigger, cfgTheme, cfgPlacement, cfgMarkerStyle, cfgTextAlign, cfgZoomControlsPosition].forEach((el) => el.addEventListener('change', rebuild));

  // Copy button
  cfgCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(cfgCode.textContent || '').then(() => {
      cfgCopy.textContent = 'Copied!';
      setTimeout(() => { cfgCopy.textContent = 'Copy to Clipboard'; }, 2000);
    });
  });

  // Initial build
  rebuild();
}
