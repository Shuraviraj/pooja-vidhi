import { Component, input } from '@angular/core';
import { t, type Lang } from '../core/i18n';
import type { Plate as PlateData } from '../core/types';

// Gol thali (ya laal kapde wali chowki) ki tasveer. Har cheez apni jagah pe
// (x, y content se) naam ke saath. Tasveerein public/art/<naam>.svg mein hain —
// asli photo lagani ho to bas wahi file badal do.

@Component({
  selector: 'app-plate',
  template: `
    @let p = plate();
    <figure class="plate-fig">
      @if (p.caption; as cap) {
        <figcaption class="plate-cap">{{ t(cap, lang()) }}</figcaption>
      }
      <div class="plate plate--{{ p.style }}">
        @for (s of p.items; track $index) {
          <div class="spot" [style.left.%]="s.x" [style.top.%]="s.y" [style.width.%]="s.size">
            <img [src]="'art/' + s.art + '.svg'" alt="" width="64" height="64" decoding="async" />
            <span class="spot-label">
              {{ t(s.name, lang()) }}
              @if (s.note; as note) {
                <small>{{ t(note, lang()) }}</small>
              }
            </span>
          </div>
        }
      </div>
      @if (p.beside.length) {
        @if (p.besideLabel; as bl) {
          <p class="beside-label">{{ t(bl, lang()) }}</p>
        }
        <div class="beside">
          @for (s of p.beside; track $index) {
            <div class="bspot">
              <img [src]="'art/' + s.art + '.svg'" alt="" width="64" height="64" decoding="async" />
              <b>{{ t(s.name, lang()) }}</b>
              @if (s.note; as note) {
                <small>{{ t(note, lang()) }}</small>
              }
            </div>
          }
        </div>
      }
    </figure>
  `,
})
export class Plate {
  readonly plate = input.required<PlateData>();
  readonly lang = input.required<Lang>();

  protected readonly t = t;
}
