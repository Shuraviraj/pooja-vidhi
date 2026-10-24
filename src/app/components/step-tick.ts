import { Component, computed, inject, input } from '@angular/core';
import { Store } from '../core/store';

// Step ke saamne "Ho gaya" button. Tick sirf aaj ke liye yaad rehta hai —
// kal wahi page khologe to saare steps phir se khaali milenge.

@Component({
  selector: 'app-step-tick',
  template: `
    <button type="button" class="tick" [attr.aria-pressed]="done()" [disabled]="!store.ready()" (click)="toggle()">
      {{ done() ? '✓' : '○' }} {{ label() }}
    </button>
  `,
})
export class StepTick {
  readonly id = input.required<string>();
  readonly label = input.required<string>();

  protected readonly store = inject(Store);
  private readonly key = computed(() => `tick:${this.store.today()}:${this.id()}`);
  protected readonly done = computed(() => this.store.get(this.key()) === '1');

  toggle() {
    this.store.set(this.key(), this.done() ? null : '1');
  }
}
