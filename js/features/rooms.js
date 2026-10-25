/* =====================================================================
   rooms.js — the rooms, wired to the store.

   Before this file the rooms kept their state in memory and forgot it on reload, and they shared nothing.
   Now every room reads and writes the same artifacts (js/core/store.js) and opens the same viewer:

     my page          the builder, saved as one page artifact. each block has its own visibility.
     letters          write (to someone, with an attachment, with a delivery choice) + the drawer
     the shelf        drafts are revisions of one artifact; "sign" makes it a signed piece. + what you kept
     the ledger       a new "one sentence" tab: one sentence, three records, a profile that follows your choices
     lost & found     a new "the stacks" tab: search by words, declared interests, a shared page, or chance
     the recycle bin  a new "what you left" tab: inspect, hide, restore, delete forever, export, clear all
     the readme       an invitation to meet something someone left, and to leave something

   Global names the older code and mote rely on are kept: addBlock, removeBlock, updateBlock, renderBuild,
   renderFindings, setTab, renderPreview, syncCompare, onMailInput, sendMail, saveDraft, signWork, `blocks`.
   ===================================================================== */
(function () {
  'use strict';
  const S = window.Store, L = window.Lenses, esc = L.esc;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const QUICK = /quick/.test(location.hash) || window.TS_QUICK === true;
  const TYPE = { page: 'page', letter: 'letter', note: 'note', memory: 'sentence', link: 'saved link', work: 'signed piece', drawing: 'drawing' };
  const VIS = { private: 'only me', recipient: 'left for the next visit', public: 'in the archive' };
  const THEMES = [['websites that feel like home', 'home-site'], ['things people collect', 'collecting'], ['unfinished projects', 'unfinished'],
    ['small acts of repair', 'repair'], ['memories of old technology', 'old-tech'], ['things people make for no particular reason', 'no-reason']];
  const parseTags = (v) => String(v || '').split(/[,\n]/).map((x) => x.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean).slice(0, 3);
  const clock = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const savedMsg = () => 'saved in this browser only · ' + clock();
  const open = (id, o) => window.Viewer && Viewer.open(id, o);
  const logR = (a, b) => { if (typeof logReceipt === 'function') logReceipt(a, b || 'kept on this device · yours'); };
  const say = (sel, t) => { const el = $(sel); if (el) el.textContent = t; };
  const excerpt = (t, n) => { t = String(t || '').replace(/\s+/g, ' ').trim(); return t.length > (n || 90) ? t.slice(0, n || 90) + '…' : t; };
  const label = (a) => L.label(a);

  function toast(t) {
    const el = $('#rmToast'); if (!el) return;
    el.textContent = t; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 5200);
  }
  const card = (a, extra) => '<div class="rm-card"><div class="rm-ct"><a href="#" data-open="' + esc(a.id) + '"><b>' + esc(a.title || TYPE[a.type]) + '</b></a> <small>' + esc(TYPE[a.type]) + ' · ' + esc(label(a)) + ', ' + esc(a.year) + '</small></div>' +
    '<div class="rm-cx">' + esc(excerpt(a.body || (a.fields && a.fields.blocks && a.fields.blocks.map((b) => b.text).join(' ')))) + '</div>' + (extra || '') + '</div>';
  const chip = (a) => a.origin === 'visitor' ? '<span class="ts-vis v-' + esc(a.visibility) + '">' + esc(VIS[a.visibility]) + '</span>' : a.origin === 'sample' ? '<span class="ts-vis v-fake">fictional sample</span>' : '<span class="ts-vis v-real">shared with consent</span>';

  /* =====================================================================
     MY PAGE
     ===================================================================== */
  const PROMPTS = ['What is something you keep that nobody else understands?', 'What is a website you wish still existed?', 'What did you spend time on this week that nobody asked you to do?',
    'What is something you learned from another person online?', 'What would you like someone to discover about you without having to explain it?'];
  const BG = [['paper', 'paper'], ['graph', 'graph paper'], ['night', 'night'], ['moss', 'moss']];
  const meta = {};            // id -> { label, kind, vis, unfinished }
  let order = [], bg = 'paper', promptAt = 0, saveT = null;
  const AV = () => (typeof available !== 'undefined' ? available : []);   // script.js: a top-level const, so not on window
  const labelOf = (id) => (meta[id] && meta[id].label) || (AV().find((a) => a.id === id) || {}).label || id;
  const kindOf = (id) => (meta[id] && meta[id].kind) || 'text';
  const fieldOf = (id) => AV().find((a) => a.id === id) || { kind: 'textarea', placeholder: '' };

  function pageSnapshot() {
    return { bg, blocks: order.filter((id) => id in blocks).map((id) => ({ id, label: labelOf(id), kind: kindOf(id), text: blocks[id] || '', vis: (meta[id] && meta[id].vis) || 'private', unfinished: !!(meta[id] && meta[id].unfinished) })) };
  }
  const safeTitle = () => { const i = order.indexOf('title'); return (i >= 0 && meta.title && meta.title.vis === 'public' && (blocks.title || '').trim()) ? blocks.title.trim() : 'my page'; };   // a private title block must not leak into search or lists
  function pseudoPage() { const p = S.myPage(); return Object.assign({}, p || { id: '~draft', origin: 'visitor', type: 'page', year: new Date().getFullYear(), author: {}, tags: [], refs: [], events: [] }, { fields: pageSnapshot(), title: safeTitle() }); }
  function savePage(o) {
    const f = pageSnapshot();
    if (!f.blocks.length && !S.myPage()) return null;
    const anyPub = f.blocks.some((b) => b.vis === 'public' && (b.text.trim() || b.kind === 'empty'));
    const patch = { title: safeTitle(), body: f.blocks.filter((b) => b.vis === 'public').map((b) => b.text).join('\n'), fields: f, tags: parseTags($('#pgTags') && $('#pgTags').value), refs: [] };
    let p = S.myPage();
    if (!p) { p = S.create(Object.assign({ type: 'page', visibility: anyPub ? 'public' : 'private' }, patch)); }
    else {
      const vis = anyPub ? 'public' : 'private';
      if (p.visibility !== vis) S.setVisibility(p.id, vis, vis === 'public' ? 'some blocks put in the archive' : 'nothing left in the archive');
      S.update(p.id, patch, o && o.revise ? { revise: true, what: 'saved a version' } : {});
    }
    say('#pgSaved', savedMsg()); drawWhere();
    return p;
  }
  const autosave = () => { clearTimeout(saveT); saveT = setTimeout(() => savePage(), 400); };
  function drawWhere() {
    const p = S.myPage(), n = order.filter((id) => id in blocks).length, pub = order.filter((id) => id in blocks && meta[id] && meta[id].vis === 'public').length;
    const el = $('#pgWhere'); if (!el) return;
    el.textContent = !n ? 'nothing here yet, and nothing is saved. an empty page is fine.' :
      'kept in this browser only. ' + (pub ? pub + ' block' + (pub === 1 ? ' is' : 's are') + ' in the archive (a stranger could find ' + (pub === 1 ? 'it' : 'them') + '; here that stranger is you, later). ' : 'every block is only yours. ') +
      (p && p.revisions.length ? p.revisions.length + ' earlier version' + (p.revisions.length === 1 ? '' : 's') + ' kept. ' : '');
  }
  function loadPage() {
    const p = S.myPage();
    Object.keys(blocks).forEach((k) => delete blocks[k]); Object.keys(meta).forEach((k) => delete meta[k]); order = [];
    if (p && p.fields && p.fields.blocks) {
      bg = p.fields.bg || 'paper';
      p.fields.blocks.forEach((b) => { blocks[b.id] = b.text || ''; meta[b.id] = { label: b.label, kind: b.kind, vis: b.vis || 'private', unfinished: !!b.unfinished }; order.push(b.id); });
      const t = $('#pgTags'); if (t) t.value = (p.tags || []).join(', ');
    } else { bg = 'paper'; const t = $('#pgTags'); if (t) t.value = ''; }
    $$('.addbtn').forEach((b) => { b.style.display = b.id.replace('add-', '') in blocks ? 'none' : 'inline-block'; });
    drawBg(); renderBuild(); drawWhere();
  }
  function drawBg() {
    const host = $('#pgBg'); if (!host) return;
    host.innerHTML = BG.map(([k, t]) => '<button class="btn-95' + (bg === k ? ' active' : '') + '" data-bg="' + k + '" aria-pressed="' + (bg === k) + '">' + t + '</button>').join(' ');
  }
  window.addBlock = function (id) {
    if (blocks[id] !== undefined) return;
    blocks[id] = ''; meta[id] = meta[id] || { vis: 'private' }; order.push(id);
    const btn = document.getElementById('add-' + id); if (btn) btn.style.display = 'none';
    renderBuild();
    logR('added a "' + labelOf(id) + '" block', '+1 profile field'); Trace.fieldsFilled += 1;
    savePage();
    const f = $('#blocksContainer .block:last-child .field'); if (f) f.focus();
  };
  window.removeBlock = function (id) {
    delete blocks[id]; delete meta[id]; order = order.filter((x) => x !== id);
    const btn = document.getElementById('add-' + id); if (btn) btn.style.display = 'inline-block';
    renderBuild(); savePage();
  };
  window.updateBlock = function (id, val) { blocks[id] = val; renderFindings(); autosave(); };
  window.renderBuild = function () {
    const c = $('#blocksContainer'); if (!c) return;
    c.innerHTML = '';
    order.filter((id) => id in blocks).forEach((id, i, arr) => {
      const m = meta[id] || (meta[id] = { vis: 'private' }), f = fieldOf(id), k = kindOf(id);
      const div = document.createElement('div'); div.className = 'block' + (m.unfinished ? ' unf' : ''); div.dataset.id = id;
      const input = k === 'empty' ? '<div class="ts-blank">this space is left empty on purpose. the page keeps it empty.</div>'
        : (f.kind === 'textarea' || k === 'prompt') ? '<textarea class="field" rows="3" aria-label="' + esc(labelOf(id)) + '" placeholder="' + esc(f.placeholder || '') + '">' + esc(blocks[id]) + '</textarea>'
          : '<input class="field" aria-label="' + esc(labelOf(id)) + '" placeholder="' + esc(f.placeholder || '') + '" value="' + esc(blocks[id]) + '">';
      div.innerHTML = '<div class="blocklabel">' + esc(labelOf(id)) + '</div>' + input +
        '<div class="pg-ctl"><label>who could find it <select class="pg-vis" aria-label="visibility of this block"><option value="private"' + (m.vis === 'private' ? ' selected' : '') + '>only me</option><option value="public"' + (m.vis === 'public' ? ' selected' : '') + '>in the archive</option></select></label>' +
        (k === 'empty' ? '' : '<label><input type="checkbox" class="pg-unf"' + (m.unfinished ? ' checked' : '') + '> not finished</label>') +
        '<button class="btn-95 pg-up" aria-label="move up"' + (i === 0 ? ' disabled' : '') + '>↑</button><button class="btn-95 pg-dn" aria-label="move down"' + (i === arr.length - 1 ? ' disabled' : '') + '>↓</button></div>' +
        '<button class="remove" aria-label="remove this block">remove</button>';
      c.appendChild(div);
    });
    renderFindings();
  };
  window.renderFindings = function () {
    const used = Object.keys(blocks).filter((k) => blocks[k] && blocks[k].trim()), el = $('#findings'); if (!el) return;
    el.textContent = used.length === 0 ? '' : 'You filled in ' + used.length + ' of ' + (AV().length || 7) + ' possible blocks. Is that authorship, or just enough effort to feel like it’s yours? Worth an honest think!';
  };
  window.setTab = function (which) {
    $('#tabBuild').classList.toggle('active', which === 'build'); $('#tabPreview').classList.toggle('active', which === 'preview');
    $('#buildView').style.display = which === 'build' ? 'block' : 'none'; $('#previewView').style.display = which === 'preview' ? 'block' : 'none';
    if (which === 'preview') renderPreview();
  };
  window.renderPreview = function () {
    const el = $('#previewBody'); if (!el) return;
    const pub = order.filter((id) => id in blocks && meta[id] && meta[id].vis === 'public').length;
    el.innerHTML = '<p class="rm-small">this is what a stranger would see: only the blocks you put in the archive.</p>' + (pub ? L.page(pseudoPage(), { asStranger: true }) : '<p class="ts-empty">nothing yet. every block is only yours, so a stranger would find an empty room. that is a choice, and it is allowed.</p>');
    syncCompare();
  };
  window.syncCompare = function () {
    const pl = $('#comparePlace'), sd = $('#compareStandard'), mc = $('#compareMachine'); if (!pl) return;
    const used = Object.keys(blocks).filter((k) => blocks[k] && blocks[k].trim());
    pl.innerHTML = used.length ? L.page(pseudoPage(), {}) : '<em>nothing built yet — visit "your place" first.</em>';
    sd.innerHTML = $('#standardCard').innerHTML;
    mc.innerHTML = computeMachineProfile().map((t) => '<span class="trait">' + esc(t) + '</span>').join('') + '<div class="rm-small">fictional rules, shown in full in “the record” on any trace.</div>';
  };
  const origMode = window.setIdentityMode;
  window.setIdentityMode = function (m) { origMode(m); if (m === 'compare') syncCompare(); };

  function initPage() {
    const bgh = $('#pgBg'); if (!bgh) return;
    bgh.addEventListener('click', (e) => { const b = e.target.closest('[data-bg]'); if (!b) return; bg = b.dataset.bg; drawBg(); savePage(); });
    $('#pgPrompt').addEventListener('click', () => {
      const box = $('#pgPromptBox'), q = PROMPTS[promptAt % PROMPTS.length]; promptAt += 1;
      box.hidden = false; box.innerHTML = '<i>' + esc(q) + '</i> <button class="btn-95" data-yes>answer this</button> <button class="btn-95" data-next>another</button> <button class="btn-95" data-no>not now</button>';
      box.dataset.q = q;
    });
    $('#pgPromptBox').addEventListener('click', (e) => {
      const box = e.currentTarget;
      if (e.target.matches('[data-no]')) { box.hidden = true; return; }
      if (e.target.matches('[data-next]')) { $('#pgPrompt').click(); return; }
      if (e.target.matches('[data-yes]')) {
        const id = 'q' + (order.length + 1) + Date.now().toString(36).slice(-3); meta[id] = { label: box.dataset.q, kind: 'prompt', vis: 'private' };
        box.hidden = true; addBlock(id);
      }
    });
    $('#pgEmpty').addEventListener('click', () => { const id = 'e' + (order.length + 1) + Date.now().toString(36).slice(-3); meta[id] = { label: 'an empty space', kind: 'empty', vis: 'private' }; addBlock(id); });
    const bc = $('#blocksContainer');
    bc.addEventListener('input', (e) => { const b = e.target.closest('.block'); if (b && e.target.matches('.field')) updateBlock(b.dataset.id, e.target.value); });
    bc.addEventListener('change', (e) => {
      const b = e.target.closest('.block'); if (!b) return; const id = b.dataset.id, m = meta[id] || (meta[id] = {});
      if (e.target.matches('.pg-vis')) { m.vis = e.target.value; b.classList.toggle('pub', m.vis === 'public'); savePage(); }
      if (e.target.matches('.pg-unf')) { m.unfinished = e.target.checked; b.classList.toggle('unf', m.unfinished); savePage(); }
    });
    bc.addEventListener('click', (e) => {
      const b = e.target.closest('.block'); if (!b) return; const id = b.dataset.id;
      if (e.target.matches('.remove')) removeBlock(id);
      else if (e.target.matches('.pg-up,.pg-dn')) { const i = order.indexOf(id), j = i + (e.target.matches('.pg-up') ? -1 : 1); if (order[j] !== undefined) { order.splice(j, 0, order.splice(i, 1)[0]); renderBuild(); savePage(); } }
    });
    $('#pgTags').addEventListener('input', autosave);
    $('#pgSave').addEventListener('click', () => { const p = savePage({ revise: true }); if (!p) say('#pgSaved', 'nothing to save yet.'); else { say('#pgSaved', 'a version is kept. ' + savedMsg()); logR('saved a version of my page'); } });
    $('#pgTrace').addEventListener('click', () => { const p = savePage(); if (!p) { say('#pgSaved', 'add a block first.'); return; } open(p.id, { tab: 'page' }); });
    $('#pgBin').addEventListener('click', () => { const p = S.myPage(); if (!p) { say('#pgSaved', 'there is no saved page.'); return; } S.bin(p.id); loadPage(); toast('your page is in the recycle bin. restore it from “what you left”.'); });
    loadPage();
  }

  /* =====================================================================
     LETTERS
     ===================================================================== */
  let replyTo = null, padState = null, simmer = null;
  const voices = ['Still writing?', 'Take your time. Nobody is waiting on a timer but you.', "Once this goes, it's sent. That's kind of the point.", 'No read receipt is coming either way.', 'Say the true thing, not the fast thing.'];
  function pad(host) {
    const g = new Array(144).fill(0), PAL = ['#f4efe6', '#1d1a16', '#a53d2e', '#2d5a4c'];
    host.innerHTML = '<div class="ts-grid pad" role="group" aria-label="drawing pad: press a square to change its colour"></div><div class="rm-small">press a square to change its colour. four colours. <button class="btn-95" type="button" data-clear>clear</button></div>';
    const grid = $('.pad', host);
    g.forEach((_, i) => { const b = document.createElement('button'); b.type = 'button'; b.style.background = PAL[0]; b.setAttribute('aria-label', 'square ' + (i + 1)); b.dataset.i = i; grid.appendChild(b); });
    host.addEventListener('click', (e) => {
      const b = e.target.closest('[data-i]');
      if (b) { const i = +b.dataset.i; g[i] = (g[i] + 1) % 4; b.style.background = PAL[g[i]]; }
      if (e.target.matches('[data-clear]')) { g.fill(0); $$('[data-i]', host).forEach((x) => { x.style.background = PAL[0]; }); }
    });
    return { grid: () => { const rows = []; for (let r = 0; r < 12; r++) rows.push(g.slice(r * 12, r * 12 + 12).join('')); return rows; }, empty: () => g.every((v) => !v), reset: () => { g.fill(0); $$('[data-i]', host).forEach((x) => { x.style.background = PAL[0]; }); } };
  }
  function recipients() {
    const sel = $('#mlTo'); if (!sel) return;
    const cur = sel.value, names = ['whoever finds this'].concat(((window.People && People.list) || []).map((p) => People.label(p)));
    if (replyTo && names.indexOf(label(replyTo)) < 0) names.push(label(replyTo));
    sel.innerHTML = names.map((n) => '<option>' + esc(n) + '</option>').join(''); if (cur && names.indexOf(cur) >= 0) sel.value = cur;
  }
  window.onMailInput = function () {
    const text = $('#mailText').value, btn = $('#sendBtn'), voiceEl = $('#mailVoice'), timerEl = $('#mailTimer');
    clearInterval(simmer); btn.disabled = true;
    if (!text.trim()) { voiceEl.textContent = ''; timerEl.textContent = ''; return; }
    if (!voiceEl.textContent) voiceEl.textContent = voices[Math.floor(Math.random() * voices.length)];
    let remaining = QUICK ? 0 : Math.ceil(Math.min(1000 + text.length * 60, 8000) / 1000);
    const tick = () => { if (remaining <= 0) { clearInterval(simmer); timerEl.textContent = 'ready when you are.'; btn.disabled = false; } else { timerEl.textContent = 'letting it simmer... ' + remaining + 's'; remaining -= 1; } };
    tick(); if (remaining > 0) simmer = setInterval(tick, 1000);
  };
  window.sendMail = function () {
    const textEl = $('#mailText'), text = textEl.value.trim(); if (!text) return;
    const to = $('#mlTo').value, kind = (document.querySelector('input[name=mlAtt]:checked') || {}).value || '', del = (document.querySelector('input[name=mlDel]:checked') || {}).value || 'private';
    let attach = null, refs = [];
    if (kind === 'link' && $('#mlLink').value.trim()) { attach = { kind: 'link', url: $('#mlLink').value.trim(), why: '' }; refs = [attach.url.toLowerCase()]; }
    if (kind === 'drawing' && padState && !padState.empty()) attach = { kind: 'drawing', grid: padState.grid() };
    const a = S.create({ type: 'letter', title: 'to ' + to, body: text, fields: { to, attach, replyTo: replyTo ? replyTo.id : null }, tags: parseTags($('#mlTags').value), refs,
      visibility: del, unlock: del === 'recipient' ? S.session + 1 : 0 });
    if (replyTo) S.connect(a.id, replyTo.id, 'a reply');
    $$('input[name=mlDel]').forEach((r) => { r.checked = r.value === 'private'; }); $$('input[name=mlAtt]').forEach((r) => { r.checked = r.value === ''; }); $('#mlLink').hidden = true; $('#mlPad').hidden = true;
    textEl.value = ''; $('#mlTags').value = ''; $('#mlLink').value = ''; if (padState) padState.reset(); replyTo = null; drawReply();
    $('#sendBtn').disabled = true; $('#mailTimer').textContent = '';
    $('#mailVoice').innerHTML = (del === 'private' ? 'It is in your drawer.' : del === 'recipient' ? 'It is sealed. It opens on your next visit.' : 'It is in the archive.') + ' <a href="#" data-open="' + esc(a.id) + '">open it</a> · ' + savedMsg();
    Trace.lettersSentCount += 1; Trace.fieldsFilled += 1; logR('sent a letter (' + text.length + ' chars)', '+1 writing sample · kept on this device'); updateTrace();
  };
  function drawReply() {
    const el = $('#mlReply'); if (!el) return;
    if (!replyTo) { el.hidden = true; el.innerHTML = ''; return; }
    el.hidden = false; el.innerHTML = 'replying to <b>' + esc(replyTo.title || TYPE[replyTo.type]) + '</b> by ' + esc(label(replyTo)) + ' <button class="btn-95" data-cancel>don’t reply</button>';
  }
  function reply(a) {
    replyTo = a; recipients(); openWindow('win-mail'); setPane('win-mail', 'write'); drawReply();
    const sel = $('#mlTo'); if (sel) sel.value = label(a); const f = $('#mailText'); if (f) f.focus();
  }
  function drawDrawer() {
    const smp = $('#mlSamples'), mine = $('#sentList'); if (!smp) return;
    const theirs = S.all().filter((a) => a.type === 'letter' && a.origin !== 'visitor');
    smp.innerHTML = theirs.length ? theirs.map((a) => card(a, '<div class="rm-cx">to: ' + esc((a.fields || {}).to || 'whoever finds this') + ' · ' + chip(a) + '</div>')).join('') : '<p class="ts-empty">no letters here yet.</p>';
    const own = S.mine().filter((a) => a.type === 'letter');
    mine.innerHTML = own.length ? own.slice().reverse().map((a) => {
      const sealed = S.sealed(a), ready = a.visibility === 'recipient' && !sealed;
      return card(Object.assign({}, a, { body: sealed ? 'sealed. it opens on visit ' + a.unlock + '.' : a.body }),
        '<div class="rm-cx">' + chip(a) + (ready ? ' <span class="ts-vis v-real">it was waiting for you</span>' : '') + ' · ' + esc(Viewer.stamp(a.created)) + ' <button class="btn-95" data-open="' + esc(a.id) + '">open</button>' + (a.visibility === 'public' || a.visibility === 'recipient' ? ' <button class="btn-95" data-withdraw="' + esc(a.id) + '">withdraw</button>' : '') + '</div>');
    }).join('') : '<p class="ts-empty">you have not written one. nothing is waiting for you either, and that is fine.</p>';
  }
  function initLetters() {
    const pd = $('#mlPad'); if (!pd) return;
    padState = pad(pd); recipients();
    $$('input[name=mlAtt]').forEach((r) => r.addEventListener('change', () => { $('#mlLink').hidden = r.value !== 'link' || !r.checked; pd.hidden = r.value !== 'drawing' || !r.checked; if (!r.checked) return; $('#mlLink').hidden = r.value !== 'link'; pd.hidden = r.value !== 'drawing'; }));
    $('#mlReply').addEventListener('click', (e) => { if (e.target.matches('[data-cancel]')) { replyTo = null; drawReply(); } });
  }

  /* =====================================================================
     THE SHELF
     ===================================================================== */
  let cur = null, t0 = null;
  function drawDrafts() {
    const el = $('#draftLog'); if (!el) return; const a = cur && S.get(cur);
    el.innerHTML = a ? Array.from({ length: (a.fields && a.fields.drafts) || 0 }, (_, i) => '<div>draft ' + (i + 1) + (i === a.fields.drafts - 1 ? ' · ' + clock() + ' · ' + a.body.length + ' characters' : '') + '</div>').join('') : '';
  }
  window.saveDraft = function () {
    const text = $('#workText').value; if (!text.trim()) { say('#workMsg', 'write something first.'); return; }
    let a = cur && S.get(cur);
    if (!a || a.binned) { a = S.create({ type: 'work', title: 'untitled piece', body: text, fields: { signed: false, drafts: 1 }, tags: parseTags($('#workTags').value), visibility: 'private' }); cur = a.id; t0 = Date.now(); }
    else { S.update(a.id, { body: text, tags: parseTags($('#workTags').value), fields: Object.assign({}, a.fields, { drafts: ((a.fields && a.fields.drafts) || 0) + 1 }) }, { revise: true, what: 'saved a draft' }); }
    logR('saved a draft', '+1 revision history'); drawDrafts(); say('#workMsg', 'draft kept. ' + savedMsg());
  };
  window.signWork = function () {
    const text = $('#workText').value; if (!text.trim()) { say('#workMsg', 'write something first.'); return; }
    if (!cur || !S.get(cur)) saveDraft();
    const a = S.get(cur), drafts = (a.fields && a.fields.drafts) || 1, minutes = Math.max(1, Math.round((Date.now() - (t0 || Date.now())) / 60000));
    const vis = $('#workVis').value;
    S.update(a.id, { body: text, title: excerpt(text, 32), tags: parseTags($('#workTags').value), fields: Object.assign({}, a.fields, { signed: true, drafts }) }, { what: 'signed' });
    if (vis !== a.visibility) S.setVisibility(a.id, vis);
    $('#finalPiece').innerHTML = '<div class="final-piece"><div>' + L.br(text) + '</div><div class="signature">hand-signed · ' + drafts + ' draft' + (drafts === 1 ? '' : 's') + ' over ~' + minutes + ' minute' + (minutes === 1 ? '' : 's') + ' of visible work</div><div class="not-for-sale">not for sale, just proof it’s yours · ' + esc(VIS[vis]) + ' · <a href="#" data-open="' + esc(a.id) + '">open it</a></div></div>';
    Trace.worksSignedCount += 1; Trace.fieldsFilled += 1; logR('signed a piece of work', '+1 provenance record · kept on this device'); updateTrace();
    cur = null; $('#workText').value = ''; $('#workTags').value = ''; $('#draftLog').innerHTML = ''; say('#workMsg', 'signed. ' + savedMsg());
  };
  function resumeDraft() {
    const d = S.mine().filter((a) => a.type === 'work' && !(a.fields && a.fields.signed)).pop();
    if (d && $('#workText')) { cur = d.id; t0 = Date.now(); $('#workText').value = d.body; $('#workTags').value = (d.tags || []).join(', '); drawDrafts(); say('#workMsg', 'a draft you left is back. ' + savedMsg().replace('saved', 'kept')); }
  }
  function drawShelf() {
    const m = $('#shelfMine'), k = $('#shelfKept'); if (!m) return;
    const own = S.mine().filter((a) => a.type === 'work' || a.type === 'drawing');
    m.innerHTML = own.length ? own.slice().reverse().map((a) => card(a, '<div class="rm-cx">' + chip(a) + ((a.fields || {}).signed ? '' : ' <span class="ts-vis">draft, not signed</span>') + ' <button class="btn-95" data-open="' + esc(a.id) + '">open</button></div>')).join('') : '<p class="ts-empty">nothing signed yet. the shelf is allowed to be empty.</p>';
    const ids = S.kept().map((id) => S.get(id)).filter((a) => a && !a.binned);
    k.innerHTML = ids.length ? ids.map((a) => card(a, '<div class="rm-cx">' + chip(a) + ' <button class="btn-95" data-open="' + esc(a.id) + '">open</button> <button class="btn-95" data-unkeep="' + esc(a.id) + '">take off the shelf</button></div>')).join('') : '<p class="ts-empty">you have not kept anything from anyone. open something in the stacks or the drawer and choose “keep it on the shelf”.</p>';
  }

  /* =====================================================================
     THE LEDGER: one sentence
     ===================================================================== */
  let lgSel = null;
  const EXAMPLE = "I spent Sunday fixing something that wasn't broken.";
  function recordHTML(a) {
    return '<p class="ts-fiction"><b>fictional system output.</b> a short list of plain rules, not machine learning. nothing here is stored: it is made again each time you look.</p>' +
      '<div class="ts-legend"><span class="tk k">ink = kept</span> <span class="tk o">faded = dropped</span> <span class="ts-inf">boxed = guessed, not written by anyone</span></div>' + L.record(a, 'all') + L.yours(a);
  }
  function drawLedger() {
    const list = $('#lgList'); if (!list) return;
    const own = S.mine().filter((a) => a.type === 'memory');
    list.innerHTML = own.length ? own.slice().reverse().map((a) => '<div class="rm-card' + (lgSel === a.id ? ' sel' : '') + '"><div class="rm-cx">“' + esc(excerpt(a.body, 100)) + '”</div><div class="rm-cx">' + chip(a) + ' <button class="btn-95" data-lg="' + esc(a.id) + '" aria-pressed="' + (lgSel === a.id) + '">' + (lgSel === a.id ? 'looking at this one' : 'see it') + '</button></div></div>').join('')
      : '<p class="ts-empty">no sentences kept. the ledger has nothing on you, which is the starting point.</p>';
    if (lgSel && !own.some((a) => a.id === lgSel)) lgSel = null;
    const a = lgSel && S.get(lgSel), host = $('#lgLens');
    if (a) {
      host.innerHTML = '<h3 class="cmp">the same sentence, kept three ways</h3>' + recordHTML(a) +
        '<section class="ts-lens"><h4>what is actually saved</h4><p class="rm-small">only your words and a few labels, in this browser. the records above are not saved; they are drawn again each time.</p><details class="testing-footer"><summary>show the saved record</summary><pre class="rm-pre">' + esc(JSON.stringify({ id: a.id, type: a.type, body: a.body, tags: a.tags, visibility: a.visibility, year: a.year, created: a.created, rejected: S.marks(a.id).rejected, revisions: a.revisions.length }, null, 2)) + '</pre></details></section>' +
        '<section class="ts-lens"><h4>who can find it</h4><div class="rm-row"><label><input type="radio" name="lgVis" value="private"' + (a.visibility === 'private' ? ' checked' : '') + '> only me</label><label><input type="radio" name="lgVis" value="public"' + (a.visibility === 'public' ? ' checked' : '') + '> in the archive (the sentence only; never the records)</label></div>' +
        '<div class="rm-row"><button class="btn-95" data-lg-open="' + esc(a.id) + '">open it as a trace</button><button class="btn-95" data-lg-bin="' + esc(a.id) + '">take it out of the ledger (recycle bin)</button><button class="btn-95" data-lg-del="' + esc(a.id) + '">delete forever</button></div></section>';
    } else host.innerHTML = '';
    const pr = L.profile(own), rej = own.reduce((n, x) => n + S.marks(x.id).rejected.length, 0);
    $('#lgProfile').innerHTML = !pr.n ? '<p class="ts-empty">nothing. with no sentences kept, a system has nothing to say about you.</p>' :
      '<table class="ts-kv">' + (pr.rows.length ? pr.rows.map((r) => '<tr><td>' + esc(r[0]) + '</td><td>' + r[1] + ' of ' + pr.n + ' sentence' + (pr.n === 1 ? '' : 's') + '</td></tr>').join('') : '<tr><td colspan="2">it could not file ' + (pr.n === 1 ? 'it' : 'them') + ' under anything.</td></tr>') + '</table><div class="ts-sum">built only from what you kept' + (rej ? ', minus ' + rej + ' categor' + (rej === 1 ? 'y' : 'ies') + ' you said no to' : '') + '. delete a sentence, or say no to a category, and these lines change.</div>';
  }
  function initLedger() {
    const root = $('#pane-sentence'); if (!root) return;
    $('#lgEx').addEventListener('click', () => { $('#lgText').value = EXAMPLE; $('#lgText').focus(); });
    const draft = () => ({ id: '~draft', origin: 'visitor', type: 'memory', year: new Date().getFullYear(), title: '', body: $('#lgText').value.trim(), fields: {}, tags: [], refs: [], author: {}, events: [] });
    $('#lgSee').addEventListener('click', () => { const d = draft(); if (!d.body) { say('#lgSay', 'write a sentence first.'); return; } $('#lgPreview').innerHTML = '<div class="ts-draft"><p class="rm-small">not saved. this is only a look.</p>' + recordHTML(d) + '</div>'; say('#lgSay', ''); });
    $('#lgKeep').addEventListener('click', () => {
      const d = draft(); if (!d.body) { say('#lgSay', 'write a sentence first, or leave this empty. both are fine.'); return; }
      const a = S.create({ type: 'memory', title: excerpt(d.body, 28), body: d.body, tags: parseTags($('#lgTags').value), visibility: 'private' });
      lgSel = a.id; $('#lgText').value = ''; $('#lgTags').value = ''; $('#lgPreview').innerHTML = ''; say('#lgSay', 'kept, only for you. ' + savedMsg());
      logR('kept a sentence in the ledger', 'kept on this device · yours'); drawLedger();
    });
    root.addEventListener('click', (e) => {
      const t = e.target;
      if (t.dataset.lg) { lgSel = t.dataset.lg; drawLedger(); }
      else if (t.dataset.lgOpen) open(t.dataset.lgOpen, { tab: 'record' });
      else if (t.dataset.lgBin) { S.bin(t.dataset.lgBin); toast('taken out of the ledger. it is in the recycle bin; restore it there.'); }
      else if (t.dataset.lgDel) { if (t.dataset.sure) { S.destroy(t.dataset.lgDel); logR('deleted a sentence forever', 'erased from this browser'); toast('deleted forever. watch the profile change.'); } else { t.dataset.sure = '1'; t.textContent = 'really delete it forever? press again'; } }
      else if (t.name === 'lgVis') { S.setVisibility(lgSel, t.value); say('#lgSay', 'changed. ' + savedMsg()); }
      else if (t.dataset.act === 'reject' || t.dataset.act === 'unreject') { S[t.dataset.act](t.dataset.id, t.dataset.tag); if (t.dataset.id !== '~draft') drawLedger(); else { $('#lgSee').click(); } }
    });
  }

  /* =====================================================================
     THE STACKS
     ===================================================================== */
  let sFn = null;
  function archive() { return S.all().filter((a) => S.findable(a) && !(a.type === 'note' && a.about)); }
  function why(a, q, path, key) {
    const w = [];
    if (path === 'tag') w.push('its maker declared “' + key + '”');
    else if (path === 'site') w.push('it mentions “' + key + '”');
    else if (path === 'chance') w.push('picked at random; nothing about you was used');
    else {
      const words = q.split(/\s+/).filter((x) => x.length > 1);
      const hay = (k) => words.some((x) => String(k).toLowerCase().indexOf(x) >= 0);
      if (hay(a.title)) w.push('the word is in its title');
      if (hay(a.body) || hay(((a.fields && a.fields.blocks) || []).filter((b) => a.origin !== 'visitor' || b.vis === 'public').map((b) => b.text).join(' '))) w.push('the word is in what it says');
      (a.tags || []).filter(hay).forEach((t) => w.push('its maker declared “' + t + '”'));
      (a.refs || []).filter(hay).forEach((t) => w.push('it mentions “' + t + '”'));
      if (hay(label(a))) w.push('the word is in its maker’s name');
    }
    return w;
  }
  function stacksState(v) { if (v) S.setPref('stacks', v); return S.pref('stacks', { q: '', path: 'words', key: '' }); }
  function drawStacks(st0) {
    const st = st0 || stacksState(), res = $('#stRes'); if (!res) return;
    const all = archive().slice().sort((a, b) => a.year - b.year || (a.title < b.title ? -1 : 1));
    let items = [], head = '', order = 'oldest first, then by title. nothing else is used.';
    $$('input[name=stPath]').forEach((r) => { r.checked = r.value === st.path; });
    if (document.activeElement !== $('#stQ')) $('#stQ').value = st.q || '';
    if (st.path === 'words') {
      const q = (st.q || '').toLowerCase().trim();
      const tm = THEMES.filter((t) => q && (q.indexOf(t[1]) >= 0 || t[0].indexOf(q) >= 0)).map((t) => t[1]);
      items = !q ? all.map((a) => ({ a, w: ['nothing was asked, so this is everything, oldest first'] })) : all.map((a) => ({ a, w: why(a, q + ' ' + tm.join(' '), 'words') })).filter((x) => x.w.length);
      head = q ? items.length + ' thing' + (items.length === 1 ? '' : 's') + ' mention' + (items.length === 1 ? 's' : '') + ' “' + esc(q) + '”.' : 'the whole archive (' + all.length + ').';
    } else if (st.path === 'tag') {
      if (!st.key) {
        const t = {}; all.forEach((a) => (a.tags || []).forEach((x) => { t[x] = (t[x] || 0) + 1; }));
        res.innerHTML = '<p class="rm-small">words their makers chose for themselves:</p><div class="st-themes">' + Object.keys(t).sort().map((k) => '<button class="btn-95" data-tag="' + esc(k) + '">' + esc(k) + ' <small>' + t[k] + '</small></button>').join('') + '</div>'; $('#stOrder').textContent = ''; return;
      }
      items = all.filter((a) => (a.tags || []).indexOf(st.key) >= 0).map((a) => ({ a, w: why(a, '', 'tag', st.key) })); head = items.length + ' declared “' + esc(st.key) + '”. <button class="btn-95" data-reset>choose another</button>';
    } else if (st.path === 'site') {
      if (!st.key) {
        const t = {}; all.forEach((a) => (a.refs || []).forEach((x) => { t[x] = (t[x] || 0) + 1; }));
        res.innerHTML = Object.keys(t).length ? '<p class="rm-small">pages people mention:</p><div class="st-themes">' + Object.keys(t).sort().map((k) => '<button class="btn-95" data-site="' + esc(k) + '">' + esc(k) + ' <small>' + t[k] + '</small></button>').join('') + '</div>' : '<p class="ts-empty">nobody mentions a page yet.</p>'; $('#stOrder').textContent = ''; return;
      }
      items = all.filter((a) => (a.refs || []).indexOf(st.key) >= 0).map((a) => ({ a, w: why(a, '', 'site', st.key) })); head = items.length + ' mention “' + esc(st.key) + '”. <button class="btn-95" data-reset>choose another</button>';
    } else {
      const seed = st.seed || Math.floor(Math.random() * 1e6), pick = all.slice(); const r = (n) => { seed2 = (seed2 * 9301 + 49297) % 233280; return seed2 / 233280 * n; }; let seed2 = seed;
      for (let i = pick.length - 1; i > 0; i--) { const j = Math.floor(r(i + 1)); const x = pick[i]; pick[i] = pick[j]; pick[j] = x; }
      items = pick.slice(0, 3).map((a) => ({ a, w: why(a, '', 'chance') })); head = 'three things, by chance. <button class="btn-95" data-again>again</button>'; order = 'in the order they were drawn. that is all.';
      if (!st.seed) S.setPref('stacks', Object.assign({}, st, { seed }));
    }
    res.innerHTML = '<p class="st-head">' + head + '</p>' + (items.length ? items.slice(0, 30).map((x) => card(x.a, '<div class="st-why"><b>why it is here:</b> ' + x.w.map(esc).join(' · ') + '</div><div class="rm-cx">' + chip(x.a) + ' <button class="btn-95" data-open="' + esc(x.a.id) + '">open it</button></div>')).join('') : '<p class="ts-empty">nothing. that is an honest answer: nobody here has said anything about that. you could.</p>');
    $('#stOrder').textContent = items.length ? 'order: ' + order : '';
  }
  function initStacks() {
    const root = $('#pane-stacks'); if (!root) return;
    $('#stThemes').innerHTML = THEMES.map((t) => '<button class="btn-95" data-theme="' + t[1] + '">' + esc(t[0]) + '</button>').join('');
    const go = () => { const v = { q: $('#stQ').value, path: 'words', key: '' }; stacksState(v); drawStacks(v); };
    $('#stGo').addEventListener('click', go); $('#stQ').addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
    $$('input[name=stPath]').forEach((r) => r.addEventListener('change', () => { const v = Object.assign({}, stacksState(), { path: r.value, key: '', seed: 0 }); stacksState(v); drawStacks(v); }));
    root.addEventListener('click', (e) => {
      const t = e.target;
      if (t.dataset.theme) { const v = { q: '', path: 'tag', key: t.dataset.theme }; stacksState(v); drawStacks(v); }
      else if (t.closest('[data-tag]')) { const v = Object.assign({}, stacksState(), { key: t.closest('[data-tag]').dataset.tag }); stacksState(v); drawStacks(v); }
      else if (t.closest('[data-site]')) { const v = Object.assign({}, stacksState(), { key: t.closest('[data-site]').dataset.site }); stacksState(v); drawStacks(v); }
      else if (t.matches('[data-reset]')) { const v = Object.assign({}, stacksState(), { key: '' }); stacksState(v); drawStacks(v); }
      else if (t.matches('[data-again]')) { const v = Object.assign({}, stacksState(), { seed: 0 }); stacksState(v); drawStacks(v); }
    });
    drawStacks();
  }

  /* =====================================================================
     THE RECYCLE BIN: what you left
     ===================================================================== */
  function drawMine() {
    const host = $('#mineBody'); if (!host) return;
    const own = S.mine(), bin = S.binned(), c = S.counts();
    let h = '<h2 class="roomtitle">what you left</h2>' +
      '<p class="rm-store">' + (S.persistent ? '<b>' + c.total + ' thing' + (c.total === 1 ? '' : 's') + ' kept, about ' + Math.max(1, Math.round(S.bytes() / 1024 * 10) / 10) + ' KB, in this browser only.</b> there is no account and no server: nothing here has been sent anywhere.' : '<b>this browser would not let anything be saved.</b> what you write lasts until you close this tab, then it is gone.') +
      ' the sample letters, pages and notes are not yours and are not saved here.</p>';
    h += '<h3 class="cmp">kept</h3>' + (own.length ? own.slice().reverse().map((a) => '<div class="rm-card"><div class="rm-ct"><a href="#" data-open="' + esc(a.id) + '"><b>' + esc(a.title || TYPE[a.type]) + '</b></a> <small>' + esc(TYPE[a.type]) + ' · ' + esc(Viewer.stamp(a.created)) + '</small></div><div class="rm-cx">' + chip(a) + ' · ' + a.revisions.length + ' earlier version' + (a.revisions.length === 1 ? '' : 's') + (a.keepHistory ? '' : ' (history off)') + ' · ' + S.edges(a.id).filter((e) => e.by === 'you').length + ' connection(s)</div>' +
      '<div class="rm-cx"><button class="btn-95" data-open="' + esc(a.id) + '">open</button>' + (a.visibility === 'public' ? ' <button class="btn-95" data-withdraw="' + esc(a.id) + '">withdraw from the archive</button>' : '') + ' <button class="btn-95" data-bin="' + esc(a.id) + '">move to the bin</button></div></div>').join('') : '<p class="ts-empty">nothing. you have left nothing, and nothing has been kept about you but the log on the other tab, which disappears.</p>');
    h += '<h3 class="cmp">in the bin <small>(hidden everywhere; still on this device)</small></h3>' + (bin.length ? bin.map((a) => '<div class="rm-card bin"><div class="rm-ct"><b>' + esc(a.title || TYPE[a.type]) + '</b> <small>' + esc(TYPE[a.type]) + '</small></div><div class="rm-cx">' + esc(excerpt(a.body, 80)) + '</div><div class="rm-cx"><button class="btn-95" data-restore="' + esc(a.id) + '">restore</button> <button class="btn-95" data-destroy="' + esc(a.id) + '">delete forever…</button></div></div>').join('') + '<div class="rm-row"><button class="btn-95" data-empty>empty the bin (delete forever)…</button></div>' : '<p class="ts-empty">the bin is empty.</p>');
    h += '<details class="testing-footer"><summary>what each choice means</summary><div>' +
      '<p><b>take a block off my page</b>: it leaves the page. the page keeps its other blocks.</p>' +
      '<p><b>withdraw from the archive</b>: the public version goes away. you keep a private copy.</p>' +
      '<p><b>keep a private copy, remove the public one</b>: the same thing; “only me” in who can find it.</p>' +
      '<p><b>revise</b>: the words change. earlier versions are kept and shown, or erased, as you choose (a tickbox on the thing).</p>' +
      '<p><b>move to the bin</b>: hidden everywhere, still on this device, restorable.</p>' +
      '<p><b>delete forever</b>: erased from this browser: the thing, its versions, its connections, notes about it. it cannot reach a copy you exported, a screenshot, or anything outside this browser.</p></div></details>';
    h += '<h3 class="cmp">everything at once</h3><div class="rm-row"><button class="btn-95" data-export>download what is kept (a file)</button><button class="btn-95" data-history>erase all earlier versions</button><button class="btn-95" data-wipe>clear everything I left…</button></div><div class="rm-say" id="mineSay" role="status"></div>';
    host.innerHTML = h;
  }
  function initMine() {
    const root = $('#pane-mine'); if (!root) return;
    root.addEventListener('click', (e) => {
      const t = e.target.closest('button,a'); if (!t) return; const d = t.dataset;
      if (d.bin) { S.bin(d.bin); }
      else if (d.restore) { S.restore(d.restore); loadPage(); }
      else if (d.destroy) { if (t.dataset.sure) { S.destroy(d.destroy); logR('deleted something forever', 'erased from this browser'); } else { t.dataset.sure = '1'; t.textContent = 'sure? it cannot be undone. press again'; } }
      else if (t.matches('[data-empty]')) { if (t.dataset.sure) { S.binned().forEach((a) => S.destroy(a.id)); logR('emptied the bin', 'erased from this browser'); } else { t.dataset.sure = '1'; t.textContent = 'sure? press again'; } }
      else if (t.matches('[data-history]')) { S.mine().forEach((a) => { if (a.revisions.length) S.setHistory(a.id, false), S.setHistory(a.id, true); }); say('#mineSay', 'earlier versions erased. history is still on for new ones.'); }
      else if (t.matches('[data-wipe]')) { if (t.dataset.sure) { S.destroyAll(); cur = null; lgSel = null; loadPage(); $$('#workText,#mailText,#lgText').forEach((x) => { x.value = ''; }); toast('everything you left is erased from this browser.'); logR('cleared everything I left', 'erased from this browser'); } else { t.dataset.sure = '1'; t.textContent = 'really clear everything? press again'; } }
      else if (t.matches('[data-export]')) {
        const blob = new Blob([S.exportJSON()], { type: 'application/json' }), a = document.createElement('a');
        a.href = URL.createObjectURL(blob); a.download = 'third-space-what-i-left.json'; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 2000);
        say('#mineSay', 'downloaded. that file is a copy outside this browser; deleting here will not touch it.');
      }
    });
  }

  /* =====================================================================
     README, links between rooms, and the small shared things
     ===================================================================== */
  function initReadme() {
    const f = $('#rmFind'); if (!f) return;
    f.addEventListener('click', () => { const a = window.TS_FEATURED && TS_FEATURED(); if (a) open(a.id, { tab: 'page' }); });
    $('#rmCalm').addEventListener('click', () => { $('#rmInvite').classList.add('calm'); $('#rmSmall').textContent = 'ok. nothing is kept unless you write it.'; });
  }
  function openTraces() { openPane('win-receipt', 'mine'); drawMine(); }

  // one delegated click for every "open this" / "withdraw" / "take off the shelf" control in the rooms (the viewer has its own)
  document.addEventListener('click', (e) => {
    if (e.target.closest('#win-trace')) return;
    const t = e.target.closest('[data-open],[data-withdraw],[data-unkeep]'); if (!t) return;
    if (t.dataset.open) { e.preventDefault(); open(t.dataset.open); }
    else if (t.dataset.withdraw) S.setVisibility(t.dataset.withdraw, 'private', 'withdrawn from the archive; a private copy kept');
    else if (t.dataset.unkeep) S.unkeep(t.dataset.unkeep);
  });

  function refresh() {
    cancelAnimationFrame(refresh.f);
    refresh.f = requestAnimationFrame(() => {
      drawDrawer(); drawShelf(); drawLedger(); drawStacks(); drawMine(); recipients();
      const p = S.myPage(), has = order.some((id) => id in blocks);
      if ((!p && has) || (p && !has && !document.activeElement.closest('#buildView'))) loadPage();
    });
  }

  function a11y() {
    $$('.icon[data-room]').forEach((ic) => {
      if (ic.tabIndex >= 0 && ic.getAttribute('role')) return;
      ic.tabIndex = 0; ic.setAttribute('role', 'button'); const l = ic.querySelector('.label'); if (l) ic.setAttribute('aria-label', l.textContent);
      ic.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); ic.click(); } });
    });
  }

  // small screens: the era bar wraps onto several rows, so windows start below whatever height it has this moment
  function chrome() {
    const n = document.getElementById('eraNote'), b = document.getElementById('eraBar'); if (!n || !b) return;
    document.documentElement.style.setProperty('--chrome-h', Math.ceil(Math.max(n.getBoundingClientRect().bottom, b.getBoundingClientRect().bottom) + 6) + 'px');
  }

  function init() {
    chrome(); window.addEventListener('resize', chrome);
    if (window.MutationObserver) new MutationObserver(chrome).observe(document.getElementById('eraNote'), { childList: true, characterData: true, subtree: true });
    initPage(); initLetters(); initLedger(); initStacks(); initMine(); initReadme(); a11y();
    resumeDraft(); drawDrawer(); drawShelf(); drawLedger(); drawMine();
    S.on(refresh);
    if (!S.persistent) toast('this browser will not keep what you write. it will last until you close the tab.');
    // a letter left "for the next visit" is waiting
    const waiting = S.mine().filter((a) => a.type === 'letter' && a.visibility === 'recipient' && !S.sealed(a));
    if (waiting.length) toast('a letter you left for this visit is waiting in the drawer.');
  }
  window.Rooms = { refresh, toast, reply, openTraces, loadPage };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
