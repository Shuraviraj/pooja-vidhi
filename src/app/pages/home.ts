import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { navratri } from '../core/content';
import { htmlLang, link, t, ui, type Lang } from '../core/i18n';
import { Mantra } from '../components/mantra';
import { seo } from './seo';

// Home simple rakha hai: har pooja ka ek card. Nayi pooja aaye to yahan ek aur card.

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, Mantra],
  template: `
    <main class="wrap" [attr.lang]="htmlLang(lang())">
      <section class="hero">
        <h1>{{ t(ui.siteName, lang()) }}</h1>
        <p class="muted">{{ t(ui.tagline, lang()) }}</p>
        <app-mantra [lines]="nav.cover" cover />
      </section>

      <h2>{{ t(ui.poojayein, lang()) }}</h2>
      <div class="stack">
        <a class="card card-link puja-card" [routerLink]="link(lang(), '/navratri')">
          <img src="art/durga.svg" alt="" width="76" height="76" />
          <div>
            <h3>{{ t(nav.title, lang()) }}</h3>
            <p class="muted">{{ t(nav.subtitle, lang()) }}</p>
            <div class="dots" aria-hidden="true">
              @for (d of nav.days; track d.day) {
                <span class="dot" [style.background]="d.color.hex"></span>
              }
            </div>
          </div>
        </a>
      </div>
    </main>
  `,
})
export class HomePage {
  /** Route ke `data: { lang }` se aata hai (withComponentInputBinding). */
  readonly lang = input.required<Lang>();

  protected readonly nav = navratri;
  protected readonly t = t;
  protected readonly ui = ui;
  protected readonly link = link;
  protected readonly htmlLang = htmlLang;

  constructor() {
    seo(() => ({
      lang: this.lang(),
      path: '/',
      title:
        this.lang() === 'hi'
          ? 'पूजा विधि — नवरात्रि पूजा विधि, मंत्र, आरती और चालीसा'
          : 'Pooja Vidhi — Navratri pooja vidhi, mantra, aarti aur chalisa',
    }));
  }
}
