# Pooja Vidhi

Ghar ki pooja ke liye ek saaf, ad-free website — vidhi, niyam, mantra aur aarti ek hi jagah.
Abhi: **Navratri (9 din + Dussehra)**, 11 aartiyan aur Shri Durga Chalisa — Hinglish aur Shuddh Hindi dono mein.

Tech: **Angular 22** (standalone components + signals) with prerender (SSG) → GitHub Pages. Koi server/backend nahi —
build ke time har page ka HTML ban jaata hai, isliye phone pe turant khulta hai.

## Local chalana

Node **24.15+** chahiye (`node --version`). nvm-windows ho to: `nvm use 24.22.0`.

```bash
npm install
npm start            # http://localhost:4200  (content.json pehle apne-aap banta hai)
npm run build        # dist/pooja-vidhi/browser/ mein poori static site
```

Phone pe dekhna ho: `npm start -- --host 0.0.0.0`, phir phone se `http://<PC-ka-IP>:4200` (same Wi-Fi).

Screenshot (build ke baad, PowerShell se): `npm run shot -- /navratri --w 380 --open chowki` → `dist/shots/`.
`--w 820` = tablet, `--theme diya` = dark mode.

## Ye kaam kaise karta hai

```text
content/*.yaml  ──(npm run content)──▶  src/generated/content.json  ──(ng build)──▶  48 HTML pages
   aap likhte ho        scripts/build-content.mts:              Angular app JSON import karta hai,
                        YAML padho + Zod se check karo +        prerender har URL ka HTML banata hai
                        $mool/{vaar} jaise placeholders bharo
```

YAML mein galti ho (koi field chhoot gaya, galat mantra naam) to `npm run content` wahi ruk jaata hai aur
file + line batata hai — galat content kabhi live nahi jaata.

## Folder kya-kya hai

```text
content/                     ← SAARA content yahan (code chhuye bina edit karo)
  mantras.yaml               ← har mantra ek baar (sirf Devanagari)
  texts/                     ← aarti-*.yaml, chalisa-*.yaml (poore bol)
  pujas/navratri/
    meta.yaml                ← naam, intro sections (chowki, thali, niyam…)
    routine.yaml             ← roz ke common steps — ek baar likhe hain
    days/01-…10-*.yaml       ← har din: Devi, tithi, rang, bhog, mantra, special steps
scripts/
  schema.mts                 ← content ka "shape" (Zod)
  build-content.mts          ← YAML → src/generated/content.json
  postbuild.mts              ← 404.html + .nojekyll (GitHub Pages ke liye)
  shot.mts                   ← phone/tablet screenshot (`npm run shot`)
src/app/
  core/                      ← types, content access, i18n (Hinglish/Hindi), Store (localStorage + aaj ki date)
  components/                ← Mantra, Blocks, Plate (thali tasveer), AartiSheet, StepTick, SiteHeader, ReaderBar…
  pages/                     ← Home, Navratri, Day, Text (aarti/chalisa), NotFound
  app.routes.ts              ← URLs — dono languages ke same pages, sirf `data.lang` alag
  app.routes.server.ts       ← build ke time kaunse pages ka HTML banana hai (din-1…10, har aarti)
src/styles.css               ← saari styling; upar ke design tokens badlo to poora look badal jaata hai
public/pdf/                  ← original PDFs (download ke liye)
public/art/                  ← thali/chowki ki tasveerein (SVG) — asli photo chahiye to file badal do
```

**Angular concepts jo yahan dikhenge:**
- `input()` / `input.required()` — component ke props. Route ka `data: { lang }` aur URL ke `:day` / `:slug`
  seedhe inputs ban jaate hain (`withComponentInputBinding()`).
- `signal()` / `computed()` — state. Jaise `StepTick` mein `done = computed(() => store.get(key) === '1')`.
- `@if` / `@for` / `@switch` — template control flow. `Blocks` component har content block ke `type` pe `@switch` karta hai.
- `Store` (`core/store.ts`) — prerender ke time localStorage/date nahi hote, isliye app "stable" (hydrated) hone
  ke baad hi asli values padhta hai. Isse server HTML aur browser render mel khaate hain.

## Content badalna (sabse common kaam)

- **Typo theek karna:** `content/` mein file kholo → text badlo → commit. GitHub website pe bhi edit kar sakte ho (phone se bhi).
- **Test karke pakka karna:** har aarti/pooja file mein `status: draft` hai — "Jaanch baaki" badge dikhta hai. Ghar pe test karke `status: verified` kar do.
- **Har saal ke liye same:** site mein koi tareekh/saal nahi hai. Har din ki tithi (Pratipada…Dashami) din ki file mein hai; sankalp mein vaar khali (______) rehta hai — pooja karne wala us din ka vaar bolta hai.
- **Nayi aarti:** `content/texts/aarti-<naam>.yaml` banao (kisi maujooda file jaisa). Din ki file mein `aarti: aarti-<naam>` likho; poora page `/aarti/<naam>` pe.
- **Thali/chowki ki tasveer:** `meta.yaml` mein `plate:` block — har cheez ka `art` (public/art/ ki file ka naam), `x`/`y` (jagah %, 0–100) aur `size` (%). Nayi cheez = nayi SVG `public/art/` mein. Galat naam ho to build wahi bata deta hai.
- **YAML tip:** jis line mein comma ( , ) ya colon ( : ) ho, use `"double quotes"` mein likho.

## Live site

**https://shuraviraj.github.io/pooja-vidhi/** — phone pe kholo → browser menu → "Add to Home Screen" (diya wala icon, app jaisa khulta hai).

Repo: https://github.com/Shuraviraj/pooja-vidhi (public). Pages source = GitHub Actions.

## SEO (Google mein dikhna)

- Har page ka apna title, description, canonical URL, `hreflang` (Hinglish ↔ Hindi) aur share image (`public/og.png`) — `src/app/pages/seo.ts`.
- `sitemap.xml` + `robots.txt` build ke time banta hai (`scripts/postbuild.mts`). Site ka pata `content/site.yaml` mein — repo/domain badle to wahi badlo.
- Google mein jaldi aane ke liye: [Search Console](https://search.google.com/search-console) → property add karo
  (`https://shuraviraj.github.io/pooja-vidhi/`) → HTML-tag se verify → Sitemaps mein `sitemap.xml` submit.

Iske baad har push apne-aap deploy hota hai (`.github/workflows/deploy.yml` — `--base-href` repo ke naam se lagta hai).

## Aage (v1.1+)

Offline/PWA (`ng add @angular/pwa`) · 108 jaap counter · search · nayi poojayein · UI design phase.
Server features (login waghera) chahiye to `angular.json` mein `outputMode: "server"` karke kisi Node host pe deploy karo.
