/* =====================================================================
   family.js — the governing metaphor: one shared family computer.

   Every era is a user profile somebody left logged in. Every file says
   "last edited by: unknown". The receipt is the recycle bin: what the computer kept
   after you let go of it. This file wires all of that, and it is on top of the rest:

   1. the profile chip + "last edited by" line on every window
   2. a short "logging in as ..." ritual per era (slow, skippable)
   3. desktop objects that vanish era by era, until one ask bar is left (2024);
      the speculative web (2030) gives them back, each with an author label
   4. the recycle bin: a badge, a rattle when it fills, a slip that resurfaces something
   5. the wallpaper follows the visitor's clock (a tint layer; works with or without photos)
   6. slower pop-ups (x1.5) and the sound toggle

   For review: add #quick to the url (index.html#quick) and the rituals/timers shrink to nothing.
   Add #hour=22 to preview the wallpaper at 22:00.
===================================================================== */
(function () {
  'use strict';
  const S = window.ThirdSpaceNext;
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const QUICK = /quick/.test(location.hash) || window.TS_QUICK === true;
  const yr = (k) => parseInt(k, 10);
  const People = window.People || { name: () => 'someone', list: [] };

  /* ---------- 1. profiles ---------- */
  const PROFILES = {
    '1991': { who: 'guest', face: '👤' }, '1993': { who: 'guest', face: '👤' }, '1996': { who: 'the first user', face: '🧑‍💻' },
    '1999': { who: 'dad', face: '👨' }, '2004': { who: 'dad', face: '👨' }, '2006': { who: 'my sister', face: '👧' },
    '2008': { who: 'my sister', face: '👧' }, '2010': { who: 'the kids', face: '🧒' }, '2014': { who: 'the kids', face: '🧒' },
    '2016': { who: 'mum', face: '👩' }, '2024': { who: 'everyone', face: '👥' }, '2030': { who: 'you', face: '🫵' },
  };
  const prof = (k) => PROFILES[k] || { who: 'unknown', face: '❔' };
  const chip = document.createElement('div');
  chip.id = 'profileChip';
  const clockEl = document.getElementById('clock');
  if (clockEl && clockEl.parentNode) clockEl.parentNode.insertBefore(chip, clockEl);
  const sbtn = document.createElement('button');
  sbtn.id = 'soundbtn'; sbtn.className = 'btn-95'; sbtn.textContent = 'sound: off'; sbtn.title = 'each profile has its own system sounds';
  sbtn.onclick = () => window.Sound && window.Sound.toggle();
  if (clockEl && clockEl.parentNode) clockEl.parentNode.insertBefore(sbtn, chip);

  // room -> who made it, once the speculative web gives the objects back
  const AUTHOR = () => ({
    'win-home': 'isabella', 'win-data': People.name(2), 'win-mail': People.name(5) + ' & you', 'win-gallery': 'you',
    'win-personal': 'you', 'win-maze': People.name(0), 'win-machine': 'the model, and you · named', 'win-receipt': 'you',
  });

  function stampWindows(k) {
    const a = AUTHOR(), next = yr(k) >= 2030;
    document.querySelectorAll('.window').forEach((w) => {
      let el = w.querySelector(':scope > .lastedit');
      if (!el) { el = document.createElement('div'); el.className = 'lastedit'; w.appendChild(el); }
      el.textContent = 'last edited by: ' + (next ? (a[w.id] || 'someone who is named here') : 'unknown');
      el.classList.toggle('named', next);
    });
  }

  function drawChip(k) {
    const p = prof(k), next = yr(k) >= 2030;
    chip.innerHTML = '<span class="pc-face">' + p.face + '</span> profile: <b>' + esc(p.who) + '</b> · last edited by: <i>' + (next ? 'everyone, named' : 'unknown') + '</i>';
    const d = new Date(); const h = window.TS_HOUR != null ? window.TS_HOUR : d.getHours() + d.getMinutes() / 60;
    chip.title = 'this profile was left logged in. it is ' + String(Math.floor(h)).padStart(2, '0') + ':' + String(Math.floor((h % 1) * 60)).padStart(2, '0') + ' where you are, and the wallpaper knows.';
  }

  /* ---------- 2. vanishing ---------- */
  const GONE_AT = { 'win-maze': 2004, 'win-personal': 2006, 'win-gallery': 2008, 'win-mail': 2010, 'win-data': 2014, 'win-machine': 2016, 'win-home': 2024 };
  const REASON = {
    'win-maze': 'search learned to rank, so looking around stopped.', 'win-personal': 'profile templates replaced the page you built.',
    'win-gallery': 'posts got shared without the signature.', 'win-mail': 'the feed replaced the letter.',
    'win-data': 'what it knew about you stopped being yours to trade.', 'win-machine': 'it moved into the text box and stopped announcing itself.',
    'win-home': 'one box answers for all of it now.',
  };
  const roomIcon = (id) => document.querySelector('.icon[data-room="' + id + '"]');
  const toast = (t) => {
    let el = $('#famToast'); if (!el) { el = document.createElement('div'); el.id = 'famToast'; document.body.appendChild(el); }
    el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 4200);
  };
  document.querySelectorAll('.icon[data-room]').forEach((ic) => {
    ic.addEventListener('click', (e) => {
      if (!ic.classList.contains('gone')) return;
      e.stopImmediatePropagation(); e.preventDefault();
      const id = ic.dataset.room;
      toast('gone since ' + GONE_AT[id] + '. ' + REASON[id] + ' nobody asked for it to go.');
      if (window.Sound) Sound.play('vanish');
    }, true);
  });

  function syncDesktop(k, prevK) {
    const y = yr(k), py = prevK ? yr(prevK) : y;
    const next = y >= 2030;
    const a = AUTHOR();
    document.querySelectorAll('.icon[data-room]').forEach((ic, i) => {
      const id = ic.dataset.room, g = GONE_AT[id];
      const gone = !!g && y >= g && !next;
      const wasGone = ic.classList.contains('gone');
      ic.classList.toggle('gone', gone);
      ic.dataset.goneYear = gone ? g : '';
      let by = ic.querySelector('.by');
      if (next && g) {
        if (!by) { by = document.createElement('div'); by.className = 'by'; ic.appendChild(by); }
        by.textContent = 'by ' + (a[id] || 'someone');
        if (wasGone || py < 2030) { ic.classList.remove('back'); void ic.offsetWidth; ic.style.animationDelay = (QUICK ? 0 : i * 0.35) + 's'; ic.classList.add('back'); }
      } else { if (by) by.remove(); ic.classList.remove('back'); }
    });
    if (next && py < 2030 && window.Sound) { [0, 1, 2].forEach((n) => setTimeout(() => Sound.play('back'), QUICK ? 0 : n * 500)); }
    else if (!next && window.Sound && document.querySelectorAll('.icon.gone').length && Object.keys(GONE_AT).some((id) => GONE_AT[id] === y)) Sound.play('vanish');
    // start menu follows the desktop
    document.querySelectorAll('#startMenu button').forEach((b) => {
      const m = /openWindow\('([^']+)'\)/.exec(b.getAttribute('onclick') || '');
      if (!m) return;
      const g = GONE_AT[m[1]];
      b.hidden = !!g && y >= g && !next;
    });
  }

  /* ---------- ask bar ---------- */
  const ask = document.createElement('form');
  ask.id = 'askbar'; ask.autocomplete = 'off';
  ask.innerHTML = '<span class="ab-l">ask</span><input type="text" id="askIn" maxlength="80" placeholder="ask for anything"><button type="submit" title="ask">↵</button><div class="ab-out" id="askOut"></div>';
  document.body.appendChild(ask);
  const INTENTS = [
    [/letter|write|message|mail|tell|reply/, 'win-mail', 'letters'], [/sign|make|made|draw|art|create/, 'win-gallery', 'the shelf'],
    [/data|week|trade|ledger/, 'win-data', 'the ledger'], [/page|profile|about me|build|site/, 'win-personal', 'my page'],
    [/find|search|lighthouse|look|where|lost/, 'win-maze', 'lost & found'], [/machine|ai|help me|rewrite|say/, 'win-machine', 'the machine between us'],
    [/bin|receipt|trash|know about me|what do you know|kept/, 'win-receipt', 'the recycle bin'], [/next|future|forecast|web|predict/, 'win-future', 'the next web'],
    [/album|aesthetic|culture|style|look like/, 'win-fieldguide', 'the album'], [/home|read|hello|hi\b|start/, 'win-home', 'the readme'],
  ];
  ask.onsubmit = (e) => {
    e.preventDefault();
    const q = $('#askIn').value.trim(); if (!q) return;
    const out = $('#askOut'); let hit = INTENTS.find((r) => r[0].test(q.toLowerCase()));
    const guessed = !hit; if (!hit) hit = INTENTS[0];
    if (typeof logReceipt === 'function') logReceipt('asked: “' + q.slice(0, 40) + '”', guessed ? 'kept · answered with a guess' : 'kept · used to guess what you want next');
    out.textContent = guessed ? 'i wasn’t sure, so i guessed: ' + hit[2] + '.' : 'here is what you meant: ' + hit[2] + '.';
    out.classList.add('show'); clearTimeout(ask.t); ask.t = setTimeout(() => out.classList.remove('show'), 5000);
    if (hit[1] === 'win-fieldguide') { const ic = $('.culture-icon[data-cid="fieldguide"]'); if (ic) ic.click(); else openWindow(hit[1]); }
    else if (hit[1] === 'win-future') { if (typeof window.openWindow === 'function') openWindow('win-future'); }
    else openWindow(hit[1]);
    $('#askIn').value = '';
  };

  /* ---------- 3. recycle bin ---------- */
  const bin = roomIcon('win-receipt');
  let badge = null, lastN = 0, binFull = false;
  if (bin) {
    bin.classList.add('is-bin');
    badge = document.createElement('div'); badge.className = 'bin-badge'; badge.hidden = true; bin.appendChild(badge);
  }
  setInterval(() => {
    if (!bin || typeof Trace === 'undefined') return;
    const n = Trace.entries.length;
    badge.hidden = n === 0; badge.textContent = n > 99 ? '99+' : n;
    if (n > lastN) { bin.classList.remove('rattle'); void bin.offsetWidth; bin.classList.add('rattle'); if (n % 5 === 0 && window.Sound) Sound.play('rattle'); }
    lastN = n;
    const full = n >= 12;
    if (full !== binFull) { binFull = full; bin.querySelector('.glyph').textContent = full ? '🗑' : '🗑'; bin.classList.toggle('full', full); }
  }, 1200);
  // every so often the bin gives something back
  function haunt() {
    if (!bin || typeof Trace === 'undefined' || !Trace.entries.length || document.hidden) return;
    const pool = Trace.entries.filter((e) => e && e.label && !/pop-up was shown/.test(e.label));
    if (!pool.length) return;
    const e = pool[Math.floor(Math.random() * pool.length)];
    const r = bin.getBoundingClientRect();
    let sl = $('#binSlip'); if (!sl) { sl = document.createElement('div'); sl.id = 'binSlip'; document.body.appendChild(sl); }
    sl.innerHTML = '<small>still here</small>' + esc(String(e.label).slice(0, 56));
    sl.style.left = Math.max(8, r.right + 8) + 'px'; sl.style.top = (r.top + 6) + 'px';
    sl.classList.add('show'); if (window.Sound) Sound.play('rattle');
    clearTimeout(haunt.t); haunt.t = setTimeout(() => sl.classList.remove('show'), 5200);
  }
  setInterval(haunt, QUICK ? 6000 : 55000);
  S.haunt = haunt;

  /* ---------- 4. wallpaper follows the visitor's clock ---------- */
  const tod = document.createElement('div'); tod.id = 'todLayer';
  document.getElementById('desktop').insertBefore(tod, document.getElementById('desktop').firstChild);
  const STOPS = [   // [hour, r, g, b, alpha]
    [0, 12, 16, 64, 0.42], [5, 20, 28, 84, 0.36], [7, 255, 160, 120, 0.16], [9, 255, 240, 200, 0.0], [16, 255, 240, 200, 0.0],
    [18, 255, 130, 60, 0.2], [20, 70, 40, 110, 0.3], [22, 14, 18, 70, 0.4], [24, 12, 16, 64, 0.42],
  ];
  function todColor(h) {
    for (let i = 0; i < STOPS.length - 1; i++) {
      const a = STOPS[i], b = STOPS[i + 1];
      if (h >= a[0] && h <= b[0]) { const t = (h - a[0]) / (b[0] - a[0] || 1); return a.slice(1).map((v, j) => v + (b[j + 1] - v) * t); }
    }
    return [0, 0, 0, 0];
  }
  function drawTod() {
    const m = /hour=(\d+(?:\.\d+)?)/.exec(location.hash); if (m) window.TS_HOUR = parseFloat(m[1]);
    const d = new Date(), h = window.TS_HOUR != null ? window.TS_HOUR : d.getHours() + d.getMinutes() / 60;
    const c = todColor(h);
    tod.style.background = 'rgba(' + Math.round(c[0]) + ',' + Math.round(c[1]) + ',' + Math.round(c[2]) + ',' + c[3].toFixed(3) + ')';
    const name = h < 5 || h >= 22 ? 'night' : h < 9 ? 'morning' : h < 17 ? 'day' : h < 20 ? 'dusk' : 'evening';
    document.body.dataset.tod = name;
    drawChip(typeof currentEra !== 'undefined' ? currentEra : '1991');
  }
  drawTod(); setInterval(drawTod, 60000);

  /* ---------- 5. the login ritual: one per era, slow, skippable ---------- */
  const rit = document.createElement('div'); rit.id = 'ritual'; rit.hidden = true;
  document.body.appendChild(rit);
  let ritTimer = null, ritFor = null;
  function closeRitual() { clearTimeout(ritTimer); rit.hidden = true; rit.innerHTML = ''; rit.className = ''; ritFor = null; }
  function topPx() { const b = document.getElementById('eraBar'), n = document.getElementById('eraNote'); return (b ? b.offsetHeight : 30) + (n ? n.offsetHeight : 0); }
  function ritual(k) {
    closeRitual();
    const y = yr(k), p = prof(k);
    rit.style.top = topPx() + 'px';
    ritFor = k; rit.hidden = false;
    const done = (ms) => { ritTimer = setTimeout(() => { if (ritFor === k) closeRitual(); }, QUICK ? 120 : ms); };
    const skip = '<a href="#" class="rt-skip">skip</a>';
    let html = '';
    if (y <= 1999) {
      rit.className = 'rt-early';
      const lines = ['connecting at 14400 …', 'handshake …', 'carrier found.', 'logging in as ' + p.who + ' …'];
      html = '<div class="rt-card"><pre class="rt-lines"></pre>' + skip + '</div>';
      rit.innerHTML = html;
      let i = 0; const pre = $('.rt-lines', rit);
      (function step() { if (ritFor !== k) return; pre.textContent = lines.slice(0, ++i).join('\n'); if (i < lines.length) ritTimer = setTimeout(step, QUICK ? 10 : 650); else done(700); })();
      if (window.Sound) Sound.play('login');
    } else if (y <= 2008) {
      rit.className = 'rt-pick';
      rit.innerHTML = '<div class="rt-card"><div class="rt-face">' + p.face + '</div><p>who is this?</p><button class="btn-95 rt-go">i’m ' + esc(p.who) + '</button>' + skip + '</div>';
      $('.rt-go', rit).onclick = () => { if (typeof logReceipt === 'function' && y >= 1999) logReceipt('logged in as ' + p.who, 'profile · remembered'); closeRitual(); };
      done(7000); if (window.Sound) Sound.play('login');
    } else if (y <= 2014) {
      rit.className = 'rt-remember';
      rit.innerHTML = '<div class="rt-card"><div class="rt-face">' + p.face + '</div><p>welcome back, ' + esc(p.who) + '.</p><label><input type="checkbox" class="rt-rem" checked> keep me signed in on this computer</label><button class="btn-95 rt-go">log in</button>' + skip + '</div>';
      $('.rt-go', rit).onclick = () => {
        const keep = $('.rt-rem', rit).checked;
        if (typeof logReceipt === 'function') logReceipt(keep ? 'asked to be remembered (pre-ticked)' : 'declined to be remembered', keep ? 'kept · you did not choose this' : 'noted');
        if (window.ThirdSpaceNext) S.flags.remembered = keep ? 'default' : 'declined';
        closeRitual();
      };
      done(8000); if (window.Sound) Sound.play('login');
    } else if (y <= 2016) {
      rit.className = 'rt-continue';
      rit.innerHTML = '<div class="rt-card"><div class="rt-face">' + p.face + '</div><button class="btn-95 rt-go">continue as ' + esc(p.who) + '</button>' + skip + '</div>';
      $('.rt-go', rit).onclick = () => closeRitual();
      done(5000); if (window.Sound) Sound.play('login');
    } else if (y <= 2026) {
      rit.className = 'rt-none';
      rit.innerHTML = '<div class="rt-card"><p>you are already logged in.</p></div>';
      ritTimer = setTimeout(() => { if (ritFor === k) closeRitual(); }, QUICK ? 120 : 1300);
    } else {
      rit.className = 'rt-sign';
      const have = (S.me && S.me.handle) || '';
      rit.innerHTML = '<div class="rt-card"><p>write your name to come in.<br><small>it will be on everything you make here.</small></p><input id="rtName" maxlength="24" value="' + esc(have) + '" placeholder="a name or a handle"><button class="btn-95 rt-go">come in</button>' + skip + '</div>';
      $('.rt-go', rit).onclick = () => {
        const n = ($('#rtName', rit).value || '').trim();
        if (n) { S.me.handle = n; if (typeof logReceipt === 'function') logReceipt('signed the login screen', 'authored by you · kept with your name'); }
        closeRitual();
      };
      if (window.Sound) Sound.play('login'); if (QUICK) done(0);
    }
    const sk = $('.rt-skip', rit); if (sk) sk.onclick = (e) => { e.preventDefault(); closeRitual(); };
  }

  /* ---------- wiring ---------- */
  let prevEra = null;
  function onEra(k) {
    drawChip(k); stampWindows(k); syncDesktop(k, prevEra);
    ritual(k);
    prevEra = k;
  }
  const origSet = window.setEra;
  window.setEra = function (k) { const r = origSet.apply(this, arguments); onEra(k); return r; };
  const origOpen = window.openWindow;
  window.openWindow = function (id) { const r = origOpen.apply(this, arguments); if (window.Sound) Sound.play('open'); return r; };
  const origClose = window.closeWindow;
  if (origClose) window.closeWindow = function () { const r = origClose.apply(this, arguments); if (window.Sound) Sound.play('close'); return r; };
  new MutationObserver((m) => { if (m.some((x) => x.addedNodes.length) && window.Sound) Sound.play('popup'); }).observe(document.getElementById('popupLayer'), { childList: true });

  // slower pop-ups: one and a half times the old interval (the ritual and the bin carry the era's pressure instead)
  try { Object.keys(eraPopupInterval).forEach((k) => { eraPopupInterval[k] = Math.round(eraPopupInterval[k] * 1.5); }); } catch (e) { /* not available */ }

  S.family = { PROFILES, GONE_AT, ritual, closeRitual, QUICK };
  onEra(typeof currentEra !== 'undefined' ? currentEra : '1991');
})();
