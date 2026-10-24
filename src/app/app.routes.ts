import { Routes } from '@angular/router';
import type { Lang } from './core/i18n';
import { DayPage } from './pages/day';
import { HomePage } from './pages/home';
import { NavratriPage } from './pages/navratri';
import { NotFoundPage } from './pages/not-found';
import { TextPage } from './pages/text';

// Dono languages ke same pages — sirf `data.lang` alag. Route ka data aur
// URL params (`:day`, `:slug`) seedhe component ke input() ban jaate hain.
const pages = (lang: Lang): Routes => [
  { path: '', component: HomePage, data: { lang } },
  { path: 'navratri', component: NavratriPage, data: { lang } },
  { path: 'navratri/:day', component: DayPage, data: { lang } },
  { path: 'aarti/:slug', component: TextPage, data: { lang, kind: 'aarti' } },
  { path: 'chalisa/:slug', component: TextPage, data: { lang, kind: 'chalisa' } },
];

export const routes: Routes = [
  { path: 'hi', children: pages('hi') },
  ...pages('hinglish'),
  { path: '**', component: NotFoundPage },
];
