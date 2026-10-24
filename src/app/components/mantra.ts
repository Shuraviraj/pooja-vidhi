import { booleanAttribute, Component, input } from '@angular/core';

@Component({
  selector: 'app-mantra',
  template: `
    <div class="mantra" [class.mantra--big]="big()" [class.cover-mantra]="cover()" lang="sa">
      @for (line of lines(); track $index) {
        <p>{{ line }}</p>
      }
    </div>
  `,
})
export class Mantra {
  readonly lines = input.required<string[]>();
  readonly big = input(false, { transform: booleanAttribute });
  readonly cover = input(false, { transform: booleanAttribute });
}
