import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { signal, path, __resetRegistryForTesting } from '@nisoku/sairin';
import { SazamiComponent, component } from '../src/primitives/base';
import { registerComponents } from '../src/primitives/registry';

describe('Structural Change Detection', () => {
  beforeEach(() => {
    registerComponents();

    if (!customElements.get('test-structural')) {
      const structuralConfig = {
        structuralRoots: {
          modeA: 'div',
          modeB: 'span',
        },
      };
      @component(structuralConfig)
      class TestStructural extends SazamiComponent<typeof structuralConfig> {
        private _mode: 'modeA' | 'modeB' = 'modeA';

        protected getRenderMode(): string {
          return this._mode;
        }

        set mode(value: 'modeA' | 'modeB') {
          this._mode = value;
          this.render();
        }

        render() {
          if (this._mode === 'modeA') {
            this.mount('', '<div class="mode-a">Mode A</div>');
          } else {
            this.mount('', '<span class="mode-b">Mode B</span>');
          }
        }
      }
      customElements.define('test-structural', TestStructural);
    }

    if (!customElements.get('test-auto-detect')) {
      class TestAutoDetect extends SazamiComponent {
        private _showDiv = true;

        set showDiv(value: boolean) {
          this._showDiv = value;
          this.render();
        }

        render() {
          if (this._showDiv) {
            this.mount('', '<div class="auto-div">Div</div>');
          } else {
            this.mount('', '<section class="auto-section">Section</section>');
          }
        }
      }
      customElements.define('test-auto-detect', TestAutoDetect);
    }

    if (!customElements.get('test-generic-slot')) {
      class TestGenericSlot extends SazamiComponent {
        private _showSlot = true;

        set showSlot(value: boolean) {
          this._showSlot = value;
          this.render();
        }

        render() {
          if (this._showSlot) {
            this.mount('', '<slot></slot>');
          } else {
            this.mount('', '<div class="content">Content</div>');
          }
        }
      }
      customElements.define('test-generic-slot', TestGenericSlot);
    }
  });

  afterEach(() => {
    document.body.innerHTML = '';
    __resetRegistryForTesting();
  });

  describe('Explicit structuralRoots (avatar pattern)', () => {
    test('renders synchronously when structuralRoots mode changes', async () => {
      const el = document.createElement('test-structural') as any;
      document.body.appendChild(el);
      await Promise.resolve();

      const div = el.shadowRoot?.querySelector('div.mode-a');
      expect(div).not.toBeNull();
      expect(div?.textContent).toBe('Mode A');

      el.mode = 'modeB';
      await Promise.resolve();

      const span = el.shadowRoot?.querySelector('span.mode-b');
      expect(span).not.toBeNull();
      expect(span?.textContent).toBe('Mode B');
    });
  });

  describe('Auto-detected structural changes', () => {
    test('auto-detects when root element changes', async () => {
      const el = document.createElement('test-auto-detect') as any;
      document.body.appendChild(el);
      await Promise.resolve();

      const div = el.shadowRoot?.querySelector('div.auto-div');
      expect(div).not.toBeNull();

      el.showDiv = false;
      await Promise.resolve();

      const section = el.shadowRoot?.querySelector('section.auto-section');
      expect(section).not.toBeNull();
    });

    test('batches renders when root element stays the same', async () => {
      const el = document.createElement('test-auto-detect') as any;
      document.body.appendChild(el);
      await Promise.resolve();

      el.showDiv = true;
      el.showDiv = false;
      el.showDiv = true;
      el.showDiv = false;

      await Promise.resolve();

      const section = el.shadowRoot?.querySelector('section.auto-section');
      expect(section).not.toBeNull();
    });

    test('renders sync when root element changes', async () => {
      const el = document.createElement('test-auto-detect') as any;
      document.body.appendChild(el);
      await Promise.resolve();

      el.showDiv = false;
      await Promise.resolve();

      const section = el.shadowRoot?.querySelector('section.auto-section');
      expect(section).not.toBeNull();

      el.showDiv = true;
      await Promise.resolve();

      const div = el.shadowRoot?.querySelector('div.auto-div');
      expect(div).not.toBeNull();
    });
  });

  describe('Generic/custom components', () => {
    test('generic-like components get structural change detection', async () => {
      const el = document.createElement('test-generic-slot') as any;
      document.body.appendChild(el);
      await Promise.resolve();

      const slot = el.shadowRoot?.querySelector('slot');
      expect(slot).not.toBeNull();

      el.showSlot = false;
      await Promise.resolve();

      const content = el.shadowRoot?.querySelector('div.content');
      expect(content).not.toBeNull();
    });
  });

  describe('Avatar structural mode transitions', () => {
    test('switches from initials to image when src signal updates', async () => {
      const el = document.createElement('saz-avatar') as any;
      const src = signal(path('test', 'avatarEmpty'), '');

      el.src = src;
      document.body.appendChild(el);
      await Promise.resolve();

      let initials = el.shadowRoot?.querySelector('.initials');
      expect(initials).not.toBeNull();

      src.set('user.jpg');
      await Promise.resolve();
      await Promise.resolve();

      const img = el.shadowRoot?.querySelector('img.image');
      expect(img).not.toBeNull();
      expect((img as HTMLImageElement)?.src).toContain('user.jpg');
    });

    test('switches from image to initials when src signal updates', async () => {
      const el = document.createElement('saz-avatar') as any;
      const src = signal(path('test', 'avatarFull'), 'user.jpg');

      el.src = src;
      document.body.appendChild(el);
      await Promise.resolve();

      let img = el.shadowRoot?.querySelector('img.image');
      expect(img).not.toBeNull();

      src.set('');
      await Promise.resolve();
      await Promise.resolve();

      const initials = el.shadowRoot?.querySelector('.initials');
      expect(initials).not.toBeNull();
    });

    test('switches from empty string to image with different signal', async () => {
      const el = document.createElement('saz-avatar') as any;
      const src = signal(path('test', 'avatarSwitch1'), '');

      el.src = src;
      document.body.appendChild(el);
      await Promise.resolve();

      src.set('photo.png');
      await Promise.resolve();
      await Promise.resolve();

      const img = el.shadowRoot?.querySelector('img.image');
      expect(img).not.toBeNull();
      expect((img as HTMLImageElement)?.src).toContain('photo.png');
    });

    test('switches from image to empty with different signal', async () => {
      const el = document.createElement('saz-avatar') as any;
      const src = signal(path('test', 'avatarSwitch2'), 'avatar.png');

      el.src = src;
      document.body.appendChild(el);
      await Promise.resolve();

      src.set('');
      await Promise.resolve();
      await Promise.resolve();

      const initials = el.shadowRoot?.querySelector('.initials');
      expect(initials).not.toBeNull();
    });
  });
});
