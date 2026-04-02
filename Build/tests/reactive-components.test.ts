import { describe, test, expect, it, afterEach, beforeEach } from '@jest/globals';
import { Signal, signal, derived, path, effect, __resetRegistryForTesting } from '@nisoku/sairin';

describe('Sazami Components - Signal Support', () => {
  const defineOnce = (name: string, cls: any) => {
    if (!customElements.get(name)) {
      customElements.define(name, cls);
    }
  };

  beforeEach(() => {
    defineOnce('saz-text', require('../src/primitives/text').SazamiText);
    defineOnce('saz-badge', require('../src/primitives/badge').SazamiBadge);
    defineOnce('saz-heading', require('../src/primitives/heading').SazamiHeading);
    defineOnce('saz-label', require('../src/primitives/label').SazamiLabel);
    defineOnce('saz-button', require('../src/primitives/button').SazamiButton);
    defineOnce('saz-input', require('../src/primitives/input').SazamiInput);
    defineOnce('saz-checkbox', require('../src/primitives/checkbox').SazamiCheckbox);
    defineOnce('saz-switch', require('../src/primitives/switch').SazamiSwitch);
    defineOnce('saz-toggle', require('../src/primitives/toggle').SazamiToggle);
    defineOnce('saz-radio', require('../src/primitives/radio').SazamiRadio);
    defineOnce('saz-image', require('../src/primitives/image').SazamiImage);
    defineOnce('saz-avatar', require('../src/primitives/avatar').SazamiAvatar);
    defineOnce('saz-coverart', require('../src/primitives/coverart').SazamiCoverart);
    defineOnce('saz-progress', require('../src/primitives/progress').SazamiProgress);
    defineOnce('saz-slider', require('../src/primitives/slider').SazamiSlider);
    defineOnce('saz-select', require('../src/primitives/select').SazamiSelect);
    defineOnce('saz-icon', require('../src/primitives/icon').SazamiIcon);
    defineOnce('saz-spinner', require('../src/primitives/spinner').SazamiSpinner);
    defineOnce('saz-tag', require('../src/primitives/tag').SazamiTag);
    defineOnce('saz-chip', require('../src/primitives/chip').SazamiChip);
    defineOnce('saz-modal', require('../src/primitives/modal').SazamiModal);
    defineOnce('saz-toast', require('../src/primitives/toast').SazamiToast);
    defineOnce('saz-tabs', require('../src/primitives/tabs').SazamiTabs);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    __resetRegistryForTesting();
  });

  describe('Text Components', () => {
    test('saz-text binds Signal<string> to textContent', async () => {
      const el = document.createElement('saz-text') as any;
      const textSignal = signal(path("test", "textContent"), 'Hello');
      
      el.content = textSignal;
      document.body.appendChild(el);
      await Promise.resolve();
      
      const textNode = el.shadowRoot?.textContent;
      expect(textNode).toContain('Hello');
      
      textSignal.set('World');
      await Promise.resolve();
      
      const updatedText = el.shadowRoot?.textContent;
      expect(updatedText).toContain('World');
      
      el.remove();
    });

    test('saz-text binds Derived<string> to textContent', async () => {
      const el = document.createElement('saz-text') as any;
      const firstName = signal(path("test", "firstName"), 'John');
      const lastName = signal(path("test", "lastName"), 'Doe');
      const fullName = derived(path("test", "fullName"), () => `${firstName.get()} ${lastName.get()}`);
      
      el.content = fullName;
      document.body.appendChild(el);
      await Promise.resolve();
      
      expect(el.shadowRoot?.textContent).toContain('John Doe');
      
      firstName.set('Jane');
      await Promise.resolve();
      expect(el.shadowRoot?.textContent).toContain('Jane Doe');
      
      lastName.set('Smith');
      await Promise.resolve();
      expect(el.shadowRoot?.textContent).toContain('Jane Smith');
      
      el.remove();
    });

    test('saz-badge binds Signal<string>', async () => {
      const el = document.createElement('saz-badge') as any;
      const label = signal(path("test", "badgeLabel"), 'New');
      
      el.content = label;
      document.body.appendChild(el);
      await Promise.resolve();
      
      expect(el.shadowRoot?.textContent).toContain('New');
      
      label.set('Updated');
      await Promise.resolve();
      expect(el.shadowRoot?.textContent).toContain('Updated');
      
      el.remove();
    });

    test('saz-heading binds Signal<string>', async () => {
      const el = document.createElement('saz-heading') as any;
      const title = signal(path("test", "heading"), 'Welcome');
      
      el.content = title;
      document.body.appendChild(el);
      await Promise.resolve();
      
      expect(el.shadowRoot?.textContent).toContain('Welcome');
      
      title.set('Goodbye');
      await Promise.resolve();
      expect(el.shadowRoot?.textContent).toContain('Goodbye');
      
      el.remove();
    });

    test('saz-label binds Signal<string>', async () => {
      const el = document.createElement('saz-label') as any;
      const labelText = signal(path("test", "labelText"), 'Email Address');
      
      el.content = labelText;
      document.body.appendChild(el);
      await Promise.resolve();
      
      expect(el.shadowRoot?.textContent).toContain('Email Address');
      
      labelText.set('Username');
      await Promise.resolve();
      expect(el.shadowRoot?.textContent).toContain('Username');
      
      el.remove();
    });
  });

  describe('Image Components', () => {
    test('saz-image binds Signal<string> to src', async () => {
      const el = document.createElement('saz-image') as any;
      const src = signal(path("test", "imageSrc"), '/image1.jpg');
      
      el.src = src;
      document.body.appendChild(el);
      await Promise.resolve();
      
      const img = el.shadowRoot?.querySelector('img');
      expect(img?.src).toContain('/image1.jpg');
      
      src.set('/image2.jpg');
      await Promise.resolve();
      
      expect(img?.src).toContain('/image2.jpg');
      
      el.remove();
    });

    test('saz-image binds Derived<string> to src', async () => {
      const el = document.createElement('saz-image') as any;
      const baseUrl = signal(path("test", "baseUrl"), 'https://example.com');
      const filename = signal(path("test", "filename"), 'avatar.png');
      const fullSrc = derived(path("test", "fullSrc"), () => `${baseUrl.get()}/${filename.get()}`);
      
      el.src = fullSrc;
      document.body.appendChild(el);
      await Promise.resolve();
      
      const img = el.shadowRoot?.querySelector('img');
      expect(img?.src).toContain('https://example.com/avatar.png');
      
      filename.set('profile.png');
      await Promise.resolve();
      expect(img?.src).toContain('https://example.com/profile.png');
      
      el.remove();
    });

    test('saz-avatar binds Signal<string> to src', async () => {
      const el = document.createElement('saz-avatar') as any;
      const src = signal(path("test", "avatarSrc"), 'user1.jpg');
      
      el.src = src;
      document.body.appendChild(el);
      await Promise.resolve();
      
      const img = el.shadowRoot?.querySelector('img');
      expect(img?.src).toContain('user1.jpg');
      
      src.set('user2.jpg');
      await Promise.resolve();
      expect(img?.src).toContain('user2.jpg');
      
      el.remove();
    });

    test('saz-avatar switches from empty to image when src signal updates', async () => {
      const el = document.createElement('saz-avatar') as any;
      const src = signal(path("test", "avatarEmpty"), '');
      
      el.src = src;
      document.body.appendChild(el);
      await Promise.resolve();
      
      const initials = el.shadowRoot?.querySelector('.initials');
      expect(initials).not.toBeNull();
      
      src.set('user.jpg');
      await Promise.resolve();
      
      const img = el.shadowRoot?.querySelector('img');
      expect(img?.src).toContain('user.jpg');
      
      el.remove();
    });

    test('saz-avatar switches from image to empty when src signal updates', async () => {
      const el = document.createElement('saz-avatar') as any;
      const src = signal(path("test", "avatarFull"), 'user.jpg');
      
      el.src = src;
      document.body.appendChild(el);
      await Promise.resolve();
      
      const img = el.shadowRoot?.querySelector('img');
      expect(img?.src).toContain('user.jpg');
      
      src.set('');
      await Promise.resolve();
      
      const initials = el.shadowRoot?.querySelector('.initials');
      expect(initials).not.toBeNull();
      
      el.remove();
    });

    test('saz-coverart binds Signal<string> to src', async () => {
      const el = document.createElement('saz-coverart') as any;
      const src = signal(path("test", "coverSrc"), 'album.jpg');
      
      el.src = src;
      document.body.appendChild(el);
      await Promise.resolve();
      
      const img = el.shadowRoot?.querySelector('img');
      expect(img?.src).toContain('album.jpg');
      
      src.set('new-album.jpg');
      await Promise.resolve();
      expect(img?.src).toContain('new-album.jpg');
      
      el.remove();
    });
  });

  describe('Interactive Components - Disabled', () => {
    test('saz-button binds Signal<boolean> to disabled', async () => {
      const el = document.createElement('saz-button') as any;
      const disabled = signal(path("test", "btnDisabled"), false);
      
      el.disabled = disabled;
      document.body.appendChild(el);
      await Promise.resolve();
      
      expect(el.hasAttribute('disabled')).toBe(false);
      
      disabled.set(true);
      await Promise.resolve();
      expect(el.hasAttribute('disabled')).toBe(true);
      
      el.remove();
    });

    test('saz-button binds Derived<boolean> to disabled', async () => {
      const el = document.createElement('saz-button') as any;
      const isLoading = signal(path("test", "isLoading"), false);
      const hasPermission = signal(path("test", "hasPermission"), true);
      const shouldDisable = derived(path("test", "shouldDisable"), () => isLoading.get() || !hasPermission.get());
      
      el.disabled = shouldDisable;
      document.body.appendChild(el);
      await Promise.resolve();
      
      expect(el.hasAttribute('disabled')).toBe(false);
      
      isLoading.set(true);
      await Promise.resolve();
      expect(el.hasAttribute('disabled')).toBe(true);
      
      el.remove();
    });

    test('saz-checkbox binds Signal<boolean> to disabled', async () => {
      const el = document.createElement('saz-checkbox') as any;
      const disabled = signal(path("test", "cbxDisabled"), false);
      
      el.disabled = disabled;
      document.body.appendChild(el);
      await Promise.resolve();
      
      expect(el.hasAttribute('disabled')).toBe(false);
      
      disabled.set(true);
      await Promise.resolve();
      expect(el.hasAttribute('disabled')).toBe(true);
      
      el.remove();
    });
  });

  describe('Form Controls - Value Binding', () => {
    test('saz-input binds Signal<string> with two-way sync', async () => {
      const el = document.createElement('saz-input') as any;
      const value = signal(path("test", "inputValue"), 'initial');
      
      el.value = value;
      document.body.appendChild(el);
      await Promise.resolve();
      
      const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('initial');
      
      value.set('updated');
      await Promise.resolve();
      expect(input.value).toBe('updated');
      
      input.value = 'user typed';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      
      expect(value.get()).toBe('user typed');
      
      el.remove();
    });

    test('saz-slider binds Signal<number> to value', async () => {
      const el = document.createElement('saz-slider') as any;
      const value = signal(path("test", "sliderValue"), 50);
      
      el.value = value;
      document.body.appendChild(el);
      await Promise.resolve();
      
      const slider = el.shadowRoot?.querySelector('input[type="range"]') as HTMLInputElement;
      expect(slider?.value).toBe('50');
      
      value.set(75);
      await Promise.resolve();
      expect(slider?.value).toBe('75');
      
      el.remove();
    });

    test('saz-progress binds Signal<number> to value', async () => {
      const el = document.createElement('saz-progress') as any;
      const value = signal(path("test", "progressValue"), 25);
      
      el.value = value;
      document.body.appendChild(el);
      await Promise.resolve();
      
      const bar = el.shadowRoot?.querySelector('.bar') as HTMLElement;
      expect(bar?.style.width).toBe('25%');
      
      value.set(75);
      await Promise.resolve();
      expect(bar?.style.width).toBe('75%');
      
      el.remove();
    });
  });

  describe('Boolean State Components', () => {
    test('saz-checkbox binds Signal<boolean> to checked', async () => {
      const el = document.createElement('saz-checkbox') as any;
      const checked = signal(path("test", "checked"), false);
      
      el.checked = checked;
      document.body.appendChild(el);
      await Promise.resolve();
      
      expect(el.hasAttribute('checked')).toBe(false);
      
      checked.set(true);
      await Promise.resolve();
      expect(el.hasAttribute('checked')).toBe(true);
      
      el.remove();
    });

    test('saz-switch binds Signal<boolean> to checked', async () => {
      const el = document.createElement('saz-switch') as any;
      const checked = signal(path("test", "switchChecked"), true);
      
      el.checked = checked;
      document.body.appendChild(el);
      await Promise.resolve();
      
      expect(el.hasAttribute('checked')).toBe(true);
      
      checked.set(false);
      await Promise.resolve();
      expect(el.hasAttribute('checked')).toBe(false);
      
      el.remove();
    });

    test('saz-toggle binds Signal<boolean> to checked', async () => {
      const el = document.createElement('saz-toggle') as any;
      const checked = signal(path("test", "toggleChecked"), false);
      
      el.checked = checked;
      document.body.appendChild(el);
      await Promise.resolve();
      
      expect(el.hasAttribute('checked')).toBe(false);
      
      checked.set(true);
      await Promise.resolve();
      expect(el.hasAttribute('checked')).toBe(true);
      
      el.remove();
    });

    test('saz-radio binds Signal<boolean> to checked', async () => {
      const el = document.createElement('saz-radio') as any;
      const checked = signal(path("test", "radioChecked"), true);
      
      el.checked = checked;
      document.body.appendChild(el);
      await Promise.resolve();
      
      expect(el.hasAttribute('checked')).toBe(true);
      
      checked.set(false);
      await Promise.resolve();
      expect(el.hasAttribute('checked')).toBe(false);
      
      el.remove();
    });
  });

  describe('Derived Signal Integration', () => {
    test('multiple signals compose into derived for component', async () => {
      const el = document.createElement('saz-text') as any;
      const first = signal(path("test", "first"), 'Hello');
      const last = signal(path("test", "last"), 'World');
      const greeting = derived(path("test", "greeting"), () => `${first.get()}, ${last.get()}!`);
      
      el.content = greeting;
      document.body.appendChild(el);
      await Promise.resolve();
      
      expect(el.shadowRoot?.textContent).toContain('Hello, World!');
      
      first.set('Hi');
      last.set('There');
      await Promise.resolve();
      
      expect(el.shadowRoot?.textContent).toContain('Hi, There!');
      
      el.remove();
    });

    test('derived computed from form inputs', async () => {
      const el = document.createElement('saz-input') as any;
      const firstName = signal(path("test", "firstName"), 'John');
      const lastName = signal(path("test", "lastName"), 'Doe');
      const fullName = derived(path("test", "fullName"), () => `${firstName.get()} ${lastName.get()}`);
      
      el.value = fullName;
      document.body.appendChild(el);
      await Promise.resolve();
      
      const input = el.shadowRoot?.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('John Doe');
      
      firstName.set('Jane');
      await Promise.resolve();
      expect(input.value).toBe('Jane Doe');
      
      el.remove();
    });

    test('derived boolean controls component disabled', async () => {
      const el = document.createElement('saz-button') as any;
      const isLoading = signal(path("test", "isLoading"), false);
      const hasErrors = signal(path("test", "hasErrors"), false);
      const shouldDisable = derived(path("test", "shouldDisable"), () => isLoading.get() || hasErrors.get());
      
      el.disabled = shouldDisable;
      document.body.appendChild(el);
      await Promise.resolve();
      
      expect(el.hasAttribute('disabled')).toBe(false);
      
      isLoading.set(true);
      await Promise.resolve();
      expect(el.hasAttribute('disabled')).toBe(true);
      
      isLoading.set(false);
      hasErrors.set(true);
      await Promise.resolve();
      expect(el.hasAttribute('disabled')).toBe(true);
      
      el.remove();
    });

    test('derived computed styles applied to component', async () => {
      const el = document.createElement('saz-progress') as any;
      const current = signal(path("test", "current"), 50);
      const total = signal(path("test", "total"), 100);
      const percentage = derived(path("test", "percentage"), () => Math.round((current.get() / total.get()) * 100));
      
      el.value = percentage;
      document.body.appendChild(el);
      await Promise.resolve();
      
      const bar = el.shadowRoot?.querySelector('.bar') as HTMLElement;
      expect(bar?.style.width).toBe('50%');
      
      current.set(75);
      await Promise.resolve();
      expect(bar?.style.width).toBe('75%');
      
      el.remove();
    });
  });

  describe('Edge Cases', () => {
    test('signal with null initial value', async () => {
      const el = document.createElement('saz-text') as any;
      const text = signal<string | null>(path("test", "nullText"), null);
      
      el.content = text as any;
      document.body.appendChild(el);
      await Promise.resolve();
      
      const textNode = el.shadowRoot?.childNodes[1]; // Skip style element
      expect(textNode?.textContent || '').toBe('');
      
      text.set('has value');
      await Promise.resolve();
      expect(el.shadowRoot?.textContent).toContain('has value');
      
      el.remove();
    });

    test('signal updates batch correctly', async () => {
      const el = document.createElement('saz-text') as any;
      const a = signal(path("test", "a"), 'A');
      const b = signal(path("test", "b"), 'B');
      const c = signal(path("test", "c"), 'C');
      const combined = derived(path("test", "combined"), () => `${a.get()}${b.get()}${c.get()}`);
      
      el.content = combined;
      document.body.appendChild(el);
      await Promise.resolve();
      
      expect(el.shadowRoot?.textContent).toContain('ABC');
      
      a.set('1');
      b.set('2');
      c.set('3');
      await Promise.resolve();
      
      expect(el.shadowRoot?.textContent).toContain('123');
      
      el.remove();
    });

    test('switching from static to signal value', async () => {
      const el = document.createElement('saz-text') as any;
      
      el.content = 'static value';
      document.body.appendChild(el);
      await Promise.resolve();
      expect(el.shadowRoot?.textContent).toContain('static value');
      
      const dynamicContent = derived(path("test", "dynamic"), () => 'dynamic value');
      el.content = dynamicContent;
      await Promise.resolve();
      expect(el.shadowRoot?.textContent).toContain('dynamic value');
      
      el.remove();
    });
  });

  describe('Resource Integration', () => {
    test('resource.value signal updates component', async () => {
      const el = document.createElement('saz-text') as any;
      const { resource } = require('@nisoku/sairin');
      
      const userData = resource(
        () => Promise.resolve({ name: 'John', age: 30 }),
        null
      );
      
      const userName = signal(path("test", "userName"), '');
      effect(() => {
        const data = userData.value.get();
        userName.set(data?.name ?? '');
      });
      
      el.content = userName;
      document.body.appendChild(el);
      
      let found = false;
      for (let i = 0; i < 20; i++) {
        await new Promise(resolve => setTimeout(resolve, 10));
        await Promise.resolve();
        if (el.shadowRoot?.textContent?.includes('John')) {
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
      expect(el.shadowRoot?.textContent).toContain('John');
      
      el.remove();
    });
  });
});
