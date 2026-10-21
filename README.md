# Third Space — prototype 0.4

An interactive Windows-95-style desktop that moves through the history of the web, era by era.
Static site: open `index.html` (or serve the folder, e.g. `python3 -m http.server`).

## Folders

```
index.html            the page; lists every stylesheet and script, in load order
assets/               images (1996, 1999 ...)
css/
  core/               style.css (base desktop, windows, pop-ups), early-eras.css (1991–2003), layer3.css (guide, forecast)
  features/           subcultures.css (shared frame reset + primitives, field guide, interest profile)
  features/looks/     a-oldweb … f-independence .css (one bespoke look per aesthetic, scoped to #win-c-<id>)
  eras/               one stylesheet per later era: 2004, 2005-07, 2008-09, 2010-13, 2014, 2016-19, 2020-26
js/
  core/               script.js (base: eras, windows, receipt), early-eras.js (1991, 1993, 1999)
  features/           cultures.js (subculture icons + "the next web"), guide.js (mote, pop-ups, cookies, log)
  eras/               one script per later era, same names as the css
```

## Load order matters

`script.js` → `cultures.js` → `js/features/pages/*.js` (one HTML template per aesthetic) → `subcultures.js` → `early-eras.js` → era scripts, oldest to newest → `guide.js` (last).
Era scripts splice themselves into the timeline, so each one must load after the era before it.

## Adding an era

1. `css/eras/<years>.css` scoped to `body.era-<key>`; `js/eras/<years>.js` that adds the era (or edits an existing entry), the per-window chrome, and receipt lines.
2. To give it a guide task and pop-up copy, set `window.__eraXXXX = { key, beat, tag, tier, chance, copy }` and add one line to the registration block near the bottom of `guide.js`.
3. Add the `<link>` and `<script>` to `index.html`, after the previous era.

## Subcultures: how an icon is placed

Each entry in `subcultures.js` has `from` / `until` (the era years in which its icon is on the desktop), a family (A–F),
a palette, a font, assets and a treatment (`fx`). The desktop holds at most 15 icons; everything else stays reachable
through the field guide icon. Every interaction (take a colour, collect an asset, add a word, apply the look, keep)
writes a line to the receipt and feeds the interest profile on the receipt window.


## Each aesthetic is its own page
- **Template** (what is on the page): `js/features/pages/<group>.js`, `SC_PAGES[id] = { w, fx, html }`. The template builds the
  layout and decoration; `subcultures.js` wires up the four things to do (take a colour, collect an asset, add a word, the
  "turn it up" button), and every one is itemised on the receipt.
- **Look** (how it looks): `css/features/looks/*.css`. Every rule is scoped to `#win-c-<id>`, so it cannot leak. A look sets
  CSS variables (`--bg --ink --font --w-bd --tb-bg …`, listed at the top of `subcultures.css`) for the window frame and titlebar,
  then styles its own markup. Era chrome (url bars, status footers) is hidden inside these windows: each place is its own website.
- To change one page: edit its block in `pages/` and its block in `looks/`. To add one: add an entry to `D` in `subcultures.js`,
  a template in `pages/`, and a look in `looks/`.


## Rooms (0.4)
Two rooms were folded into others, because they argued the same axis and had no guide task of their own:
- **find it** now has two tabs: *find it* (the three friction modes) and *who knows?* (answered by uncertain people, not ranked pages).
- **the data room** now has two tabs: *the week* (reciprocal trade) and *our data* (a relationship as felt vs. as recorded).

Tabs are plain markup (`.pane-tabs` + `.pane`) switched by `setPane / switchPane / openPane` in `js/core/script.js`.
Pop-up and receipt copy still use the old room keys (`win-whoknows`, `win-social`): `roomKeyOf(win)` returns the key for the tab that is showing.

## Assets and provenance (0.4)
`js/core/assets.js` is the manifest (it loads first). Every image the prototype uses is declared there with a *kind*:
`mine`, `reconstructed`, `referenced` or `unset`. The about window lists everything by kind, the empty slots, and the
invented/placeholder content, so the prototype says who made what.

- Folders: `assets/eras/<era>/` and `assets/cultures/<id>/` (the 1999 pills stay in `assets/1999/` and are declared in the manifest).
- Default slots: `era.<era>.wallpaper`, `era.<era>.graphic`, `culture.<id>.hero`, `culture.<id>.graphic`.
- To add one: drop the file in its folder, add an entry to `assets` in `assets.js`, set `kind`, reload.
  A `culture.<id>.hero` appears at the top of that aesthetic's window by itself. To place it elsewhere, call `h.asset('hero')` in the page template (`js/features/pages/`).
- Era wallpapers/graphics: the slots exist, but nothing draws them yet (next step: read `Assets.src('era.<key>.wallpaper')` where each era sets its desktop).
- Check what is missing from the console: `Assets.todo()`.


## The next web (speculative era) — js/eras/next.js, css/eras/next.css

A final era, "next ▸", entered after 2020–26 (or via mote). It is not a skin of the past: it builds a world **from the visitor**.

1. **Catalog.** Every receipt line becomes a record (id `TS-0001`, title, type, credited to, time, status: *observed* / *system-initiated* / *inferred*). The `RULES` table in next.js says how each kind of line is classified and what it counts toward.
2. **Scoring.** Records add weight to four worlds: delegation (yes-to-offers, assistant, autoplay left on, shares), commons (letters, signed work, cancelling, choosing the order), provenance (reading the receipt / cookie list, asking why, and the largest gap between what was *kept* and what was *done*), museum (opening many places, doing little). Too little signal = **delegation, assigned by default**, and the site says so.
3. **Dispute.** In "your catalog" any record can be disputed ("not what I meant" / "wasn't me"). It stops counting and the world is recomputed. Acting inside a world (revoking an agent permission, tending a memory, rejecting an action) writes new records, so a world can talk you out of itself.
4. **Four worlds**, each with premise, six conditions (technology, economics, governance, culture, material reality, interface consequences — each tagged *exists today* / *plausible within a few years* / *speculation*), its own design system (type, palette with meanings, layout rules), a critical question, three interface artifacts filled with the visitor's own data, and a path from today ("exists today" / "what would have to change").
5. **Other futures.** Preview the worlds you did not get, with what would have tipped you there and the (deliberately crude) scoring shown.

Pages: front door · your catalog · the world · artifacts · other futures · footholds & sources. Edit words in `WORLDS`, edit what counts in `RULES`; nothing else needs touching. `ThirdSpaceNext.evalWorld()` returns the live scores for testing. Logging only starts at 1999 (the site's own rule), so a visitor who jumps straight to "next" gets the default world.

Sources are labelled by evidentiary status (theory / industry / portfolio / essay / speculative / lead). The Awwwards AI report and Seesaw AIID 26 are listed as leads only; nothing is attributed to them.
