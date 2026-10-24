import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ReaderBar } from './components/reader-bar';
import { SiteHeader } from './components/site-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SiteHeader, ReaderBar],
  template: `
    <app-site-header />
    <router-outlet />
    <footer class="site-footer">॥ जय माता दी ॥</footer>
    <app-reader-bar />
  `,
})
export class App {}
