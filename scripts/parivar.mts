// Parivar page (/parivar) — Anuradha Paudwal wali Nav Durga aartiyan, sirf ghar walon ke liye (password se).
//   npm run parivar
// 1. private/aarti/<slug>.txt na ho to assets/transcripts/ se bana deta hai (time hata ke; lamba music = naya pad).
//    Whisper ki galtiyan isi file mein theek karo: ek line = ek pankti, khaali line = naya pad.
//    private/ gitignored hai — ye bol kabhi GitHub pe khule nahi jaate (copyrighted recording hai).
// 2. Username + password poochhta hai (ya env PARIVAR_USER / PARIVAR_PASS), sab aartiyan band karke
//    public/parivar.enc.json likhta hai. Sirf ye taala-band file commit hoti hai.
// Bol theek kiye ya password badalna hai → ye script dobara chalao, phir commit + push.

import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { parse } from "yaml";
import { seal } from "../src/app/core/vault.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const PRIVATE = path.join(ROOT, "private/aarti");
const OUT = path.join(ROOT, "public/parivar.enc.json");

// Hamari aarti ka slug → [recording (MP3/transcript) ka naam, Devi ka naam]
const FROM: Record<string, [string, string]> = {
  shailputri: ["Shailputri Aarti", "शैलपुत्री"],
  brahmacharini: ["Brahmacharini Aarti", "ब्रह्मचारिणी"],
  chandraghanta: ["Chandraghanta Aarti", "चंद्रघंटा"],
  kushmanda: ["Kushmanda Aarti", "कूष्मांडा"],
  skandamata: ["Skandamata Aarti", "स्कंदमाता"],
  katyayani: ["Kathyayini Aarti", "कात्यायनी"],
  kalaratri: ["Kaalratri Aarti", "कालरात्रि"],
  mahagauri: ["Maha Gauri Aarti", "महागौरी"],
  siddhidatri: ["Siddhidhatri Aarti", "सिद्धिदात्री"],
};
/** Do lines ke shuru mein itne second se zyada ka farak = beech mein music tha = naya pad. */
const GAP = 15;

/** Whisper ki woh galtiyan jo har gaane mein ek jaisi hoti hain. Baaki shabd jaise sune, waise. */
const clean = (line: string, devi: string) =>
  line
    .replace(new RegExp([...devi].join("\\s*"), "g"), devi) // "काल रात्रि" → "कालरात्रि"
    .replace(/(^|\s)(?:ओम्?|होम्?)\s*(?=जै|जय)/g, "$1ॐ ") // "होम जय…" → "ॐ जय…"
    .replace(new RegExp(`जै\\s*${devi}`, "g"), `जय ${devi}`) // "जैशैलपुत्री" → "जय शैलपुत्री"
    .replace(/(^|\s)जै(?=\s)/g, "$1जय")
    .replace(new RegExp(`${devi} मा(?=\\s|$)`, "g"), `${devi} माँ`)
    .replace(/\s+/g, " ")
    .trim();
/** Gaana khatam hone ke baad Whisper "dhanyavaad / subscribe" jaisa kuch "sun" leta hai. */
const JUNK = /धन्यवाद|दिन्यवाद|सब्सक्राइब|subscribe/i;

// Har recording Devi ke dhyan shlok se shuru hoti hai — paramparik Sanskrit, jo din ki YAML (`dhyan:`) mein
// sahi likha hai, aur Whisper Sanskrit mein sabse zyada galti karta hai. Shuru ki jo lines us shlok se
// milti hain (akshar-jodon ka ≥50% mel), unki jagah asli shlok.
const pairs = (s: string) => {
  const t = s.replace(/[\s।॥]+/g, "");
  return new Set([...t].slice(1).map((c, i) => t[i] + c));
};
const like = (line: string, ref: Set<string>) => {
  if (/जय|मैया|माँ|मां/.test(line)) return false; // ye aarti ki line hai, shlok ki nahi
  const p = pairs(line);
  return p.size > 0 && [...p].filter((x) => ref.has(x)).length / p.size >= 0.5;
};
function withDhyan(lines: string[], slug: string) {
  const day = fs.readdirSync(path.join(ROOT, "content/pujas/navratri/days")).find((f) => f.endsWith(`-${slug}.yaml`));
  const dhyan: string[] | undefined = day && parse(fs.readFileSync(path.join(ROOT, "content/pujas/navratri/days", day), "utf8")).dhyan;
  if (!dhyan?.length) return lines;
  const ref = pairs(dhyan.join(""));
  let i = 0;
  while (i < lines.length && (lines[i] === "" || like(lines[i], ref))) i++;
  if (!lines.slice(0, i).some(Boolean)) return lines; // shuruaat mein shlok nahi mila — jaisa hai waisa
  return [...dhyan, "", ...lines.slice(i)];
}

