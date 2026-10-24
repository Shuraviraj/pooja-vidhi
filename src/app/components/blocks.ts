import { Component, input } from '@angular/core';
import { content, textPath } from '../core/content';
import { link, t, ui, type Lang } from '../core/i18n';
import type { Block } from '../core/types';
import { AartiSheet } from './aarti-sheet';
import { Listen } from './listen';
import { Mantra } from './mantra';
import { Plate } from './plate';
import { TextBody } from './text-body';

/** Content ke har "block" (mantra, table, list, callout, thali…) ko HTML mein badalta hai. */
@Component({
  selector: 'app-blocks',
  imports: [AartiSheet, Listen, Mantra, Plate, TextBody],
  template: `
    @for (block of blocks(); track $index) {
      @switch (block.type) {
        @case ('p') {
          <p class="para">{{ t(block.text, lang()) }}</p>
        }
        @case ('label') {
          <p class="label">{{ t(block.text, lang()) }}</p>
        }
        @case ('mantra') {
          <app-mantra [lines]="block.lines" [big]="block.big ?? false" />
        }
        @case ('table') {
          <table class="offer">
            <tbody>
              @for (row of block.rows; track $index) {
                <tr>
                  <td>{{ t(row.a, lang()) }}</td>
                  <td lang="sa">{{ row.m }}</td>
                </tr>
              }
            </tbody>
          </table>
        }
        @case ('list') {
          <ul class="bullets">
            @for (item of block.items; track $index) {
              <li>{{ t(item, lang()) }}</li>
            }
          </ul>
        }
        @case ('ordered') {
          <ol class="numbers">
            @for (item of block.items; track $index) {
              <li>{{ t(item, lang()) }}</li>
            }
          </ol>
        }
        @case ('callout') {
          <div class="callout callout--{{ block.tone }}">
            @if (block.title; as title) {
              <strong>{{ t(title, lang()) }}</strong>
            }
            {{ t(block.text, lang()) }}
          </div>
        }
        @case ('aartis') {
          <ol class="aarti-list">
            @for (id of block.ids; track id) {
              @let text = texts[id];
              <li>
                <app-aarti-sheet
                  [title]="t(text.title, lang())"
                  [href]="link(lang(), textPath(id))"
                  [closeLabel]="t(ui.close, lang())"
                  [fullLabel]="t(ui.fullPage, lang())"
                >
                  @if (text.youtube; as yt) {
                    <app-listen
                      [id]="yt.id"
                      [by]="yt.by"
                      [sameText]="yt.sameText"
                      [title]="t(text.title, lang())"
                      [lang]="lang()"
                    />
                  }
                  <app-text-body [text]="text" [lang]="lang()" />
                </app-aarti-sheet>
              </li>
            }
          </ol>
        }
        @case ('cards') {
          <div class="cards">
            @for (card of block.items; track $index) {
              <div class="card">
                @if (card.plate; as plate) {
                  <app-plate [plate]="plate" [lang]="lang()" />
                }
                <div>
                  <h4>{{ t(card.title, lang()) }}</h4>
                  <p>{{ t(card.body, lang()) }}</p>
                </div>
              </div>
            }
          </div>
        }
        @case ('timetable') {
          <div class="timetable">
            @for (row of block.rows; track row.time) {
              <div>
                <b>{{ row.time }} {{ lang() === 'hi' ? 'मिनट' : 'min' }}</b>
                <span>{{ t(row.text, lang()) }}</span>
              </div>
            }
          </div>
        }
        @case ('plate') {
          <app-plate [plate]="block.plate" [lang]="lang()" />
        }
      }
    }
  `,
})
export class Blocks {
  readonly blocks = input.required<Block[]>();
  readonly lang = input.required<Lang>();

  protected readonly texts = content.texts;
  protected readonly t = t;
  protected readonly link = link;
  protected readonly textPath = textPath;
  protected readonly ui = ui;
}
