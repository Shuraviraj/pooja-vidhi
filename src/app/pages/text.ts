import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getText } from '../core/content';
import { htmlLang, link, t, ui, type Lang } from '../core/i18n';
import type { Text } from '../core/types';
import { Listen } from '../components/listen';
import { TextBody } from '../components/text-body';
import { NotFoundPage } from './not-found';
import { seo } from './seo';

/** Ek aarti ya chalisa ka poora page. `kind` route ke data se aata hai. */
@Component({
  selector: 'app-text-page',
  imports: [RouterLink, Listen, TextBody, NotFoundPage],
  template: `
    @if (text(); as text) {
      <main class="wrap" [attr.lang]="htmlLang(lang())">
        <section class="hero">
          <h1>{{ t(text.title, lang()) }}</h1>
          @if (text.subtitle; as sub) {
            <p class="muted">{{ t(sub, lang()) }}</p>
          }
        </section>

        <!-- Kis din ki aarti hai + doosre naam: padhne wale ke kaam ka, aur Google ko bhi page samajh aata hai -->
        <p class="text-intro">
          @if (text.day; as d) {
            @if (lang() === 'hi') {
              नवरात्रि के दिन {{ d.day }} ({{ d.name.hi }}) की पूजा में यह आरती गाई जाती है।
            } @else {
              Navratri ke Din {{ d.day }} ({{ d.name.hinglish }}) ki pooja mein ye aarti gaayi jaati hai.
            }
            <a [routerLink]="link(lang(), '/navratri/' + d.slug)">
              {{ lang() === 'hi' ? 'दिन ' + d.day + ' की पूरी पूजा विधि →' : 'Din ' + d.day + ' ki poori pooja vidhi →' }}
            </a>
          }
          @if (text.aka?.length) {
            <span class="aka">{{ lang() === 'hi' ? 'अन्य नाम' : 'Doosre naam' }}: {{ text.aka!.join(' · ') }}</span>
          }
        </p>

        @if (text.youtube; as yt) {
          <app-listen [id]="yt.id" [by]="yt.by" [sameText]="yt.sameText" [title]="t(text.title, lang())" [lang]="lang()" />
        }

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
      const firstLine = (text.parts[0]?.verses[0]?.[0] ?? '').replace(/\s*[।॥]+\s*$/, '');
      const day = text.day ? (lang === 'hi' ? ` नवरात्रि दिन ${text.day.day}।` : ` Navratri Din ${text.day.day}.`) : '';
      return {
        lang,
        path: `/${text.kind}/${text.slug}`,
        // Hinglish page ke title mein Devanagari naam bhi — log Hindi mein bhi search karte hain
        title: lang === 'hi' ? `${title} — पूरे बोल (Lyrics) | पूजा विधि` : `${title} (${text.title.hi}) — Lyrics | Pooja Vidhi`,
        description:
          lang === 'hi'
            ? `${title} के पूरे बोल: "${firstLine}…"${day} बिना विज्ञापन, शुद्ध हिंदी में।`
            : `${title} ke poore bol (lyrics): "${firstLine}…"${day} Bina ads — Hinglish aur शुद्ध हिंदी mein.`,
        crumbs: [
          { name: t(ui.siteName, lang), path: '/' },
          { name: lang === 'hi' ? 'नवरात्रि' : 'Navratri', path: '/navratri' },
          { name: title, path: `/${text.kind}/${text.slug}` },
        ],
      };
    });
  }
}
