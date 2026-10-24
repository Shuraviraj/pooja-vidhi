// Kisi bhi page ka phone/tablet screenshot — UI check ke liye.
//   npm run shot -- /navratri --w 380 --h 900 --open chowki --theme diya
// Pehle `npm run build` chahiye. Ye dist/ ko khud serve karta hai, page ko ek
// iframe mein (sahi chaudai pe) kholta hai — kyunki headless Edge ki window
// ~500px se chhoti nahi hoti — aur dist/shots/<naam>.png likhta hai.

import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { parseArgs } from "node:util";

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    w: { type: "string", default: "380" }, // phone ~380, tablet ~820
    h: { type: "string", default: "900" },
    open: { type: "string" }, // is id wale <details> tak scroll (saare details khule rehte hain)
    theme: { type: "string" }, // "diya" = dark mode
    out: { type: "string" },
  },
});

// Git Bash "/hi/..." ko "C:/Program Files/Git/hi/..." bana deta hai — wapas URL banao.
const page = "/" + (positionals[0] ?? "").replace(/^[A-Za-z]:[\\/].*?Git[\\/]/, "").replace(/^\/+/, "");
const ROOT = path.resolve(import.meta.dirname, "../dist/pooja-vidhi/browser");
const name = values.out ?? `${page.replace(/\W+/g, "-").replace(/^-|-$/g, "") || "home"}-${values.w}${values.theme ? "-" + values.theme : ""}`;
const OUT = path.resolve(import.meta.dirname, "../dist/shots", `${name}.png`);
const EDGE = process.env.EDGE_PATH ?? "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";

if (!fs.existsSync(ROOT)) throw new Error("dist nahi mila — pehle `npm run build` chalao");

const TYPES: Record<string, string> = {
  ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml",
  ".woff2": "font/woff2", ".woff": "font/woff", ".png": "image/png", ".ico": "image/x-icon", ".pdf": "application/pdf",
};

const wrapper = `<!doctype html><meta charset="utf-8"><style>body{margin:0}iframe{border:0;display:block}</style>
<iframe id="f" width="${values.w}" height="${values.h}" src="${page}"></iframe>
<script>
  const f = document.getElementById('f');
  f.onload = () => setTimeout(() => {
    const d = f.contentDocument;
    d.querySelectorAll('details').forEach((x) => (x.open = true));
    ${values.theme ? `d.documentElement.dataset.theme = ${JSON.stringify(values.theme)};` : ""}
    const el = ${JSON.stringify(values.open ?? "")} && d.getElementById(${JSON.stringify(values.open ?? "")});
    if (el) f.contentWindow.scrollTo(0, el.offsetTop - 60);
  }, 800);
</script>`;

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://x");
  if (pathname === "/__shot.html") return void res.writeHead(200, { "content-type": "text/html" }).end(wrapper);
  let file = path.join(ROOT, path.normalize(decodeURIComponent(pathname)));
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  if (!file.startsWith(ROOT) || !fs.existsSync(file)) file = path.join(ROOT, "404.html");
  res.writeHead(200, { "content-type": TYPES[path.extname(file)] ?? "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});

server.listen(0, async () => {
  const { port } = server.address() as { port: number };
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.rmSync(OUT, { force: true });
  // Har baar alag profile — warna pehle se chal raha Edge kaam le leta hai aur screenshot nahi banta.
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "pooja-shot-"));
  try {
    const { stdout, stderr } = await promisify(execFile)(EDGE, [
      "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", `--user-data-dir=${profile}`,
      `--window-size=${values.w},${values.h}`, "--virtual-time-budget=4000",
      `--screenshot=${OUT}`, `http://localhost:${port}/__shot.html`,
    ]);
    if (!fs.existsSync(OUT)) throw new Error(`Edge ne screenshot nahi banaya\n${stdout}\n${stderr}`);
    console.log(`✓ ${OUT}`);
  } finally {
    server.close();
    fs.rmSync(profile, { recursive: true, force: true, maxRetries: 3 });
  }
});
