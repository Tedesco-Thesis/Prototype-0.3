# Third Space — prototype 0.2

An interactive Windows-95-style desktop that moves through the history of the web, era by era.
Static site: open `index.html` (or serve the folder, e.g. `python3 -m http.server`).

## Folders

```
index.html            the page; lists every stylesheet and script, in load order
assets/               images (1996, 1999 ...)
css/
  core/               style.css (base desktop, windows, pop-ups), early-eras.css (1991–2003), layer3.css (guide, forecast)
  eras/               one stylesheet per later era: 2004, 2005-07, 2008-09, 2010-13, 2014, 2016-19, 2020-26
js/
  core/               script.js (base: eras, windows, receipt), early-eras.js (1991, 1993, 1999)
  features/           cultures.js (subculture icons + "the next web"), guide.js (mote, pop-ups, cookies, log)
  eras/               one script per later era, same names as the css
```

## Load order matters

`script.js` → `cultures.js` → `early-eras.js` → era scripts, oldest to newest → `guide.js` (last).
Era scripts splice themselves into the timeline, so each one must load after the era before it.

## Adding an era

1. `css/eras/<years>.css` scoped to `body.era-<key>`; `js/eras/<years>.js` that adds the era (or edits an existing entry), the per-window chrome, and receipt lines.
2. To give it a guide task and pop-up copy, set `window.__eraXXXX = { key, beat, tag, tier, chance, copy }` and add one line to the registration block near the bottom of `guide.js`.
3. Add the `<link>` and `<script>` to `index.html`, after the previous era.
