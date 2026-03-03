export class InputHandler {
  keys: Record<string, boolean> = {};

  private onKeyDown: (e: KeyboardEvent) => void;
  private onKeyUp: (e: KeyboardEvent) => void;

  constructor() {
    this.onKeyDown = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) {
        e.preventDefault();
        this.keys[e.key] = true;
      }
    };

    this.onKeyUp = (e: KeyboardEvent) => {
      this.keys[e.key] = false;
    };

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
  }

  get left(): boolean {
    return !!this.keys['ArrowLeft'];
  }

  get right(): boolean {
    return !!this.keys['ArrowRight'];
  }

  get up(): boolean {
    return !!this.keys['ArrowUp'];
  }

  get down(): boolean {
    return !!this.keys['ArrowDown'];
  }

  get restart(): boolean {
    return !!this.keys[' '];
  }

  destroy() {
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
  }
}
