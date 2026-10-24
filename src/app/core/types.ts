// content.json ka shape — scripts/build-content.mts yahi banata hai,
// aur poora Angular app isi ko padhta hai.

/** Ek string jo dono languages mein likhi ho. */
export type L = { hinglish: string; hi: string };

export type Status = 'draft' | 'verified';

/** Thali/chowki ki ek cheez — `art` = public/art/<art>.svg */
export type Spot = { art: string; name: L; note?: L };

/** Gol thali ki tasveer: `items` andar (x, y, size % mein), `beside` bagal mein. */
export type Plate = {
  style: 'cloth' | 'brass';
  caption?: L;
  items: (Spot & { x: number; y: number; size: number })[];
  besideLabel?: L;
  beside: Spot[];
};

/** Content ka ek tukda. `type` dekhkar template sahi HTML banata hai. */
export type Block =
  | { type: 'p'; text: L }
  | { type: 'label'; text: L }
  | { type: 'mantra'; lines: string[]; big?: boolean }
  | { type: 'table'; rows: { a: L; m: string }[] }
  | { type: 'list'; items: L[] }
  | { type: 'ordered'; items: L[] }
  | { type: 'callout'; text: L; title?: L; tone: 'info' | 'warn' | 'ok' }
  | { type: 'aartis'; ids: string[] }
  | { type: 'cards'; items: { title: L; body: L; plate?: Plate }[] }
  | { type: 'timetable'; rows: { time: string; text: L }[] }
  | { type: 'plate'; plate: Plate };

export type Step = { title: L; tag?: L; body?: L; note?: L; blocks: Block[] };

export type Text = {
  kind: 'aarti' | 'chalisa';
  slug: string;
  status: Status;
  title: L;
  subtitle?: L;
  top?: string[];
  refrain?: string;
  parts: { heading?: string; numbered?: boolean; boxed?: boolean; verses: string[][] }[];
  closing?: string[];
  note?: L;
};

export type Day = {
  day: number;
  slug: string;
  tithi: L;
  name: L;
  color: { name: L; hex: string; note?: L };
  bhog: L;
  phool?: L;
  about: L;
  alert?: L;
  taiyari: boolean;
  after: boolean;
  steps: Step[];
  closing?: string[];
};

export type Navratri = {
  status: Status;
  title: L;
  subtitle: L;
  when: L;
  pdf: L;
  cover: string[];
  glance: L[];
  chartNote: L;
  chartFooter: L[];
  sections: { id: string; title: L; subtitle?: L; blocks: Block[] }[];
  days: Day[];
  taiyari: { title: L; list: L[] };
  after: L;
};

export type Content = { site: { url: string; description: L }; texts: Record<string, Text>; navratri: Navratri };
