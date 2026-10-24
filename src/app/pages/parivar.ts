import { Component, computed, effect, inject, Injectable, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { content, getText } from '../core/content';
import { htmlLang, link, t, ui, type Lang } from '../core/i18n';
import { Store } from '../core/store';
import type { Text } from '../core/types';
import { exportKey, importKey, keyFor, unseal, type Sealed } from '../core/vault';
import { Listen } from '../components/listen';
import { TextBody } from '../components/text-body';
import { NotFoundPage } from './not-found';
import { seo } from './seo';

// /parivar/<devi> — Anuradha Paudwal wali aarti ke bol, sirf ghar walon ke liye (username + password).
// Bol `public/parivar.enc.json` mein taala-band hain (`npm run parivar` banata hai, core/vault.ts).
// Login pe browser khud kholta hai; "yaad rakhein" pe sirf chaabi (password nahi) localStorage mein.

/** slug → pad → panktiyan */
type Bol = Record<string, string[][]>;
const KEY = 'parivar-key';

/** Ek baar khula to saari aartiyan khuli — agli Devi pe dobara password na maange. */
@Injectable({ providedIn: 'root' })
class ParivarVault {
  private readonly store = inject(Store);
  private sealed?: Promise<Sealed>;
  readonly bol = signal<Bol | null>(null);

  private load() {
    // no-cache: password/bol badle to purani file na mile (GitHub Pages ~10 min cache karta hai)
    this.sealed ??= fetch(new URL('parivar.enc.json', document.baseURI), { cache: 'no-cache' }).then((r) => {
      if (!r.ok) throw new Error(`parivar.enc.json: ${r.status}`);
      return r.json() as Promise<Sealed>;
    });
    return this.sealed.catch((e) => {
      this.sealed = undefined;
      throw e;
    });
  }

  /** Pichhli baar "yaad rakhein" kiya tha to bina poochhe kholo. */
  async remembered() {
    const raw = this.store.get(KEY);
    if (!raw || this.bol()) return;
    try {
      this.bol.set(await unseal<Bol>(await this.load(), await importKey(raw)));
    } catch {
      this.store.set(KEY, null); // password badal gaya — purani chaabi bekaar
    }
  }

  async login(user: string, pass: string, remember: boolean) {
    const sealed = await this.load();
    const key = await keyFor(sealed, user, pass);
    this.bol.set(await unseal<Bol>(sealed, key)); // galat password → yahin error
    if (remember) this.store.set(KEY, await exportKey(key));
  }

  logout() {
    this.store.set(KEY, null);
    this.bol.set(null);
  }
}

/** Jin aartiyon ki recording ke bol alag hain (Anuradha Paudwal album) — Din ke kram mein. */
export const parivarSlugs = () =>
  Object.values(content.texts)
    .filter((x) => x.kind === 'aarti' && x.youtube && !x.youtube.sameText)
    .sort((a, b) => (a.day?.day ?? 99) - (b.day?.day ?? 99))
    .map((x) => x.slug);

@Component({
  selector: 'app-parivar-page',
  imports: [RouterLink, Listen, TextBody, NotFoundPage],
  template: `
    @if (text(); as text) {
      <main class="wrap" [attr.lang]="htmlLang(lang())">
        <section class="hero">
          <p class="kicker">🔒 {{ hi() ? 'परिवार के लिए' : 'Parivar ke liye' }}</p>
          <h1>{{ t(text.title, lang()) }}</h1>
          <p class="muted">{{ text.youtube?.by }} · Nav Durga Aarti</p>
        </section>

        @if (bol(); as bol) {
          @if (text.youtube; as yt) {
            <app-listen [id]="yt.id" [by]="yt.by" [sameText]="true" [title]="t(text.title, lang())" [lang]="lang()" />
          }
          <div class="parivar-bol">
            <app-text-body [text]="bol" [lang]="lang()" />
          </div>
          <p class="center small">
            <button type="button" class="link-btn" (click)="vault.logout()">
              🔒 {{ hi() ? 'इस फ़ोन से लॉग आउट' : 'Is phone se logout' }}
            </button>
          </p>
        } @else if (vault.bol()) {
          <p class="callout">{{ hi() ? 'इस आरती के बोल अभी नहीं जोड़े गए।' : 'Is aarti ke bol abhi nahi jode gaye.' }}</p>
        } @else if (!store.ready() || checking()) {
          <p class="center muted">{{ hi() ? 'खुल रहा है…' : 'Khul raha hai…' }}</p>
        } @else {
          <!-- Form sirf browser mein (hydration ke baad) — warna JS se pehle Enter dabane pe password URL mein chala jaata -->
          <form class="card vault" (submit)="submit($event)">
            <p>
              {{
                hi()
                  ? 'अनुराधा पौडवाल जी वाले बोल सिर्फ़ परिवार के लिए हैं — username और password डालिए।'
                  : 'Anuradha Paudwal ji wale bol sirf parivar ke liye hain — username aur password daaliye.'
              }}
            </p>
            <label>
              Username
              <input name="user" autocomplete="username" autocapitalize="none" spellcheck="false" required />
            </label>
            <label>
              Password
              <input name="pass" type="password" autocomplete="current-password" required />
            </label>
            <label class="check">
              <input type="checkbox" name="remember" checked />
              {{ hi() ? 'इस फ़ोन पर याद रखें' : 'Is phone pe yaad rakhein' }}
            </label>
            @if (error(); as error) {
              <p class="vault-error" role="alert">{{ error }}</p>
            }
            <button class="btn" [disabled]="busy()">
              {{ busy() ? (hi() ? 'खुल रहा है…' : 'Khul raha hai…') : hi() ? 'खोलिए' : 'Kholiye' }}
            </button>
          </form>
        }

        <nav class="day-nav">
          @if (prev(); as p) {
            <a class="btn btn-ghost" [routerLink]="link(lang(), '/parivar/' + p.slug)">← {{ t(p.title, lang()) }}</a>
          }
          <a class="btn btn-ghost" [routerLink]="link(lang(), '/aarti/' + text.slug)">
            {{ hi() ? 'पारंपरिक आरती' : 'Paramparik aarti' }}
          </a>
          @if (next(); as n) {
            <a class="btn btn-ghost" [routerLink]="link(lang(), '/parivar/' + n.slug)">{{ t(n.title, lang()) }} →</a>
          }
        </nav>
      </main>
    } @else {
      <app-not-found-page />
    }
  `,
})
export class ParivarPage {
  readonly lang = input.required<Lang>();
  readonly slug = input.required<string>();

  protected readonly vault = inject(ParivarVault);
  protected readonly store = inject(Store);
  /** Yaad rakhi chaabi se khol rahe hain (form abhi mat dikhao). */
  protected readonly checking = signal(false);
  /** Login button dabaya — form wahi rahe, taaki galat password pe dobara type na karna pade. */
  protected readonly busy = signal(false);
  protected readonly error = signal('');

  protected readonly hi = computed(() => this.lang() === 'hi');
  protected readonly text = computed(() => (parivarSlugs().includes(this.slug()) ? getText('aarti', this.slug()) : undefined));

  /** Khule bol ko aarti jaisa hi dikhao — wahi TextBody, wahi design. */
  protected readonly bol = computed((): Text | null => {
    const pads = this.vault.bol()?.[this.slug()];
    const text = this.text();
    if (!pads || !text) return null;
    return {
      kind: 'aarti',
      slug: text.slug,
      status: 'draft',
      title: text.title,
      parts: [{ verses: pads }],
      note: {
        hinglish: 'Ye bol recording sunkar computer (Whisper) ne likhe hain — kuch shabd galat ho sakte hain.',
        hi: 'ये बोल रिकॉर्डिंग सुनकर कंप्यूटर (Whisper) ने लिखे हैं — कुछ शब्द गलत हो सकते हैं।',
      },
    };
  });

  private readonly around = computed(() => {
    const list = parivarSlugs();
    const i = list.indexOf(this.slug());
    const at = (j: number) => (list[j] ? getText('aarti', list[j]) : undefined);
    return { prev: at(i - 1), next: at(i + 1) };
  });
  protected readonly prev = computed(() => this.around().prev);
  protected readonly next = computed(() => this.around().next);

  protected readonly t = t;
  protected readonly link = link;
  protected readonly htmlLang = htmlLang;

  constructor() {
    effect(() => {
      if (!this.store.ready()) return;
      untracked(() => {
        this.checking.set(true);
        this.vault.remembered().finally(() => this.checking.set(false));
      });
    });

    seo(() => {
      const text = this.text();
      if (!text) return null;
      const lang = this.lang();
      return {
        lang,
        path: `/parivar/${text.slug}`,
        title: `${t(text.title, lang)} — Anuradha Paudwal | ${t(ui.siteName, lang)}`,
        noindex: true, // ghar ka page — Google pe nahi
      };
    });
  }

  protected async submit(event: SubmitEvent) {
    event.preventDefault();
    const form = new FormData(event.target as HTMLFormElement);
    this.error.set('');
    this.busy.set(true);
    try {
      await this.vault.login(String(form.get('user')), String(form.get('pass')), form.get('remember') !== null);
    } catch (e) {
      const offline = e instanceof TypeError || String(e).includes('parivar.enc.json');
      this.error.set(
        offline
          ? this.hi() ? 'फ़ाइल नहीं मिली — इंटरनेट देखिए।' : 'File nahi mili — internet check kijiye.'
          : this.hi() ? 'गलत username या password।' : 'Galat username ya password.',
      );
    } finally {
      this.busy.set(false);
    }
  }
}
