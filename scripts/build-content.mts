// Build se pehle chalta hai (`npm run content`). Saari YAML padhta hai, schema
// se check karta hai, "$mool" jaise placeholders ko us din ke asli mantra se
// bharta hai, aur sab kuch ek file mein likhta hai: src/generated/content.json
// Angular app bas wahi JSON import karta hai.

import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import { z } from "zod";
import * as S from "./schema.mts";
import type { Block, Content, Day, Plate, Text } from "../src/app/core/types.ts";

const ROOT = path.resolve(import.meta.dirname, "../content");
const OUT = path.resolve(import.meta.dirname, "../src/generated/content.json");
const ART = path.resolve(import.meta.dirname, "../public/art");

function load<T extends z.ZodType>(file: string, schema: T): z.infer<T> {
  const raw = parse(fs.readFileSync(path.join(ROOT, file), "utf8"));
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Error(`content/${file} mein galti:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

const list = (dir: string) =>
  fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith(".yaml")).sort();

// ---------- Aarti / Chalisa ----------

const texts: Record<string, Text> = {};
for (const f of list("texts")) {
  const id = f.replace(/\.yaml$/, "");
  const text = load(`texts/${f}`, S.Text);
  const [kind, ...rest] = id.split("-");
  if (kind !== text.kind) throw new Error(`content/texts/${f}: naam "${kind}-" se shuru ho, kind: ${text.kind} hai`);
  texts[id] = { ...text, slug: rest.join("-") };
}

// ---------- Navratri ----------

const dir = "pujas/navratri";
const meta = load(`${dir}/meta.yaml`, S.PujaMeta);
const routine = load(`${dir}/routine.yaml`, S.Routine);
const mantras = load("mantras.yaml", S.Mantras);

type Ctx = { file: string; day?: S.Day };

function mantraLines(ref: string, ctx: Ctx): string[] {
  const { day } = ctx;
  if (ref.startsWith("$") && !day) throw new Error(`${ctx.file}: "${ref}" sirf din ki file mein chalta hai`);
  let lines: string[] | undefined;
  if (ref === "$dhyan") lines = day!.dhyan;
  else if (ref === "$mool") lines = [day!.mool];
  else if (ref === "$stuti")
    lines = day!.stutiName
      ? [`या देवी सर्वभूतेषु माँ ${day!.stutiName} रूपेण संस्थिता ।`, "नमस्तस्यै नमस्तस्यै नमस्तस्यै नमो नमः ॥"]
      : undefined;
  else lines = mantras[ref];
  if (!lines) throw new Error(`${ctx.file}: mantra "${ref}" nahi mila (content/mantras.yaml dekhein)`);

  // Sankalp mein us din ki tithi (din ki file se) bharte hain.
  return lines.map((line) => line.replaceAll("{tithi}", day?.tithi.hi ?? "______"));
}

/** Thali ki har tasveer public/art/ mein honi chahiye — warna build yahin ruk jaaye. */
function checkPlate(plate: Plate, ctx: Ctx): Plate {
  for (const spot of [...plate.items, ...plate.beside]) {
    if (!fs.existsSync(path.join(ART, `${spot.art}.svg`))) {
      throw new Error(`${ctx.file}: tasveer "${spot.art}" nahi mili (public/art/${spot.art}.svg)`);
    }
  }
  return plate;
}

/** YAML ka block → app ka block (har block pe `type` taaki template mein @switch chal sake). */
function resolveBlock(b: S.Block, ctx: Ctx): Block {
  if ("p" in b) return { type: "p", text: b.p };
  if ("label" in b) return { type: "label", text: b.label };
  if ("mantra" in b) return { type: "mantra", lines: mantraLines(b.mantra, ctx), big: b.big };
  if ("table" in b) return { type: "table", rows: b.table };
  if ("list" in b) return { type: "list", items: b.list };
  if ("ordered" in b) return { type: "ordered", items: b.ordered };
  if ("callout" in b) return { type: "callout", text: b.callout, title: b.title, tone: b.tone };
  if ("cards" in b)
    return {
      type: "cards",
      items: b.cards.map((c) => ({ ...c, plate: c.plate && checkPlate(c.plate, ctx) })),
    };
  if ("timetable" in b) return { type: "timetable", rows: b.timetable };
  if ("plate" in b) return { type: "plate", plate: checkPlate(b.plate, ctx) };
  const ids = b.aartis.map((ref) => {
    const id = ref === "$aarti" ? ctx.day?.aarti : ref;
    if (!id) throw new Error(`${ctx.file}: is din ki aarti (aarti:) set nahi hai`);
    if (!texts[id]) throw new Error(`${ctx.file}: aarti "${id}" nahi mili (content/texts/${id}.yaml)`);
    return id;
  });
  return { type: "aartis", ids };
}

const days: Day[] = list(`${dir}/days`).map((f) => {
  const day = load(`${dir}/days/${f}`, S.Day);
  const ctx: Ctx = { day, file: `content/${dir}/days/${f}` };
  // Devi ki aarti ko uska din pata ho — aarti page pe "Din 9 ki poori vidhi →" link ke liye.
  if (day.aarti && texts[day.aarti]) texts[day.aarti].day = { day: day.day, slug: `din-${day.day}`, name: day.name };

  const steps = day.steps.map((s) => {
    const base = "use" in s ? routine.steps[s.use] : s;
    if (!base) throw new Error(`${ctx.file}: routine step "${"use" in s ? s.use : ""}" nahi mila`);
    return {
      title: base.title,
      tag: base.tag,
      body: base.body,
      note: ("use" in s && s.note) || base.note,
      blocks: base.blocks.map((b) => resolveBlock(b, ctx)),
    };
  });

  return {
    day: day.day,
    slug: `din-${day.day}`,
    tithi: day.tithi,
    name: day.name,
    color: day.color,
    bhog: day.bhog,
    phool: day.phool,
    about: day.about,
    alert: day.alert,
    taiyari: day.taiyari,
    after: day.after,
    steps,
    closing: day.closing?.flatMap((id) => mantraLines(id, ctx)),
  };
});

// Aarti list ka kram: Ganesh ji → Ambe ji → Deviyan (Navratri ke din ke kram se) → baaki → chalisa
const dayOrder = days.flatMap((d) => d.steps.flatMap((s) => s.blocks.flatMap((b) => (b.type === "aartis" ? b.ids : []))));
const rank = (id: string) => {
  if (id === "aarti-ganesh") return -2;
  if (id === "aarti-ambe") return -1;
  if (texts[id].kind === "chalisa") return 1000;
  const i = dayOrder.indexOf(id);
  return i === -1 ? 999 : i;
};
const orderedTexts = Object.fromEntries(Object.entries(texts).sort(([a], [b]) => rank(a) - rank(b)));

const metaCtx: Ctx = { file: `content/${dir}/meta.yaml` };
const content: Content = {
  site: load("site.yaml", S.Site),
  texts: orderedTexts,
  navratri: {
    status: meta.status,
    title: meta.title,
    subtitle: meta.subtitle,
    when: meta.when,
    pdf: meta.pdf,
    cover: meta.cover.flatMap((id) => mantraLines(id, metaCtx)),
    glance: meta.glance,
    chartNote: meta.chartNote,
    chartFooter: meta.chartFooter,
    sections: meta.sections.map((s) => ({ ...s, blocks: s.blocks.map((b) => resolveBlock(b, metaCtx)) })),
    days,
    taiyari: routine.taiyari,
    after: routine.after,
  },
};

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(content));
console.log(
  `✓ content.json: ${Object.keys(texts).length} aarti/chalisa, ${days.length} din — ${Math.round(fs.statSync(OUT).size / 1024)} KB`,
);
