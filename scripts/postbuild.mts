// Build ke baad GitHub Pages ke liye chhoti cheezein:
// 1. 404.html — anjaan URL pe bhi app khule (client-side "page nahi mila")
// 2. .nojekyll — GitHub Pages files ko Jekyll se process na kare
// 3. sitemap.xml + robots.txt — Google ko har page ka pata (dono bhasha)

import fs from "node:fs";
import path from "node:path";

const OUT = path.resolve(import.meta.dirname, "../dist/pooja-vidhi/browser");
const { site } = JSON.parse(fs.readFileSync(path.resolve(import.meta.dirname, "../src/generated/content.json"), "utf8"));

const csr = path.join(OUT, "index.csr.html");
fs.copyFileSync(fs.existsSync(csr) ? csr : path.join(OUT, "index.html"), path.join(OUT, "404.html"));
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

// Har prerendered page = ek folder/index.html → uska URL (aakhir mein "/", jaisa GitHub Pages deta hai)
const pages = fs
  .readdirSync(OUT, { recursive: true })
  .map((f) => String(f).replaceAll("\\", "/"))
  .filter((f) => f === "index.html" || f.endsWith("/index.html"))
  .map((f) => `${site.url}/${f.replace(/index\.html$/, "")}`)
  .sort();

const today = new Date().toISOString().slice(0, 10);
fs.writeFileSync(
  path.join(OUT, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    pages.map((loc) => `  <url><loc>${loc}</loc><lastmod>${today}</lastmod></url>`).join("\n") +
    `\n</urlset>\n`,
);
fs.writeFileSync(path.join(OUT, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`);

console.log(`✓ dist/pooja-vidhi/browser: ${pages.length} pages + 404.html + .nojekyll + sitemap.xml + robots.txt`);
