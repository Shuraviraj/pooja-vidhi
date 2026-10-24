import { Component, input } from '@angular/core';
import { htmlLang, t, type Lang } from '../core/i18n';
import type { Text } from '../core/types';
import { DraftNote } from './draft-note';

/** Aarti / chalisa ke bol. Sheet aur poore page — dono jagah yahi use hota hai. */
@Component({
  selector: 'app-text-body',
  imports: [DraftNote],
  template: `
    <div class="lyrics" lang="hi">
      @if (text().status === 'draft') {
        <app-draft-note [lang]="lang()" />
      }
      @for (line of text().top ?? []; track line) {
        <p class="top">{{ line }}</p>
      }
      @for (part of text().parts; track $index) {
        <section [class.boxed]="part.boxed">
          @if (part.heading) {
            <h4>{{ part.heading }}</h4>
          }
          @for (verse of part.verses; track $index; let vi = $index, first = $first, last = $last) {
            <div class="verse" [class.first]="!part.numbered && first" [class.last]="!part.numbered && last">
              @for (line of verse; track $index; let li = $index) {
                <p>
                  @if (part.numbered && li === 0) {
                    <span class="num">{{ vi + 1 }}</span>
                  }
                  {{ line }}
                </p>
              }
              @if (text().refrain; as refrain) {
                <p class="refrain">{{ refrain }}</p>
              }
            </div>
          }
        </section>
      }
      @for (line of text().closing ?? []; track line) {
        <p class="closing">{{ line }}</p>
      }
      @if (text().note; as note) {
        <div class="callout" [attr.lang]="htmlLang(lang())">{{ t(note, lang()) }}</div>
      }
    </div>
  `,
})
export class TextBody {
  readonly text = input.required<Text>();
  readonly lang = input.required<Lang>();
  protected readonly t = t;
  protected readonly htmlLang = htmlLang;
}
