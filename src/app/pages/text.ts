import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getText } from '../core/content';
import { htmlLang, link, t, ui, type Lang } from '../core/i18n';
import type { Text } from '../core/types';
import { TextBody } from '../components/text-body';
import { NotFoundPage } from './not-found';
import { seo } from './seo';

/** Ek aarti ya chalisa ka poora page. `kind` route ke data se aata hai. */
@Component({
  selector: 'app-text-page',
  imports: [RouterLink, TextBody, NotFoundPage],
  template: `
    @if (text(); as text) {
      <main class="wrap" [attr.lang]="htmlLang(lang())">
        <section class="hero">
          <h1>{{ t(text.title, lang()) }}</h1>
          @if (text.subtitle; as sub) {
            <p class="muted">{{ t(sub, lang()) }}</p>
          }
        </section>
        <app-text-body [text]="text" [lang]="lang()" />
        <nav class="day-nav">
          <a class="btn btn-ghost" [routerLink]="link(lang(), '/')">← {{ t(ui.home, lang()) }}</a>
          <a class="btn btn-ghost" [routerLink]="link(lang(), '/navratri')">{{ t(ui.overview, lang()) }}</a>
        </nav>
      </main>
    } @else {
      <app-not-found-page />
    }
  `,
})
export class TextPage {
  readonly lang = input.required<Lang>();
  readonly kind = input.required<Text['kind']>();
  /** URL ka `:slug` hissa, jaise "ganesh". */
  readonly slug = input.required<string>();

  protected readonly text = computed(() => getText(this.kind(), this.slug()));
  protected readonly t = t;
  protected readonly ui = ui;
  protected readonly link = link;
  protected readonly htmlLang = htmlLang;

  constructor() {
    seo(() => {
      const text = this.text();
      if (!text) return null;
      const lang = this.lang();
      const title = t(text.title, lang);
      return {
        lang,
        path: `/${text.kind}/${text.slug}`,
        title: lang === 'hi' ? `${title} — पूरे बोल | पूजा विधि` : `${title} — Lyrics | Pooja Vidhi`,
        description:
          lang === 'hi'
            ? `${title} के पूरे बोल, देवनागरी में — बिना विज्ञापन। नवरात्रि पूजा विधि के साथ।`
            : `${title} ke poore bol (lyrics) Devanagari mein — bina ads. Navratri pooja vidhi ke saath.`,
      };
    });
  }
}
