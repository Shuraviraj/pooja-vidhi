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
- `status: draft` everywhere → proofread. **9 Devi aartis**: Claude can't listen to YouTube, so check against the Anuradha Paudwal recording.
  Lines (couplet numbers) where the Drik Panchang/Bhakti Bharat text differs from ours and the exact word is unconfirmed:
  Brahmacharini 3, 4, 5 · Kushmanda 5 (पहुँचाती?) · Skandamata 3, 9 · Katyayani 4, 5, 6, 8 · Mahagauri 1, 4 · Shailputri 5 (word order).
  Siddhidatri matches the reference (spelling-only differences).
- Deploy: `gh` is installed (2.103.2) → run `gh auth login` once and restart Claude Code (so it's on PATH); then Claude can create the repo, push and enable Pages.
- Say when to make the first git commit.

**Next / ideas**
- UI design phase — user reviews screen by screen and gives feedback.
- Later: PWA/offline, 108-jaap counter, search, more poojas (Kali Pooja etc.).

## Log

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
