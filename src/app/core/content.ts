import data from '../../generated/content.json';
import type { Content, Day, Text } from './types';

// `npm run content` ka banaya JSON — build ke time hi app mein jud jaata hai.
export const content = data as unknown as Content;

export const navratri = content.navratri;

export const getDay = (slug: string): Day | undefined => navratri.days.find((d) => d.slug === slug);

export const getText = (kind: string, slug: string): Text | undefined => content.texts[`${kind}-${slug}`];

/** Aarti/chalisa ka URL path: "aarti-ganesh" → "/aarti/ganesh" */
export const textPath = (id: string) => {
  const text = content.texts[id];
  return `/${text.kind}/${text.slug}`;
};

export const textIds = (kind: Text['kind']) =>
  Object.values(content.texts)
    .filter((x) => x.kind === kind)
    .map((x) => x.slug);
