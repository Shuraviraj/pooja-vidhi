import { Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import type { Lang } from '../core/i18n';

// "▶ Aarti suniye" — pehle sirf chhoti tasveer + button (page halka rahe, YouTube ka bhaari
// player tabhi aaye jab koi sunna chahe). Tap karte hi player wahin chalta hai aur upar
// chipka rehta hai (sticky), taaki sunte-sunte neeche bol padhte ja sakein.
// youtube-nocookie.com = bina tracking cookie wala YouTube player.

@Component({
  selector: 'app-listen',
  imports: [RouterLink],
  template: `
    @if (playing()) {
      <div class="yt">
        <iframe
          [src]="src()"
          [title]="title()"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowfullscreen
        ></iframe>
      </div>
    } @else {
      <button type="button" class="listen" (click)="playing.set(true)">
        <img [src]="'https://i.ytimg.com/vi/' + id() + '/mqdefault.jpg'" alt="" width="96" height="54" loading="lazy" />
        <span>
          <b>▶ {{ hi() ? 'आरती सुनिए' : 'Aarti suniye' }}@if (by(); as by) { — {{ by }} }</b>
          <small>
            @if (sameText()) {
              {{ hi() ? 'YouTube पर · बोल नीचे पढ़ते जाइए' : 'YouTube pe · bol neeche padhte jaaiye' }}
            } @else {
              {{
                hi()
                  ? 'YouTube पर · इस रिकॉर्डिंग की धुन और बोल अलग हैं — नीचे पारंपरिक आरती है'
                  : 'YouTube pe · is recording ki dhun aur bol alag hain — neeche paramparik aarti hai'
              }}
            }
          </small>
        </span>
      </button>
    }
    <a class="listen-app" [href]="'https://www.youtube.com/watch?v=' + id()" target="_blank" rel="noopener">
      {{ hi() ? 'YouTube ऐप में खोलें ↗' : 'YouTube app mein kholein ↗' }}
    </a>
    @if (lyricsHref(); as href) {
      <a class="listen-lyrics" [routerLink]="href">
        🔒 {{ by() ?? 'Recording' }} {{ hi() ? 'जी वाले बोल — परिवार के लिए' : 'ji wale bol — parivar ke liye' }} →
      </a>
    }
  `,
})
export class Listen {
  /** YouTube video id — content schema 11 akshar check karta hai, isliye URL mein seedha daalna safe hai. */
  readonly id = input.required<string>();
  readonly title = input.required<string>();
  readonly lang = input.required<Lang>();
  readonly by = input<string>();
  /** Recording mein wahi bol hain jo page pe? Nahi to label saaf-saaf batata hai. */
  readonly sameText = input(true);
  /** Recording wale bol ka (password wala) page — sirf jab bol alag hon. */
  readonly lyricsHref = input<string>();

  private readonly sanitizer = inject(DomSanitizer);
  protected readonly playing = signal(false);
  protected readonly hi = computed(() => this.lang() === 'hi');
  protected readonly src = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube-nocookie.com/embed/${this.id()}?autoplay=1&rel=0&playsinline=1`,
    ),
  );
}
