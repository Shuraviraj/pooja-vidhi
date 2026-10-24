import { Component, input } from '@angular/core';
import { ui, type Lang } from '../core/i18n';

/** "Jaanch baaki" — jab tak content `status: verified` na ho. */
@Component({
  selector: 'app-draft-note',
  template: `
    <p class="small muted draft-note">
      <span class="badge">{{ ui.draft[lang()] }}</span> {{ ui.draftNote[lang()] }}
    </p>
  `,
})
export class DraftNote {
  readonly lang = input.required<Lang>();
  protected readonly ui = ui;
}
