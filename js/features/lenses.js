/* =====================================================================
   lenses.js — one artifact, shown the way each era would hold it.

   page    (the early web): the thing itself, in its maker's order, signed.
   record  (the platform web): what a system would keep of it. THIS IS A FICTION. It is a short table of plain-text
           rules (RULES below, listed in the interface too). It is not machine learning, it learns nothing, and
           nothing it prints leaves the visitor's browser.
   yours   (the next web): the same words, with what is unknown left unknown, the author named, and the controls on it.

   Every piece of text that came from a visitor goes through esc(). This file only builds strings; viewer.js attaches
   the clicks (data-act attributes).
   ===================================================================== */
(function () {
  'use strict';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const br = (s) => esc(s).replace(/\n/g, '<br>');

  /* ---- the fiction's rules (all of them) ---- */
  const RULES = [
    { id: 'repair', re: /\b(fix|fixed|fixing|repair|repaired|mend|mended|solder|patch|broke|broken)\b/i, interest: 'home improvement', sells: 'tools & hardware offers', ask: 'what was it, and why did it matter that it sounded right?' },
    { id: 'garden', re: /\b(tomato|tomatoes|garden|seed|seeds|soil|plant|plants)\b/i, interest: 'gardening', sells: 'seed subscriptions', ask: 'what did you hope would grow?' },
    { id: 'transit', re: /\b(bus|train|timetable|route|stop)\b/i, interest: 'public transport', sells: 'ride-share offers', ask: 'where were you trying to get to?' },
    { id: 'tech', re: /\b(radio|computer|modem|dial|floppy|screen|site|page|browser|chat|forum|flash|web|counter)\b/i, interest: 'consumer electronics', sells: 'device upgrades', ask: 'what was it like to use, before it was optimised?' },
    { id: 'letters', re: /\b(letter|letters|wrote|write|writing|pen-?pal|stamp|post)\b/i, interest: 'stationery & publishing', sells: 'a premium writing tier', ask: 'who did you want to reach, and did they answer?' },
    { id: 'family', re: /\b(dad|mum|mom|sister|brother|cousin|grandmother|grandfather|family|kids?)\b/i, interest: 'family', sells: 'a family plan', ask: 'who is in this, and are they happy to be in a record?' },
    { id: 'night', re: /\b(night|quiet|dark|late|3:\d\d|am)\b/i, interest: 'sleep & wellness', sells: 'sleep tracker offers', ask: 'was the quiet chosen or just what was left?' },
    { id: 'weather', re: /\b(weather|rain|gray|grey|forecast|window|sun)\b/i, interest: 'weather alerts', sells: 'a weather app', ask: 'what does it look like from where you are?' },
    { id: 'mood', re: /\b(sad|tired|lonely|alone|upset|miss|missed)\b/i, interest: 'mood: low (inferred)', sells: 'wellbeing ads', ask: 'would you have said this to a stranger? did you mean it to be kept?' },
  ];
  const NEG = /\b(wasn'?t|isn'?t|didn'?t|never|not|no)\b/i;
  const DAY = /\b(mon|tues?|wed(nes)?|thu(rs)?|fri|sat(ur)?|sun)(day)?\b/i;
  const TIMEW = /\b(morning|evening|night|noon|today|yesterday|week|weekend|\d{1,2}:\d\d|\d+ ?(am|pm))\b/i;
  const DUR = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|twelve) ?(hours?|hrs?|minutes?|mins?|days?)\b/i;
  const OUT = /\b(fix|fixed|fixing|made|make|built|build|finished|wrote|drew|sent|grew|repaired|mended)\b/i;
  const NUM = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12 };

  function minutesOf(text) {
    const m = DUR.exec(text); if (!m) return null;
    const n = NUM[m[1].toLowerCase()] || parseInt(m[1], 10) || 1; const u = m[2].toLowerCase();
    return /^h/.test(u) ? n * 60 : /^d/.test(u) ? n * 60 * 24 : n;
  }
  const words = (t) => String(t || '').split(/\s+/).filter(Boolean);
  // the words a system would read. a page is read block by block; anything else is read from its body. titles are not read:
// for a sentence or a signed piece the title is only a shortened copy of the body, and counting it twice made the record repeat itself.
const textOf = (a) => (a.fields && a.fields.blocks) ? a.fields.blocks.filter((b) => b.vis !== 'private' || a.origin === 'visitor').map((b) => b.text).filter(Boolean).join('. ') : String(a.body || '');

  /* what the fiction would infer from an artifact; rejected rules (the visitor said "no") are removed */
  function infer(a) {
    const text = textOf(a), rej = (window.Store && Store.marks(a.id).rejected) || [];
    const hits = RULES.map((r) => ({ r, n: (text.match(new RegExp(r.re.source, 'gi')) || []).length })).filter((h) => h.n > 0);
    const kept = hits.filter((h) => rej.indexOf(h.r.id) < 0).map((h) => ({ id: h.r.id, interest: h.r.interest, sells: h.r.sells, ask: h.r.ask, conf: Math.min(97, 52 + 15 * h.n), rule: String(h.r.re.source).slice(0, 60) }));
    const rejected = hits.filter((h) => rej.indexOf(h.r.id) >= 0).map((h) => ({ id: h.r.id, interest: h.r.interest }));
    const day = DAY.exec(text), tw = TIMEW.exec(text), mins = minutesOf(text);
    const assumed = mins == null;
    const minutes = assumed ? 12 : mins;
    const units = OUT.test(text) ? 1 : 0;
    const unnecessary = units > 0 && NEG.test(text);
    const score = Math.max(0, Math.min(100, Math.round(100 * units / (1 + minutes / 60)) - (unnecessary ? 60 : 0)));
    return { text, kept, rejected, day: day && day[0], when: tw && tw[0], minutes, assumed, units, unnecessary, score, nWords: words(text).length };
  }

  /* ---- tokens: ink = kept, faded = dropped ---- */
  function tokens(text, keepRe) {
    return words(text).map((w) => '<span class="tk ' + (keepRe && keepRe.test(w.replace(/[.,;:!?"]/g, '')) ? 'k' : (keepRe ? 'o' : 'k')) + '">' + esc(w) + '</span>').join(' ');
  }
  const reAny = (arr) => arr.length ? new RegExp('^(' + arr.map((r) => r.re.source.replace(/^\\b\(|\)\\b$/g, '').replace(/^\\b|\\b$/g, '')).join('|') + ')$', 'i') : null;

  const label = (a) => {
    const au = a.author || {};
    if (a.origin === 'visitor') return au.handle ? au.handle : 'you (no name given)';
    return au.label || au.handle || 'someone';
  };
  const provenance = (a) => a.origin === 'visitor' ? 'left by you · stored only in this browser'
    : a.origin === 'sample' ? 'fictional sample · written for this prototype' : 'shared with consent (' + ((a.author && a.author.consent) || 'named') + ')';

  /* ---- the archival page ---- */
  const GRID = ['#f4efe6', '#1d1a16', '#a53d2e', '#2d5a4c'];
  function drawing(grid) {
    return '<div class="ts-grid" role="img" aria-label="a small drawing">' + (grid || []).map((row) => String(row).split('').map((c) => '<i style="background:' + (GRID[+c] || GRID[0]) + '"></i>').join('')).join('') + '</div>';
  }
  function page(a, opt) {
    const o = opt || {}, mine = a.origin === 'visitor', f = a.fields || {};
    let h = '<article class="ts-paper ts-t-' + esc(a.type) + (f.bg ? ' bg-' + esc(f.bg) : '') + '">';
    if (a.type === 'page') {
      h += '<h3 class="ts-h">' + esc(a.title || 'untitled') + '</h3>';
      const bl = (f.blocks || []);
      if (!bl.length) h += '<p class="ts-empty">nothing here yet.</p>';
      bl.forEach((b) => {
        const hide = mine && b.vis === 'private' && o.asStranger;
        if (hide) return;
        h += '<section class="ts-blk' + (b.unfinished ? ' unf' : '') + (b.kind === 'empty' ? ' emp' : '') + '"><div class="ts-bl">' + esc(b.label || '') +
          (mine && !o.asStranger ? ' <span class="ts-vis v-' + esc(b.vis || 'private') + '">' + (b.vis === 'public' ? 'in the archive' : 'only you') + '</span>' : '') + '</div>' +
          (b.kind === 'empty' ? '<div class="ts-blank">left empty on purpose</div>' : '<div class="ts-bt">' + br(b.text) + (b.unfinished ? ' <em class="ts-unf">(not finished)</em>' : '') + '</div>') + '</section>';
      });
    } else if (a.type === 'letter') {
      h += '<div class="ts-to">to: ' + esc(f.to || 'whoever finds this') + '</div><div class="ts-body">' + br(a.body) + '</div>';
      if (f.attach && f.attach.kind === 'drawing') h += '<div class="ts-att">attached: ' + drawing(f.attach.grid) + '</div>';
      if (f.attach && f.attach.kind === 'link') h += '<div class="ts-att">attached: <b>' + esc(f.attach.url) + '</b>' + (f.attach.why ? ' — ' + esc(f.attach.why) : '') + '</div>';
      h += '<div class="ts-sig">— ' + esc(label(a)) + ', ' + esc(a.year) + '</div>';
    } else if (a.type === 'link') {
      h += '<div class="ts-body">saved: <b>' + esc(f.url || a.title) + '</b></div><div class="ts-body">' + br(a.body) + '</div>' + (f.why ? '<div class="ts-att">why: ' + esc(f.why) + '</div>' : '');
    } else if (a.type === 'drawing') {
      h += drawing(f.grid) + '<div class="ts-body">' + esc(a.title) + '. ' + esc(a.body) + '</div>';
    } else if (a.type === 'work') {
      h += '<div class="ts-body">' + br(a.body) + '</div><div class="ts-sig">hand-signed · ' + (f.drafts || 1) + ' draft' + ((f.drafts || 1) === 1 ? '' : 's') + ' · ' + esc(label(a)) + '</div>';
    } else {
      h += (a.title ? '<h3 class="ts-h">' + esc(a.title) + '</h3>' : '') + '<div class="ts-body">' + br(a.body) + '</div><div class="ts-sig">— ' + esc(label(a)) + ', ' + esc(a.year) + '</div>';
    }
    return h + '</article>';
  }

  /* ---- the platform's record (fiction) ---- */
  function record(a, sub) {
    const I = infer(a), id = a.id;
    const catRe = reAny(RULES.filter((r) => I.kept.some((k) => k.id === r.id)));
    const sec = (cls, title, inner, sum) => '<section class="ts-lens ' + cls + '"><h4>' + title + '</h4>' + inner + '<div class="ts-sum">' + sum + '</div></section>';
    const out = [];
    const want = (k) => !sub || sub === 'all' || sub === k;
    if (want('timeline')) {
      const keep = new RegExp('^(' + DAY.source.replace(/\\b/g, '') + '|' + TIMEW.source.replace(/\\b/g, '') + '|' + DUR.source.replace(/\\b/g, '') + ')$', 'i');
      out.push(sec('l-time', 'as an activity timeline',
        '<div class="ts-says">' + tokens(I.text, keep) + '</div><table class="ts-kv"><tr><td>event</td><td>' + (I.kept[0] ? 'activity: ' + esc(I.kept[0].interest) : 'text posted') + '</td></tr>' +
        '<tr><td>when</td><td>' + (I.day || I.when ? esc(I.day || I.when) + ' <small>(from the words)</small>' : 'unknown <small>(not stored; ' + esc(a.year) + ')</small>') + '</td></tr>' +
        '<tr><td>duration</td><td>' + I.minutes + ' min ' + (I.assumed ? '<span class="ts-inf">assumed · platform default</span>' : '<small>(from the words)</small>') + '</td></tr></table>',
        'kept: ' + ((I.day || I.when) ? 'a time word' : 'nothing about when') + '. dropped: everything else. <b>guessed:</b> ' + (I.assumed ? 'how long it took.' : 'nothing.')));
    }
    if (want('metric')) {
      const keep = new RegExp('^(' + OUT.source.replace(/\\b/g, '') + '|' + NEG.source.replace(/\\b/g, '') + ')$', 'i');
      out.push(sec('l-metric', 'as a productivity metric',
        '<div class="ts-says">' + tokens(I.text, keep) + '</div><div class="ts-big">' + I.score + '<small>/100</small></div>' +
        '<table class="ts-kv"><tr><td>deliverables</td><td>' + I.units + '</td></tr><tr><td>minutes</td><td>' + I.minutes + (I.assumed ? ' <span class="ts-inf">assumed</span>' : '') + '</td></tr>' +
        '<tr><td>flag</td><td>' + (I.unnecessary ? '<span class="ts-inf">unnecessary work: acted on something not broken</span>' : 'none') + '</td></tr></table>',
        'rule: 100 × deliverables ÷ (1 + minutes ÷ 60), minus 60 for “unnecessary”. <b>dropped:</b> why it was worth doing.'));
    }
    if (want('category')) {
      const chips = I.kept.map((k) => '<span class="ts-chip"><b>' + esc(k.interest) + '</b> ' + k.conf + '% <small>→ ' + esc(k.sells) + '</small> ' +
        (a.origin === 'visitor' || true ? '<button class="ts-x" data-act="reject" data-id="' + esc(id) + '" data-tag="' + esc(k.id) + '" title="that is not me / not this">not this</button>' : '') + '</span>').join('') ||
        '<span class="ts-none">nothing it could file this under.</span>';
      const rejs = I.rejected.map((r) => '<span class="ts-chip rej"><s>' + esc(r.interest) + '</s> <small>you rejected this</small> <button class="ts-x" data-act="unreject" data-id="' + esc(id) + '" data-tag="' + esc(r.id) + '">undo</button></span>').join('');
      out.push(sec('l-cat', 'as an inferred interest',
        '<div class="ts-says">' + tokens(I.text, catRe) + '</div><div class="ts-chips">' + chips + rejs + '</div>' +
        '<div class="ts-meta">author: <b>not retained</b> · user id: ' + (10000 + (a.id.split('').reduce((n, c) => n + c.charCodeAt(0), 0) % 89999)) + ' · last edited by: unknown</div>',
        'confidence numbers are made up by a formula (52 + 15 per match). <b>boxed words are things nobody wrote.</b>'));
    }
    return out.join('');
  }

  /* ---- the next web: what stays unknown ---- */
  function yours(a) {
    const I = infer(a), asks = I.kept.map((k) => k.ask);
    if (!I.day && !I.when) asks.push('when was this?');
    if (I.assumed) asks.push('how long did it take you? (the record guessed ' + I.minutes + ' minutes)');
    asks.push('what would you want a stranger to understand without having to explain?');
    const unk = [];
    if (!I.day && !I.when) unk.push('when'); if (I.assumed) unk.push('how long'); unk.push('why it mattered', 'who it was for');
    return '<section class="ts-lens l-yours"><h4>the same words, with nothing filled in</h4><div class="ts-says big">' + br(a.body || a.title) + '</div>' +
      '<div class="ts-unk">unknown, and left unknown: ' + unk.map((u) => '<span class="ts-q">' + esc(u) + '?</span>').join(' ') + '</div>' +
      '<ul class="ts-asks">' + asks.slice(0, 4).map((q) => '<li>' + esc(q) + '</li>').join('') + '</ul>' +
      '<div class="ts-sum">this is a reading, not a verdict. it asks; it does not decide. you can overwrite it with a note of your own.</div></section>';
  }

  /* all the memories together, as the ledger would profile you; changes when one is removed or a category rejected */
  function profile(arts) {
    const tally = {}; let n = 0;
    arts.forEach((a) => { n += 1; infer(a).kept.forEach((k) => { tally[k.interest] = (tally[k.interest] || 0) + 1; }); });
    const rows = Object.keys(tally).map((k) => [k, tally[k]]).sort((x, y) => y[1] - x[1] || (x[0] < y[0] ? -1 : 1));
    return { n, rows };
  }

  window.Lenses = { RULES, infer, page, record, yours, profile, drawing, esc, br, label, provenance };
})();
