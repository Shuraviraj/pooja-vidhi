import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { content, navratri, textPath } from '../core/content';
import { inkFor } from '../core/format';
import { htmlLang, link, t, ui, type Lang } from '../core/i18n';
import { Blocks } from '../components/blocks';
import { DraftNote } from '../components/draft-note';
import { Mantra } from '../components/mantra';
import { seo } from './seo';

@Component({
  selector: 'app-navratri-page',
  imports: [RouterLink, Blocks, DraftNote, Mantra],
  template: `
    <main class="wrap" [attr.lang]="htmlLang(lang())">
      <section class="hero">
        <p class="kicker" lang="hi">॥ श्री गणेशाय नमः ॥</p>
        <h1>{{ t(nav.title, lang()) }}</h1>
        <p class="sub">{{ t(nav.subtitle, lang()) }}</p>
        <p class="muted small">{{ t(nav.when, lang()) }}</p>
        <app-mantra [lines]="nav.cover" cover />
        @if (nav.status === 'draft') {
          <app-draft-note [lang]="lang()" />
        }
      </section>

      <h2>{{ lang() === 'hi' ? 'रोज़ की पूजा — एक दृष्टि में' : 'Roz ki pooja — ek nazar mein' }}</h2>
      <div class="chips">
        @for (g of nav.glance; track $index) {
          <span class="chip"><b>{{ $index + 1 }}</b>{{ t(g, lang()) }}</span>
        }
      </div>

      <h2>{{ t(ui.pehlePadh, lang()) }}</h2>
      @for (s of nav.sections; track s.id) {
        <details class="section" [id]="s.id">
          <summary>{{ t(s.title, lang()) }}</summary>
          <div class="inner">
            @if (s.subtitle; as sub) {
              <p class="muted small">{{ t(sub, lang()) }}</p>
            }
            <app-blocks [blocks]="s.blocks" [lang]="lang()" />
          </div>
        </details>
      }

      <h2>{{ t(ui.naunDin, lang()) }}</h2>
      <p class="callout">{{ t(nav.chartNote, lang()) }}</p>
      <ol class="day-list">
        @for (d of nav.days; track d.day) {
          <li>
            <a
              class="card card-link day-row"
              [routerLink]="link(lang(), '/navratri/' + d.slug)"
              [style.--day]="d.color.hex"
              [style.--day-ink]="inkFor(d.color.hex)"
            >
              <span class="n">{{ d.day }}</span>
              <span>
                <span class="t">{{ t(d.name, lang()) }}</span>
                @if (d.color.note) {
                  <span class="s">{{ t(ui.table.rang, lang()) }}: {{ t(d.color.name, lang()) }}</span>
                }
                <span class="s">{{ t(ui.bhog, lang()) }}: {{ t(d.bhog, lang()) }}</span>
              </span>
              <span aria-hidden="true">›</span>
            </a>
          </li>
        }
      </ol>
      <ul class="bullets small muted chart-footer">
        @for (f of nav.chartFooter; track $index) {
          <li>{{ t(f, lang()) }}</li>
        }
      </ul>

      <h2>{{ lang() === 'hi' ? 'आरतियाँ और चालीसा' : 'Aartiyan aur Chalisa' }}</h2>
      <ul class="text-links">
        @for (e of texts; track e[0]) {
          <li>
            <a [routerLink]="link(lang(), textPath(e[0]))">{{ t(e[1].title, lang()) }}</a>
          </li>
        }
      </ul>

      <div class="day-nav">
        <a class="btn btn-ghost" [routerLink]="link(lang(), '/chalisa/durga')">
          {{ lang() === 'hi' ? 'श्री दुर्गा चालीसा' : 'Shri Durga Chalisa' }}
        </a>
        <a class="btn btn-ghost" [href]="t(nav.pdf, lang())" download>⬇ {{ t(ui.pdf, lang()) }}</a>
      </div>
    </main>
  `,
})
export class NavratriPage {
  readonly lang = input.required<Lang>();

  protected readonly nav = navratri;
  protected readonly texts = Object.entries(content.texts);
  protected readonly textPath = textPath;
  protected readonly t = t;
  protected readonly ui = ui;
  protected readonly link = link;
  protected readonly htmlLang = htmlLang;
  protected readonly inkFor = inkFor;

  constructor() {
    seo(() => ({
      lang: this.lang(),
      path: '/navratri',
      title:
        this.lang() === 'hi'
          ? 'नवरात्रि पूजा विधि — नौ दिन की पूरी विधि, मंत्र, आरती | पूजा विधि'
          : 'Navratri Pooja Vidhi — 9 din ki poori vidhi, mantra, aarti | Pooja Vidhi',
    }));
  }
}
