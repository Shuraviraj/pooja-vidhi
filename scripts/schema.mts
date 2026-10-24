import { z } from "zod";

// Har content file ka "shape" yahan likha hai. Build ke time har YAML isse
// check hoti hai — kuch chhoot gaya ya galat likha to build wahi ruk jaata hai.

export const L = z.object({ hinglish: z.string().min(1), hi: z.string().min(1) }).strict();

export const Status = z.enum(["draft", "verified"]);

/** Mantra ki lines (sirf Devanagari). `$dhyan`, `$mool`, `$stuti` din ke hisaab se bharte hain. */
const MantraRef = z.string().min(1);

/** Thali/chowki ki ek cheez. `art` = public/art/<art>.svg ki tasveer. */
const Spot = z.object({ art: z.string().min(1), name: L, note: L.optional() }).strict();

/**
 * Gol thali (ya laal kapde wali chowki) ki tasveer. `items` thali ke andar —
 * x, y = beech ka point (% mein, 0–100), size = chaudai (%). `beside` thali ke bagal/neeche.
 */
export const Plate = z
  .object({
    style: z.enum(["cloth", "brass"]),
    caption: L.optional(),
    items: z.array(
      Spot.extend({
        x: z.number().min(0).max(100),
        y: z.number().min(0).max(100),
        size: z.number().min(5).max(60).default(22),
      }).strict(),
    ),
    besideLabel: L.optional(),
    beside: z.array(Spot).default([]),
  })
  .strict();
export type Plate = z.infer<typeof Plate>;

export const Block = z.union([
  z.object({ p: L }).strict(),
  z.object({ label: L }).strict(),
  z.object({ mantra: MantraRef, big: z.boolean().optional() }).strict(),
  z.object({ table: z.array(z.object({ a: L, m: z.string() }).strict()) }).strict(),
  z.object({ list: z.array(L) }).strict(),
  z.object({ ordered: z.array(L) }).strict(),
  z
    .object({
      callout: L,
      title: L.optional(),
      tone: z.enum(["info", "warn", "ok"]).default("info"),
    })
    .strict(),
  z.object({ aartis: z.array(z.string()) }).strict(),
  z.object({ cards: z.array(z.object({ title: L, body: L, plate: Plate.optional() }).strict()) }).strict(),
  z.object({ timetable: z.array(z.object({ time: z.string(), text: L }).strict()) }).strict(),
  z.object({ plate: Plate }).strict(),
]);
export type Block = z.infer<typeof Block>;

export const Step = z
  .object({
    title: L,
    tag: L.optional(),
    body: L.optional(),
    blocks: z.array(Block).default([]),
    note: L.optional(),
  })
  .strict();
export type Step = z.infer<typeof Step>;

/** Din ki file mein step ya to routine se aata hai (`use`) ya poora likha hota hai. */
export const DayStep = z.union([
  z.object({ use: z.string(), note: L.optional() }).strict(),
  Step,
]);

export const Mantras = z.record(z.string(), z.array(z.string().min(1)).min(1));

export const Text = z
  .object({
    kind: z.enum(["aarti", "chalisa"]),
    title: L,
    subtitle: L.optional(),
    /** Doosre naam/spelling jinse log Google pe dhoondhte hain (jaise Kalratri, Kaalratri) — page pe dikhte hain. */
    aka: z.array(z.string().min(1)).optional(),
    /**
     * Page pe "▶ Suniye" player — sirf official channel ka video.
     * sameText: kya recording mein wahi bol hain jo page pe? (false = alag rachna, bol copyright — page pe mat likho)
     */
    youtube: z
      .object({
        id: z.string().regex(/^[\w-]{11}$/, "YouTube video id 11 akshar ka hota hai (watch?v= ke baad wala)"),
        by: z.string().optional(),
        sameText: z.boolean(),
      })
      .strict()
      .optional(),
    status: Status,
    top: z.array(z.string()).optional(),
    refrain: z.string().optional(),
    parts: z
      .array(
        z
          .object({
            heading: z.string().optional(),
            numbered: z.boolean().optional(),
            boxed: z.boolean().optional(),
            verses: z.array(z.array(z.string().min(1)).min(1)),
          })
          .strict(),
      )
      .min(1),
    closing: z.array(z.string()).optional(),
    note: L.optional(),
  })
  .strict();
export type Text = z.infer<typeof Text>;

export const Routine = z
  .object({
    steps: z.record(z.string(), Step),
    taiyari: z.object({ title: L, list: z.array(L) }).strict(),
    after: L,
  })
  .strict();

export const Day = z
  .object({
    day: z.number().int().min(1),
    /** Har saal same: Navratri ka din 1 = Ashwin Shukla Pratipada… Sankalp mein `{tithi}` yahi bharta hai. */
    tithi: L,
    name: L,
    stutiName: z.string().optional(),
    color: z.object({ name: L, hex: z.string(), note: L.optional() }).strict(),
    bhog: L,
    phool: L.optional(),
    about: L,
    mool: z.string(),
    dhyan: z.array(z.string()).optional(),
    aarti: z.string().optional(),
    alert: L.optional(),
    taiyari: z.boolean().default(true),
    after: z.boolean().default(true),
    steps: z.array(DayStep).min(1),
    closing: z.array(MantraRef).optional(),
  })
  .strict();
export type Day = z.infer<typeof Day>;

/** content/site.yaml — live URL (bina aakhri "/") aur search description. */
export const Site = z
  .object({ url: z.url().refine((u) => !u.endsWith("/"), "url ke aakhir mein / mat lagao"), description: L })
  .strict();

export const PujaMeta = z
  .object({
    slug: z.string(),
    status: Status,
    title: L,
    subtitle: L,
    when: L,
    pdf: L,
    cover: z.array(MantraRef),
    glance: z.array(L),
    chartNote: L,
    chartFooter: z.array(L),
    sections: z.array(
      z.object({ id: z.string(), title: L, subtitle: L.optional(), blocks: z.array(Block) }).strict(),
    ),
  })
  .strict();
export type PujaMeta = z.infer<typeof PujaMeta>;
