const isMac =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent);

const HINT_TEXT = isMac
  ? '\u2318 Scroll or pinch to zoom'
  : 'Ctrl + scroll to zoom';

const HIDE_DELAY = 1500;

export class ScrollHint {
  private el: HTMLElement;
  private hideTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(parent: HTMLElement) {
    this.el = document.createElement('div');
    this.el.className = 'ci-hotspot-scroll-hint';
    this.el.textContent = HINT_TEXT;
    this.el.setAttribute('aria-hidden', 'true');
    parent.appendChild(this.el);
  }

  show(): void {
    // Reset timer on repeated scrolls
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
    }

    this.el.classList.add('ci-hotspot-scroll-hint--visible');

    this.hideTimer = setTimeout(() => {
      this.el.classList.remove('ci-hotspot-scroll-hint--visible');
      this.hideTimer = null;
    }, HIDE_DELAY);
  }

  destroy(): void {
    if (this.hideTimer !== null) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.el.remove();
  }
}
