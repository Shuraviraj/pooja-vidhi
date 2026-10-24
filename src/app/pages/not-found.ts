import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <main class="wrap hero">
      <h1>404</h1>
      <p class="muted">Ye page nahi mila · यह पृष्ठ नहीं मिला</p>
      <p class="sheet-more"><a class="btn" routerLink="/">Home</a></p>
    </main>
  `,
})
export class NotFoundPage {}