fs.mkdirSync(PRIVATE, { recursive: true });
for (const [slug, [name, devi]] of Object.entries(FROM)) {
  const file = path.join(PRIVATE, `${slug}.txt`);
  const src = path.join(ROOT, "assets/transcripts", `${name}.txt`);
  if (fs.existsSync(file) || !fs.existsSync(src)) continue;
  const out: string[] = [];
  const pad = () => out.length && out.at(-1) !== "" && out.push("");
  let prev = -Infinity;
  for (const line of fs.readFileSync(src, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\[\s*([\d.]+)\]\s*(.+)$/);
    if (!m || JUNK.test(m[2])) continue;
    if (Number(m[1]) - prev > GAP) pad();
    prev = Number(m[1]);
    // Ek segment mein kai panktiyan comma se judi aati hain — alag karo
    for (const l of m[2].split(/[,،]\s*/).map((l) => clean(l, devi)).filter(Boolean)) {
      // "ॐ जय … माँ" (tek) har pad ke aakhir mein aati hai → uske baad naya pad
      if ((out.at(-1) ?? "").startsWith("ॐ जय") && !/^(ॐ|मैया)/.test(l)) pad();
      out.push(l);
    }
  }
  fs.writeFileSync(file, withDhyan(out, slug).join("\n") + "\n");
  console.log(`+ private/aarti/${slug}.txt (transcript se bana — Whisper ki galtiyan yahin theek karein)`);
}

const aartis: Record<string, string[][]> = {};
for (const slug of Object.keys(FROM)) {
  const file = path.join(PRIVATE, `${slug}.txt`);
  if (!fs.existsSync(file)) continue;
  const pads = fs
    .readFileSync(file, "utf8")
    .split(/\r?\n\s*\r?\n/)
    .map((pad) => pad.split(/\r?\n/).map((l) => l.trim()).filter(Boolean))
    .filter((pad) => pad.length);
  if (pads.length) aartis[slug] = pads;
}
const count = Object.keys(aartis).length;
if (!count) throw new Error("private/aarti/ mein koi aarti nahi — pehle MP3 se transcripts banao (CLAUDE.md dekho)");

/** Terminal se poochho; password type karte waqt screen pe na dikhe. */
async function ask(question: string, hidden = false) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  if (hidden) {
    const rlw = rl as unknown as { _writeToOutput: (s: string) => void };
    const write = rlw._writeToOutput.bind(rl);
    rlw._writeToOutput = (s) => write(s.startsWith(question) || s.includes("\n") ? s : "");
  }
  const answer = await rl.question(question);
  rl.close();
  return answer;
}

const user = process.env.PARIVAR_USER ?? (await ask("Username: "));
let pass = process.env.PARIVAR_PASS;
if (pass === undefined) {
  pass = await ask("Password: ", true);
  if ((await ask("Password dobara: ", true)) !== pass) throw new Error("dono password alag hain — dobara chalao");
}
if (!user.trim() || pass.length < 8) throw new Error("username chahiye, aur password kam se kam 8 akshar ka");

fs.writeFileSync(OUT, JSON.stringify(await seal(aartis, user, pass)) + "\n");
console.log(`✓ public/parivar.enc.json — ${count} aartiyan taale mein. Ab build/commit/push; site pe /parivar/ kholein.`);
