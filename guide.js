/* =====================================================================
   guide.js — the guide (mote), the new pop-ups, and the session log.
   Load LAST (after eras.js). It wraps existing functions from the outside;
   script.js and eras.js are not edited.

   What lives here
   ---------------
   1. mote: a small guide in the corner. Per era it says what changed and what
      is missing, asks the visitor to DO one thing, makes them wait a moment,
      then offers the next era. (Midterm feedback: onboarding, tasks, pauses,
      "explain what's missing and why".)
   2. pop-ups: rewritten. Short, tied to the room they land on, and they change
      in *form* by era (ad -> offer -> "suggested" -> prediction) instead of
      repeating the same sentence. Edit the words in POP below.
   3. a session log, exportable as JSON, so user testing can separate what
      people SAID (the notes they type, what they keep) from what they DID.
===================================================================== */
(function () {
  'use strict';
  const S = window.ThirdSpaceNext;
  if (!S) { console.warn('guide.js: cultures.js did not load'); return; }

  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const yearOf = (k) => parseInt(k, 10);
  const trackingOn = () => yearOf(currentEra) >= 1999;     // currentEra: global in script.js

  /* =====================================================================
     SESSION LOG
  ===================================================================== */
  const T0 = Date.now();
  const LOG = [];
  function rec(type, data) {
    LOG.push(Object.assign({ t: Math.round((Date.now() - T0) / 1000), era: currentEra, type: type }, data || {}));
  }
  S.hooks.exportLog = function () {
    const payload = {
      exported: new Date().toISOString(),
      seconds: Math.round((Date.now() - T0) / 1000),
      note: 'recorded locally in this tab. nothing was sent anywhere. intake answers (name, first memory) are not included.',
      events: LOG,
      summary: {
        backgroundClicks: Trace.totalClicks, itemizedEntries: Trace.entries.length,
        rooms: S.rooms, pop: S.pop, kept: S.keptBy, dwellSeconds: S.dwell, acts: S.acts, flags: S.flags,
      },
      forecast: S.compute(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'thirdspace-session-' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.json';
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  S.hooks.onKeep = (id, on) => { rec(on ? 'keep' : 'unkeep', { culture: id }); };
  S.hooks.onAct = (id, name) => { rec('culture_act', { culture: id, act: name }); };

  /* small wrapper: run the original, then our code */
  function hook(name, after) {
    const orig = window[name];
    if (typeof orig !== 'function') return;
    window[name] = function () {
      const r = orig.apply(this, arguments);
      try { after.apply(this, arguments); } catch (e) { console.warn('guide hook', name, e); }
      return r;
    };
  }

  /* =====================================================================
     POP-UP COPY  — edit freely. {c} is replaced by the culture's name.
     Three tiers: early (1999-2004: plain ads), mid (2010: accounts and
     social), late (2016-2024: prediction). Each is { t: title, b: one line,
     a: button, fx: optional effect }. Keep bodies to one short line.
  ===================================================================== */
  const POP = {
    'win-home': {
      early: { t: 'visitor #004,813!', b: 'you are our lucky visitor.', a: 'claim' },
      mid:   { t: 'welcome back', b: 'we saved your place.', a: 'continue' },
      late:  { t: 'pick up where you left off', b: 'we know where that is.', a: 'resume' },
    },
    'win-data': {
      early: { t: 'a free week planner', b: 'for your desktop. no strings.', a: 'get it' },
      mid:   { t: 'see friends’ weeks', b: 'no need to share yours.', a: 'show me' },
      late:  { t: 'we filled in your week', b: 'from your phone. look right?', a: 'accept', fx: 'autofillWeek' },
    },
    'win-mail': {
      early: { t: 'get your own @ address', b: 'faster mail. free.', a: 'sign up' },
      mid:   { t: 'seen · 2 minutes ago', b: 'they read it. no reply yet.', a: 'nudge them' },
      late:  { t: 'stuck on the first line?', b: 'we can start it for you.', a: 'start it', fx: 'draftStart' },
    },
    'win-gallery': {
      early: { t: 'show your work to the world', b: 'submit to 40 directories.', a: 'submit' },
      mid:   { t: 'your piece got 3 likes', b: 'see who liked it.', a: 'see' },
      late:  { t: 'this could earn', b: 'add a price. we take 20%.', a: 'add price' },
    },
    'win-receipt': {
      early: { t: 'privacy policy updated', b: 'nothing to do. it’s fine.', a: 'ok' },
      mid:   { t: 'we updated our terms', b: 'by staying, you agree.', a: 'i agree' },
      late:  { t: 'want the full receipt?', b: 'premium members see all of it.', a: 'upgrade' },
    },
    'win-personal': {
      early: { t: 'add a hit counter', b: 'so you know you’re popular.', a: 'add it' },
      mid:   { t: 'profile 40% complete', b: 'pick a category to continue.', a: 'pick one' },
      late:  { t: 'we wrote your bio', b: 'based on your clicks.', a: 'use it' },
    },
    'win-maze': {
      early: { t: 'lost? try our directory', b: 'someone already found it.', a: 'go' },
      mid:   { t: 'top result', b: 'most people stop here.', a: 'stop here' },
      late:  { t: 'skip the searching', b: 'we already know what you want.', a: 'skip' },
    },
    'win-whoknows': {
      early: { t: 'ask a real expert', b: '$1.99 per question.', a: 'ask' },
      mid:   { t: 'people also asked', b: 'you won’t need to ask anyone.', a: 'show' },
      late:  { t: 'ask the assistant instead', b: 'it never says “i don’t know.”', a: 'ask it' },
    },
    'win-machine': {
      early: { t: 'type faster', b: 'free typing tutor.', a: 'download' },
      mid:   { t: 'smart replies', b: 'three taps. no typing.', a: 'turn on' },
      late:  { t: 'unlimited rewrites', b: 'they’ll never see the first draft.', a: 'upgrade' },
    },
    'win-social': {
      early: { t: 'make a friends list', b: 'rank your top 8.', a: 'rank' },
      mid:   { t: 'you and sam', b: 'closeness score: 71.', a: 'raise it' },
      late:  { t: 'your closest friend is…', b: 'we measured. want to see?', a: 'show me' },
    },
    'win-future': {
      early: { t: 'what’s next?', b: 'nobody knows yet.', a: 'ok' },
      mid:   { t: 'what’s next?', b: 'nobody knows yet.', a: 'ok' },
      late:  { t: 'skip ahead', b: 'we already know your future.', a: 'show it', fx: 'skipAhead' },
    },
    culture: {
      early: { t: 'more sites like this', b: '25 more. one click each.', a: 'browse' },
      mid:   { t: 'follow {c}', b: 'so you never miss a thing.', a: 'follow' },
      late:  { t: 'because you looked at {c}', b: 'people like you are here.', a: 'join them', fx: 'interest' },
    },
    desktop: {
      early: { t: 'free screensaver', b: 'rotates your photos.', a: 'get it' },
      mid:   { t: 'new: share this site', b: 'tell 3 friends.', a: 'share' },
      late:  { t: 'you’ve been here a while', b: 'want us to pick for you?', a: 'pick for me' },
    },
  };
  const TAGS = { '1999': 'AD', '2004': 'ad', '2010': 'offer', '2016': 'suggested', '2024': 'for you' };
  const tierOf = (y) => (y >= 2016 ? 'late' : y >= 2010 ? 'mid' : 'early');
  // chance that opening a room is followed, a few seconds later, by a pop-up about that room
  const CONTEXT_CHANCE = { 1999: 0.15, 2004: 0.3, 2010: 0.5, 2016: 0.75, 2024: 0.95 };

  /* =====================================================================
     POP-UPS
  ===================================================================== */
  const G = { era: null, stage: 'idle', modal: false, min: false, intake: false, task: {}, seen: {}, timer: null, lastAct: Date.now() };
  const lastPick = {};
  let memoryUsed = false;

  function topWindow() {
    const ws = Array.prototype.slice.call(document.querySelectorAll('.window.open')).filter((w) => w.style.display !== 'none');
    if (!ws.length) return null;
    return ws.reduce((a, b) => ((parseInt(b.style.zIndex, 10) || 0) > (parseInt(a.style.zIndex, 10) || 0) ? b : a));
  }
  function chromeBottom() { return document.getElementById('eraBar').offsetHeight + document.getElementById('eraNote').offsetHeight; }
  function splashShowing() { const s = document.getElementById('era1999'); return !!(s && s.classList.contains('show')); }

  const FX = {
    autofillWeek() {
      if (Trace.dataMailed) return;
      const cells = Array.prototype.slice.call(document.querySelectorAll('#myGrid .datacell'));
      const pick = cells.filter((c) => !/lvl/.test(c.className)).sort(() => Math.random() - 0.5).slice(0, 6);
      pick.forEach((c) => c.click());
      logReceipt('your week was filled in for you', pick.length + ' cells · predicted, not yours');
    },
    draftStart() {
      const t = document.getElementById('mailText');
      if (!t || t.value.trim()) return;
      t.value = 'hope you’re doing well! just wanted to say hi.';
      t.dispatchEvent(new Event('input', { bubbles: true }));
      logReceipt('your message was started for you', 'predicted text · not yours');
    },
    skipAhead() { S.flags.skipped = true; rec('skip_ahead'); },
    interest(c) { logReceipt('followed ' + c, 'interest confirmed · used for targeting'); },
    memory() { logReceipt('your first memory was used to target you', 'silent · not itemized above'); },
  };

  function pickCopy(key, tier) {
    const set = (POP[key] || POP.desktop)[tier];
    return set;
  }

  window.spawnPopup = function (targetId) {
    const year = yearOf(currentEra);
    if (year < 1999 || G.modal || splashShowing()) return;
    const layer = document.getElementById('popupLayer');
    const cap = year >= 2016 ? 5 : 3;
    if (!layer || layer.children.length >= cap) return;

    const target = typeof targetId === 'string' ? document.getElementById(targetId) : topWindow();
    const live = target && target.classList.contains('open') && target.style.display !== 'none' ? target : null;
    const tier = tierOf(year);
    let key = 'desktop', cname = '';
    if (live) {
      const c = S.cultures.find((x) => x.winId === live.id);
      if (c) { key = 'culture'; cname = c.title; } else key = POP[live.id] ? live.id : 'desktop';
    }
    // never say the same sentence twice in a row within an era: try this room's line, then the generic one,
    // and if both were just used, stay quiet (silence is part of the pacing)
    let copy = null;
    [key, 'desktop'].some((k) => {
      const cand = pickCopy(k, tier);
      if (lastPick[k] === cand.t) return false;
      copy = cand; lastPick[k] = cand.t; if (k !== key) { key = 'desktop'; cname = ''; }
      return true;
    });
    if (!copy) return;
    // late tiers occasionally use what you told mote at the start
    if (tier === 'late' && S.me.first && !memoryUsed && Math.random() < 0.35) {
      memoryUsed = true;
      copy = { t: 'remember “' + S.me.first.slice(0, 28) + '”?', b: 'people like you still go there.', a: 'relive it', fx: 'memory' };
    }
    const t = copy.t.replace('{c}', cname), b = copy.b.replace('{c}', cname);

    const div = document.createElement('div');
    div.className = 'popup-ad pp-' + tier + (year === 2016 ? ' pp-tiny' : '') + (year === 2024 ? ' pp-wait' : '');
    const tag = TAGS[currentEra] || 'ad';
    div.innerHTML =
      '<div class="popup-head"><span>' + esc(tag) + '</span><button class="popup-x" title="close">×</button></div>' +
      '<div class="popup-body"><b>' + esc(t) + '</b><p>' + esc(b) + '</p><button class="popup-accept">' + esc(copy.a) + '</button></div>';

    const minTop = chromeBottom() + 10;
    let left, top;
    if (live) {
      const r = live.getBoundingClientRect();
      left = r.left + r.width * (0.2 + Math.random() * 0.5) - 120;
      top = r.top + 50 + Math.random() * Math.max(40, r.height * 0.45);
    } else {
      left = 20 + Math.random() * Math.max(0, window.innerWidth - 330);
      top = minTop + Math.random() * Math.max(0, window.innerHeight - minTop - 260);
    }
    div.style.left = Math.max(8, Math.min(left, window.innerWidth - 310)) + 'px';
    div.style.top = Math.max(minTop, Math.min(top, window.innerHeight - 220)) + 'px';

    const shownAt = Date.now();
    const x = div.querySelector('.popup-x');
    const finish = (accepted) => {
      const lat = Date.now() - shownAt;
      div.remove();
      Trace.popupsClosed += 1;
      if (accepted) {
        Trace.fieldsFilled += 1; S.pop.accepted += 1;
        logReceipt('accepted: “' + t + '”', '+4 profile data');
        if (copy.fx && FX[copy.fx]) FX[copy.fx](cname);
      } else {
        S.pop.closed += 1;
        logReceipt('closed: “' + t + '”', '+1 engagement signal');
      }
      rec(accepted ? 'popup_accept' : 'popup_close', { over: key, text: t, ms: lat });
    };
    x.onclick = () => { if (!x.disabled) finish(false); };
    div.querySelector('.popup-accept').onclick = () => finish(true);

    if (year === 2024) {            // the close button makes you wait
      let n = 3;
      x.disabled = true; x.textContent = String(n);
      const iv = setInterval(() => {
        n -= 1;
        if (!div.isConnected) { clearInterval(iv); return; }
        if (n <= 0) { clearInterval(iv); x.disabled = false; x.textContent = '×'; } else x.textContent = String(n);
      }, 1000);
    }

    layer.appendChild(div);
    Trace.popupsSeen += 1; S.pop.shown += 1;
    logReceipt('a pop-up was shown to you', 'silent · not itemized above');
    rec('popup_show', { over: key, text: t });
  };

  /* =====================================================================
     COOKIE PROMPT (midterm feedback: "cookie prompts that make data collection visible")
     2016: a polite bar, "OK" is big, the list of what it takes is one click away.
     2024: "accept all" is big, there is no "reject", "manage" is a small link.
     What the visitor does with it is recorded (S.flags.cookie) and shows up in the forecast.
     Edit the wording in COOKIE below.
  ===================================================================== */
  const COOKIE = {
    '2016': { head: 'we use cookies.', body: 'to make things better for you.', ok: 'ok', more: 'what for?' },
    '2024': { head: 'your privacy matters to us.', body: 'we and 212 partners store and access information on your device.', ok: 'accept all', more: 'manage preferences' },
  };
  const COOKIE_TAKES = ['every click, with a timestamp', 'how long you stayed, and where', 'what you hovered over and left', 'what you closed, and how fast', 'what you wrote and then deleted'];
  const cookieEl = document.createElement('div');
  cookieEl.id = 'cookieBar';
  cookieEl.hidden = true;
  document.body.appendChild(cookieEl);
  const cookieSeen = {};
  function cookies(key) {
    cookieEl.hidden = true;
    const c = COOKIE[key];
    if (!c || cookieSeen[key]) return;
    let read = false;
    cookieEl.className = 'ck-' + key;
    cookieEl.innerHTML =
      '<div class="ck-txt"><b>' + esc(c.head) + '</b> ' + esc(c.body) + '</div>' +
      '<ul class="ck-list" hidden>' + COOKIE_TAKES.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
      '<div class="ck-acts"><button class="ck-ok">' + esc(c.ok) + '</button><a href="#" class="ck-more">' + esc(c.more) + '</a></div>';
    $('.ck-more', cookieEl).onclick = (e) => {
      e.preventDefault();
      read = true;
      $('.ck-list', cookieEl).hidden = false;
      logReceipt('opened the cookie list', 'noted · ' + (key === '2024' ? 'took 4 clicks' : 'took 1 click'));
      rec('cookie_more', { key });
    };
    $('.ck-ok', cookieEl).onclick = () => {
      S.flags.cookie = read ? 'read' : 'blind';
      cookieEl.hidden = true;
      logReceipt('accepted cookies', read ? 'after reading the list' : 'without reading the list · +' + COOKIE_TAKES.length + ' data points');
      rec('cookie_ok', { key, read });
    };
    setTimeout(() => {                       // only counts as "seen" once it is actually on screen
      if (G.era === key && !G.modal && !cookieSeen[key]) { cookieSeen[key] = true; cookieEl.hidden = false; }
    }, 1800);
  }

  /* =====================================================================
     MOTE — the guide
  ===================================================================== */
  const SPRITE =
    '<svg class="mote-svg" viewBox="0 0 16 16" width="46" height="46" shape-rendering="crispEdges" aria-hidden="true">' +
    '<rect x="6" y="0" width="4" height="2" fill="#cc0000"/><rect x="7" y="2" width="2" height="2" fill="#1b1b3a"/>' +
    '<rect x="3" y="4" width="10" height="1" fill="#1b1b3a"/><rect x="3" y="13" width="10" height="1" fill="#1b1b3a"/>' +
    '<rect x="2" y="5" width="1" height="8" fill="#1b1b3a"/><rect x="13" y="5" width="1" height="8" fill="#1b1b3a"/>' +
    '<rect x="3" y="5" width="10" height="8" fill="#efe6c8"/>' +
    '<rect class="eyew" x="4" y="7" width="3" height="3" fill="#fff"/><rect class="eyew" x="9" y="7" width="3" height="3" fill="#fff"/>' +
    '<g class="pupils"><rect x="5" y="8" width="1" height="1" fill="#1b1b3a"/><rect x="10" y="8" width="1" height="1" fill="#1b1b3a"/></g>' +
    '<rect x="7" y="11" width="2" height="1" fill="#1b1b3a"/>' +
    '<rect x="3" y="10" width="1" height="1" fill="#f0a0b8"/><rect x="12" y="10" width="1" height="1" fill="#f0a0b8"/>' +
    '<rect x="4" y="14" width="2" height="1" fill="#1b1b3a"/><rect x="10" y="14" width="2" height="1" fill="#1b1b3a"/></svg>';

  const guideEl = document.createElement('div');
  guideEl.id = 'guide';
  guideEl.innerHTML =
    '<div id="guideBox"><div class="g-head"><span>mote <i>· your guide</i></span><button class="g-min" title="minimize">–</button></div>' +
    '<div class="g-body"></div><div class="g-acts"></div></div>' +
    '<button id="guideMote" aria-label="ask mote" data-watch="0">' + SPRITE + '<span class="g-ping">!</span></button>';
  document.body.appendChild(guideEl);
  const boxEl = $('#guideBox'), bodyEl = $('.g-body', guideEl), actsEl = $('.g-acts', guideEl), moteEl = $('#guideMote');

  $('.g-min', guideEl).onclick = () => { G.min = true; layoutGuide(); };
  moteEl.onclick = () => { G.min = !G.min; moteEl.classList.remove('ping'); layoutGuide(); };
  function layoutGuide() { guideEl.classList.toggle('min', G.min); }

  // eyes: half-lidded before tracking existed, following the cursor after
  document.addEventListener('mousemove', (e) => {
    G.lastAct = Date.now();
    moteEl.dataset.watch = trackingOn() ? '1' : '0';
    if (!trackingOn()) { moteEl.style.setProperty('--px', 0); moteEl.style.setProperty('--py', 0); return; }
    const r = moteEl.getBoundingClientRect();
    const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    moteEl.style.setProperty('--px', Math.abs(dx) < 40 ? 0 : dx > 0 ? 1 : -1);
    moteEl.style.setProperty('--py', Math.abs(dy) < 40 ? 0 : dy > 0 ? 1 : -1);
  });
  document.addEventListener('pointerdown', () => { G.lastAct = Date.now(); });

  const BEATS = {
    '1993': {
      say: 'this is a browser, 1993. anyone can read this. no one is counting.',
      miss: 'nothing yet. no ads, no accounts, no tracking. nothing here wants anything from you.',
      task: { key: 'block', room: 'win-personal', label: 'your place', text: 'build a small page about yourself. add two blocks.' },
    },
    '1996': {
      say: '1996. people are building their own pages. nobody is moderating them.',
      miss: 'someone deciding what you see next. here you still have to go looking.',
      task: { key: 'maze', room: 'win-maze', label: 'find it', text: 'find the lighthouse story. take as long as you like.' },
    },
    '1999': {
      say: '1999. the portals arrive, and this site starts counting you.',
      miss: 'being unobserved. from here on, every click is a number.',
      task: { key: 'letter', room: 'win-mail', label: 'correspondence', text: 'write someone a letter. it will make you wait.' },
    },
    '2004': {
      say: '2004. platforms remember you between visits. the pop-ups still ask politely.',
      miss: 'not much, yet. everything is still easy to close. remember how that feels.',
      task: { key: 'signed', room: 'win-gallery', label: 'signed-work', text: 'sign something you made.' },
    },
    '2010': {
      say: '2010. accounts, feeds, terms nobody reads.',
      miss: 'the data room stops telling you what looking costs. notice what it asks of you now.',
      task: { key: 'data', room: 'win-data', label: 'the data room', text: 'mail a week of your data, then look at what comes back.' },
    },
    '2016': {
      say: '2016. ranking replaces browsing.',
      miss: 'the other ways to search. “find it” locks to one mode. “who knows” loses its hints.',
      task: { key: 'machine', room: 'win-machine', label: 'the machine between us', text: 'send someone a message. let the machine help.' },
    },
    '2024': {
      say: '2024. every interaction is a data point. even the slow parts.',
      miss: 'the slow line in the correspondence room. the “maybe” in who knows. the “not for sale” on your work.',
      task: { key: 'forecast', room: 'win-future', label: 'the next web', text: 'open the next web. see what your receipt predicts.' },
    },
  };
  const SIT_MS = 6000;

  function btn(label, fn, cls) {
    const b = document.createElement('button');
    b.className = 'btn-95 ' + (cls || '');
    b.textContent = label;
    b.onclick = fn;
    actsEl.appendChild(b);
    return b;
  }
  function nextEraKey() {
    const i = ERAS.findIndex((e) => e.key === currentEra);
    return ERAS[i + 1] ? ERAS[i + 1].key : null;
  }
  function newPlaces(key) {
    const i = ERAS.findIndex((e) => e.key === key);
    const prev = i > 0 ? yearOf(ERAS[i - 1].key) : 0, y = yearOf(key);
    const names = S.cultures.filter((c) => c.from > prev && c.from <= y).map((c) => c.label);
    if (y >= 1999 && prev < 1999) names.push('the next web');
    return names;
  }
  function wake() { if (G.min) { moteEl.classList.add('ping'); } }

  function renderGuide() {
    clearInterval(G.timer);
    actsEl.innerHTML = '';
    const era = G.era, beat = BEATS[era];
    if (G.stage === 'hidden' || !beat && G.stage !== 'intake') { guideEl.classList.add('gone'); return; }
    guideEl.classList.remove('gone');

    if (G.stage === 'intake') {
      bodyEl.innerHTML =
        '<p class="g-say">hi. i’m mote. i live in the margin of this site.</p>' +
        '<label class="g-lab">what should i call you?<input id="gName" maxlength="18" placeholder="a name or a handle"></label>' +
        '<label class="g-lab">what’s the first thing you remember doing online?<input id="gFirst" maxlength="80" placeholder="a game, a site, a chat room…"></label>' +
        '<p class="g-small">this stays in this tab. what the project does with it later is part of the project.</p>';
      btn('start', () => finishIntake(true));
      btn('skip', () => finishIntake(false), 'quiet');
      return;
    }

    if (G.stage === 'intro') {
      bodyEl.innerHTML = '<p class="g-say">' + esc(beat.say) + '</p><p class="g-miss"><b>what’s missing:</b> ' + esc(beat.miss) + '</p>';
      btn('got it', () => { G.stage = 'task'; rec('guide_intro_ack'); renderGuide(); });
      return;
    }

    const t = beat.task;
    if (G.stage === 'task') {
      bodyEl.innerHTML = '<p class="g-task"><span class="g-box">☐</span> ' + esc(t.text) + '</p><p class="g-small">in this era, not some other one. what’s different here is the point.</p>';
      btn('open ' + t.label, () => openWindow(t.room));
      btn('skip', () => { rec('task_skip', { task: t.key }); G.task[era] = 'skipped'; G.stage = 'sit'; renderGuide(); }, 'quiet');
      return;
    }

    if (G.stage === 'sit') {
      const nxt = nextEraKey();
      const fresh = newPlaces(era);
      const last = !nxt;
      bodyEl.innerHTML =
        '<p class="g-task"><span class="g-box">' + (G.task[era] === 'skipped' ? '☐' : '☑') + '</span> ' + (last ? 'this is what your receipt predicted.' : 'done. now stay a moment.') + '</p>' +
        '<p class="g-say">' + (last ? 'what would you keep? what did your clicks keep for you?' : 'what’s different from the era before?') + '</p>' +
        (fresh.length ? '<p class="g-small">new on the desktop: ' + esc(fresh.join(', ')) + '.</p>' : '') +
        '<input id="gSaid" class="g-said" maxlength="140" placeholder="what did you notice? (optional)">' +
        '<div class="g-wait"><i></i></div>';
      const fill = $('.g-wait i', bodyEl);
      const go = btn(last ? 'open the receipt' : 'next era →', () => {
        const said = ($('#gSaid') || {}).value || '';
        if (said.trim()) rec('said', { text: said.trim() });
        rec('guide_next');
        if (last) openWindow('win-receipt'); else setEra(nxt);
      }, 'primary');
      go.disabled = true;
      btn('stay here', () => { G.min = true; layoutGuide(); }, 'quiet');
      const t0 = Date.now();
      G.timer = setInterval(() => {
        const p = Math.min(1, (Date.now() - t0) / SIT_MS);
        if (fill) fill.style.width = (p * 100) + '%';
        if (p >= 1) { clearInterval(G.timer); go.disabled = false; }
      }, 100);
      return;
    }

    // recap: visiting an era you've already been told about
    bodyEl.innerHTML = '<p class="g-say">' + esc(beat.say) + '</p><p class="g-miss"><b>what’s missing:</b> ' + esc(beat.miss) + '</p>' +
      '<p class="g-task"><span class="g-box">' + (G.task[era] ? '☑' : '☐') + '</span> ' + esc(t.text) + '</p>';
    btn('open ' + t.label, () => openWindow(t.room));
    const nxt = nextEraKey();
    if (nxt) btn('next era →', () => setEra(nxt), 'quiet');
  }

  function finishIntake(save) {
    if (save) {
      S.me.handle = (($('#gName') || {}).value || '').trim();
      S.me.first = (($('#gFirst') || {}).value || '').trim();
    }
    rec('intake', { name: !!S.me.handle, memory: !!S.me.first, skipped: !save });
    G.intake = true; G.modal = false;
    enterEra(currentEra, true);
    cookies(currentEra);
  }

  function enterEra(key, afterIntake) {
    G.era = key;
    clearInterval(G.timer);
    if (key === '1991') { G.stage = 'hidden'; renderGuide(); return; }
    if (!G.intake) { G.stage = 'intake'; G.modal = true; G.min = false; layoutGuide(); renderGuide(); return; }
    const go = () => {
      if (G.era !== key) return;
      if (!G.seen[key]) { G.seen[key] = true; G.stage = 'intro'; }
      else G.stage = 'recap';
      if (afterIntake) G.min = false;
      renderGuide(); wake();
    };
    // 1999 has a splash screen: wait until the visitor is in
    const wait = () => { if (splashShowing()) setTimeout(wait, 400); else setTimeout(go, 700); };
    wait();
  }

  // a room told us the visitor did the task in the era they're in
  function signal(k) {
    const beat = BEATS[G.era];
    rec('room_done', { task: k });
    if (!beat || G.stage !== 'task' || beat.task.key !== k) return;
    G.task[G.era] = 'done';
    rec('task_done', { task: k });
    G.stage = 'sit'; renderGuide(); wake();
  }

  /* =====================================================================
     HOOKS into the existing rooms (functions are global, so we can wrap them)
  ===================================================================== */
  hook('addBlock', () => { S.rooms.blocks = Object.keys(blocks).length; if (S.rooms.blocks >= 2) signal('block'); });
  hook('found', (match) => { if (match === true) { S.rooms.maze += 1; signal('maze'); } });
  hook('sendMail', () => { if (Trace.lettersSentCount > S.rooms.letters) { S.rooms.letters = Trace.lettersSentCount; signal('letter'); } });
  hook('signWork', () => { if (Trace.worksSignedCount > S.rooms.signed) { S.rooms.signed = Trace.worksSignedCount; signal('signed'); } });
  hook('mailData', () => { if (Trace.dataMailed && !S.rooms.data) { S.rooms.data = 1; signal('data'); } });
  hook('ask', () => { S.rooms.asked += 1; });
  hook('sendFinal', (text, kind) => {
    if (kind === 'accepted') S.rooms.machineAccepted += 1;
    if (kind === 'rejected') S.rooms.machineRejected += 1;
    signal('machine');
  });

  hook('openWindow', (id) => {
    rec('open', { id });
    const c = S.cultures.find((x) => x.winId === id);
    if (c) S.opened[c.id] = true;
    if (id === 'win-future') { S.renderForecast(); signal('forecast'); }
    const p = CONTEXT_CHANCE[yearOf(currentEra)];
    if (p && Math.random() < p) {
      setTimeout(() => {
        const w = document.getElementById(id);
        if (w && w.classList.contains('open') && w.style.display !== 'none') window.spawnPopup(id);
      }, 2500);
    }
  });
  hook('closeWindow', (id) => rec('close', { id }));

  hook('setEra', (key) => {
    Object.keys(lastPick).forEach((k) => delete lastPick[k]);
    cookies(key);
    rec('era', { to: key });
    S.syncIcons(yearOf(key));
    moteEl.dataset.watch = trackingOn() ? '1' : '0';
    document.body.classList.toggle('tracking-on', trackingOn());
    enterEra(key);
  });

  // nudge: if the box is minimized and the visitor has been idle with a task open
  setInterval(() => {
    if (G.stage === 'task' && G.min && Date.now() - G.lastAct > 45000) moteEl.classList.add('ping');
  }, 5000);

  /* boot: eras.js already ran setEra('1991') before we loaded */
  S.syncIcons(yearOf(currentEra));
  enterEra(currentEra);
  window.ThirdSpaceGuide = { G, signal, rec, log: LOG };
})();
