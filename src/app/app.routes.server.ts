import { RenderMode, ServerRoute } from '@angular/ssr';
import { navratri, textIds } from './core/content';

// Build ke time kaunse pages ka HTML banana hai (prerender / SSG).
// Params wale routes ke liye saari values yahin se aati hain.

const days = async () => navratri.days.map((d) => ({ day: d.slug }));
const texts = (kind: 'aarti' | 'chalisa') => async () => textIds(kind).map((slug) => ({ slug }));

export const serverRoutes: ServerRoute[] = [
  ...['', 'hi/'].flatMap((prefix): ServerRoute[] => [
    { path: `${prefix}navratri/:day`, renderMode: RenderMode.Prerender, getPrerenderParams: days },
    { path: `${prefix}aarti/:slug`, renderMode: RenderMode.Prerender, getPrerenderParams: texts('aarti') },
    { path: `${prefix}chalisa/:slug`, renderMode: RenderMode.Prerender, getPrerenderParams: texts('chalisa') },
  ]),
  { path: '**', renderMode: RenderMode.Prerender },
];
