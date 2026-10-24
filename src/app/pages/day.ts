import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { getDay, navratri } from '../core/content';
import { dayLine, inkFor } from '../core/format';
import { htmlLang, link, t, ui, type Lang } from '../core/i18n';
import { Blocks } from '../components/blocks';
import { Mantra } from '../components/mantra';
import { StepTick } from '../components/step-tick';
import { NotFoundPage } from './not-found';
import { seo } from './seo';

@Component({
  selector: 'app-day-page',
  imports: [RouterLink, Blocks, Mantra, StepTick, NotFoundPage],
  template: `
    @if (d(); as d) {
      <main class="wrap" [attr.lang]="htmlLang(lang())">
        <header class="day-head" [style.--day]="d.color.hex" [style.--day-ink]="inkFor(d.color.hex)">
          <span class="num"><span><small>{{ t(ui.din, lang()).toUpperCase() }}</small>{{ d.day }}</span></span>
          <div>
            <h1 lang="hi">{{ d.name.hi }}</h1>
            <p>{{ dayLine(d, lang()) }}</p>
          </div>
        </header>

        <p class="para">{{ t(d.about, lang()) }}</p>

        <div class="info">
          @if (d.color.note; as colorNote) {
            <div class="card">
              <div class="k">{{ t(ui.rang, lang()) }}</div>
              <div class="v"><span class="dot dot-inline" [style.background]="d.color.hex"></span>{{ t(d.color.name, lang()) }}</div>
              <div class="small muted">{{ t(colorNote, lang()) }}</div>
            </div>
          }
          <div class="card">
            <div class="k">{{ t(ui.bhog, lang()) }}</div>
            <div class="v">{{ t(d.bhog, lang()) }}</div>
            @if (d.day <= 9) {
              <div class="small muted">{{ t(ui.rozBhog, lang()) }}</div>
            }
          </div>
          @if (d.phool; as phool) {
            <div class="card">
              <div class="k">{{ t(ui.phool, lang()) }}</div>
              <div class="v">{{ t(phool, lang()) }}</div>
              <div class="small muted">{{ t(ui.charnon, lang()) }}</div>
            </div>
          }
        </div>

        @if (d.alert; as alert) {
          <div class="callout callout--warn">{{ t(alert, lang()) }}</div>
        }

        @if (d.taiyari) {
          <div class="callout">
            <strong>{{ t(nav.taiyari.title, lang()) }}</strong>
            <ul>
              @for (item of nav.taiyari.list; track $index) {
                <li>{{ t(item, lang()) }}</li>
              }
            </ul>
            <a class="small" [routerLink]="link(lang(), '/navratri')" fragment="thali">
              {{ lang() === 'hi' ? 'थालियाँ कैसे सजाएँ →' : 'Thaliyan kaise sajayein →' }}
            </a>
          </div>
        }

        <ol class="steps">
          @for (step of d.steps; track $index; let n = $index) {
            <li class="step" [id]="'step-' + (n + 1)">
              <span class="step-num">{{ n + 1 }}</span>
              <div>
                <div class="step-head">
                  <h3>
                    {{ t(step.title, lang()) }}
                    @if (step.tag; as tag) {
                      <span class="tag">{{ t(tag, lang()) }}</span>
                    }
                  </h3>
                  <app-step-tick [id]="'/navratri/' + d.slug + ':' + (n + 1)" [label]="t(ui.stepDone, lang())" />
                </div>
                @if (step.body; as body) {
                  <p>{{ t(body, lang()) }}</p>
                }
                <app-blocks [blocks]="step.blocks" [lang]="lang()" />
                @if (step.note; as note) {
                  <p class="note">{{ t(note, lang()) }}</p>
                }
              </div>
            </li>
          }
        </ol>

        @if (d.after) {
          <div class="callout callout--ok">{{ t(nav.after, lang()) }}</div>
        }

        @if (d.closing; as closing) {
          <app-mantra [lines]="closing" cover />
        }

        @if (next(); as nx) {
          <a class="card card-link next-day" [routerLink]="link(lang(), '/navratri/' + nx.slug)">
            <strong>{{ t(ui.kal, lang()) }} — {{ t(ui.din, lang()) }} {{ nx.day }}: </strong>
            {{ t(nx.name, lang()) }}
            @if (nx.color.note) {
              · {{ t(ui.table.rang, lang()) }} {{ t(nx.color.name, lang()) }}
            }
            · {{ t(ui.bhog, lang()) }}: {{ t(nx.bhog, lang()) }} →
          </a>
        }

        <nav class="day-nav">
          @if (prev(); as pv) {
            <a class="btn btn-ghost" [routerLink]="link(lang(), '/navratri/' + pv.slug)">← {{ t(ui.din, lang()) }} {{ pv.day }}</a>
          } @else {
            <span></span>
          }
          <a class="btn btn-ghost" [routerLink]="link(lang(), '/navratri')">{{ t(ui.overview, lang()) }}</a>
          @if (next(); as nx) {
            <a class="btn btn-ghost" [routerLink]="link(lang(), '/navratri/' + nx.slug)">{{ t(ui.din, lang()) }} {{ nx.day }} →</a>
          } @else {
            <span></span>
          }
        </nav>
      </main>
    } @else {
      <app-not-found-page />
    }
  `,
})
export class DayPage {
  readonly lang = input.required<Lang>();
  /** URL ka `:day` hissa, jaise "din-8". */
  readonly day = input.required<string>();

  protected readonly nav = navratri;
  protected readonly d = computed(() => getDay(this.day()));
  private readonly index = computed(() => navratri.days.findIndex((x) => x.slug === this.day()));
  protected readonly prev = computed(() => navratri.days[this.index() - 1]);
  protected readonly next = computed(() => (this.index() >= 0 ? navratri.days[this.index() + 1] : undefined));

  protected readonly t = t;
  protected readonly ui = ui;
  protected readonly link = link;
  protected readonly htmlLang = htmlLang;
  protected readonly inkFor = inkFor;
  protected readonly dayLine = dayLine;

  constructor() {
    seo(() => {
      const d = this.d();
      if (!d) return null;
      const lang = this.lang();
      const name = t(d.name, lang);
      return {
        lang,
        path: `/navratri/${d.slug}`,
        title:
          lang === 'hi'
            ? `नवरात्रि दिन ${d.day}: ${name} की पूजा विधि, मंत्र, आरती | पूजा विधि`
            : `Navratri Din ${d.day}: ${name} ki Pooja Vidhi, Mantra, Aarti | Pooja Vidhi`,
        description: `${name} — ${t(d.about, lang)}`,
        crumbs: [
          { name: t(ui.siteName, lang), path: '/' },
          { name: lang === 'hi' ? 'नवरात्रि' : 'Navratri', path: '/navratri' },
          { name: `${t(ui.din, lang)} ${d.day}: ${name}`, path: `/navratri/${d.slug}` },
        ],
      };
    });
  }
}
