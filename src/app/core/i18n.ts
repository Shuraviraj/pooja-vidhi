import type { L } from './types';

export type Lang = 'hinglish' | 'hi';
export type { L };

export const t = (s: L, lang: Lang) => s[lang];

/** Router link language ke hisaab se: Hinglish root pe, Shuddh Hindi `/hi` ke neeche. */
export const link = (lang: Lang, path: string) =>
  lang === 'hi' ? (path === '/' ? '/hi' : `/hi${path}`) : path;

/** HTML `lang` attribute: Hinglish = Hindi bhasha, Latin lipi. */
export const htmlLang = (lang: Lang) => (lang === 'hinglish' ? 'hi-Latn' : 'hi');

/** Chhote UI labels jo content files mein nahi hain. */
export const ui = {
  siteName: { hinglish: 'Pooja Vidhi', hi: 'पूजा विधि' },
  tagline: {
    hinglish: 'Ghar ki pooja — saaf vidhi, sahi mantra, bina ads',
    hi: 'घर की पूजा — स्पष्ट विधि, शुद्ध मंत्र, बिना विज्ञापन',
  },
  poojayein: { hinglish: 'Poojayein', hi: 'पूजाएँ' },
  din: { hinglish: 'Din', hi: 'दिन' },
  rang: { hinglish: 'Aaj ka rang', hi: 'आज का रंग' },
  bhog: { hinglish: 'Bhog', hi: 'भोग' },
  phool: { hinglish: 'Phool', hi: 'फूल' },
  rozBhog: {
    hinglish: '+ roz wala: mishri/kishmish, ek fal, jal',
    hi: '+ रोज़ वाला: मिश्री/किशमिश, एक फल, जल',
  },
  charnon: { hinglish: 'Mata ke charnon mein', hi: 'माता के चरणों में' },
  kal: { hinglish: 'Kal', hi: 'कल' },
  pichhla: { hinglish: 'Pichhla din', hi: 'पिछला दिन' },
  agla: { hinglish: 'Agla din', hi: 'अगला दिन' },
  overview: { hinglish: 'Navratri overview', hi: 'नवरात्रि मुखपृष्ठ' },
  pehlePadh: { hinglish: 'Pehle ek baar padh lein', hi: 'पहले एक बार पढ़ लें' },
  naunDin: { hinglish: 'Naun din', hi: 'नौ दिन' },
  pdf: { hinglish: 'PDF download karein', hi: 'PDF डाउनलोड करें' },
  draft: { hinglish: 'Jaanch baaki', hi: 'जाँच बाकी' },
  draftNote: {
    hinglish: 'Ye content abhi test nahi hua — ek baar milaa lein.',
    hi: 'यह सामग्री अभी जाँची नहीं गई — एक बार मिला लें।',
  },
  close: { hinglish: 'Band karein', hi: 'बंद करें' },
  fullPage: { hinglish: 'Poora page kholein', hi: 'पूरा पृष्ठ खोलें' },
  screenOn: { hinglish: 'Screen ON', hi: 'स्क्रीन ऑन' },
  diyaMode: { hinglish: 'Diya mode', hi: 'दीया मोड' },
  home: { hinglish: 'Home', hi: 'मुखपृष्ठ' },
  stepDone: { hinglish: 'Ho gaya', hi: 'हो गया' },
  table: {
    din: { hinglish: 'Din', hi: 'दिन' },
    devi: { hinglish: 'Devi', hi: 'देवी' },
    rang: { hinglish: 'Rang', hi: 'रंग' },
    bhog: { hinglish: 'Aaj ka extra bhog', hi: 'आज का अतिरिक्त भोग' },
  },
} satisfies Record<string, L | Record<string, L>>;
