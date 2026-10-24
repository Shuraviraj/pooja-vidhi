import { Component, ElementRef, input, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';

// Aarti ka button: tap karne pe neeche se sheet khulti hai (native <dialog>).
// Band karne pe page wahi rehta hai jahan tha — pooja mein jagah nahi khoti.
// Sheet ke andar kya dikhe, wo <ng-content> se aata hai.

@Component({
  selector: 'app-aarti-sheet',
  imports: [RouterLink],
  template: `
    <button type="button" class="aarti-open" (click)="open()">{{ title() }}</button>
    <dialog #dlg class="sheet" [attr.aria-label]="title()" (click)="closeOnBackdrop($event)">
      <div class="sheet-bar">
        <strong>{{ title() }}</strong>
        <button type="button" class="rb-btn" (click)="dlg.close()">✕ {{ closeLabel() }}</button>
      </div>
      <div class="sheet-body">
        <ng-content />
        <p class="center small sheet-more">
          <a [routerLink]="href()">{{ fullLabel() }} →</a>
        </p>
      </div>
    </dialog>
  `,
})
export class AartiSheet {
  readonly title = input.required<string>();
  readonly href = input.required<string>();
  readonly closeLabel = input.required<string>();
  readonly fullLabel = input.required<string>();

  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dlg');

  open() {
    this.dialog().nativeElement.showModal();
  }

  /** Bahar (backdrop) pe tap karne se bhi band ho jaaye. */
  closeOnBackdrop(event: MouseEvent) {
    if (event.target === event.currentTarget) this.dialog().nativeElement.close();
  }
}
