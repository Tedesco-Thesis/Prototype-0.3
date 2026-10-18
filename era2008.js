/* =====================================================================
   era2008.js — 2008–09, "foundations of web 3.0". Load AFTER era2006.js, BEFORE guide.js.
   (index.html: script.js, cultures.js, eras.js, era2006.js, era2004.js, era2008.js, guide.js)

   The era's argument: the page stops waiting to be visited. A news feed ranks what you see,
   ratings feed a recommender, "follow" turns people into a stream. The web starts reading you
   back. It is also the last era where you can still choose the plain version (most recent).

   Adds, additively:
     - the era (after 2005-07) + its button
     - per-window chrome: browser toolbar, a "news feed" with Top stories / Most recent
     - per-window footer: star rating + "recommended for you", follow, footer links
     - receipt lines + shared-state flags the forecast reads (feed choice, ratings)
     - guide beat, pop-up copy tier ("feed"), tag, odds (via window.__era2008)
===================================================================== */
(function () {
  const KEY = '2008';
  const S = window.ThirdSpaceNext;

  /* ---------- 1. timeline ---------- */
  const at = ERAS.findIndex((e) => e.key === '2006');
  ERAS.splice(at + 1, 0, {
    key: KEY, label: '2008–09', name: 'foundations of web 3.0',
    note: 'the page stops waiting to be visited. a news feed ranks what you see, ratings feed a recommender, “follow” turns people into a stream, and browsers compete on speed. the web begins to read you back — you can still choose “most recent”, for now.',
  });
  eraPopupInterval[KEY] = 26000;

  const bar = document.getElementById('eraBar');
  const prev = bar.querySelector('.era-btn[data-era="2006"]') || bar.querySelector('.era-btn[data-era="2004"]');
  const btn = document.createElement('button');
  btn.className = 'era-btn'; btn.dataset.era = KEY; btn.textContent = '2008–09';
  btn.onclick = () => setEra(KEY);
  (prev ? prev.after(btn) : bar.appendChild(btn));

  /* ---------- 2. state ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const ids = Object.keys(windowTitles);
  const st = { order: 'top', rating: {}, follow: {} };
  if (S) { S.flags = S.flags || {}; S.acts = S.acts || {}; }

  const ago = (i) => (i === 0 ? 'just now' : i * 3 + ' min ago');
  function feedItems() {
    const log = (typeof Trace !== 'undefined' ? Trace.entries : []).filter((e) => !/viewed the web/.test(e.label)).slice(-3).reverse();
    const items = log.map((e, i) => ({ who: 'you', text: e.label, when: ago(i) }));
    if (!items.length) items.push({ who: 'you', text: 'joined third space', when: 'just now' });
    if (st.order === 'top') {
      // "top stories": the same items, plus one the feed decided you should see, ahead of your own
      items.unshift({ who: 'suggested', text: 'a friend of a friend rated this room 5★', when: 'top story', hot: true });
      return items.slice(0, 3);
    }
    return items.slice(0, 3);
  }
  function nextRoom(id) { const i = ids.indexOf(id); return windowTitles[ids[(i + 1) % ids.length]]; }

  /* ---------- 3. per-window chrome (hidden unless body.era-2008) ---------- */
  ids.forEach((id) => {
    const w = document.getElementById(id);
    if (!w || w.querySelector('.fd-chrome')) return;
    const title = windowTitles[id] || id;

    const chrome = document.createElement('div');
    chrome.className = 'fd-chrome';
    chrome.innerHTML =
      '<div class="fd-bar"><span class="fd-nav"><i>◀</i><i>▶</i><i>↻</i></span>' +
      '<span class="fd-addr">http://thirdspace.net/' + esc(title.replace(/\s+/g, '-')) + '<b>☆</b></span>' +
      '<span class="fd-find">search</span></div>' +
      '<div class="fd-feedhead"><b>news feed</b><span><a class="fd-top on">top stories</a> · <a class="fd-rec">most recent</a></span></div>' +
      '<ul class="fd-feed"></ul>';
    w.querySelector('.titlebar').after(chrome);

    const foot = document.createElement('div');
    foot.className = 'fd-foot';
    foot.innerHTML =
      '<div class="fd-row"><span class="fd-rate">rate this room: ' +
      [1, 2, 3, 4, 5].map((n) => '<a data-n="' + n + '">★</a>').join('') +
      '</span><button class="fd-follow">+ follow</button></div>' +
      '<div class="fd-recs"></div>' +
      '<div class="fd-links"><a>about</a> <a>advertising</a> <a>developers</a> <a>careers</a> <a>terms</a> <a>privacy</a> · © 2008 third space</div>';
    w.appendChild(foot);

    foot.querySelectorAll('.fd-rate a').forEach((a) => {
      a.onclick = () => {
        const n = +a.dataset.n; st.rating[id] = n;
        logReceipt('rated ' + title + ' ' + n + '★', 'used to decide what you see next');
        if (S) { S.acts.ratings = Object.keys(st.rating).length; }
        const g = window.ThirdSpaceGuide; if (g && g.signal) g.signal('rate');
        paint();
      };
    });
    foot.querySelector('.fd-follow').onclick = () => {
      st.follow[id] = !st.follow[id];
      if (st.follow[id]) logReceipt('followed ' + title, 'their updates now come to you');
      paint();
    };
    chrome.querySelector('.fd-top').onclick = () => setOrder('top');
    chrome.querySelector('.fd-rec').onclick = () => setOrder('recent');
  });

  function setOrder(o) {
    if (st.order === o) return;
    st.order = o;
    if (S) S.flags.feed = o === 'recent' ? 'recent' : 'top';
    logReceipt('feed set to ' + (o === 'recent' ? 'most recent' : 'top stories'), o === 'recent' ? 'you picked the order' : 'the order is picked for you');
    paint();
  }

  function paint() {
    const items = feedItems();
    ids.forEach((id) => {
      const w = document.getElementById(id); if (!w) return;
      const ul = w.querySelector('.fd-feed'); if (!ul) return;
      ul.innerHTML = items.map((it) => '<li class="' + (it.hot ? 'hot' : '') + '"><span class="fd-av">' + (it.who === 'you' ? '☺' : '★') + '</span><span>' + esc(it.text) + '<em>' + esc(it.when) + '</em></span></li>').join('');
      w.querySelector('.fd-top').classList.toggle('on', st.order === 'top');
      w.querySelector('.fd-rec').classList.toggle('on', st.order === 'recent');
      const r = st.rating[id] || 0;
      w.querySelectorAll('.fd-rate a').forEach((a) => a.classList.toggle('on', +a.dataset.n <= r));
      const f = w.querySelector('.fd-follow'); f.textContent = st.follow[id] ? '✓ following' : '+ follow';
      f.classList.toggle('on', !!st.follow[id]);
      w.querySelector('.fd-recs').innerHTML = r
        ? 'because you rated this ' + r + '★, <b>' + esc(nextRoom(id)) + '</b> is recommended for you.'
        : '<span class="fd-dim">rate this room and we’ll recommend the next one.</span>';
    });
  }
  document.addEventListener('click', () => setTimeout(paint, 0));
  paint();

  /* ---------- 4. guide + pop-ups (read by guide.js) ---------- */
  window.__era2008 = {
    key: KEY,
    beat: {
      say: '2008–09. the feed arrives, and ratings start steering what you see next.',
      miss: 'seeing only what you went looking for. from here, something else chooses the order.',
      task: { key: 'rate', room: 'win-home', label: 'rate something', text: 'rate a room. five stars is easy to give. watch what the page does with it.' },
    },
    tag: 'for you', chance: 0.45, tier: 'feed',
    copy: {
      desktop:        { t: 'people you may know', b: '3 mutual friends.', a: 'add' },
      'win-home':     { t: 'top stories for you', b: 'we picked 3 from your week.', a: 'see them' },
      'win-data':     { t: 'because you viewed this', b: 'you might also like our data.', a: 'view' },
      'win-mail':     { t: 'share this on your wall', b: 'your friends will see it.', a: 'share' },
      'win-gallery':  { t: '12 people liked your piece', b: 'see what else they liked.', a: 'see' },
      'win-receipt':  { t: 'rate your receipt', b: 'help us show you better ones.', a: 'rate' },
      'win-personal': { t: 'your profile is public', b: 'friends of friends can find you.', a: 'ok' },
      'win-maze':     { t: 'top results for you', b: 'ranked by what people click.', a: 'see' },
      'win-whoknows': { t: 'someone asked this before', b: 'the top answer is already here.', a: 'read it' },
      'win-machine':  { t: 'suggested reply', b: 'one tap. no typing.', a: 'use it' },
      'win-social':   { t: 'follow 5 people', b: 'we picked them for you.', a: 'follow' },
      'win-future':   { t: 'what’s next?', b: 'nobody knows yet.', a: 'ok' },
    },
  };
})();
