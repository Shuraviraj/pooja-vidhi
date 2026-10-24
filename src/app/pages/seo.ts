import { DOCUMENT, effect, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { content } from '../core/content';
import { htmlLang, link, t, ui, type Lang } from '../core/i18n';

// Har page ke liye search (Google) aur WhatsApp-share wale tags. Prerender ke time
// ye sab HTML mein likh jaate hain — crawler ko JavaScript chalani nahi padti.

export type PageSeo = {
  lang: Lang;
  /** Language ke bina path, jaise "/navratri/din-1" (Hindi wala "/hi/..." apne-aap banta hai). */
  path: string;
  title: string;
  description?: string;
  /** Google results mein "Home › Navratri › …" dikhane ke liye (BreadcrumbList structured data). */
  crumbs?: { name: string; path: string }[];
  /** Google pe na aaye (jaise parivar wala page). */
  noindex?: boolean;
};

const SITE = content.site.url;

/** GitHub Pages har page ko folder/index.html se deta hai — isliye canonical URL "/" pe khatam. */
export const pageUrl = (lang: Lang, path: string) => {
  const p = link(lang, path);
  return SITE + (p.endsWith('/') ? p : `${p}/`);
};

/** Lambi line ko ~160 akshar pe kaato (Google itna hi dikhata hai). */
const clip = (s: string, max = 160) => (s.length <= max ? s : `${s.slice(0, max - 1).replace(/\s+\S*$/, '')}…`);

export function seo(compute: () => PageSeo | null) {
  const title = inject(Title);
  const meta = inject(Meta);
  const doc = inject(DOCUMENT);

  /** <link rel=…> head mein ek hi baar — na ho to banao, ho to href badlo. */
  const setLink = (rel: string, href: string, hreflang?: string) => {
    const sel = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]`;
    let el = doc.head.querySelector<HTMLLinkElement>(sel);
    if (!el) {
      el = doc.createElement('link');
      el.rel = rel;
      if (hreflang) el.hreflang = hreflang;
      doc.head.appendChild(el);
    }
    el.href = href;
  };

  /** <script type="application/ld+json"> — Google ke liye page ki "structure" (JSON-LD). */
  const setJsonLd = (data: object | null) => {
    let el = doc.head.querySelector<HTMLScriptElement>('script[type="application/ld+json"]');
    if (!data) return el?.remove();
    if (!el) {
      el = doc.createElement('script');
      el.type = 'application/ld+json';
      doc.head.appendChild(el);
    }
    el.textContent = JSON.stringify(data);
  };

  effect(() => {
    const p = compute();
    if (!p) {
      title.setTitle('404');
      meta.updateTag({ name: 'robots', content: 'noindex' });
      return;
    }
    const description = clip(p.description ?? t(content.site.description, p.lang));
    const url = pageUrl(p.lang, p.path);

    title.setTitle(p.title);
    doc.documentElement.lang = htmlLang(p.lang);
    // Ek page se doosre pe jaane pe (bina reload) pichhle page ka "noindex" na chipka rahe
    if (p.noindex) meta.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    else meta.removeTag('name="robots"');
    meta.updateTag({ name: 'description', content: description });
    meta.updateTag({ property: 'og:type', content: 'website' });
    meta.updateTag({ property: 'og:site_name', content: t(ui.siteName, p.lang) });
    meta.updateTag({ property: 'og:title', content: p.title });
    meta.updateTag({ property: 'og:description', content: description });
    meta.updateTag({ property: 'og:url', content: url });
    meta.updateTag({ property: 'og:image', content: `${SITE}/og.png` });
    meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });

    // Ek hi page do bhasha mein hai — Google ko batao taaki dono alag-alag "duplicate" na lagen.
    setLink('canonical', url);
    setLink('alternate', pageUrl('hinglish', p.path), 'hi-Latn');
    setLink('alternate', pageUrl('hi', p.path), 'hi');
    setLink('alternate', pageUrl('hinglish', p.path), 'x-default');

    setJsonLd(
      p.crumbs?.length
        ? {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: p.crumbs.map((c, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: c.name,
              item: pageUrl(p.lang, c.path),
            })),
          }
        : null,
    );
  });
}
