# Progress

Update after every change: what got done, what's pending, what we learned. Newest on top.

## Status (2026-10-24)

**Done**
- Angular 22 SSG site: Home → Navratri overview → Din 1–10 pages, 11 aarti + Durga Chalisa pages, Hinglish + `/hi/` Shuddh Hindi (48 pages).
- Features: aarti bottom-sheet, step "Ho gaya" ticks (per day), A−/A+, Screen ON (wake lock), Diya dark mode, language toggle, PDF download.
- Chowki and 3 thaliyan shown as round plate pictures (19 SVGs in `public/art/`), works on phone/tablet/dark mode.
- Universal content (no 2026 / dates), simple home (one Navratri card).
- Tooling: content-check hook, `npm run shot` screenshots, CLAUDE.md + this file.

**Pending — user**
- `status: draft` everywhere → proofread. The 9 Devi aartis on the site are the **traditional** texts (not the Anuradha
  Paudwal album — that's a different, copyrighted 2021 composition; see log). To verify the traditional text, compare with a
  printed pooja book (e.g. Gita Press). Lines that differ from Drik Panchang and are unconfirmed:
  Brahmacharini 3, 4, 5 · Kushmanda 5 · Skandamata 3, 9 · Katyayani 4, 5, 6, 8 · Mahagauri 1, 4 · Shailputri 5.
- ✅ Live: https://shuraviraj.github.io/pooja-vidhi/ (repo Shuraviraj/pooja-vidhi, public).
- Search Console: verification file `public/google4f818588381b59bd.html` is live (**never delete it**). User: click Verify →
  Sitemaps → submit `sitemap.xml`.
- Later (Claude): GitHub warns actions target Node 20 (deprecated) — bump action versions in deploy.yml when newer majors exist.
- Parivar page: listen + fix misheard words in `private/aarti/*.txt`, then `npm run parivar` + push.

**Next / ideas**
- UI design phase — user reviews screen by screen and gives feedback.
- Later: PWA/offline, 108-jaap counter, search, more poojas (Kali Pooja etc.).

## Log

### 2026-10-24 (parivar page)
- User wanted Anuradha Paudwal ke bol online. Public = copyright issue (credit ≠ permission), so: **password page for family**.
  Aarti pages unchanged (traditional text) + "🔒 Anuradha Paudwal ji wale bol — parivar ke liye" link under the YouTube button
  (aarti page + day-page sheet) → `/parivar/<slug>` (noindex, not in sitemap) → username/password → video + bol together.
- Bol encrypted client-side (`core/vault.ts`: PBKDF2-SHA256 600k + AES-GCM) into `public/parivar.enc.json`; GitHub Pages can't
  do real login, so the file is public but unreadable without the password. Login saved in gitignored `private/LOGIN.txt`.
- Bol = Whisper re-run with `hotwords` (Devi naam) + mechanical cleanup (ॐ/जय/commas/junk). Words not hand-corrected (Claude
  can't hear the audio) → page shows "Jaanch baaki" + note. Family can fix `private/aarti/<slug>.txt` → `npm run parivar`.
- Ideas: Shemaroo permission email (then bol could go public with credit); Musixmatch contribution.

### 2026-10-24 (aarti audio + SEO)
- User put 9 Anuradha Paudwal MP3s in `assets/` (gitignored with transcripts). Whisper large-v3 on GPU transcribed them
  (`scripts/transcribe.py`; VAD off — singing over music isn't "speech"; own PyAV decoder — faster-whisper's breaks on av 19).
- Finding: the recordings are the album "Nav Durga Aarti" (℗ 2021 Shemaroo, composer Sanjayraj Gaurinandan) — a **different
  composition** ("ॐ जय शैलपुत्री माँ…"), copyrighted → NOT put on the site. Transcripts stay local for the family's own use.
- "▶ Aarti suniye" (`components/listen.ts`): thumbnail button → youtube-nocookie player on tap, sticky while scrolling;
  on aarti pages + inside day-page aarti sheets. Official videos for all 11 aartis; label says when the recording's words differ.
- SEO: aarti titles in both scripts ("Maa Kalaratri ki Aarti (माँ कालरात्रि की आरती) — Lyrics"), description with the first line,
  `aka:` alternate spellings shown on page, "Din 7 ki poori vidhi →" link, BreadcrumbList JSON-LD (aarti + day pages),
  "Aartiyan aur Chalisa" link list on the Navratri page (internal links).

### 2026-10-24 (publish)
- SEO: `seo()` per page (keyword titles, descriptions, canonical, hreflang hi-Latn/hi/x-default, og/twitter tags, `<html lang>`),
  `content/site.yaml` (live URL), sitemap.xml + robots.txt in postbuild, share card `public/og.png`, diya icon (`favicon.svg`,
  `icon-512.png`) + `manifest.webmanifest` (Add to Home Screen). Removed Angular's default favicon.ico.
- Published to GitHub (Shuraviraj/pooja-vidhi, public) with Pages via Actions.
- Note: robots.txt under a sub-path (/pooja-vidhi/) is ignored by crawlers — submit the sitemap in Search Console instead.

### 2026-10-24 (later)
- User asked to replace the Devi aartis with the Anuradha Paudwal versions. Claude can't play audio, and her albums partly use credited lyricists (copyrighted), so we did **not** copy song lyrics. Instead each draft was diffed against Drik Panchang / Bhakti Bharat (traditional, uncredited texts).
- Fixed (confirmed words): Shailputri सिमरे→सुमिरे, गाएँ→जपाएँ, भक्त→चमन · Chandraghanta समान→समाज, जगदाता→जगत दाता, removed the extra "क्रोध को शांत…" couplet · Kalaratri "…रहे ना बीमारी".
- Tools: Playwright MCP ✓ connected (first try timed out while npx downloaded), context7 ✓, `gh` installed but not logged in.

### 2026-10-24
- **Removed** "Navratri sampann hui / agli dates jald" (TodayCard) and the aarti list from Home → Home has one Navratri card (with Durga art).
- **Universal**: deleted `content/calendar/`; each day file has `tithi:`; dates removed from day list + day header (now "Navratri ka din 1 · Ashwin Shukla Pratipada"); sankalp vaar = `______ (वार)`, maas fixed आश्विन (content is Sharad Navratri — has Dussehra); removed "शारदीय नवरात्रि 2026" heading and the "संध्या को लगभग एक घंटा…" note (`glanceNote`).
- **Plate pictures**: new `plate` block (replaces `chowki` grid) + optional `plate` on cards; `Plate` component; build fails if an `art` SVG is missing. Thali cards are side-by-side (picture | text) on ≥640px.
- **Tooling**: `.claude/hooks/check-content.mjs` (PostToolUse) — verified live; `scripts/shot.mts`.
- Learned: Bash-tool heredoc strips `\`; Edge headless dead from Bash tool; auto-fit/minmax max quirk; `serve` drops query. (Recorded in CLAUDE.md.)
- Explained HLD (pages → components → core) to the user in chat.

### 2026-10-20 → 10-23
- Planned (Hinglish default, mantras Devanagari-only, PDFs as source), built in Next.js, then switched to Angular 22 on request (React deleted).
- Transcribed all content from 3 PDFs to YAML; wrote 9 Devi aartis; Zod schema; GitHub Pages workflow.
- Node 24.22.0 installed manually into nvm folder (checksum verified).
