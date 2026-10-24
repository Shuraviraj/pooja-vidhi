import { Component, computed, DOCUMENT, effect, inject, OnDestroy, signal } from '@angular/core';
import { ui } from '../core/i18n';
import { Store } from '../core/store';
import { currentPath, langFromUrl } from './site-header';

// Neeche ki patti: font chhota/bada, screen ON (wake lock), Diya mode.
// Font aur theme ki choice yaad rehti hai; index.html ka chhota script page
// khulte hi lagata hai taaki pehle galat size na dikhe.

const MAX_SIZE = 3;

@Component({
  selector: 'app-reader-bar',
  template: `
    <div class="reader-bar">
      <div class="wrap">
        <button type="button" class="rb-btn" aria-label="Font chhota" [disabled]="size() <= 0" (click)="setSize(size() - 1)">A−</button>
        <button type="button" class="rb-btn" aria-label="Font bada" [disabled]="size() >= max" (click)="setSize(size() + 1)">A+</button>
        @if (wakeSupported()) {
          <button type="button" class="rb-btn" [attr.aria-pressed]="awake()" (click)="toggleWake()">☀ {{ ui.screenOn[lang()] }}</button>
        }
        <button type="button" class="rb-btn" [attr.aria-pressed]="theme() === 'diya'" (click)="toggleTheme()">🪔 {{ ui.diyaMode[lang()] }}</button>
      </div>
    </div>
  `,
})
export class ReaderBar implements OnDestroy {
  private readonly store = inject(Store);
  private readonly doc = inject(DOCUMENT);
  private readonly path = currentPath();

  protected readonly ui = ui;
  protected readonly max = MAX_SIZE;
  protected readonly lang = computed(() => langFromUrl(this.path()));
  protected readonly size = computed(() => Number(this.store.get('size') ?? '0'));
  protected readonly theme = computed(() => this.store.get('theme') ?? 'light');
  protected readonly wakeSupported = computed(() => this.store.ready() && 'wakeLock' in navigator);
  protected readonly awake = signal(false);

  private lock: WakeLockSentinel | null = null;
  // Tab chhodne pe browser lock hata deta hai — wapas aane pe dobara maangte hain.
  private readonly onVisible = () => {
    if (this.awake() && this.doc.visibilityState === 'visible') this.acquire();
  };

  constructor() {
    effect(() => {
      if (!this.store.ready()) return; // tab tak index.html wala script hi sambhale
      this.doc.documentElement.dataset['size'] = String(this.size());
      this.doc.documentElement.dataset['theme'] = this.theme();
    });
  }

  setSize(n: number) {
    this.store.set('size', String(Math.min(MAX_SIZE, Math.max(0, n))));
  }

  toggleTheme() {
    this.store.set('theme', this.theme() === 'diya' ? 'light' : 'diya');
  }

  async toggleWake() {
    if (this.awake()) {
      this.awake.set(false);
      this.doc.removeEventListener('visibilitychange', this.onVisible);
      await this.lock?.release();
      this.lock = null;
      return;
    }
    this.awake.set(true);
    this.doc.addEventListener('visibilitychange', this.onVisible);
    await this.acquire();
  }

  private async acquire() {
    try {
      this.lock = await navigator.wakeLock.request('screen');
    } catch {
      this.awake.set(false); // battery saver waghera mein mana ho sakta hai
    }
  }

  ngOnDestroy() {
    this.doc.removeEventListener('visibilitychange', this.onVisible);
    this.lock?.release();
  }
}
