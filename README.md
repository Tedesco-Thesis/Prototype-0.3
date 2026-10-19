# Third Space — prototype 0.2

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
