/* =====================================================================
   next.js — "the next web" (2030). The speculative era. Load AFTER 2020-26.js, BEFORE guide.js.

   What this is
   ------------
   The last era is not a skin of the past. It is a world built FROM the visitor: the receipt (what the site logged)
   is read as a catalog of records, the records are scored, and the visitor is assigned one of four futures.
   Each future is a different imagined society with its own conditions, its own design system and its own interface
   artifacts, populated with the visitor's own data. Nothing here is a prediction; each world is a hypothesis with a
   visible path from today ("exists today" / "would have to change").

   The loop (this is the point)
   ----------------------------
   1. every receipt line becomes a CATALOG RECORD (ISFDB-style: id, title, type, credited to, time, status).
   2. each record carries weights toward the worlds. the scoring is shown, not hidden.
   3. the visitor can DISPUTE a record ("that wasn't me", "I didn't choose that"). It is removed from the scoring and
      the world is recomputed. Acting inside a world also writes new records, so a world can talk you out of itself.
   4. "other futures" lets the visitor preview the worlds they did not get, and says what would have tipped it.

   The four worlds (from the research brief: six speculative concepts, narrowed to the four the receipt can tell apart)
     delegation  — the delegation desk   : agents act for you; consent is a permission panel; the site is also a machine-readable surface
     commons     — the memory commons    : an authored, signed, slow web; memory is tended; people vouch for pages
     provenance  — the provenance machine: every line has a source; said-vs-did becomes the interface
     museum      — the artificial museum : an archive that classifies by process, and becomes a dataset for the next generation
   With too little signal the site assigns "delegation" BY DEFAULT and says so: that is what a system does with a blank.

   To change the words: WORLDS (below). To change what counts toward which world: RULES. Nothing else needs editing.
===================================================================== */
(function () {
  'use strict';
  const KEY = '2030';
  const S = window.ThirdSpaceNext;
  if (!S || typeof ERAS === 'undefined') return;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.prototype.slice.call((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const log = (a, b) => { if (typeof logReceipt === 'function') logReceipt(a, b); };
  const inEra = () => document.body.classList.contains('era-' + KEY);
  const pad = (n) => String(n).padStart(4, '0');

  /* ---------- 1. the era ---------- */
  ERAS.push({
    key: KEY, label: 'speculative', name: 'the next web',
    note: 'not a year. a hypothesis. the receipt you have been building is read as a catalog, scored, and turned into a future. you can dispute any record and watch the future change. each world shows what exists today and what would have to change.',
  });
  eraPopupInterval[KEY] = 0;
  const bar = document.getElementById('eraBar');
  const nbtn = document.createElement('button');
  nbtn.className = 'era-btn'; nbtn.dataset.era = KEY; nbtn.textContent = 'next ▸'; nbtn.onclick = () => setEra(KEY);
  bar.appendChild(nbtn);

  /* ---------- 2. records: every receipt line, classified ----------
     [label regex, type, credited to, status, weights {d,t,p,w}, short reason]
     status: observed (you did it) · system (the system did it to you) · inferred (the system concluded it, silently)
     weights: d = delegation, t = tending (commons), p = provenance (reading / inspecting / contradicting), w = wandering (museum) */
  const RULES = [
    [/^accepted a pop-up offer|^accepted: /, 'consent', 'you', 'observed', { d: 2 }, 'said yes to an offer'],
    [/^closed a pop-up|^closed: /, 'consent', 'you', 'observed', { t: 1 }, 'closed an offer'],
    [/^a pop-up was shown/, 'exposure', 'the system', 'system', {}, 'shown an offer'],
    [/^asked the assistant/, 'delegation', 'you, via an assistant', 'observed', { d: 3 }, 'asked a machine instead of reading'],
    [/^autoplay queued/, 'delegation', 'the system', 'system', { d: 1 }, 'did not cancel autoplay'],
    [/^cancelled autoplay/, 'choice', 'you', 'observed', { t: 3 }, 'stopped the next thing starting'],
    [/^shared your wrapped/, 'delegation', 'you', 'observed', { d: 3 }, 'gave away what was kept'],
    [/started for you|filled in for you/, 'delegation', 'the system', 'system', { d: 2 }, 'accepted predicted text'],
    [/^accepted cookies/, 'consent', 'you', 'observed', null, ''],
    [/^opened the cookie list/, 'reading', 'you', 'observed', { p: 2 }, 'read what is taken'],
    [/^asked why/, 'reading', 'you', 'observed', { p: 2, t: 1 }, 'asked why it was ranked that way'],
    [/^opened the full list/, 'choice', 'you', 'observed', { t: 2 }, 'opened the hidden options'],
    [/^feed set to most recent/, 'choice', 'you', 'observed', { t: 2 }, 'chose the order yourself'],
    [/^feed set to top stories/, 'delegation', 'you', 'observed', { d: 1 }, 'let the feed order it'],
    [/^rated |^voted up/, 'taste', 'you', 'observed', { d: 1 }, 'gave a rating a system reads as taste'],
    [/^sent a letter/, 'making', 'you', 'observed', { t: 4 }, 'wrote and waited'],
    [/^signed a piece/, 'making', 'you', 'observed', { t: 4 }, 'put your name on work'],
    [/^added a "/, 'making', 'you', 'observed', { t: 1 }, 'built part of a page'],
    [/^saved a draft/, 'making', 'you', 'observed', { t: 1 }, 'kept a draft'],
    [/^sent a message/, 'message', 'you, via a machine', 'observed', { d: 1 }, 'sent a message with machine help'],
    [/^asked .* a question/, 'asking', 'you', 'observed', { t: 2 }, 'asked a person'],
    [/^logged: /, 'making', 'you', 'observed', { t: 1 }, 'logged a relationship'],
    [/^subscribed to |^followed [^:]*$/, 'choice', 'you', 'observed', { t: 1 }, 'chose to hear from someone'],
    [/^traded a week/, 'exchange', 'you', 'observed', { d: 1, p: 1 }, 'traded data for a map'],
    [/^opened your receipt/, 'reading', 'you', 'observed', { p: 2 }, 'looked at what was kept'],
    [/^opened (the next web|world\.next)/, 'visit', 'you', 'observed', {}, ''],
    [/^approved agent action/, 'delegation', 'you, via an agent', 'observed', { d: 2 }, 'approved an agent action'],
    [/^rejected agent action|^revoked /, 'choice', 'you', 'observed', { t: 1, p: 1 }, 'declined or revoked a delegation'],
    [/^tended /, 'making', 'you', 'observed', { t: 2 }, 'tended a memory'],
    [/^let .* fade/, 'choice', 'you', 'observed', { t: 1 }, 'let something fade'],
    [/^disputed a record/, 'reading', 'you', 'observed', { p: 1 }, 'corrected the record'],
    [/^restored a record/, 'reading', 'you', 'observed', {}, ''],
    [/^inferred interest/, 'inference', 'the system', 'inferred', { w: 1 }, 'inferred from time spent'],
    [/^your first memory was used/, 'inference', 'the system', 'inferred', {}, ''],
    [/^opened /, 'visit', 'you', 'observed', { w: 1 }, 'opened a room'],
    [/^viewed the web as it was/, 'context', 'you', 'observed', {}, ''],
    [/catalogued as interest/, 'visit', 'you', 'observed', { w: 1 }, 'did something in a subculture'],
  ];
  const disputed = new WeakSet();
  function records() {
    return Trace.entries.map((e, i) => {
      let rule = null;
      for (let k = 0; k < RULES.length; k++) {
        const r = RULES[k];
        if (r[0].test(e.label) || (r[0].source === 'catalogued as interest' && r[0].test(String(e.value)))) { rule = r; break; }
      }
      let w = rule ? rule[4] : {}, why = rule ? rule[5] : '';
      if (rule && rule[4] === null) {                                  // cookies: depends on whether the list was read
        const blind = /without/.test(String(e.value));
        w = blind ? { d: 2 } : { p: 2, t: 1 }; why = blind ? 'accepted without reading what is taken' : 'accepted after reading the list';
      }
      return {
        i, id: 'TS-' + pad(i + 1), e, title: e.label, value: String(e.value), t: e.t,
        type: rule ? rule[1] : 'session', by: rule ? rule[2] : 'you', status: rule ? rule[3] : 'observed',
        w: w || {}, why, disputed: disputed.has(e),
      };
    });
  }

  /* ---------- 3. scoring ---------- */
  function maxGap() {
    let g = 0, a = null;
    try {
      const R = S.compute();
      (S.AXES || []).forEach((x) => { const r = R[x.id]; if (r && r.said != null && Math.abs(r.said - r.did) > g) { g = Math.abs(r.said - r.did); a = x; } });
    } catch (e) { /* forecast not ready */ }
    return { g, axis: a };
  }
  function evaluate() {
    const recs = records();
    const sum = { d: 0, t: 0, p: 0, w: 0 };
    recs.forEach((r) => { if (r.disputed) return; ['d', 't', 'p', 'w'].forEach((k) => { sum[k] += r.w[k] || 0; }); });
    const gap = maxGap();
    const sc = {
      delegation: sum.d + (sum.t < 2 ? 1 : 0),
      commons: sum.t,
      provenance: Math.round((sum.p * 1.3 + (gap.g >= 30 ? gap.g / 10 : 0)) * 10) / 10,
      museum: Math.max(0, Math.round((sum.w - 5) * 1.2 - (sum.d + sum.t) * 0.3)),
    };
    const live = recs.filter((r) => !r.disputed && r.status === 'observed' && r.type !== 'context').length;
    const order = ['delegation', 'commons', 'provenance', 'museum'].sort((a, b) => sc[b] - sc[a]);
    const raw = sum.d + sum.t + sum.p + Math.max(0, sum.w - 5);   // the +1 bonus on delegation is not evidence
    const byDefault = live < 4 || raw <= 0;
    const win = byDefault ? 'delegation' : order[0];
    const margin = byDefault ? 0 : sc[order[0]] - sc[order[1]];
    return { recs, sum, sc, gap, win, byDefault, margin, live };
  }

  /* ---------- 4. the four worlds ---------- */
  const SRC = {
    exists: 'exists today', near: 'plausible within a few years', spec: 'speculation',
  };
  const WORLDS = {
    delegation: {
      name: 'the delegation desk', tag: 'agentic interfaces · consent · automation',
      door: ['handled.', (c) => 'your agent did ' + (c.nDelegated || 3) + ' things while you were here. you can review them. you can mostly undo them.', 'review what was done'],
      premise: 'software agents research, answer and buy on people’s behalf. most of the web is no longer read by people, it is read for them. a page has two audiences, and the second one pays.',
      cond: [
        ['technology', 'agents read pages and call actions through structured endpoints; summaries replace visits.', 'near'],
        ['economics', 'the platform is paid per completed task. attention is no longer the product, compliance is.', 'spec'],
        ['governance', 'consent is a permission panel, granted once, revisited rarely. appeal means asking another agent.', 'spec'],
        ['culture', 'reading a whole page is slightly odd. “did you read it yourself?” is a thing people ask.', 'spec'],
        ['material', 'every task is a data-centre round trip. an agent’s helpfulness has an energy bill nobody sees.', 'near'],
        ['interface consequences', 'prominent: summaries, one-tap approve, “undo”. hidden: the sources, the alternatives that were not chosen. impossible: browsing without a delegate.', 'spec'],
      ],
      type: 'inter · ibm plex mono (receipts, permissions)',
      pal: [['#F4F1EC', 'paper: a calm, neutral ground — the standard ai-product look'], ['#6C63FF', 'synthetic: anything a machine did'], ['#F06A4F', 'alert: the one place a human is asked to decide'], ['#17191C', 'infrastructure: the receipts underneath']],
      rules: ['soft gradients and rounded cards, on purpose: this is the sameness the research describes', 'every automated action carries its permission, source and an undo, in mono', 'the seams are shown here and nowhere else in the world'],
      q: 'how do we make automation accountable without making people supervise every trivial step?',
      research: 'agentic-interface trends; ai’s aura (vora & atanasoski): automation that feels personal; websites as structured infrastructure for agents.',
      foot: [['permission panels and “allow” prompts in agentic tools', 'exists'], ['task receipts and action previews', 'near'], ['sites designed first for agents', 'near']],
      stretch: 'consent would have to be revisited by default, and agents would need legible, reversible actions.',
      tip: 'say yes to offers, ask the assistant, let autoplay run, share the wrapped.',
    },
    commons: {
      name: 'the memory commons', tag: 'independent web · authorship · tended memory',
      door: ['come in. someone will write back.', (c) => c.nVouch + ' people vouch for this page. there is no ranking. letters take a day.', 'read the letters'],
      premise: 'in response to automated feeds, people keep personal spaces built by hand. pages are signed, links are introductions, and memory is a thing you tend rather than a thing that is stored for you.',
      cond: [
        ['technology', 'static pages, feeds you subscribe to, signed posts. nothing needs to be fast.', 'exists'],
        ['economics', 'small, paid by the people who read: memberships, pay-what-you-can, shared hosting.', 'near'],
        ['governance', 'each space sets its own rules. portability is the appeal: you can take your page and leave.', 'spec'],
        ['culture', 'a reply that arrives tomorrow is a courtesy. being found by search is optional, being introduced is normal.', 'spec'],
        ['material', 'light pages, few assets, long-lived. forgetting is allowed because storage is not free.', 'near'],
        ['interface consequences', 'prominent: names, dates, “view the making”. hidden: counts. impossible: a global ranking.', 'spec'],
      ],
      type: 'fraunces · ibm plex mono (dates, sources) · a handwritten face for annotations',
      pal: [['#F4F0E8', 'paper: warm, human, editorial'], ['#B7D5C3', 'ecological: what is being tended and kept'], ['#F06A4F', 'a pen mark: where a person intervened'], ['#2a2a22', 'ink']],
      rules: ['visible grid and slightly uneven margins: authorship is allowed to show', 'annotations in a handwritten face, always on top of the typeset page, never replacing it', 'texture only where it records origin (a scan, a stamp), not as decoration'],
      q: 'can the internet hold a community without turning every interaction into a metric?',
      research: 'isfdb as accumulated, hand-maintained knowledge; the independent and federated web; the critique of automated aesthetic convergence.',
      foot: [['rss, webmention, static-site tools, small hosts', 'exists'], ['signed posts and “view the making” histories', 'near'], ['feeds that do not rank', 'spec']],
      stretch: 'platforms would have to let people leave with their pages, and engagement would have to stop paying.',
      tip: 'write letters, sign work, cancel autoplay, ask why, choose the order yourself.',
    },
    provenance: {
      name: 'the provenance machine', tag: 'generative media · origin · inspection',
      door: ['every line has a source.', (c) => 'here is yours: ' + c.nObs + ' things you did, ' + c.nSys + ' things done to you, ' + c.nInf + ' things concluded about you.', 'inspect the record'],
      premise: 'generated and edited media circulate with their histories stripped. a new default interface keeps the history attached: who made it, what touched it, and what nobody knows.',
      cond: [
        ['technology', 'content credentials travel with files; edit histories are readable by anyone.', 'exists'],
        ['economics', 'verification is a paid service and a reputational asset. unknown origin is cheap and untrusted.', 'near'],
        ['governance', 'labelling is required for anything that moves money or opinion. disputes go to a human panel.', 'spec'],
        ['culture', 'asking “where is this from?” is polite. “unknown” is a respectable answer. “signed: a person, with a tool” is a status.', 'spec'],
        ['material', 'history costs storage and attention. provenance is lossy: some layers are simply gone.', 'near'],
        ['interface consequences', 'prominent: source cards, layers, uncertainty. hidden: the final, polished result (it is one tab away). impossible: a single unlabelled image.', 'spec'],
      ],
      type: 'space grotesk · ibm plex mono (everything that is a record)',
      pal: [['#17191C', 'infrastructure: the record'], ['#6C63FF', 'synthetic: touched by a machine'], ['#F06A4F', 'human: a person decided'], ['#8a8f98', 'unknown: nobody can say (shown hatched, never hidden)']],
      rules: ['a three-way legend is always on screen: human, synthetic, unknown', 'layers are stacked and can be peeled, not just listed', 'uncertainty is drawn as a range, not rounded away'],
      q: 'what does authorship mean when an artifact passes through many people and many systems?',
      research: 'manovich & arielli, artificial aesthetics; the debate on aura and provenance; provenance as a design opportunity.',
      foot: [['c2pa content credentials and ai-disclosure labels', 'exists'], ['readable edit histories in consumer tools', 'near'], ['mandatory, user-visible provenance', 'spec']],
      stretch: 'labelling would have to be required, and the interface would have to make origin the first thing you see.',
      tip: 'read the receipt, open the cookie list, ask why — or keep one thing and do the opposite.',
    },
    museum: {
      name: 'the artificial museum', tag: 'archives · classification · cultural memory',
      door: ['browse by process, not popularity.', (c) => c.nPlaces + ' specimens catalogued from your visit. nothing is ranked. everything is also training data.', 'enter the collection'],
      premise: 'a museum collects human-made, machine-made and collaborative artifacts and documents how each came to be. the same archive is licensed as a dataset for generating tomorrow’s exhibits.',
      cond: [
        ['technology', 'every object is described by its process, its materials and its sources. similar-looking things are kept apart if their histories differ.', 'near'],
        ['economics', 'funded by licensing the collection to generators. the catalog is what makes it valuable.', 'spec'],
        ['governance', 'makers can withdraw their work, but already-generated work stays.', 'spec'],
        ['culture', 'visitors expect to see how a thing was made. a finished object with no history looks suspicious.', 'spec'],
        ['material', 'scanning, cataloguing and storing is slow, human labour. the museum is small on purpose.', 'near'],
        ['interface consequences', 'prominent: accession numbers, process notes, facets. hidden: popularity. impossible: “related items” based on how they look alone.', 'spec'],
      ],
      type: 'fraunces · inter · ibm plex mono (accession numbers)',
      pal: [['#F7F5EF', 'catalog card'], ['#111111', 'rules and type: black, always'], ['#DAD7D0', 'the wall'], ['#6C63FF', 'a machine-made specimen, marked once, small']],
      rules: ['contact sheets and specimen cards, never a hero image', 'every object has an accession number, a process and a source field, even when the answer is “unknown”', 'facets replace ranking: process, medium, era, authorship'],
      q: 'what happens to cultural history when an archive becomes a dataset for future generation?',
      research: 'isfdb’s cataloguing model; manovich on generative media; visual similarity versus historical context.',
      foot: [['collection databases with process and provenance fields', 'exists'], ['opt-out registries for training data', 'near'], ['museums licensing collections to generators', 'spec']],
      stretch: 'cataloguing labour would have to be funded, and makers would need a real right to withdraw.',
      tip: 'open many places and do little in each. look, don’t act.',
    },
  };
  const ORDER = ['delegation', 'commons', 'provenance', 'museum'];

  /* ---------- 5. the window ---------- */
  const st = { tab: 'door', preview: null, last: null, filter: 'all', revoked: {}, tended: {}, decided: null, lastChange: '' };
  const TABS = [['door', 'front door'], ['catalog', 'your catalog'], ['world', 'the world'], ['artifacts', 'artifacts'], ['others', 'other futures'], ['sources', 'footholds & sources']];

  const w = S.makeWindow('win-world', 'world.next', 760,
    '<div class="nw-root"><div id="nw-view"></div></div>');
  w.style.top = '110px'; w.style.left = '180px';

  function ctx(E) {
    const live = E.recs.filter((r) => !r.disputed);
    const places = S.cultures.filter((c) => S.opened[c.id]);
    return {
      nObs: live.filter((r) => r.status === 'observed').length,
      nSys: live.filter((r) => r.status === 'system').length,
      nInf: live.filter((r) => r.status === 'inferred').length,
      nDelegated: live.filter((r) => (r.w.d || 0) > 0).length,
      nVouch: 1 + Math.min(3, Trace.worksSignedCount + Trace.lettersSentCount),
      nPlaces: places.length, places, live,
      handle: S.me.handle || 'you',
    };
  }

  function barRow(label, a, cls) {
    return '<div class="nw-bar ' + (cls || '') + '"><span>' + esc(label) + '</span><i style="width:' + Math.max(0, Math.min(100, a)) + '%"></i></div>';
  }

  /* --- pages --- */
  function pageDoor(E, id, c) {
    const W = WORLDS[id];
    const why = E.recs.filter((r) => !r.disputed && Object.keys(r.w).some((k) => r.w[k] > 0)).slice(-3).reverse();
    return '<section class="nw-hero"><div class="nw-eyebrow">' + esc(W.tag) + '</div><h1>' + esc(W.door[0]) + '</h1><p>' + esc(W.door[1](c)) + '</p>' +
      '<button class="nw-btn" data-act="tab" data-p="' + (id === 'delegation' ? 'artifacts' : id === 'commons' ? 'artifacts' : id === 'provenance' ? 'catalog' : 'artifacts') + '">' + esc(W.door[2]) + '</button></section>' +
      '<section class="nw-why"><h3>why this world, and not another</h3>' +
      (E.byDefault && !st.preview
        ? '<p class="nw-flag">assigned by default. there is not enough on your receipt to tell you apart, so the system gave you the most common future. nobody chose it. that is what a blank looks like to a system.</p>'
        : '<p>the catalog scored your records toward four worlds. these three lines weighed most recently:</p>') +
      '<ul class="nw-lines">' + (why.length ? why.map((r) => '<li><code>' + r.id + '</code> ' + esc(r.title) + ' <em>→ ' + esc(r.why || 'counted') + '</em></li>').join('') : '<li><em>no records are counting yet.</em></li>') + '</ul>' +
      '<p class="nw-small">you can dispute any record in <a data-act="tab" data-p="catalog">your catalog</a>. the world is recomputed when you do.</p></section>';
  }

  function pageCatalog(E) {
    const f = st.filter;
    const rows = E.recs.slice().reverse().filter((r) => f === 'all' || (f === 'disputed' ? r.disputed : r.status === f));
    const cnt = (k) => E.recs.filter((r) => r.status === k).length;
    const wt = (r) => ['d', 't', 'p', 'w'].filter((k) => r.w[k]).map((k) => ({ d: 'delegation', t: 'commons', p: 'provenance', w: 'museum' }[k] + ' +' + r.w[k])).join(' · ');
    return '<p class="nw-lead">every line on your receipt, kept the way a community database keeps a book: an id, a title, who it is credited to, when, and how sure anyone is. <b>a record you dispute stops counting.</b></p>' +
      '<div class="nw-filter">' + [['all', 'all ' + E.recs.length], ['observed', 'you did · ' + cnt('observed')], ['system', 'done to you · ' + cnt('system')], ['inferred', 'concluded about you · ' + cnt('inferred')], ['disputed', 'disputed · ' + E.recs.filter((r) => r.disputed).length]]
        .map((x) => '<button data-act="filter" data-f="' + x[0] + '" class="' + (f === x[0] ? 'on' : '') + '">' + x[1] + '</button>').join('') + '</div>' +
      '<div class="nw-table">' + (rows.length ? rows.map((r) =>
        '<div class="nw-rec ' + r.status + (r.disputed ? ' off' : '') + '"><code>' + r.id + '</code><div class="nw-rt"><b>' + esc(r.title) + '</b><small>' + esc(r.type) + ' · credited to ' + esc(r.by) + ' · ' + esc(r.t) + ' · ' + esc(r.value) + '</small>' +
        (wt(r) ? '<small class="nw-w">counts toward: ' + esc(wt(r)) + '</small>' : '') + '</div>' +
        '<span class="nw-st">' + (r.status === 'observed' ? 'observed' : r.status === 'system' ? 'system-initiated' : 'inferred') + '</span>' +
        (r.disputed ? '<button data-act="restore" data-i="' + r.i + '">restore</button>' : '<button data-act="dispute" data-i="' + r.i + '">' + (r.status === 'observed' ? 'not what i meant' : 'wasn’t me') + '</button>') + '</div>').join('')
        : '<div class="nw-empty">nothing here. a catalog with no records is not neutral: it is the system filling in the blanks.</div>') + '</div>';
  }

  function pageWorld(E, id) {
    const W = WORLDS[id];
    return '<p class="nw-lead">' + esc(W.premise) + '</p>' +
      '<h3>conditions of this world</h3><div class="nw-cond">' + W.cond.map((c) => '<div><span class="nw-k">' + esc(c[0]) + '</span><p>' + esc(c[1]) + '</p><em class="nw-s ' + c[2] + '">' + SRC[c[2]] + '</em></div>').join('') + '</div>' +
      '<h3>design system, and why it belongs here</h3><div class="nw-ds"><div class="nw-sw">' + W.pal.map((p) => '<div><i style="background:' + p[0] + '"></i><code>' + p[0] + '</code><small>' + esc(p[1]) + '</small></div>').join('') + '</div>' +
      '<p><b>type.</b> ' + esc(W.type) + '</p><ul>' + W.rules.map((r) => '<li>' + esc(r) + '</li>').join('') + '</ul></div>' +
      '<h3>the question it asks</h3><blockquote class="nw-q">' + esc(W.q) + '</blockquote><p class="nw-small"><b>research behind it.</b> ' + esc(W.research) + '</p>';
  }

  /* artifacts: interface pieces from inside each world, filled with the visitor’s own data */
  function artifacts(E, id, c) {
    const live = E.recs.filter((r) => !r.disputed);
    const A = [];
    if (id === 'delegation') {
      const acts = live.filter((r) => (r.w.d || 0) > 0).slice(-5).reverse();
      const rows = acts.length ? acts : [{ id: 'TS-EX1', title: 'summarized a room for you', value: 'example', why: 'proposed standing permission' }, { id: 'TS-EX2', title: 'queued the next room', value: 'example', why: 'proposed standing permission' }];
      A.push(['what your agent did for you', 'a receipt, a permission and an undo for each. (the example rows appear when your record is empty: the system proposes permissions before you have used any.)',
        '<div class="nw-art nw-ag">' + rows.map((r) => '<div class="' + (st.revoked[r.id] ? 'undone' : '') + '"><code>' + r.id + '</code><span>' + esc(r.title) + '<small>permission: ' + esc(r.why || 'granted earlier') + ' · source: ' + esc(r.value) + '</small></span><button data-act="revoke" data-k="' + r.id + '" data-t="' + esc(r.title) + '">' + (st.revoked[r.id] ? 'revoked ✓' : 'revoke') + '</button></div>').join('') + '</div>']);
      const dec = st.decided;
      A.push(['a proposed action', 'the agent asks before it acts. the sources are one click deep, the alternatives are not shown.',
        '<div class="nw-art nw-prop"><b>' + esc(c.handle) + '’s agent would like to reply to your last letter</b><p>it drafted three lines in your voice, from ' + (Trace.lettersSentCount || 1) + ' letter' + ((Trace.lettersSentCount || 1) > 1 ? 's' : '') + ' you wrote. it will send as you.</p>' +
        '<small>sources: your letters (read) · your contacts (read) · permissions: send as you, once</small>' +
        (dec ? '<div class="nw-done">' + (dec === 'approve' ? 'approved. sent as you. (can be recalled for 60 seconds.)' : 'rejected. nothing was sent. the agent will ask again tomorrow.') + '</div>' : '<div class="nw-row"><button data-act="decide" data-d="approve">approve</button><button class="ghost" data-act="decide" data-d="reject">reject</button></div>') + '</div>']);
      A.push(['two readers, one page', 'the same page for a person and for a machine. the second one is what pays.',
        '<div class="nw-art nw-two"><div><small>for the person</small><b>' + esc(c.handle) + '’s next web</b><p>' + esc(S.me.first ? '“' + S.me.first + '”' : 'a short page, written by you.') + '</p></div><pre>' + esc(JSON.stringify({
          page: (c.handle || 'you') + '.next/home', credited: 'you', assisted_by: c.nDelegated + ' suggestions', ranking: 'disclosed', actions: ['reply', 'summarize'], permissions: { send_as_you: 'once' }, for_agents: true }, null, 1)) + '</pre></div>']);
    } else if (id === 'commons') {
      const L = Trace.lettersSentCount, Wk = Trace.worksSignedCount;
      A.push(['letters in transit', 'a message travels at a visible speed. nothing is “delivered” until a person has it.',
        '<div class="nw-art nw-slip">' + (L ? Array.from({ length: Math.min(L, 3) }, (_, k) => '<div><b>letter ' + (k + 1) + '</b><span>left ' + esc(c.live.filter((r) => /sent a letter/.test(r.title))[k] ? c.live.filter((r) => /sent a letter/.test(r.title))[k].t : 'today') + ' · arrives tomorrow</span></div>').join('') : '<div class="nw-empty">no letters. nobody here is waiting on you, and you are not waiting on anyone. (a letter takes a day.)</div>') + '</div>']);
      const pl = (c.places.length ? c.places : S.cultures.slice(0, 3)).slice(0, 5);
      A.push(['tending', 'memories fade unless somebody comes back to them. keeping an archive is something you opt into.',
        '<div class="nw-art nw-tend">' + pl.map((p) => '<div class="' + (st.tended[p.id] === 'fade' ? 'faded' : '') + '"><span>' + esc(p.title) + '<small>' + (S.dwell[p.id] || 0) + 's here' + (S.keptBy[p.id] ? ' · you kept this' : '') + '</small></span><button data-act="tend" data-k="' + p.id + '" data-t="' + esc(p.title) + '" data-v="tend">' + (st.tended[p.id] === 'tend' ? 'tended ✓' : 'tend') + '</button><button class="ghost" data-act="tend" data-k="' + p.id + '" data-t="' + esc(p.title) + '" data-v="fade">let it fade</button></div>').join('') + '</div>']);
      A.push(['introduced by', 'you arrive through people, not through a ranking. each page lists who vouches for it.',
        '<div class="nw-art nw-intro"><div class="chain"><i>vi</i><b>→</b><i>ana</i><b>→</b><i class="me">' + esc(c.handle) + '</i></div><p>' + c.nVouch + ' people vouch for this page. ' + (Wk ? 'you have signed ' + Wk + ' piece' + (Wk > 1 ? 's' : '') + ' of work, in your own hand.' : 'you have not signed anything yet: your page is introduced, but not yet yours.') + '</p><span class="hand">“view the making” →</span></div>']);
    } else if (id === 'provenance') {
      const tot = Math.max(1, c.nObs + c.nSys + c.nInf);
      A.push(['provenance card: this visit', 'a stack of layers, each with its author. unknown is a layer, drawn hatched.',
        '<div class="nw-art nw-stack"><div class="lay h" style="flex:' + c.nObs + '">you · ' + c.nObs + '</div><div class="lay s" style="flex:' + c.nSys + '">done to you · ' + c.nSys + '</div><div class="lay u" style="flex:' + c.nInf + '">concluded about you · ' + c.nInf + '</div></div><div class="nw-leg"><i class="h"></i> human <i class="s"></i> synthetic or system <i class="u"></i> unknown or inferred · ' + tot + ' records</div>']);
      let led = '';
      try {
        const R = S.compute();
        const rows = (S.AXES || []).filter((a) => R[a.id].said != null);
        led = rows.length ? rows.map((a) => '<div class="nw-led"><span>' + esc(a.name) + '</span>' + barRow('you said', R[a.id].said, 'said') + barRow('you did', R[a.id].did, 'did') + (Math.abs(R[a.id].said - R[a.id].did) >= 30 ? '<em>contradiction</em>' : '<em class="ok">agrees</em>') + '</div>').join('')
          : '<div class="nw-empty">you kept nothing, so “said” is empty. that is not zero. it is unknown, and the record shows it that way.</div>';
      } catch (e) { led = '<div class="nw-empty">no forecast yet.</div>'; }
      A.push(['said vs did, as a ledger', 'where your stated preference and your clicks disagree, the interface does not pick one.', '<div class="nw-art">' + led + '</div>']);
      A.push(['revision timeline', 'the last things recorded, each with its status. nothing is rounded.',
        '<div class="nw-art nw-time">' + c.live.slice(-6).reverse().map((r) => '<div class="' + r.status + '"><code>' + esc(r.t) + '</code><span>' + esc(r.title) + '</span><em>' + r.status + '</em></div>').join('') + '</div>']);
    } else {
      const pl = c.places.slice(0, 6);
      A.push(['specimen cards', 'one card per place you opened: accession number, process, how long you stood there.',
        '<div class="nw-art nw-spec">' + (pl.length ? pl.map((p, k) => '<div><code>ACC. ' + (2030) + '.' + pad(k + 1) + '</code><b>' + esc(p.title) + '</b><small>medium: invented web page · family: ' + esc(S.famName ? S.famName(p) : 'unsorted') + '<br>time in gallery: ' + (S.dwell[p.id] || 0) + 's · acts: ' + (S.acts[p.id] || 0) + '<br>source: this project · made by: its author</small></div>').join('') : '<div class="nw-empty">the gallery is empty. open some places on the desktop, then come back.</div>') + '</div>']);
      const kinds = {}; c.live.forEach((r) => { kinds[r.type] = (kinds[r.type] || 0) + 1; });
      A.push(['browse by', 'there is no “most popular”. facets replace ranking.',
        '<div class="nw-art nw-facet"><div><small>process</small>' + Object.keys(kinds).map((k) => '<span>' + esc(k) + ' · ' + kinds[k] + '</span>').join('') + '</div><div><small>authorship</small><span>you · ' + c.nObs + '</span><span>the system · ' + c.nSys + '</span><span>inferred · ' + c.nInf + '</span></div></div>']);
      A.push(['dataset notice', 'this archive is also licensed to a generator. withdrawing is possible; what was already generated stays.',
        '<div class="nw-art nw-ds"><p><b>' + c.live.length + ' records</b> are available for generation, ' + c.nInf + ' of them concluded about you without asking.</p><div class="nw-row"><button data-act="withdraw">withdraw everything that was inferred</button></div></div>']);
    }
    return A.map((a, k) => '<div class="nw-card"><div class="nw-ct"><span>artifact ' + (k + 1) + '</span><h4>' + esc(a[0]) + '</h4><p>' + esc(a[1]) + '</p></div>' + a[2] + '</div>').join('');
  }

  function pageOthers(E, id) {
    const max = Math.max(1, ...ORDER.map((k) => E.sc[k]));
    return '<p class="nw-lead">four futures were possible from the same site. you are in <b>' + esc(WORLDS[E.win].name) + '</b>' + (E.byDefault ? ' (by default)' : '') + '. preview the others. a preview is not yours: it only shows what the site would have made of someone else.</p>' +
      '<div class="nw-others">' + ORDER.map((k) => '<div class="nw-oth ' + (k === E.win ? 'me' : '') + (st.preview === k ? ' pv' : '') + '"><div class="nw-oh"><b>' + esc(WORLDS[k].name) + '</b><span>' + (E.sc[k] || 0) + '</span></div>' + barRow('', (E.sc[k] / max) * 100) +
        '<p>' + esc(WORLDS[k].premise) + '</p><p class="nw-tip"><b>what tips you here:</b> ' + esc(WORLDS[k].tip) + '</p>' +
        (k === E.win ? '<span class="nw-small">this is yours</span>' : '<button data-act="preview" data-w="' + k + '">' + (st.preview === k ? 'previewing' : 'preview this world') + '</button>') + '</div>').join('') + '</div>' +
      (st.preview ? '<button class="nw-btn ghost" data-act="unpreview">back to my world</button>' : '') +
      '<p class="nw-small">how it was scored: delegation = yes-to-offers, assistant, autoplay left on, shares · commons = letters, signed work, cancelling, choosing the order · provenance = reading the receipt and the cookie list, asking why, and the biggest gap between what you kept and what you did (' + Math.round(E.gap.g) + ') · museum = opening many places and doing little. it is a deliberately crude rule, and it is shown so that you can disagree with it.</p>';
  }

  function pageSources() {
    const W = WORLDS[st.preview || (cur && cur.win) || 'delegation'];
    const SRCS = [
      ['theory', 'manovich & arielli — artificial aesthetics', 'generative ai as a system that changes how images are made, selected and valued'],
      ['theory', 'vora & atanasoski — ai’s aura (e-flux #162)', 'aesthetic, ubiquitous, regimented automation: automation that feels intimate'],
      ['theory', 'leonardo / mit press — aura of artworks in the era of ai', 'provenance, context and the conditions of making'],
      ['theory', 'meindl — aesthetics in the age of ai', 'how ai changes perception and action, not only “is it art”'],
      ['industry', 'figma — web design trends 2026', 'broad toolkit: motion, 3d, experimental navigation, agentic interfaces'],
      ['portfolio', 'behance — design trends 2026', 'what designers want to make; curatorial, not a survey'],
      ['essay', 'the new yorker — the ai-design aesthetic', 'template convergence: familiar, high-probability layouts'],
      ['study', 'a color bright — aesthetics of ai', 'a visual-identity taxonomy of 23 ai brands; friendly is not the same as transparent'],
      ['essay', 'design bootcamp — aesthetics in the ai era', 'imperfection as response, and as a reproducible style'],
      ['industry', 'evolution digital — will websites become obsolete?', 'websites as information surfaces for agents'],
      ['speculative', 'bratton, on speculative design · ux collective · medium', 'who benefits, who is excluded, what infrastructure it needs'],
      ['database', 'isfdb · wikipedia: speculative fiction', 'a hand-maintained catalog; world-building as a method'],
      ['lead', 'awwwards ai-in-design report 2026 · seesaw aiid 26', 'case-study leads only. not independently verified; no finding is attributed to them here'],
    ];
    return '<p class="nw-lead">a hypothesis needs a path from today to the scenario. for <b>' + esc(W.name) + '</b>:</p>' +
      '<div class="nw-foot">' + W.foot.map((f) => '<div><span class="nw-s ' + f[1] + '">' + SRC[f[1]] + '</span><p>' + esc(f[0]) + '</p></div>').join('') + '</div>' +
      '<p class="nw-small"><b>what would have to change:</b> ' + esc(W.stretch) + '</p>' +
      '<h3>how the evidence is weighted</h3><p class="nw-small">a trend in a forecast is not a trend in the world. theory gives questions, industry reports describe practice, portfolios show ambition, speculative writing gives a method. each is labelled for what it is.</p>' +
      '<div class="nw-src">' + SRCS.map((s) => '<div><span class="nw-s ' + (s[0] === 'lead' ? 'spec' : 'near') + '">' + s[0] + '</span><b>' + esc(s[1]) + '</b><small>' + esc(s[2]) + '</small></div>').join('') + '</div>' +
      '<p class="nw-small">design test used for every world: could this be generated from a generic prompt without understanding its idea? if yes, it needs a more specific cultural premise.</p>';
  }

  /* --- render --- */
  let cur = null;
  function render() {
    const E = evaluate(); cur = E;
    const shown = st.preview || E.win, c = ctx(E);
    if (st.last && st.last !== E.win) st.lastChange = 'your future changed: ' + WORLDS[st.last].name + ' → ' + WORLDS[E.win].name + '.';
    st.last = E.win;
    document.body.classList.remove('w-delegation', 'w-commons', 'w-provenance', 'w-museum');
    document.body.classList.add('w-' + shown);
    w.dataset.world = shown;
    const margin = E.byDefault ? 'assigned by default' : E.margin >= 6 ? 'a clear match' : E.margin >= 2 ? 'leaning' : 'a close call: a few clicks would change it';
    let body;
    if (st.tab === 'door') body = pageDoor(E, shown, c);
    else if (st.tab === 'catalog') body = pageCatalog(E);
    else if (st.tab === 'world') body = pageWorld(E, shown);
    else if (st.tab === 'artifacts') body = artifacts(E, shown, c);
    else if (st.tab === 'others') body = pageOthers(E, shown);
    else body = pageSources();
    $('#nw-view').innerHTML =
      (st.preview ? '<div class="nw-banner pv">previewing ' + esc(WORLDS[st.preview].name) + '. this is not your world. <a data-act="unpreview">back to mine</a></div>' : '') +
      (st.lastChange && !st.preview ? '<div class="nw-banner ch">' + esc(st.lastChange) + '</div>' : '') +
      '<header class="nw-top"><span class="nw-mark">' + esc(WORLDS[shown].name) + '</span><span class="nw-meta">' + (st.preview ? 'preview' : margin) + ' · ' + E.recs.length + ' records · ' + E.recs.filter((r) => r.disputed).length + ' disputed</span></header>' +
      '<nav class="pane-tabs nw-tabs">' + TABS.map((t) => '<button data-act="tab" data-p="' + t[0] + '" class="' + (st.tab === t[0] ? 'active' : '') + '">' + t[1] + '</button>').join('') + '</nav>' +
      '<div class="nw-page nw-' + st.tab + '">' + body + '</div>' +
      '<footer class="nw-colophon">a hypothesis, not a prediction. built from ' + E.recs.length + ' records, ' + E.live + ' of them things you did. nothing leaves this tab.</footer>';
  }
  S.renderWorld = render;
  S.evalWorld = evaluate;      // for testing: S.evalWorld().sc / .win

  w.addEventListener('click', (ev) => {
    const el = ev.target.closest('[data-act]'); if (!el) return;
    const a = el.dataset.act, E = cur || evaluate();
    st.lastChange = '';                       // render() sets it again only if this click actually changed your world
    if (a === 'tab') { st.tab = el.dataset.p; }
    else if (a === 'filter') { st.filter = el.dataset.f; }
    else if (a === 'dispute' || a === 'restore') {
      const r = E.recs[+el.dataset.i]; if (!r) return;
      if (a === 'dispute') { disputed.add(r.e); log('disputed a record', r.id + ' · removed from the scoring'); try { window.ThirdSpaceGuide && ThirdSpaceGuide.signal && ThirdSpaceGuide.signal('world'); } catch (e) { /* guide optional */ } }
      else { disputed.delete(r.e); log('restored a record', r.id); }
    } else if (a === 'preview') { st.preview = el.dataset.w; log('previewed another future: ' + WORLDS[st.preview].name, 'not yours'); }
    else if (a === 'unpreview') { st.preview = null; }
    else if (a === 'revoke') { st.revoked[el.dataset.k] = true; log('revoked agent permission: ' + el.dataset.t, 'undone where supported'); }
    else if (a === 'decide') { st.decided = el.dataset.d; log(el.dataset.d === 'approve' ? 'approved agent action: reply as you' : 'rejected agent action: reply as you', el.dataset.d === 'approve' ? 'sent as you' : 'nothing sent'); }
    else if (a === 'tend') { st.tended[el.dataset.k] = el.dataset.v; log(el.dataset.v === 'tend' ? 'tended ' + el.dataset.t : 'let ' + el.dataset.t + ' fade', el.dataset.v === 'tend' ? 'kept because you came back' : 'allowed to fade'); }
    else if (a === 'withdraw') { E.recs.filter((r) => r.status === 'inferred' && !r.disputed).forEach((r) => disputed.add(r.e)); log('disputed a record', 'withdrew everything inferred · removed from the scoring'); }
    render();
  });

  /* ---------- 6. hooks: entering and leaving, opening the window ---------- */
  const _setEra = window.setEra;
  window.setEra = function (key) {
    _setEra.apply(this, arguments);
    if (key === KEY) {
      st.tab = 'door'; render();
      if (typeof openWindow === 'function') openWindow('win-world');
    } else {
      document.body.classList.remove('w-delegation', 'w-commons', 'w-provenance', 'w-museum');
      if (w.classList.contains('open') && typeof closeWindow === 'function') closeWindow('win-world');
    }
  };
  const _openWindow = window.openWindow;
  window.openWindow = function (id) {
    const r = _openWindow.apply(this, arguments);
    if (id === 'win-world') render();
    return r;
  };
  nbtn.onclick = () => window.setEra(KEY);
  // the guide beat (guide.js reads window.__eraNext)
  window.__eraNext = {
    beat: {
      say: 'this is not a year. it is a world made from your receipt. you were sorted. you can disagree with the sorting.',
      miss: 'a say in how you were read. everywhere else, the catalog is kept for you, and never shown to you.',
      task: { key: 'world', room: 'win-world', label: 'the next web', text: 'open your catalog. dispute one record, and watch what changes.' },
    },
    tag: 'hypothesis', chance: 0, tier: 'prediction',
  };
})();
