/* =====================================================================
   store.js — the one place a visitor's traces live.

   WHAT IT IS
   - A small artifact store. Every thing a visitor leaves (a page, a letter, a note, a saved link,
     a signed piece, a memory, a drawing) is an ARTIFACT with a stable id, a type, an author, a year,
     a visibility, a revision history and an event history.
   - Sample artifacts (js/features/samples.js) are fictional, are never saved, and are always read-only.
     Visitor artifacts are saved ONLY in this browser (localStorage, key KEY below). Nothing is sent anywhere.
   - The same artifact is shown three ways (js/features/viewer.js): as a page, as a record, as yours.
     The viewer never copies the artifact; it reads it from here, so the visitor's choices follow it.

   WHAT IT IS NOT
   - There is no server, no account and no sync. "Delete forever" removes the data from this browser's
     storage; it cannot, and does not claim to, remove anything outside this browser (a downloaded export,
     a screenshot, a copy someone made).
   ===================================================================== */
(function () {
  'use strict';
  const KEY = 'thirdspace.traces.v1';
  let mem = null;          // fallback when localStorage is refused (private window, blocked site data)
  let persistent = true;

  const blank = () => ({ v: 1, sessions: 0, artifacts: [], edges: [], kept: [], marks: {}, prefs: {}, seq: 0 });
  let S = blank();
  const listeners = [];

  function read() {
    try {
      const raw = window.localStorage.getItem(KEY);
      persistent = true;
      if (!raw) return blank();
      const d = JSON.parse(raw);
      return Object.assign(blank(), d);
    } catch (e) { persistent = false; return mem || blank(); }
  }
  function write() {
    try { window.localStorage.setItem(KEY, JSON.stringify(S)); persistent = true; }
    catch (e) { persistent = false; mem = S; }
    listeners.forEach((f) => { try { f(); } catch (e) { /* a listener must never break the store */ } });
  }
  const now = () => new Date().toISOString();
  const samples = () => (window.TS_SAMPLES && window.TS_SAMPLES()) || [];

  S = read();
  S.sessions += 1;       // this visit; a letter "for the next visit" opens when this number reaches its unlock
  write();

  const Store = {
    KEY,
    get persistent() { return persistent; },
    get session() { return S.sessions; },
    on(f) { listeners.push(f); },

    /* ---------- reading ---------- */
    mine(opts) { const o = opts || {}; return S.artifacts.filter((a) => o.binned ? a.binned : !a.binned); },
    binned() { return S.artifacts.filter((a) => a.binned); },
    // everything the visitor can currently meet: samples + their own, not binned
    all() { return samples().concat(S.artifacts.filter((a) => !a.binned)); },
    get(id) { return samples().find((a) => a.id === id) || S.artifacts.find((a) => a.id === id) || null; },
    isMine: (a) => !!a && a.origin === 'visitor',
    // can a stranger (a future visitor) find it? only 'public' and only once unlocked
    findable(a) { return a.origin !== 'visitor' || (a.visibility === 'public' && !a.binned && (a.unlock || 0) <= S.sessions); },
    sealed(a) { return (a.unlock || 0) > S.sessions; },

    /* ---------- writing ---------- */
    create(p) {
      S.seq += 1;
      const id = 'TS-V-' + String(S.seq).padStart(4, '0');
      const a = Object.assign({
        id, origin: 'visitor', type: 'note', title: '', body: '', fields: {}, tags: [], refs: [],
        author: { handle: (window.ThirdSpaceNext && ThirdSpaceNext.me && ThirdSpaceNext.me.handle) || '', consent: 'self' },
        year: new Date().getFullYear(), visibility: 'private', created: now(), updated: now(),
        revisions: [], keepHistory: true, events: [], binned: false,
      }, p);
      a.id = id; a.origin = 'visitor';
      a.events = (a.events || []).concat([{ t: now(), what: 'made' + (a.visibility === 'private' ? ', private' : ', ' + a.visibility) }]);
      S.artifacts.push(a); write(); return a;
    },
    update(id, patch, o) {
      const a = S.artifacts.find((x) => x.id === id); if (!a) return null;
      const opt = o || {};
      if (opt.revise && a.keepHistory) a.revisions.push({ t: now(), body: a.body, fields: JSON.parse(JSON.stringify(a.fields || {})) });
      Object.assign(a, patch); a.updated = now();
      if (opt.what) a.events.push({ t: now(), what: opt.what });
      write(); return a;
    },
    setVisibility(id, vis, why) {
      const a = S.artifacts.find((x) => x.id === id); if (!a || a.visibility === vis) return a;
      a.events.push({ t: now(), what: why || ('visibility: ' + a.visibility + ' → ' + vis) });
      a.visibility = vis; a.updated = now(); write(); return a;
    },
    setHistory(id, keep) {
      const a = S.artifacts.find((x) => x.id === id); if (!a) return;
      a.keepHistory = !!keep;
      if (!keep) { const n = a.revisions.length; a.revisions = []; a.events.push({ t: now(), what: 'revision history ' + (n ? 'erased (' + n + ')' : 'switched off') }); }
      else a.events.push({ t: now(), what: 'revision history switched on' });
      write();
    },
    // "move to the bin": hidden everywhere, still on this device, restorable
    bin(id) {
      const a = S.artifacts.find((x) => x.id === id); if (!a) return;
      a.binned = true; a.events.push({ t: now(), what: 'moved to the bin (hidden; still on this device)' }); write();
    },
    restore(id) {
      const a = S.artifacts.find((x) => x.id === id); if (!a) return;
      a.binned = false; a.events.push({ t: now(), what: 'restored from the bin' }); write();
    },
    // genuinely gone from this browser: the artifact, its revisions, its connections, notes about it, its place on the shelf
    destroy(id) {
      S.artifacts = S.artifacts.filter((a) => a.id !== id && !(a.about === id));
      S.edges = S.edges.filter((e) => e.from !== id && e.to !== id);
      S.kept = S.kept.filter((k) => k !== id);
      delete S.marks[id]; write();
    },
    destroyAll() {
      S = blank(); S.sessions = 1;
      try { window.localStorage.removeItem(KEY); } catch (e) { /* nothing to remove */ }
      mem = null; write();
      try { window.localStorage.removeItem(KEY); } catch (e) { /* nothing to remove */ }
    },

    /* ---------- relationships ---------- */
    edges(id) {
      const out = [];
      samples().forEach((a) => (a.links || []).forEach((l, i) => { if (a.id === id || l.to === id) out.push({ id: a.id + '>' + l.to + '#' + i, from: a.id, to: l.to, why: l.why, by: 'sample', t: null }); }));
      S.edges.forEach((e) => { if (e.from === id || e.to === id) out.push(Object.assign({ by: 'you' }, e)); });
      return out.filter((e) => { const o = Store.get(e.from === id ? e.to : e.from); return o && !o.binned; });
    },
    connect(from, to, why) {
      if (from === to || S.edges.some((e) => e.from === from && e.to === to)) return null;
      S.seq += 1; const e = { id: 'E-' + S.seq, from, to, why: (why || '').trim(), t: now() };
      S.edges.push(e); write(); return e;
    },
    disconnect(eid) { S.edges = S.edges.filter((e) => e.id !== eid); write(); },
    annotations(id) { return S.artifacts.filter((a) => a.about === id && !a.binned); },

    /* ---------- the shelf, and what a visitor rejected ---------- */
    kept: () => S.kept.slice(),
    isKept: (id) => S.kept.indexOf(id) >= 0,
    keep(id) { if (!Store.isKept(id)) { S.kept.push(id); write(); } },
    unkeep(id) { S.kept = S.kept.filter((k) => k !== id); write(); },
    marks: (id) => S.marks[id] || { rejected: [] },
    reject(id, tag) { const m = S.marks[id] || (S.marks[id] = { rejected: [] }); if (m.rejected.indexOf(tag) < 0) m.rejected.push(tag); write(); },
    unreject(id, tag) { const m = S.marks[id]; if (m) { m.rejected = m.rejected.filter((t) => t !== tag); write(); } },
    pref: (k, d) => (S.prefs[k] === undefined ? d : S.prefs[k]),
    setPref(k, v) { S.prefs[k] = v; write(); },

    /* ---------- the one page ---------- */
    myPage() { return S.artifacts.find((a) => a.type === 'page' && a.origin === 'visitor' && !a.binned) || null; },

    /* ---------- inspection ---------- */
    exportJSON() { return JSON.stringify(S, null, 2); },
    bytes() { return JSON.stringify(S).length; },
    counts() {
      const m = S.artifacts;
      return { total: m.length, binned: m.filter((a) => a.binned).length, public: m.filter((a) => a.visibility === 'public' && !a.binned).length,
        revisions: m.reduce((n, a) => n + a.revisions.length, 0), edges: S.edges.length, kept: S.kept.length };
    },
  };
  window.Store = Store;
})();
