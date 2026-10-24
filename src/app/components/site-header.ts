import { Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter, map } from 'rxjs';
import { ui, type Lang } from '../core/i18n';
import { Store } from '../core/store';

/** URL se language: `/hi/...` = Shuddh Hindi, baaki sab Hinglish. */
export function langFromUrl(url: string): Lang {
  return url === '/hi' || url.startsWith('/hi/') ? 'hi' : 'hinglish';
}

/** Router ka abhi wala URL (bina ?query / #hash) — signal ke roop mein. */
export function currentPath() {
  const router = inject(Router);
  const url = toSignal(
    router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: router.url },
  );
  return computed(() => url().split(/[?#]/)[0] || '/');
}

@Component({
  selector: 'app-site-header',
  imports: [RouterLink],
  template: `
    <header class="site-header">
      <div class="wrap">
        <a class="brand" [routerLink]="lang() === 'hi' ? '/hi' : '/'"><span aria-hidden="true">ॐ</span>{{ ui.siteName[lang()] }}</a>
        <nav class="lang-toggle" aria-label="Language">
          <a [routerLink]="hinglishPath()" [attr.aria-current]="lang() === 'hinglish'" (click)="choose('hinglish')">Hinglish</a>
          <a [routerLink]="hiPath()" [attr.aria-current]="lang() === 'hi'" (click)="choose('hi')" lang="hi">शुद्ध हिंदी</a>
        </nav>
      </div>
    </header>
  `,
})
export class SiteHeader {
  private readonly router = inject(Router);
  private readonly store = inject(Store);
  private readonly path = currentPath();

  protected readonly ui = ui;
  protected readonly lang = computed(() => langFromUrl(this.path()));
  protected readonly hinglishPath = computed(() =>
    this.lang() === 'hi' ? this.path().replace(/^\/hi/, '') || '/' : this.path(),
  );
  protected readonly hiPath = computed(() =>
    this.lang() === 'hi' ? this.path() : this.path() === '/' ? '/hi' : `/hi${this.path()}`,
  );

  constructor() {
    // Home pe aaye aur pichhli baar Shuddh Hindi chuni thi → seedha /hi pe
    effect(() => {
      if (this.store.ready() && this.path() === '/' && this.store.get('lang') === 'hi') {
        this.router.navigateByUrl('/hi');
      }
    });
  }

  choose(lang: Lang) {
    this.store.set('lang', lang);
  }
}
