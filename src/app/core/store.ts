import { ApplicationRef, computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

// localStorage (font size, theme, step ticks) aur aaj ki tareekh.
// Build ke time (prerender) ye sab nahi hota, isliye shuru mein khaali rehta
// hai aur app ke browser mein "stable" hote hi (hydration ke baad) asli
// values aati hain — taaki server wala HTML aur pehla client render mel khayein.

@Injectable({ providedIn: 'root' })
export class Store {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly rev = signal(0);

  /** Aaj ki tareekh (YYYY-MM-DD, phone ke time se). Prerender pe "". */
  readonly today = signal('');
  readonly ready = computed(() => this.today() !== '');

  constructor() {
    if (!this.browser) return;
    inject(ApplicationRef)
      .whenStable()
      .then(() => this.today.set(localDate()));
    window.addEventListener('storage', () => this.rev.update((n) => n + 1));
  }

  get(key: string): string | null {
    this.rev(); // badlav pe dobara padhne ke liye
    if (!this.ready()) return null;
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  set(key: string, value: string | null) {
    try {
      if (value === null) localStorage.removeItem(key);
      else localStorage.setItem(key, value);
    } catch {
      // private mode waghera — chup-chaap ignore
    }
    this.rev.update((n) => n + 1);
  }
}

function localDate() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
