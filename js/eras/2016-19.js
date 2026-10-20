/* =====================================================================
   2016-19.js — 2016–19, the algorithmic feed. Load AFTER 2014.js, BEFORE guide.js.
   Additive, like the other eras: it renames the existing 2016 entry "2016–19" (the guide's 2016 beat,
   pop-ups and cookie bar are unchanged) and adds, to every window:
     - a sticky site header (logo, search, pill sign-up) and a duotone gradient strip
     - a "ranked for you" rail: the rooms ordered by what you've clicked, only three shown.
       "show all" is the friction that used to be a menu; using it is written to the receipt
     - "why am I seeing this?" (the 2018-19 transparency link) — reading it is written to the receipt
     - an autoplay "up next" bar that counts down and queues the next room unless you cancel
   The era's argument: ranking replaces browsing. The options are still there; they are just behind one more click.
===================================================================== */
(function () {
  const KEY = '2016';
  const S = window.ThirdSpaceNext;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const log = (a, b) => { if (typeof logReceipt === 'function') logReceipt(a, b); };
  const inEra = () => document.body.classList.contains('era-' + KEY);
  if (S) { S.flags = S.flags || {}; S.acts = S.acts || {}; }

  /* ---------- 1. rename the existing era ---------- */
  const era = ERAS.find((e) => e.key === KEY);
  if (era) {
    era.label = '2016–19';
    era.name = 'the algorithmic feed';
    era.note = 'ranking replaces browsing. a feed decides the order, a bar says “up next” before you’ve finished, and the menu you used to scroll is folded behind “show all”. cookie banners arrive (2018) and so does “why am i seeing this?” — an answer, one click deep. the options are all still there.';
  }
  const eraBtn = document.querySelector('.era-btn[data-era="' + KEY + '"]');
  if (eraBtn) eraBtn.textContent = '2016–19';

  /* ---------- 2. state ---------- */
  const ids = Object.keys(windowTitles);
  const st = { all: false, why: {}, cancelled: {}, queued: {} };
  const score = (id) => {
    const t = windowTitles[id];
    return (typeof Trace !== 'undefined' ? Trace.entries : []).filter((e) => e.label.indexOf(t) !== -1).length;
  };
  const ranked = (cur) => ids.filter((i) => i !== cur).sort((a, b) => score(b) - score(a) || ids.indexOf(a) - ids.indexOf(b));
  const pct = (id, i) => Math.max(41, Math.min(98, 62 + score(id) * 9 - i * 4));
  const reason = (id, cur) => {
    const n = score(id);
    return n ? 'you opened or used ' + esc(windowTitles[id]) + ' ' + n + ' time' + (n > 1 ? 's' : '') + '.'
      : 'people who were here before you went there next. you haven’t opened it yet.';
  };

  /* ---------- 3. per-window chrome (hidden unless body.era-2016) ---------- */
  ids.forEach((id) => {
    const w = document.getElementById(id);
    if (!w || w.querySelector('.fx-chrome')) return;
    const title = windowTitles[id];
    const chrome = document.createElement('div');
    chrome.className = 'fx-chrome';
    chrome.dataset.g = String(ids.indexOf(id) % 4);
    chrome.innerHTML =
      '<div class="fx-top"><b class="fx-logo">third space</b><span class="fx-search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="10" cy="10" r="6.5"/><path d="M15 15l6 6"/></svg>search ' + esc(title) + '</span><a class="fx-login">log in</a><span class="fx-cta">sign up</span></div>' +
      '<div class="fx-hero"><i class="fx-burger"><u></u><u></u><u></u></i><span class="fx-scroll">scroll down</span>' +
      '<div class="fx-hh"><div class="fx-kick">because it’s what you looked at last</div><div class="fx-h1">' + esc(title) + '</div></div></div>' +
      '<div class="fx-band"><div class="fx-railhead"><b>ranked for you</b><a class="fx-why">why am i seeing this?</a></div>' +
      '<div class="fx-whybox"></div><div class="fx-rail"></div><a class="fx-all"></a></div>';
    w.querySelector('.titlebar').after(chrome);

    const foot = document.createElement('div');
    foot.className = 'fx-foot';
    foot.innerHTML =
      '<div class="fx-next"><div class="fx-nl"><small>autoplay</small><span class="fx-nextlbl"></span></div><div class="fx-bar"><i></i></div><a class="fx-cancel">cancel</a></div>' +
      '<div class="fx-links"><span class="fx-brand">third space</span>' +
      '<div><b>company</b><a>about</a><a>jobs</a><a>for the record</a></div>' +
      '<div><b>communities</b><a>for artists</a><a>advertisers</a><a>developers</a></div>' +
      '<div><b>useful links</b><a>help</a><a>cookies</a><a>privacy</a><a>terms</a></div></div>' +
      '<div class="fx-legal">hero image chosen for you by ranking · © 2018 third space</div>';
    w.appendChild(foot);

    chrome.querySelector('.fx-why').onclick = () => {
      st.why[id] = !st.why[id];
      if (st.why[id]) {
        log('asked why: ' + title + '’s rail', 'read the reason; kept the order');
        if (S) S.flags.askedWhy = true;
      }
      paint();
    };
    chrome.querySelector('.fx-all').onclick = () => {
      st.all = !st.all;
      if (st.all) { log('opened the full list of rooms', 'one extra click to see what was hidden'); if (S) S.flags.showedAll = true; }
      paint();
    };
    foot.querySelector('.fx-cancel').onclick = () => {
      st.cancelled[id] = true;
      log('cancelled autoplay on ' + title, 'you stopped the next room starting');
      if (S) S.flags.cancelledAutoplay = true;
      paint();
    };
  });

  function paint() {
    ids.forEach((id) => {
      const w = document.getElementById(id); if (!w || !w.querySelector('.fx-rail')) return;
      const order = ranked(id), shown = st.all ? order : order.slice(0, 3);
      w.querySelector('.fx-rail').innerHTML = shown.map((rid, i) =>
        '<button class="fx-card" data-id="' + rid + '"><span class="fx-pct">' + pct(rid, i) + '% match</span><b>' + esc(windowTitles[rid]) + '</b></button>').join('') +
        '<button class="fx-card fx-ad" data-ad="1"><span class="fx-pct">sponsored</span><b>2,500 free points. sign up now!</b></button>';
      const ad = w.querySelector('.fx-ad');
      if (ad) ad.onclick = () => { log('clicked a sponsored tile in the rail', 'it was styled like a room'); if (S) S.flags.clickedAd = true; };
      w.querySelectorAll('.fx-card[data-id]').forEach((c) => { c.onclick = () => { log('opened ' + windowTitles[c.dataset.id] + ' from the rail', 'ranked #' + (order.indexOf(c.dataset.id) + 1)); openWindow(c.dataset.id); }; });
      const hidden = order.length - 3;
      const all = w.querySelector('.fx-all');
      all.textContent = st.all ? 'show fewer' : 'show all (' + hidden + ' more)';
      const wb = w.querySelector('.fx-whybox');
      wb.style.display = st.why[id] ? 'block' : 'none';
      wb.innerHTML = 'because ' + reason(order[0], id) + ' <em>this ranking uses your clicks. it can’t be switched off.</em>';
      const nxt = order[0];
      w.querySelector('.fx-nextlbl').textContent = st.cancelled[id] ? 'autoplay off' : 'up next: ' + windowTitles[nxt];
      w.querySelector('.fx-cancel').style.display = st.cancelled[id] ? 'none' : '';
      w.querySelector('.fx-next').classList.toggle('off', !!st.cancelled[id]);
    });
  }

  /* autoplay: the bar fills in 9s; if the window is open, in this era, and not cancelled, the next room is "queued" */
  setInterval(() => {
    if (!inEra()) return;
    ids.forEach((id) => {
      const w = document.getElementById(id);
      if (!w || !w.classList.contains('open') || st.cancelled[id]) return;
      const bar = w.querySelector('.fx-bar i'); if (!bar) return;
      const t = (parseFloat(bar.dataset.t || 0) + 1) % 10;
      bar.dataset.t = t; bar.style.width = (t * 11.2) + '%';
      if (t === 9 && !st.queued[id]) {
        st.queued[id] = true;
        log('autoplay queued: ' + windowTitles[ranked(id)[0]], 'you didn’t cancel');
        if (S) S.flags.autoplayed = (S.flags.autoplayed || 0) + 1;
      }
    });
  }, 1000);
  document.addEventListener('click', () => setTimeout(paint, 0));
  paint();
})();
