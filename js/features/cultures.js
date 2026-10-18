/* =====================================================================
   cultures.js — internet subcultures (desktop shortcuts) + "the next web".

   Load AFTER script.js and BEFORE early-eras.js, so that early-eras.js wraps these new
   windows in each era's browser chrome the same way it does the old rooms.
   Anything that depends on the current era, pop-ups or the guide lives in
   guide.js (loaded last).

   The idea
   --------
   Each icon on the right-hand side of the desktop is a place people made on
   the web. Each one is NOT a skin for the future. It carries one *practice*
   that platforms stopped supporting (introduction instead of ranking, a
   guestbook instead of a counter, delay instead of instant, ...).

   Two things are recorded for every practice:
     - what the visitor SAYS: pressing "keep this for the next web"
     - what the visitor DOES: time spent there + what they actually did

   "the next web" (win-future) combines those with the receipt data
   (pop-ups accepted, letters sent, work signed...) into a forecast, and
   shows where what you said and what your clicks suggest disagree.
===================================================================== */
(function () {
  'use strict';

  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const clamp = (n, a, b) => Math.max(a == null ? 0 : a, Math.min(b == null ? 100 : b, n));

  /* ---------- shared state (guide.js reads and writes this too) ---------- */
  const S = (window.ThirdSpaceNext = {
    me: { handle: '', first: '' },
    keptBy: {},     // culture id -> true      (what the visitor SAID)
    opened: {},     // culture id -> true
    dwell: {},      // culture id -> seconds that window was on top
    acts: {},       // culture id -> weighted interactions (what they DID)
    flags: {},      // other observations (preferSmooth, lookOnly, skipped)
    rooms: { blocks: 0, maze: 0, letters: 0, signed: 0, data: 0, asked: 0, machineAccepted: 0, machineRejected: 0 },
    pop: { shown: 0, closed: 0, accepted: 0 },
    hooks: {},      // guide.js plugs in: onKeep, onAct, exportLog
    cultures: [],
  });

  /* ---------- the seven settings of the next web ----------
     ('low' is what optimization tends to give you; 'high' is the recovered quality) */
  const AXES = [
    { id: 'discovery',  name: 'how you find things', low: 'ranked for you',        high: 'introduced by people' },
    { id: 'authorship', name: 'who makes the page',  low: 'filled-in templates',   high: 'built by hand' },
    { id: 'provenance', name: 'who said it',         low: 'origin unknown',        high: 'signed by a person' },
    { id: 'visibility', name: 'who can see you',     low: 'the system',            high: 'other people' },
    { id: 'pace',       name: 'how fast it moves',   low: 'instant',               high: 'deliberate' },
    { id: 'memory',     name: 'what it remembers',   low: 'everything, forever',   high: 'what is tended' },
    { id: 'seams',      name: 'what it hides',       low: 'everything is smooth',  high: 'shows its seams' },
  ];
  S.AXES = AXES;

  /* what each setting would mean as an interface, and why it is (or isn't) believable.
     'plausible' = could ship with tools that exist now.
     'possible'  = needs the incentives to change first.
     Loosely borrowed from Dunne & Raby's cone of futures (Speculative Everything, ch. 1). Their test for
     believability is a path from today to the scenario: that is what 'foothold' (exists today) and
     'stretch' (what would have to change) are for. They also warn that a proposal which is too weird
     gets dismissed as art and one that is too normal gets assimilated (ch. 3) -- keep both lines honest. */
  const ADV = {
    discovery: {
      def: 'a feed decides what you see next.',
      rec: 'you arrive through introductions. every page lists the people who vouch for it. there is no ranking.',
      foothold: 'RSS, webmention and federated follows already work this way.',
      stretch: 'search and feeds would have to stop ranking by engagement.',
      level: 'plausible',
    },
    authorship: {
      def: 'every page is a template, and your voice has to fit the fields.',
      rec: 'pages are built, not generated. a “view the making” link shows the drafts and edits behind each one.',
      foothold: 'static-site tools, small hosts, version history.',
      stretch: 'platforms would have to let people take their pages with them.',
      level: 'plausible',
    },
    provenance: {
      def: 'you cannot tell who, or what, wrote it.',
      rec: 'everything carries a signature: a person, a person with a tool, or a machine. it is named on screen.',
      foothold: 'content credentials (C2PA) and AI-disclosure labels exist today.',
      stretch: 'labelling would have to be required, not optional.',
      level: 'possible',
    },
    visibility: {
      def: 'the system sees every click. people see a number.',
      rec: 'no hidden analytics. the only metric is who stopped by, by name, if they chose to be named.',
      foothold: 'webmentions, guestbooks, privacy-preserving analytics.',
      stretch: 'ad-funded sites would lose their main source of revenue.',
      level: 'possible',
    },
    pace: {
      def: 'everything arrives at once, instantly.',
      rec: 'messages travel at a visible speed. what you write waits with you before it goes.',
      foothold: 'scheduled send and digests already exist.',
      stretch: 'engagement metrics reward speed. they would have to stop.',
      level: 'plausible',
    },
    memory: {
      def: 'everything is kept, indexed, and sold back to you.',
      rec: 'posts fade unless someone comes back to them. keeping an archive is something you opt into.',
      foothold: 'disappearing messages, expiring links, local-first software.',
      stretch: 'data is the business model. forgetting costs money.',
      level: 'possible',
    },
    seams: {
      def: 'errors, waits and machine help are hidden so it feels seamless.',
      rec: 'the system says what it did: “rewritten by a model”, “waiting on a person”, “this page broke”.',
      foothold: 'status pages, edit histories, AI-disclosure labels.',
      stretch: 'smoothness is the brand. seams read as failure.',
      level: 'plausible',
    },
  };
  S.ADV = ADV;

  /* ---------- small helpers ---------- */
  function shuffle(a) {
    a = a.slice();
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    return a;
  }

  function makeWindow(id, title, width, bodyHTML) {
    const w = document.createElement('div');
    w.className = 'window';
    w.id = id;
    w.style.cssText = 'width:' + width + 'px; top:120px; left:260px; z-index:1;';
    w.innerHTML =
      '<div class="titlebar" onpointerdown="startDrag(event,\'' + id + '\')"><span class="ttl">' + esc(title) + '</span>' +
      '<div class="winbtns"><button onclick="minimizeWindow(\'' + id + '\')">_</button><button onclick="closeWindow(\'' + id + '\')">×</button></div></div>' +
      '<div class="winbody">' + bodyHTML + '</div>';
    document.body.appendChild(w);
    windowTitles[id] = title;
    return w;
  }

  /* =====================================================================
     THE EIGHT PLACES
     Each build(stage, api, ctx) fills a small interactive thing.
       api.act(name, weight)  -> counts as something the visitor DID
       api.flag(name)         -> a one-off observation
       ctx.keep(true|false)   -> counts as something the visitor SAID
  ===================================================================== */

  function buildWebring(st, api) {
    const RING = [
      { site: 'moth-light.net',   by: 'vi',    line: 'notes from a night-shift pharmacist. mostly about the quiet.' },
      { site: 'kettle & cable',   by: 'oskar', line: 'a repair diary. every post is something that was fixed, badly, then fixed again.' },
      { site: 'the long wait',    by: 'rufus', line: 'bus timetables i love, with commentary.' },
      { site: 'pocket weather',   by: 'dee',   line: 'the forecast, but only for my window.' },
      { site: 'ugly tomatoes',    by: 'ana',   line: 'a garden log. the tomatoes are ugly. the log is honest.' },
    ];
    let i = 0;
    st.innerHTML =
      '<div class="wr-site"><div class="wr-name"></div><div class="wr-line"></div><div class="wr-meta"></div></div>' +
      '<div class="wr-bar"><button data-d="-1">◀ prev</button><button data-d="r">random</button><button data-d="1">next ▶</button></div>' +
      '<div class="wr-ring"></div>';
    const draw = () => {
      const s = RING[i], p = RING[(i + RING.length - 1) % RING.length];
      $('.wr-name', st).textContent = s.site;
      $('.wr-line', st).textContent = s.line;
      $('.wr-meta', st).innerHTML = 'you got here because <b>' + esc(p.by) + '</b> (' + esc(p.site) + ') linked to it. nobody ranked it.';
      $('.wr-ring', st).textContent = 'the small hours ring · site ' + (i + 1) + ' of ' + RING.length;
    };
    st.querySelectorAll('.wr-bar button').forEach((b) => {
      b.onclick = () => {
        const d = b.dataset.d;
        i = d === 'r' ? (i + 1 + Math.floor(Math.random() * (RING.length - 1))) % RING.length : (i + Number(d) + RING.length) % RING.length;
        draw();
        api.act('hop');
      };
    });
    draw();
  }

  function buildGuestbook(st, api) {
    const entries = [
      { n: 'rufus (ohio)', t: '3 days ago',  m: 'found you through the small hours ring. your bus page made my whole week.' },
      { n: 'anon',         t: '2 weeks ago', m: 'no reason. i just wanted to be on a list that was made by hand.' },
      { n: 'dee',          t: 'last month',  m: 'your tomatoes are not ugly. i will fight anyone.' },
    ];
    st.innerHTML =
      '<div class="gb-title">~ please sign my guestbook ~</div><div class="gb-list"></div>' +
      '<input class="field gb-name" maxlength="20" placeholder="your name">' +
      '<textarea class="field gb-msg" rows="2" maxlength="140" placeholder="say something to the next visitor"></textarea>' +
      '<button class="btn-95 gb-sign">sign</button>' +
      '<div class="gb-note">only the next visitor will read this. there is no counter.</div>';
    const list = $('.gb-list', st);
    const draw = () => {
      list.innerHTML = entries.map((e) => '<div class="gb-entry"><b>' + esc(e.n) + '</b> <span>' + esc(e.t) + '</span><p>' + esc(e.m) + '</p></div>').join('');
    };
    $('.gb-sign', st).onclick = () => {
      const m = $('.gb-msg', st).value.trim();
      if (!m) return;
      entries.unshift({ n: $('.gb-name', st).value.trim() || 'anon', t: 'just now', m });
      $('.gb-msg', st).value = '';
      draw();
      api.act('signed', m.length > 40 ? 2 : 1);
    };
    draw();
  }

  function buildHomepage(st, api) {
    st.innerHTML =
      '<div class="hp-tabs"><button class="on" data-v="page">the page</button><button data-v="src">the making</button></div>' +
      '<div class="hp-page"><h3 class="hp-h"></h3><p>welcome to my page. it is not finished. it will never be finished.</p>' +
      '<p>links: <u>the small hours ring</u> · <u>things i like</u> · <u>email me (a real person)</u></p>' +
      '<p class="hp-blink">under construction</p></div>' +
      '<pre class="hp-src" hidden></pre>' +
      '<label class="hp-label">rename this page: <input class="field hp-title" maxlength="30" value="Vi’s Corner of the Web"></label>';
    const titleEl = $('.hp-title', st), h = $('.hp-h', st), pre = $('.hp-src', st);
    const src = (t) =>
      '<!-- made at 2am. please don’t steal the blink tag -->\n<html>\n<head><title>' + t + '</title></head>\n' +
      '<body bgcolor="#ffffcc" text="#000066">\n<h3><blink>' + t + '</blink></h3>\n' +
      '<p>welcome to my page.\nit is not finished.\nit will never be finished.</p>\n' +
      '<a href="ring.html">the small hours ring</a>\n<!-- todo: fix the counter -->\n</body>\n</html>';
    const sync = () => { h.textContent = titleEl.value; pre.textContent = src(titleEl.value); };
    let viewed = false, edited = false;
    titleEl.oninput = () => { sync(); if (!edited) { edited = true; api.act('edit', 2); } };
    st.querySelectorAll('.hp-tabs button').forEach((b) => {
      b.onclick = () => {
        st.querySelectorAll('.hp-tabs button').forEach((x) => x.classList.toggle('on', x === b));
        const isSrc = b.dataset.v === 'src';
        $('.hp-page', st).hidden = isSrc;
        pre.hidden = !isSrc;
        if (isSrc && !viewed) { viewed = true; api.act('viewsource', 2); }
      };
    });
    sync();
  }

  function buildJournal(st, api) {
    const posts = [
      ['oct 12 · 2:14am', 'can’t sleep. the radiator knocks in threes. i counted. it isn’t random.'],
      ['oct 9 · 11:40pm', 'made soup. it was bad. posting this so someone knows.'],
      ['oct 3 · 7:05am',  'nothing to report. reporting it anyway.'],
    ];
    st.innerHTML =
      posts.map((p) => '<div class="jr-post"><small>' + esc(p[0]) + '</small><p>' + esc(p[1]) + '</p></div>').join('') +
      '<div class="jr-actions"><button class="btn-95 jr-like">♡ like</button><span class="jr-msg"></span></div>' +
      '<textarea class="field jr-reply" rows="2" placeholder="write back (it will arrive tomorrow)"></textarea>' +
      '<button class="btn-95 jr-send">send</button><div class="jr-pending"></div>';
    $('.jr-like', st).onclick = () => {
      $('.jr-msg', st).textContent = 'there is no like button here. there never was. write back instead.';
      api.act('like-tried', 0.5);
    };
    $('.jr-send', st).onclick = () => {
      const t = $('.jr-reply', st).value.trim();
      if (!t) return;
      const d = document.createElement('div');
      d.className = 'jr-transit';
      d.textContent = 'in transit · arrives tomorrow · “' + (t.length > 40 ? t.slice(0, 40) + '…' : t) + '”';
      $('.jr-pending', st).prepend(d);
      $('.jr-reply', st).value = '';
      api.act('wrote-back', 2);
    };
  }

  function buildGlitch(st, api) {
    const ALT = [
      'image not found: the photo of the room before we moved.',
      '404: the page you were looking for was deleted by someone who was tired.',
      'error 500: the server remembers you, but not kindly.',
      'image failed to load. it was the sea. you know what the sea looks like.',
      'this space intentionally left in ruins.',
    ];
    st.innerHTML =
      '<div class="gl-grid">' + ALT.map((a, i) => '<button class="gl-img" data-i="' + i + '" aria-label="broken image"><span>✕</span></button>').join('') + '</div>' +
      '<div class="gl-cap">click a broken image.</div><div class="gl-count"></div>';
    const seen = new Set();
    st.querySelectorAll('.gl-img').forEach((b) => {
      b.onclick = () => {
        const i = Number(b.dataset.i);
        $('.gl-cap', st).textContent = ALT[i];
        b.classList.add('read');
        if (!seen.has(i)) api.act('reveal', 0.8);
        seen.add(i);
        $('.gl-count', st).textContent = seen.size + ' of ' + ALT.length + ' read' +
          (seen.size === ALT.length ? ' · most error pages only say “something went wrong.”' : '');
      };
    });
  }

  function buildRevival(st, api, ctx) {
    st.innerHTML =
      '<div class="rv-skins"><button class="on" data-s="plain">plain</button><button data-s="y2k">y2k</button><button data-s="vapor">vapor</button></div>' +
      '<div class="rv-card s-plain"><p>someone used to sit down and make a page. now there’s a filter that makes anything look like they did.</p></div>' +
      '<div class="rv-tag"></div>' +
      '<div class="rv-choice"><button class="btn-95 rv-look">keep the look</button><button class="btn-95 rv-practice">keep the practice (make it yourself)</button></div>' +
      '<div class="rv-note"></div>';
    const card = $('.rv-card', st), tag = $('.rv-tag', st), note = $('.rv-note', st);
    st.querySelectorAll('.rv-skins button').forEach((b) => {
      b.onclick = () => {
        st.querySelectorAll('.rv-skins button').forEach((x) => x.classList.toggle('on', x === b));
        const s = b.dataset.s;
        card.className = 'rv-card s-' + s;
        tag.textContent = s === 'plain' ? '' : '$4.99 · ' + s + ' nostalgia pack';
        if (s !== 'plain') api.act('skin', 0.4);
      };
    });
    $('.rv-look', st).onclick = () => {
      api.flag('lookOnly');
      note.textContent = 'the look arrives without the work that made it.';
      api.act('look', 0.5);
    };
    $('.rv-practice', st).onclick = () => {
      ctx.keep(true);
      note.textContent = 'kept. the next web can have any skin. what matters is that someone made it.';
    };
  }

  function buildFeed(st, api) {
    const items = shuffle([
      { human: false, t: 'This is such a powerful reminder to slow down and appreciate the little things! 🙌' },
      { human: true,  t: 'ok but my cat did this exact thing last tuesday and i cried?? anyway thanks for posting' },
      { human: false, t: 'Great insights! Thanks for sharing. Looking forward to more content like this.' },
      { human: true,  t: 'the tiles. my grandmother had these tiles. i didn’t know they were that color until just now' },
    ]);
    st.innerHTML =
      '<div class="fd-post"><div class="fd-photo">[ photo: a kitchen, early morning ]</div><div class="fd-meta">♥ 3 · 4 comments</div></div>' +
      '<div class="fd-q">which comment was written by a person?</div><div class="fd-comments">' +
      items.map((c, i) => '<div class="fd-c" data-i="' + i + '"><p>' + esc(c.t) + '</p><button class="btn-95">this one</button><span class="fd-tag"></span></div>').join('') +
      '</div><div class="fd-result"></div>';
    let done = false;
    st.querySelectorAll('.fd-c').forEach((row) => {
      row.querySelector('button').onclick = () => {
        if (done) return;
        done = true;
        const pick = items[Number(row.dataset.i)];
        st.querySelectorAll('.fd-c').forEach((r) => {
          const it = items[Number(r.dataset.i)];
          r.querySelector('.fd-tag').textContent = it.human ? 'a person · signed' : 'generated';
          r.classList.add(it.human ? 'h' : 'g');
          r.querySelector('button').disabled = true;
        });
        row.classList.add('picked');
        if (pick.human) {
          $('.fd-result', st).textContent = 'yes. look at what gave it away: a specific tile, a cat, a mistake.';
          api.act('picked', 2);
        } else {
          $('.fd-result', st).textContent = 'that one was generated. it was the smoothest. smooth reads as human now.';
          api.flag('preferSmooth');
          api.act('picked', 1);
        }
      };
    });
  }

  function buildGarden(st, api) {
    const notes = [
      { t: 'learned the name of the bird outside: a nuthatch.', age: 2 },
      { t: 'grandma’s rice. no measurements. approximate.', age: 19 },
      { t: 'a list of things i want to forget. not ready.', age: 64 },
    ];
    st.innerHTML =
      '<div class="gd-list"></div>' +
      '<input class="field gd-in" maxlength="80" placeholder="plant one thing today">' +
      '<button class="btn-95 gd-plant">plant</button>' +
      '<div class="gd-note">nothing here is kept unless someone comes back to it.</div>';
    const list = $('.gd-list', st);
    const draw = () => {
      list.innerHTML = notes.map((n, i) =>
        '<div class="gd-item" style="opacity:' + Math.max(0.22, 1 - n.age / 90).toFixed(2) + '"><span>' + esc(n.t) + '</span><small>' +
        (n.age === 0 ? 'tended today' : n.age + ' days ago') + '</small><button class="gd-water" data-i="' + i + '">water</button></div>').join('');
      list.querySelectorAll('.gd-water').forEach((b) => {
        b.onclick = () => { notes[Number(b.dataset.i)].age = 0; draw(); api.act('watered'); };
      });
    };
    $('.gd-plant', st).onclick = () => {
      const inp = $('.gd-in', st), t = inp.value.trim();
      if (!t) return;
      notes.unshift({ t, age: 0 });
      inp.value = ''; inp.disabled = true; $('.gd-plant', st).disabled = true;
      $('.gd-note', st).textContent = 'planted. come back tomorrow for the next one.';
      draw();
      api.act('planted', 2);
    };
    draw();
  }

  /* ---------- the roster ---------- */
  const CULTURES = [
    { id: 'webring',  title: 'webrings',        glyph: '🔗', label: 'webrings',  years: '1996–2016', from: 1996, fade: 2016, axis: 'discovery',
      did: 'sites linked to each other in a loop. you found the next page because a person pointed to it.',
      trait: 'practice: discovery by introduction, not by ranking.', lostTo: 'search rankings and follower counts', build: buildWebring },
    { id: 'guestbook', title: 'guestbooks',     glyph: '📖', label: 'guestbooks', years: '1996–2010', from: 1996, fade: 2010, axis: 'visibility',
      did: 'visitors left a trace for the next visitor. nothing here counted who you were.',
      trait: 'practice: being seen by people, not measured by a system.', lostTo: 'like counts and comment sections', build: buildGuestbook },
    { id: 'homepage', title: 'handmade pages',  glyph: '🧶', label: 'handmade',  years: '1996–2010', from: 1996, fade: 2010, axis: 'authorship',
      did: 'people wrote their own pages, badly and on purpose. the person was visible in how it was built.',
      trait: 'practice: the making is visible, and it belongs to you.', lostTo: 'profile templates', build: buildHomepage },
    { id: 'journal',  title: 'journals',        glyph: '📓', label: 'journals',  years: '2004–2016', from: 2004, fade: 2016, axis: 'pace',
      did: 'blogs and online diaries. you wrote for whoever came by, and they wrote back, slowly.',
      trait: 'practice: things take as long as they take.', lostTo: 'the infinite feed', build: buildJournal },
    { id: 'glitch',   title: 'glitch & net art', glyph: '👾', label: 'glitch',   years: '1996–now', from: 1996, fade: null, axis: 'seams',
      did: 'artists treated broken pages as a material. an error could say something.',
      trait: 'practice: the system shows its seams.', lostTo: '', build: buildGlitch },
    { id: 'revival',  title: 'aesthetic revival', glyph: '🌴', label: 'revival', years: '2010–now', from: 2010, fade: null, axis: 'authorship', noKeep: true,
      did: 'the look of the old web, rebuilt as a filter. sometimes the practice behind it is missing.',
      trait: 'the look can be sold. the making cannot.', lostTo: '', build: buildRevival },
    { id: 'feed',     title: 'the feed',        glyph: '💬', label: 'the feed', years: '2016–now', from: 2016, fade: null, axis: 'provenance',
      did: 'comment sections where you can no longer tell who is typing.',
      trait: 'practice: a signature says who made it.', lostTo: '', build: buildFeed },
    { id: 'garden',   title: 'digital gardens', glyph: '🌱', label: 'garden',   years: '2020–now', from: 2020, fade: null, axis: 'memory',
      did: 'small, slow personal sites that grow by being revisited. they are not built to go viral.',
      trait: 'practice: what you tend stays; the rest is allowed to fade.', lostTo: '', build: buildGarden },
  ];
  S.cultures = CULTURES;

  /* the 2024 era is the last stop (year 2024 >= 2020), so 'garden' is only reachable there */

  /* ---------- build the windows + icons ---------- */
  const keptCount = () => Object.keys(S.keptBy).length;
  function axisKept(axisId) { return CULTURES.some((c) => c.axis === axisId && S.keptBy[c.id]); }
  S.axisKept = axisKept;

  CULTURES.forEach((c) => {
    c.winId = 'win-c-' + c.id;
    const foot = c.noKeep
      ? '<div class="cult-foot"><span class="keepnote">' + esc(c.trait) + '</span></div>'
      : '<div class="cult-foot"><button class="btn-95 keepbtn">keep this for the next web</button><span class="keepnote">' + esc(c.trait) + '</span></div>';
    c.win = makeWindow(c.winId, c.title, 520,
      '<div class="kicker">INTERNET SUBCULTURE · ' + c.years + '</div>' +
      '<h2 class="roomtitle">' + esc(c.title) + '</h2>' +
      (c.lostTo ? '<div class="archived-note">archived copy. the original practice faded as ' + esc(c.lostTo) + ' took its place.</div>' : '') +
      '<div class="q">' + esc(c.did) + '</div>' +
      '<div class="cult-stage s-' + c.id + '"></div>' + foot);

    const setKept = (on) => {
      if (on) S.keptBy[c.id] = true; else delete S.keptBy[c.id];
      const b = $('.keepbtn', c.win);
      if (b) { b.textContent = on ? 'kept ✓ (undo)' : 'keep this for the next web'; b.classList.toggle('kept', on); }
      c.win.classList.toggle('is-kept', on);
      if (S.hooks.onKeep) S.hooks.onKeep(c.id, on);
    };
    const api = {
      act: (name, w) => { S.acts[c.id] = (S.acts[c.id] || 0) + (w == null ? 1 : w); if (S.hooks.onAct) S.hooks.onAct(c.id, name); },
      flag: (k, v) => { S.flags[k] = v == null ? true : v; },
    };
    c.build($('.cult-stage', c.win), api, { keep: setKept });
    const kb = $('.keepbtn', c.win);
    if (kb) kb.onclick = () => setKept(!S.keptBy[c.id]);
  });

  const desktopEl = document.getElementById('desktop');
  function addIcon(cid, glyph, label, onclick) {
    const div = document.createElement('div');
    div.className = 'icon culture-icon';
    div.dataset.cid = cid;
    div.style.left = 'auto';
    div.style.display = 'none';
    div.innerHTML = '<div class="glyph">' + glyph + '</div><div class="label">' + esc(label) + '</div>';
    div.onclick = onclick;
    desktopEl.appendChild(div);
    return div;
  }
  // a 3-column grid on the right edge. grid index g -> row = g / 3, column counted from the left.
  // "the next web" is pinned to the top-right corner (g = 2); the subcultures fill in around it,
  // packed in order so that icons which don't exist yet in an era leave no gaps.
  const GRID_COLS = 3;
  function place(el, g) {
    el.style.top = (20 + Math.floor(g / GRID_COLS) * 106) + 'px';
    el.style.right = (16 + (GRID_COLS - 1 - (g % GRID_COLS)) * 88) + 'px';
  }
  CULTURES.forEach((c) => {
    addIcon(c.id, c.glyph, c.label, () => { S.opened[c.id] = true; openWindow(c.winId); });
  });
  addIcon('future', '🔮', 'the next web', () => openWindow('win-future'));

  /* ---------- the era decides which shortcuts exist, and which are archived ---------- */
  S.syncIcons = function (year) {
    year = Number(year);
    let g = 0;
    const next = () => { if (g === GRID_COLS - 1) g += 1; return g++; };   // skip only the pinned corner slot
    CULTURES.forEach((c) => {
      const el = document.querySelector('.culture-icon[data-cid="' + c.id + '"]');
      const here = year >= c.from;
      el.style.display = here ? '' : 'none';
      if (here) place(el, next());
      const archived = !!(c.fade && year > c.fade);
      el.classList.toggle('archived', archived);
      c.win.classList.toggle('archived', archived);
    });
    const fut = document.querySelector('.culture-icon[data-cid="future"]');
    fut.style.display = year >= 1999 ? '' : 'none';
    place(fut, GRID_COLS - 1);
  };
  S.syncIcons(1991);

  /* ---------- time spent: whichever culture window is on top counts ---------- */
  setInterval(() => {
    if (document.hidden) return;
    const wins = Array.prototype.slice.call(document.querySelectorAll('.window.open')).filter((w) => w.style.display !== 'none');
    if (!wins.length) return;
    const top = wins.reduce((a, b) => ((parseInt(b.style.zIndex, 10) || 0) > (parseInt(a.style.zIndex, 10) || 0) ? b : a));
    const c = CULTURES.find((x) => x.winId === top.id);
    if (!c) return;
    S.opened[c.id] = true;
    S.dwell[c.id] = (S.dwell[c.id] || 0) + 1;
    if (S.dwell[c.id] === 20 && typeof logReceipt === 'function') {
      logReceipt('inferred interest: ' + c.title, 'added to your profile · silent');
    }
  }, 1000);

  /* =====================================================================
     THE NEXT WEB — forecast
  ===================================================================== */
  function lean() {
    const a = S.pop.accepted, c = S.pop.closed;
    return a / (a + c + 1);                       // share of pop-ups answered with "yes"
  }
  function roomBonus(id) {
    const r = S.rooms;
    switch (id) {
      case 'discovery':  return r.asked ? 12 : 0;
      case 'authorship': return Math.min(r.blocks, 3) * 4 + Math.min(r.signed, 2) * 8;
      case 'provenance': return Math.min(r.signed, 2) * 10 + Math.min(r.machineRejected, 2) * 5;
      case 'visibility': return (r.data ? 12 : 0) + (r.letters ? 6 : 0);
      case 'pace':       return Math.min(r.letters, 2) * 8;
      case 'seams':      return Math.min(r.machineRejected, 2) * 8 - Math.min(r.machineAccepted, 2) * 8;
      default:           return 0;
    }
  }
  function compute() {
    const out = {};
    const L = lean();
    AXES.forEach((a) => {
      const cs = CULTURES.filter((c) => c.axis === a.id);
      let obs = 0;
      cs.forEach((c) => {
        const d = S.dwell[c.id] || 0, k = S.acts[c.id] || 0;
        obs = Math.max(obs, Math.min(1, (d / 60) * 0.5 + (k / 4) * 0.5));
      });
      const did = clamp(50 + obs * 35 + roomBonus(a.id) - L * 35);
      const opened = cs.some((c) => S.opened[c.id]);
      const said = axisKept(a.id) ? 100 : opened ? 25 : null;
      out[a.id] = { did: Math.round(did), said, final: said == null ? Math.round(did) : Math.round((did + said) / 2) };
    });
    return out;
  }
  function signalCount() {
    const r = S.rooms;
    const roomTotal = Math.min(8, r.blocks + r.maze + r.letters + r.signed + r.data + r.asked + r.machineAccepted + r.machineRejected);
    const dwellSum = Object.keys(S.dwell).reduce((n, k) => n + S.dwell[k], 0);
    return Object.keys(S.opened).length * 2 + keptCount() * 3 + Math.min(6, Math.floor(dwellSum / 30)) + roomTotal + Math.min(4, S.pop.shown);
  }
  S.compute = compute;
  S.signalCount = signalCount;

  const FC_KEY = 'thirdspace.forecasts';
  function loadAll() { try { return JSON.parse(localStorage.getItem(FC_KEY) || '[]'); } catch (e) { return []; } }
  function saveAll(a) { try { localStorage.setItem(FC_KEY, JSON.stringify(a.slice(-200))); return true; } catch (e) { return false; } }

  const fw = makeWindow('win-future', 'the next web', 560,
    '<div class="kicker">THE NEXT WEB · A FORECAST FROM YOUR RECEIPT</div>' +
    '<h2 class="roomtitle" id="fc-title">the next web</h2>' +
    '<div id="fc-root"></div>');

  function collectiveHTML() {
    const all = loadAll();
    if (!all.length) return '<div class="fc-coll">no forecasts saved on this machine yet.</div>';
    const avg = AXES.map((a) => {
      const v = all.map((f) => (f.final && f.final[a.id] != null ? f.final[a.id] : 50));
      return esc(a.name) + ' <b>' + Math.round(v.reduce((x, y) => x + y, 0) / v.length) + '</b>';
    });
    return '<div class="fc-coll"><b>' + all.length + ' saved on this machine.</b> average setting — ' + avg.join(' · ') + '</div>';
  }

  /* what each setting looks like as a piece of interface: 'off' is the default web, 'on' is the recovered one.
     (the names are the people in the webring, so the next web is populated by people the visitor has met) */
  const PV = {
    discovery:  { on: 'you arrived through <b>vi</b> → <b>ana</b>. two people vouch for this page.', off: 'recommended for you · 98% match · 14,302 views' },
    authorship: { on: '<u>view the making</u> · 6 drafts · the first one was written at 2am', off: 'your profile is 40% complete. pick a template to continue.' },
    provenance: { on: 'signed: <b>a person</b>, with a spell-checker.', off: 'source: unknown. summary: generated.' },
    visibility: { on: 'seen by <b>rufus</b> and <b>dee</b>, who chose to be named. no other analytics.', off: '1,204 impressions · 38 engagements · audience segment 7' },
    pace:       { on: 'your reply is on its way. it will arrive tomorrow.', off: 'delivered · seen 2 min ago · they are typing…' },
    memory:     { on: '3 things tended this month. the rest is allowed to fade.', off: '14,332 items saved · searchable · shared with 41 partners' },
    seams:      { on: 'one line was rewritten by a model. <u>see the first draft</u>.', off: 'everything is working. nothing to see here.' },
  };
  function previewHTML(R, name) {
    const slug = (S.me.handle || 'you').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'you';
    const rows = AXES.map((a) => {
      const on = R[a.id].final >= 60;
      return '<div class="pv-row ' + (on ? 'on' : 'off') + '"><span class="pv-k">' + esc(a.name) + '</span><span class="pv-v">' + PV[a.id][on ? 'on' : 'off'] + '</span></div>';
    }).join('');
    return '<div class="pv"><div class="pv-bar">' + esc(slug) + '.next / home</div><div class="pv-body"><h4 class="pv-h">' +
      esc(name === 'your' ? 'your page' : name + ' page') + '</h4>' + rows + '</div></div>' +
      '<div class="pv-key"><i class="on"></i> recovered &nbsp; <i class="off"></i> the default web</div>';
  }

  function renderForecast() {
    const root = $('#fc-root');
    if (!root) return;
    const R = compute();
    const n = signalCount();
    const conf = Math.min(96, 8 + n * 5);
    const name = S.me.handle ? S.me.handle + '’s' : 'your';
    $('#fc-title').textContent = name + ' next web';

    const accepted = S.pop.accepted, shown = S.pop.shown;
    const keptN = AXES.filter((a) => axisKept(a.id)).length;
    const onN = AXES.filter((a) => R[a.id].final >= 60).length;

    let gap = null;
    AXES.forEach((a) => {
      const r = R[a.id];
      if (r.said == null) return;
      const d = Math.abs(r.said - r.did);
      if (!gap || d > gap.d) gap = { a, d, r };
    });
    let gapText = '';
    if (n < 3) gapText = 'not enough to go on yet. open a few of the places on the right-hand side of the desktop, use the rooms, then come back.';
    else if (gap && gap.d >= 25) {
      gapText = gap.r.said > gap.r.did
        ? 'the biggest gap: on “' + gap.a.name + '” you said <b>' + gap.a.high + '</b>, but your clicks say <b>' + gap.a.low + '</b>.'
        : 'the biggest gap: you passed on <b>' + gap.a.high + '</b> (“' + gap.a.name + '”), but your clicks lean toward it.';
    } else if (keptN) gapText = 'what you said and what you did mostly agree. that is rarer than it sounds.';
    else gapText = 'you kept nothing, so this forecast is only what the receipt infers about you. that is how most systems work.';

    const extras = [];
    if (shown) extras.push('you said yes to ' + accepted + ' of ' + shown + ' pop-ups. a system reads that as a preference for convenience.');
    if (S.flags.preferSmooth) extras.push('you picked the generated comment as the human one.');
    if (S.flags.lookOnly) extras.push('you kept the look of the old web, not the practice.');
    if (S.flags.skipped) extras.push('you let a pop-up answer for you. part of this was generated without asking.');
    if (S.flags.cookie === 'blind') extras.push('you accepted the cookies without opening the list of what they take.');
    if (S.flags.feed === 'recent') extras.push('you switched the feed to most recent. you chose the order yourself.');
    if (S.acts && S.acts.ratings) extras.push('you rated ' + S.acts.ratings + ' room' + (S.acts.ratings > 1 ? 's' : '') + '. a system reads a star as taste, not as the reason you liked it.');
    if (S.flags.askedWhy) extras.push('you asked why the rooms were ranked that way. the answer was your own clicks, and you could not turn it off.');
    if (S.flags.showedAll) extras.push('you opened the full list. most people take the three they are shown.');
    if (S.flags.autoplayed) extras.push('you let the next room queue itself ' + S.flags.autoplayed + ' time' + (S.flags.autoplayed > 1 ? 's' : '') + '. a system reads that as consent.');
    if (S.flags.usedAI) extras.push('you asked the assistant ' + (S.acts.askedAI || 1) + ' time' + ((S.acts.askedAI || 1) > 1 ? 's' : '') + '. an answer arrived before you had read the room.');
    if (S.flags.sharedWrapped) extras.push('you shared your wrapped. what was kept about you became something you gave away.');
    if (S.flags.cookie === 'read') extras.push('you read what the cookies take before answering.');

    const bars = AXES.map((a) => {
      const r = R[a.id];
      return '<div class="fc-row"><div class="fc-name">' + esc(a.name) + '<small>' + esc(a.low) + ' ⟷ ' + esc(a.high) + '</small></div>' +
        '<div class="fc-bars">' +
        '<div class="fc-bar said' + (r.said == null ? ' none' : '') + '"><i style="width:' + (r.said == null ? 0 : r.said) + '%"></i><span>' + (r.said == null ? 'not asked yet' : 'you said') + '</span></div>' +
        '<div class="fc-bar did"><i style="width:' + r.did + '%"></i><span>your clicks</span></div>' +
        '</div></div>';
    }).join('');

    const page = AXES.map((a) => {
      const on = R[a.id].final >= 60, t = ADV[a.id];
      return '<div class="fc-item ' + (on ? 'on' : 'off') + '"><span class="pill">' + (on ? 'recovered' : 'default') + '</span><div><b>' + esc(a.name) + '</b><br>' +
        esc(on ? t.rec : t.def) +
        (on ? '<details><summary>how believable is this? <em>' + t.level + '</em></summary>exists today: ' + esc(t.foothold) + '<br>what would have to change: ' + esc(t.stretch) + '</details>' : '') +
        '</div></div>';
    }).join('');

    const first = S.me.first ? '<div class="fc-first">page one of your next web: “' + esc(S.me.first) + '” — written by you, signed.</div>' : '';

    root.innerHTML =
      '<div class="fc-conf"><b>confidence: ' + conf + '%</b> · ' + n + ' signals · ' + keptN + ' kept · ' + onN + ' of 7 qualities recovered</div>' +
      '<div class="q">a forecast, not a promise. it is built from what you kept (what you said) and from the receipt (what you did).</div>' +
      '<div class="fc-bars-wrap">' + bars + '</div>' +
      '<div class="fc-gap">' + gapText + (extras.length ? '<br>' + extras.map(esc).join(' ') : '') + '</div>' +
      '<h3 class="cmp">a page from your next web</h3>' + first + previewHTML(R, name) +
      '<h3 class="cmp">why each setting, and how believable it is</h3><div class="fc-page">' + page + '</div>' +
      '<div class="fc-actions"><button class="btn-95" id="fc-refresh">refresh</button><button class="btn-95" id="fc-save">add mine to this machine’s collective</button></div>' +
      '<div id="fc-collective">' + collectiveHTML() + '</div>' +
      '<details class="fc-how"><summary>how this is computed</summary>' +
      '<p>"you said" = the places you kept. "your clicks" = time spent and what you did there, plus the receipt: letters sent, work signed, data traded, machine edits accepted, and how often you said yes to pop-ups (which pulls every setting toward the default). the two are averaged. 60 or more counts as recovered.</p>' +
      '<p>the collective only averages forecasts saved in this browser. nothing is sent anywhere.</p>' +
      '<p><button class="btn-95" id="fc-export">export this session (for the researcher)</button> <button class="btn-95" id="fc-clear">clear saved forecasts</button></p></details>';

    $('#fc-refresh').onclick = renderForecast;
    $('#fc-save').onclick = () => {
      const all = loadAll();
      const Rn = compute();
      all.push({ t: Date.now(), final: Object.fromEntries(AXES.map((a) => [a.id, Rn[a.id].final])), said: Object.fromEntries(AXES.map((a) => [a.id, Rn[a.id].said])), did: Object.fromEntries(AXES.map((a) => [a.id, Rn[a.id].did])) });
      const ok = saveAll(all);
      $('#fc-collective').innerHTML = ok ? collectiveHTML() : '<div class="fc-coll">could not save in this browser.</div>';
    };
    $('#fc-export').onclick = () => { if (S.hooks.exportLog) S.hooks.exportLog(); };
    $('#fc-clear').onclick = () => { saveAll([]); $('#fc-collective').innerHTML = collectiveHTML(); };
  }
  S.renderForecast = renderForecast;
  renderForecast();
})();
