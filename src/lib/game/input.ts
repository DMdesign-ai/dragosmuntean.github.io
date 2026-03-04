export class InputHandler {
  keys: Record<string, boolean> = {};

  // Touch state
  private touchActive = false;
  private isSwiping = false;
  private touchStartX = 0;
  private touchStartY = 0;
  private touchCurrentX = 0;
  private touchCurrentY = 0;
  private readonly TOUCH_DEAD_ZONE = 15;

  private touchTarget: EventTarget;

  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;
  private onTouchStart: (e: TouchEvent) => void;
  private onTouchMove: (e: TouchEvent) => void;
  private onTouchEnd: (e: TouchEvent) => void;

  constructor(canvas?: HTMLElement) {
    this.onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter', 'Escape'].includes(e.key)) {
        e.preventDefault();
        this.keys[e.key] = true;
      }
    };

    this.onKeyUp = (e: KeyboardEvent) => {
      this.keys[e.key] = false;
    };

    // Touch events scoped to canvas so page scrolling works outside the game
    this.onTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      this.touchActive = true;
      this.isSwiping = false;
      this.touchStartX = touch.clientX;
      this.touchStartY = touch.clientY;
      this.touchCurrentX = touch.clientX;
      this.touchCurrentY = touch.clientY;
    };

    this.onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!this.touchActive) return;
      const touch = e.touches[0];
      this.touchCurrentX = touch.clientX;
      this.touchCurrentY = touch.clientY;
      const dx = this.touchCurrentX - this.touchStartX;
      const dy = this.touchCurrentY - this.touchStartY;
      if (Math.abs(dx) > this.TOUCH_DEAD_ZONE || Math.abs(dy) > this.TOUCH_DEAD_ZONE) {
        this.isSwiping = true;
      }
    };

    this.onTouchEnd = () => {
      // Tap (no swipe) = confirm / restart
      if (this.touchActive && !this.isSwiping) {
        this.keys[' '] = true;
        this.keys['Enter'] = true;
        setTimeout(() => {
          this.keys[' '] = false;
          this.keys['Enter'] = false;
        }, 100);
      }
      this.touchActive = false;
      this.isSwiping = false;
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);

    this.touchTarget = canvas || window;
    this.touchTarget.addEventListener('touchstart', this.onTouchStart as EventListener, { passive: false });
    this.touchTarget.addEventListener('touchmove', this.onTouchMove as EventListener, { passive: false });
    this.touchTarget.addEventListener('touchend', this.onTouchEnd as EventListener);
  }

  get left(): boolean {
    if (this.touchActive && this.isSwiping) {
      return (this.touchCurrentX - this.touchStartX) < -this.TOUCH_DEAD_ZONE;
    }
    return !!this.keys['ArrowLeft'];
  }

  get right(): boolean {
    if (this.touchActive && this.isSwiping) {
      return (this.touchCurrentX - this.touchStartX) > this.TOUCH_DEAD_ZONE;
    }
    return !!this.keys['ArrowRight'];
  }

  get up(): boolean {
    if (this.touchActive && this.isSwiping) {
      return (this.touchCurrentY - this.touchStartY) < -this.TOUCH_DEAD_ZONE;
    }
    return !!this.keys['ArrowUp'];
  }

  get down(): boolean {
    if (this.touchActive && this.isSwiping) {
      return (this.touchCurrentY - this.touchStartY) > this.TOUCH_DEAD_ZONE;
    }
    return !!this.keys['ArrowDown'];
  }

  get restart(): boolean {
    return !!this.keys[' '];
  }

  get confirm(): boolean {
    return !!this.keys['Enter'] || !!this.keys[' '];
  }

  get escape(): boolean {
    return !!this.keys['Escape'];
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    this.touchTarget.removeEventListener('touchstart', this.onTouchStart as EventListener);
    this.touchTarget.removeEventListener('touchmove', this.onTouchMove as EventListener);
    this.touchTarget.removeEventListener('touchend', this.onTouchEnd as EventListener);
  }
}
