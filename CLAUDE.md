# Pooja Vidhi — notes for Claude

Ad-free pooja website (vidhi, niyam, mantra, aarti) for the user's family. v1 = Navratri (9 din + Dussehra) + Durga Chalisa.
Status, history and todo live in **docs/progress.md** — read it when you need context; update it after every change.

## Talking to the user
- Reply in **Hinglish (Roman script)**. Code comments in Hinglish too (match existing files).
- User is learning (Angular, Claude Code) — explain the why briefly. They dislike slowness: act, don't over-ask.
- Personal project, full freedom to experiment. Never commit/push unless asked (nothing committed yet).

## Content rules (never break)
- Mantras only in Sanskrit/Devanagari — **no Roman transliteration**, ever.
- Hinglish is default (root URLs); Shuddh Hindi under `/hi/`. Every UI string needs both (`L` = `{hinglish, hi}`).
- **Universal, not year-specific**: no dates/years anywhere. Tithi lives in each day file; sankalp keeps vaar blank (`______ (वार)`).
- Keep it simple: no date-based features (the "Aaj" card was removed on request).
- Every text/pooja has `status: draft` until the user tests it at home. `assets/*.pdf` = text source only, not a design spec.
- **No copyrighted lyrics on the site.** Aarti text = traditional/public-domain versions only. Anuradha Paudwal's 9 Devi aartis
  ("Nav Durga Aarti", ℗ 2021 Shemaroo, composer Sanjayraj Gaurinandan) are a different, copyrighted composition → we only
  embed the official YouTube video (`youtube: {id, by, sameText: false}`), never transcribe it onto the page.
  Family-only exception (user's request, private use): `/parivar/<slug>` asks username+password and shows those bol, which live
  **encrypted** in `public/parivar.enc.json` (`npm run parivar`; plaintext only in gitignored `private/`). Public aarti pages keep
  the traditional text + a "🔒 … ji wale bol" link. **Never** write the password into a committed file (it's in `private/LOGIN.txt`).

## Architecture
`content/*.yaml` → `scripts/build-content.mts` (Zod check + resolve `$mool`/`$aarti`/`{tithi}`) → `src/generated/content.json`
→ Angular 22 SSG (`outputMode: static`, 66 prerendered pages: 48 public in sitemap + 18 noindex parivar) → GitHub Pages (`.github/workflows/deploy.yml`).
- `src/app/core/vault.ts` = WebCrypto lock (PBKDF2 600k → AES-GCM), shared by the browser and `scripts/parivar.mts`. `pages/parivar.ts` = login + bol
  (reuses `TextBody`); "yaad rakhein" stores only the derived key in localStorage. `seo({noindex: true})`; postbuild drops `parivar/` from sitemap.
- `src/app/core/` types, content access, i18n, `Store` (localStorage + today, only after hydration).
- `src/app/components/blocks.ts` renders every content block via `@switch (block.type)`.
- `src/app/components/plate.ts` = round thali/chowki picture; items placed by `x`,`y`,`size` (%) from YAML; art = `public/art/<name>.svg`.
- New block type checklist: `scripts/schema.mts` → `resolveBlock` in build-content → `core/types.ts` → `blocks.ts` `@case` → `src/styles.css`.
- All styling in `src/styles.css` (tokens on top; Diya dark mode = `:root[data-theme="diya"]`).
- SEO: every page calls `seo()` (`src/app/pages/seo.ts`) → title, description, canonical, hreflang, og tags, BreadcrumbList JSON-LD.
  Aarti YAML `aka:` = alternate search spellings (shown on page); build-content links each Devi aarti to its day (`text.day`). Live URL lives only in
  `content/site.yaml` (canonical, sitemap, og:image). Live: https://shuraviraj.github.io/pooja-vidhi/ · repo Shuraviraj/pooja-vidhi.

## Commands
- `npm start` (dev, :4200) · `npm run build` (content + ng build + postbuild) · `npm run content` (YAML check only)
- `npm run shot -- /navratri --w 380 --open chowki [--theme diya] [--store key=value]` → `dist/shots/*.png`. **Run via PowerShell tool**, after a build.
  `--store` pre-fills localStorage (e.g. `parivar-key=<base64>` to see the unlocked parivar page).
  Verify UI at 380 (phone) and 820 (tablet).
- Transcribe aarti audio: `%USERPROFILE%\.whisper-venv\Scripts\python scripts\transcribe.py "assets\*.mp3"` (faster-whisper
  large-v3 on the RTX 4070) → `assets/transcripts/*.txt`. MP3s + transcripts are **gitignored** (copyrighted recordings) —
  never commit them. Whisper mishears sung Hindi: use transcripts as evidence, then correct with judgment.
  `hotwords=` (Devi naam) fixes names; ~2.5 min/song. 9 songs > 10 min → split into batches (tool timeout kills the run).
- `npm run parivar` → seeds `private/aarti/<slug>.txt` from transcripts (only if missing; cleans ॐ/जय/commas/"धन्यवाद"), asks
  username/password (or env `PARIVAR_USER`/`PARIVAR_PASS`), writes `public/parivar.enc.json`. Re-run after editing bol or changing password.

## Gotchas (learned the hard way)
- Angular 22 needs Node ≥ 24.15 (user is on nvm-windows 24.22.0; `nvm` only works in a real console).
- Bash tool: heredocs strip backslashes / fail to parse → write files with the Write tool.
- Bash tool: Git Bash turns args like `/hi/x` into `C:/Program Files/Git/hi/x` → `MSYS_NO_PATHCONV=1` (shot.mts already fixes it).
- Headless Edge fails silently from the Bash tool → use PowerShell. Its min window is ~500px → shot.mts uses an iframe.
- `ng build` wipes `dist/pooja-vidhi/` (so don't keep temp files there). `npx serve` drops `?query` on `.html` redirects.
- YAML flow lists: quote any line containing `,` or `:`.
- `gh` lives at `/c/Program Files/GitHub CLI/gh.exe` (may not be on the Bash PATH). Pushing `.github/workflows/*` needs the
  token's `workflow` scope (`gh auth refresh -s workflow`). Device login works from a background Bash: read the code from its output.
- Pages was enabled on an empty repo → `github-pages` environment allowed only `master`; we added a `main` branch policy.
  Deploy = push to `main` → Actions (~2 min). Check: `gh run list -R Shuraviraj/pooja-vidhi -L 1`.
- CSS `repeat(auto-fit, minmax(84px, 120px))` counts columns at the max → use `1fr` as max.
- Hook: `.claude/settings.json` PostToolUse runs build-content after edits in `content/`, `public/art/`, schema — an exit-2 error means fix it now.
