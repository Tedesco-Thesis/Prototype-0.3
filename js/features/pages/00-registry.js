/* pages/ — one bespoke page per aesthetic / subculture.
   Each file registers templates on window.SC_PAGES (load these BEFORE subcultures.js).

   SC_PAGES[id] = { w: window width in px, fx: ['label when off', 'label when on'], html: (h) => '<markup>' }

   h is the helper object subcultures.js passes in:
     h.title h.did h.years h.kind h.cname h.ctext      the culture's own text (already escaped)
     h.pal(fn?)       the clickable colour swatches   (fn(hex, i) -> inner html, optional)
     h.assets(fn?)    the clickable things to collect (fn(label, i) -> inner html, optional)
     h.fx()           the "turn it up" button
     h.count()        the running tally
     h.gloss(ph, btn) the glossary input + button
     h.terms()        the words people added
   The page's look lives in css/features/looks/*.css, scoped to #win-c-<id>. */
window.SC_PAGES = window.SC_PAGES || {};
