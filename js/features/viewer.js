/* =====================================================================
   viewer.js — "a trace": the one window where any artifact can be met.

   Opened from anywhere (a letter in the drawer, a result in the stacks, an item on the shelf, the bin).
   It does not copy the artifact. It reads it from Store and shows it three ways, the way three eras would hold it:

     1996 · the page    the thing itself, in its maker's order, signed
     2024 · the record  what a platform would keep of it (a fiction: see lenses.js). author: not retained.
     2030 · yours       the same words with nothing filled in, who made it, its history, its connections,
                        and (if it is yours) where it lives and how to take it back.

   Below the tabs is the response bar: write a note on it · connect it to something · keep it on the shelf ·
   reply (a letter) · leave it as it is. "Leave it as it is" records nothing; this window never logs a view.
   Choices the visitor makes (a rejected category, a connection, a note) stay on the artifact when they change tab.

   The window keeps its own back-stack, so a visitor can wander through connections and come back.
   ===================================================================== */
(function () {
  'use strict';
  const L = window.Lenses, esc = L.esc;
  const $ = (s, r) => (r || document).querySelector(s);
  const TABS = [['page', '1996 · the page'], ['record', '2024 · the record'], ['yours', '2030 · yours']];
  const TYPE = { page: 'page', letter: 'letter', note: 'note', memory: 'memory', link: 'saved link', work: 'signed piece', drawing: 'drawing' };
  const stamp = (iso) => { if (!iso) return 'long ago (not recorded)'; const d = new Date(iso); return isNaN(d) ? String(iso) : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); };
  const log = (a, b) => { if (typeof logReceipt === 'function') logReceipt(a, b || 'kept on this device · yours'); };

  const st = { id: null, tab: Store.pref('lens', 'page'), sub: 'all', stack: [], panel: null, confirm: null, say: '' };

  /* ---------- why two things are connected: only things anyone can check ---------- */
  function reasons(a, b) {
    const r = [];
    Store.edges(a.id).forEach((e) => { if ((e.from === a.id && e.to === b.id) || (e.from === b.id && e.to === a.id)) r.push({ k: 'link', t: (e.by === 'you' ? 'you connected them' : 'connected by their maker') + (e.why ? ': “' + e.why + '”' : '') }); });
    const tg = (a.tags || []).filter((t) => (b.tags || []).indexOf(t) >= 0);
    if (tg.length) r.push({ k: 'tag', t: 'both declare: ' + tg.join(', ') });
    const rf = (a.refs || []).filter((t) => (b.refs || []).indexOf(t) >= 0);
    if (rf.length) r.push({ k: 'ref', t: 'both mention: ' + rf.join(', ') });
    if (a.year && a.year === b.year) r.push({ k: 'year', t: 'both from ' + a.year });
    return r;
  }
  function related(a, max) {
    const out = [];
    Store.all().forEach((b) => {
      if (b.id === a.id || Store.sealed(b) || (b.origin === 'visitor' && b.type === 'note' && b.about)) return;
      const rs = reasons(a, b); if (!rs.length) return;
      out.push({ a: b, rs, n: rs.filter((x) => x.k !== 'year').length });
    });
    out.sort((x, y) => y.n - x.n || (x.a.year - y.a.year) || (x.a.id < y.a.id ? -1 : 1));
    return out.slice(0, max || 5);
  }

  /* ---------- opening ---------- */
  function win() { return document.getElementById('win-trace'); }
  function show() {
    const w = win(), was = w.classList.contains('open') && w.style.display !== 'none';
    w.classList.add('open'); w.style.display = 'flex';
    if (typeof focusWindow === 'function') focusWindow('win-trace');
    if (typeof refreshTabs === 'function') refreshTabs();
    return was;
  }
  function open(id, o) {
    const a = Store.get(id); if (!a) return false;
    const w = win(), already = w.classList.contains('open') && w.style.display !== 'none';
    if (!already) st.stack = []; else if (st.id && st.id !== id && !(o && o.noPush)) st.stack.push(st.id);
    st.id = id; st.panel = null; st.confirm = null; st.say = '';
    if (o && o.tab) st.tab = o.tab;
    show(); draw(); return true;
  }
  function back() { const id = st.stack.pop(); if (id && Store.get(id)) { st.id = id; st.panel = null; st.confirm = null; st.say = ''; draw(); } else close(); }
  function close() { if (typeof closeWindow === 'function') closeWindow('win-trace'); st.stack = []; st.id = null; }
  function say(t) { st.say = t; const el = $('#trSay'); if (el) el.textContent = t; }
  const saved = () => 'saved in this browser only · ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  /* ---------- drawing the window ---------- */
  function draw() {
    const w = win(); if (!w) return;
    const a = Store.get(st.id);
    if (!a) { $('#trLens').innerHTML = '<p class="ts-empty">nothing is open.</p>'; return; }
    const mine = a.origin === 'visitor';
    $('#trTitle').textContent = a.id + '.txt — ' + (TYPE[a.type] || a.type);
    $('#trBack').disabled = !st.stack.length;
    $('#trMeta').innerHTML = '<b>' + esc(a.title || TYPE[a.type]) + '</b> · ' + esc(TYPE[a.type] || a.type) + ' · ' + esc(L.label(a)) + ', ' + esc(a.year) +
      '<div class="ts-prov ' + (mine ? 'mine' : a.origin === 'sample' ? 'fake' : 'real') + '">' + esc(L.provenance(a)) + '</div>';
    TABS.forEach(([k, t]) => { const b = $('#trTab-' + k); b.classList.toggle('active', st.tab === k); b.setAttribute('aria-selected', st.tab === k ? 'true' : 'false'); });
    let h = '';
    if (st.tab === 'page') h = L.page(a, {}) + (mine && a.type === 'page' ? '' : '') + '<p class="ts-foot">how an early-web page held it: in its maker’s order, with a signature. ' + (a.origin === 'visitor' ? '' : 'nothing is counting who looked.') + '</p>';
    else if (st.tab === 'record') h = recordTab(a);
    else h = yoursTab(a);
    $('#trLens').innerHTML = h;
    $('#trRespond').innerHTML = respond(a);
    $('#trSay').textContent = st.say || '';
  }

  function recordTab(a) {
    const subs = [['all', 'all three'], ['timeline', 'timeline'], ['metric', 'metric'], ['category', 'category']];
    return '<p class="ts-fiction"><b>fictional system output.</b> a platform would keep something like this. these are a short list of plain rules (listed at the bottom), not machine learning. you can say no to a category and it stays said, on every tab.</p>' +
      '<div class="ts-sub" role="group" aria-label="which record">' + subs.map(([k, t]) => '<button class="btn-95' + (st.sub === k ? ' active' : '') + '" data-act="sub" data-k="' + k + '">' + t + '</button>').join('') + '</div>' +
      '<div class="ts-legend"><span class="tk k">ink = kept</span> <span class="tk o">faded = dropped</span> <span class="ts-inf">boxed = guessed, not written by anyone</span></div>' +
      L.record(a, st.sub) +
      '<details class="testing-footer"><summary>the rules this fiction uses</summary><div>' + L.RULES.map((r) => '<div><code>' + esc(r.id) + '</code> matches <code>' + esc(r.re.source.replace(/\\b/g, '')) + '</code> → “' + esc(r.interest) + '”</div>').join('') + '<div>time: day and clock words. duration: “six hours”, “20 minutes”; otherwise 12 minutes is assumed. nothing else.</div></div></details>';
  }

  function yoursTab(a) {
    const mine = a.origin === 'visitor', au = a.author || {};
    let h = L.yours(a);
    // who
    h += '<section class="ts-lens l-who"><h4>who made it</h4><table class="ts-kv"><tr><td>by</td><td><b>' + esc(L.label(a)) + '</b></td></tr>' +
      '<tr><td>year</td><td>' + esc(a.year) + '</td></tr>' +
      '<tr><td>credited</td><td>' + (mine ? (au.handle ? 'as “' + esc(au.handle) + '” (you chose that)' : 'not by name. nobody asked you for one.') : a.origin === 'sample' ? 'a made-up person, in a made-up sample' : 'the way they chose: ' + esc(au.consent || 'named')) + '</td></tr>' +
      '<tr><td>revised</td><td>' + (a.revisions && a.revisions.length ? a.revisions.length + ' time' + (a.revisions.length === 1 ? '' : 's') + ', history ' + (a.keepHistory ? 'kept' : 'off') : mine ? (a.keepHistory ? 'not yet; history is on' : 'history is off') : 'not recorded') + '</td></tr></table>' +
      '<div class="ts-sum">nobody is told you opened this. nothing counts views. there is no read receipt.</div></section>';
    // history
    const ev = (a.events || []).slice().reverse();
    h += '<section class="ts-lens l-hist"><h4>its history</h4><ul class="ts-ev">' + ev.map((e) => '<li><span>' + stamp(e.t) + '</span> ' + esc(e.what) + '</li>').join('') + '</ul>' +
      (mine && a.revisions && a.revisions.length ? '<details class="testing-footer"><summary>earlier versions (' + a.revisions.length + ')</summary>' + a.revisions.slice().reverse().map((r) => '<div class="ts-rev"><small>' + stamp(r.t) + '</small><div>' + L.br(r.body) + '</div></div>').join('') + '</details>' : '') + '</section>';
    // connections
    const ed = Store.edges(a.id), rel = related(a, 5);
    h += '<section class="ts-lens l-conn"><h4>what it is connected to</h4>';
    if (!ed.length && !rel.length) h += '<p class="ts-empty">nothing yet. connect it to something, or leave it alone.</p>';
    ed.forEach((e) => { const o = Store.get(e.from === a.id ? e.to : e.from); if (!o) return;
      h += '<div class="ts-rel"><a href="#" data-act="open" data-id="' + esc(o.id) + '">' + esc(o.title || TYPE[o.type]) + '</a> <small>' + esc(TYPE[o.type]) + ' · ' + esc(L.label(o)) + '</small><div class="ts-why">' + (e.by === 'you' ? 'you connected them' : 'connected by its maker') + (e.why ? ': “' + esc(e.why) + '”' : '') + (e.by === 'you' ? ' <button class="ts-x" data-act="disconnect" data-eid="' + esc(e.id) + '">remove</button>' : '') + '</div></div>'; });
    const shown = {}; ed.forEach((e) => { shown[e.from === a.id ? e.to : e.from] = 1; });
    rel.filter((r) => !shown[r.a.id]).forEach((r) => { h += '<div class="ts-rel"><a href="#" data-act="open" data-id="' + esc(r.a.id) + '">' + esc(r.a.title || TYPE[r.a.type]) + '</a> <small>' + esc(TYPE[r.a.type]) + ' · ' + esc(L.label(r.a)) + '</small><div class="ts-why">' + r.rs.map((x) => esc(x.t)).join(' · ') + '</div></div>'; });
    if (rel.length) h += '<div class="ts-sum">listed by how many things they share, then oldest first. nothing else is used: no clicks, no popularity, nothing about you.</div>';
    h += '</section>';
    // notes
    const notes = Store.annotations(a.id);
    if (notes.length) h += '<section class="ts-lens l-notes"><h4>your notes on it</h4>' + notes.map((n) => '<div class="ts-note"><div>' + L.br(n.body) + '</div><small>' + stamp(n.created) + ' · ' + esc(n.visibility === 'private' ? 'only you' : n.visibility) + '</small> <button class="ts-x" data-act="open" data-id="' + esc(n.id) + '">open</button></div>').join('') + '</section>';
    if (mine) h += controls(a);
    return h;
  }

  function controls(a) {
    const vis = a.visibility, c = st.confirm, sealed = Store.sealed(a);
    const opt = (v, t, d) => '<label class="ts-opt"><input type="radio" name="trvis" data-act="vis" value="' + v + '"' + (vis === v ? ' checked' : '') + '> <b>' + t + '</b><small>' + d + '</small></label>';
    let h = '<section class="ts-lens l-ctrl"><h4>where it is, and how to take it back</h4>';
    h += '<fieldset class="ts-vis-f"><legend>who could find it</legend>' +
      opt('private', 'only me', 'nobody else could find or read it.') +
      (a.type === 'letter' ? opt('recipient', 'left for the next visit', 'sealed now; it opens when you come back. a local simulation: nothing is delivered to anyone.') : '') +
      opt('public', 'in the archive', 'a future visitor searching lost &amp; found could meet it. on this prototype that visitor is you, later: there is no server.') + '</fieldset>';
    if (sealed) h += '<p class="ts-foot">sealed until visit ' + a.unlock + '. this is visit ' + Store.session + '.</p>';
    if (a.type === 'note' || a.type === 'memory' || a.type === 'link') {
      h += '<div class="ts-edit"><label for="trEdit">revise it</label><textarea id="trEdit" class="field" rows="3">' + esc(a.body) + '</textarea><button class="btn-95" data-act="revise">save a revision</button> ' +
        '<label class="ts-opt inline"><input type="checkbox" data-act="history"' + (a.keepHistory ? ' checked' : '') + '> keep earlier versions <small>(they are shown above; unticking erases them)</small></label></div>';
    } else if (a.type === 'page') h += '<p class="ts-foot">a page is edited where it is made. <a href="#" data-act="editpage">go to my page</a>. each block there has its own visibility.</p>';
    else if (a.type === 'work') h += '<p class="ts-foot">a signed piece keeps the drafts it was signed with. <label class="ts-opt inline"><input type="checkbox" data-act="history"' + (a.keepHistory ? ' checked' : '') + '> keep the drafts</label></p>';
    else if (a.type === 'letter') h += '<p class="ts-foot">a letter is not edited once it is sent. you can change who can find it, withdraw it, or reply with another.</p>';
    h += '<div class="ts-end">';
    if (c === 'destroy') h += '<div class="ts-confirm"><b>delete forever?</b> it, its earlier versions, its connections and notes about it are erased from this browser. a copy you exported or a screenshot is not touched, and neither is anything outside this browser. <button class="btn-95" data-act="destroy-yes">yes, delete forever</button> <button class="btn-95" data-act="confirm-no">keep it</button></div>';
    else {
      h += (vis === 'public' ? '<button class="btn-95" data-act="withdraw" title="the public version goes away. you keep a private copy.">withdraw from the archive (keep a private copy)</button> ' : '') +
        '<button class="btn-95" data-act="bin" title="hidden everywhere. still on this device. you can restore it from the recycle bin.">move to the recycle bin</button> ' +
        '<button class="btn-95" data-act="destroy" title="erased from this browser">delete forever…</button>';
    }
    return h + '</div></section>';
  }

  function respond(a) {
    const mine = a.origin === 'visitor', pn = st.panel;
    let h = '<div class="ts-rbar" role="group" aria-label="what would you like to do with it?">' +
      '<button class="btn-95' + (pn === 'note' ? ' active' : '') + '" data-act="panel" data-k="note">write a note on it</button>' +
      '<button class="btn-95' + (pn === 'connect' ? ' active' : '') + '" data-act="panel" data-k="connect">connect it to something</button>' +
      '<button class="btn-95" data-act="keep">' + (Store.isKept(a.id) ? '✓ on your shelf · take it off' : 'keep it on the shelf') + '</button>' +
      (a.type === 'letter' || a.type === 'note' || a.type === 'memory' ? '<button class="btn-95" data-act="reply">reply by letter</button>' : '') +
      '<button class="btn-95" data-act="leave">leave it as it is</button></div>';
    if (pn === 'note') h += '<div class="ts-panel"><label for="trNote">a note, only for you (it stays with this artifact)</label><textarea id="trNote" class="field" rows="2" maxlength="400" placeholder="what it made you think of, or what the record got wrong"></textarea><button class="btn-95" data-act="note-save">save the note</button> <button class="btn-95" data-act="panel" data-k="">cancel</button></div>';
    if (pn === 'connect') {
      const opts = Store.all().filter((o) => o.id !== a.id && !Store.sealed(o) && !(o.origin === 'visitor' && o.about))
        .map((o) => '<option value="' + esc(o.id) + '">' + esc(TYPE[o.type]) + ' · ' + esc(o.title || o.body.slice(0, 30)) + ' · ' + esc(L.label(o)) + '</option>').join('');
      h += '<div class="ts-panel"><label for="trTo">connect it to</label><select id="trTo" class="field">' + opts + '</select><label for="trWhy">why? (optional, shown with the connection)</label><input id="trWhy" class="field" maxlength="120" placeholder="a sentence, in your words"><button class="btn-95" data-act="connect-save">connect them</button> <button class="btn-95" data-act="panel" data-k="">cancel</button></div>';
    }
    return h;
  }

  /* ---------- clicks ---------- */
  function act(e) {
    const t = e.target.closest('[data-act]'); if (!t) return;
    const k = t.dataset.act, a = Store.get(st.id);
    if (e.type === 'click' && (k === 'vis' || k === 'history')) return;   // these fire on 'change'
    if (k === 'open') { e.preventDefault(); open(t.dataset.id); return; }
    if (k === 'tab') { st.tab = t.dataset.k; Store.setPref('lens', st.tab); draw(); return; }
    if (k === 'sub') { st.sub = t.dataset.k; draw(); return; }
    if (k === 'reject' || k === 'unreject') {
      const id = t.dataset.id; Store[k](id, t.dataset.tag);
      say(k === 'reject' ? 'no, then. it is no longer counted anywhere. ' + saved() : 'put back. ' + saved()); draw(); if (window.Rooms) Rooms.refresh(); return;
    }
    if (k === 'back') { back(); return; }
    if (!a) return;
    if (k === 'panel') { st.panel = t.dataset.k || null; draw(); const f = $(st.panel === 'note' ? '#trNote' : '#trTo'); if (f) f.focus(); return; }
    if (k === 'leave') { st.panel = null; draw(); say('left as it was. nothing was saved or counted.'); return; }
    if (k === 'keep') { if (Store.isKept(a.id)) { Store.unkeep(a.id); say('taken off the shelf.'); } else { Store.keep(a.id); log('kept “' + (a.title || a.type) + '” on the shelf'); say('on your shelf. ' + saved()); } draw(); if (window.Rooms) Rooms.refresh(); return; }
    if (k === 'reply') { if (window.Rooms) Rooms.reply(a); return; }
    if (k === 'note-save') {
      const v = ($('#trNote').value || '').trim(); if (!v) { say('write something first, or cancel.'); return; }
      Store.create({ type: 'note', title: 'a note on “' + (a.title || a.type) + '”', body: v, about: a.id, visibility: 'private', tags: [], refs: [] });
      log('wrote a note on “' + (a.title || a.type) + '”'); st.panel = null; say('note saved. ' + saved()); draw(); if (window.Rooms) Rooms.refresh(); return;
    }
    if (k === 'connect-save') {
      const to = $('#trTo').value; if (!to) return;
      const ed = Store.connect(a.id, to, $('#trWhy').value);
      st.panel = null; say(ed ? 'connected. you can remove it later. ' + saved() : 'those two are already connected.'); if (ed) log('connected two things', 'kept on this device · yours'); draw(); if (window.Rooms) Rooms.refresh(); return;
    }
    if (k === 'disconnect') { Store.disconnect(t.dataset.eid); say('connection removed.'); draw(); return; }
    if (a.origin !== 'visitor') return;
    if (k === 'vis') {
      const v = t.value; Store.setVisibility(a.id, v);
      if (v === 'recipient') Store.update(a.id, { unlock: Store.session + 1 }, { what: 'sealed until your next visit' }); else if (a.unlock) Store.update(a.id, { unlock: 0 }, { what: 'unsealed' });
      say('changed to “' + (v === 'private' ? 'only me' : v === 'public' ? 'in the archive' : 'left for the next visit') + '”. ' + saved()); draw(); if (window.Rooms) Rooms.refresh(); return;
    }
    if (k === 'withdraw') { Store.setVisibility(a.id, 'private', 'withdrawn from the archive; a private copy kept'); say('withdrawn. only you can find it now. ' + saved()); draw(); if (window.Rooms) Rooms.refresh(); return; }
    if (k === 'revise') { const v = $('#trEdit').value; if (v === a.body) { say('nothing changed.'); return; } Store.update(a.id, { body: v }, { revise: true, what: 'revised' + (a.keepHistory ? ' (earlier version kept)' : ' (earlier version not kept)') }); say('revised. ' + saved()); draw(); if (window.Rooms) Rooms.refresh(); return; }
    if (k === 'history') { Store.setHistory(a.id, t.checked); say(t.checked ? 'earlier versions will be kept.' : 'earlier versions erased.'); draw(); return; }
    if (k === 'editpage') { e.preventDefault(); if (typeof openWindow === 'function') openWindow('win-personal'); return; }
    if (k === 'bin') { Store.bin(a.id); say(''); const nm = a.title || a.type; if (window.Rooms) Rooms.refresh(); afterGone('“' + nm + '” is in the recycle bin. hidden everywhere; still on this device. restore it there.'); return; }
    if (k === 'destroy') { st.confirm = 'destroy'; draw(); return; }
    if (k === 'confirm-no') { st.confirm = null; draw(); return; }
    if (k === 'destroy-yes') { const nm = a.title || a.type; Store.destroy(a.id); log('deleted “' + nm + '” forever', 'erased from this browser'); if (window.Rooms) Rooms.refresh(); afterGone('deleted forever. nothing of “' + nm + '” remains in this browser.'); return; }
  }
  function afterGone(msg) {
    st.confirm = null;
    const prev = st.stack.pop();
    if (prev && Store.get(prev) && !Store.get(prev).binned) { st.id = prev; st.say = msg; draw(); }
    else { close(); if (window.Rooms) Rooms.toast(msg); }
  }

  /* ---------- wiring ---------- */
  document.addEventListener('DOMContentLoaded', init);
  function init() {
    const w = win(); if (!w) return;
    w.addEventListener('click', act);
    w.addEventListener('change', (e) => { if (e.target.matches('[data-act="vis"],[data-act="history"]')) act(e); });
    $('#trBack').addEventListener('click', back);
    TABS.forEach(([k]) => $('#trTab-' + k).addEventListener('click', () => { st.tab = k; Store.setPref('lens', k); draw(); }));
    w.addEventListener('keydown', (e) => { if (e.key === 'Escape') { if (st.panel) { st.panel = null; draw(); } else close(); } });
    Store.on(() => { if (w.classList.contains('open') && st.id && !Store.get(st.id)) close(); });
  }
  if (document.readyState !== 'loading') setTimeout(init, 0);

  // moving along the era bar while a trace is open: it is held the way that era would hold it
  // (before 2010 as a page, 2010–2024 as a record, 2030 as "yours"). the visitor can still pick any tab by hand.
  (function () {
    const eraOf = () => { const m = /era-(\w+)/.exec(document.body.className); return m ? m[1] : null; };
    let last = eraOf();
    new MutationObserver(() => {
      const e = eraOf(); if (!e || e === last) return; last = e;
      const w = win(); if (!w || !w.classList.contains('open') || !st.id) return;
      const y = parseInt(e, 10); if (isNaN(y)) return;
      st.tab = y >= 2030 ? 'yours' : y >= 2010 ? 'record' : 'page'; draw();
    }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  })();

  window.Viewer = { open, back, close, reasons, related, draw, stamp, TYPE };
})();
