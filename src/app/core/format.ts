import { t, type Lang } from './i18n';
import type { Day } from './types';

/** Halke rang (safed, peela) pe kaala text, gehre rang pe safed. */
export function inkFor(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 160 ? '#2b1a12' : '#ffffff';
}

/** "Navratri ka din 1 · Ashwin Shukla Pratipada" — har saal same, koi tareekh nahi. */
export function dayLine(day: Day, lang: Lang) {
  const nav = lang === 'hi' ? `नवरात्रि का दिन ${day.day}` : `Navratri ka din ${day.day}`;
  const tithi = (lang === 'hi' ? 'आश्विन शुक्ल ' : 'Ashwin Shukla ') + t(day.tithi, lang);
  return [day.day <= 9 ? nav : null, tithi].filter(Boolean).join(' · ');
}
