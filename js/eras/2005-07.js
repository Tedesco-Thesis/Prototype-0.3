/* =====================================================================
   2005-07.js — 2005–2007, the social media boom. Load AFTER early-eras.js and
   BEFORE guide.js (index.html: script.js, cultures.js, early-eras.js, 2005-07.js, guide.js).

   Adds, without editing the base files:
     - the era itself (spliced into the timeline after 2004, with its button)
     - per-window "profile" chrome: a blue banner + nav, a status box, a vote box,
       and a footer with a profile-completeness bar and a friend count
     - tracking: status posts and votes become receipt lines (so the forecast can read them)
     - guide beat, pop-up copy tier, tag and odds, through the S.guide hook in guide.js
   The era's argument: for the first time, connection becomes something you can SEE and COUNT
   (friends, completeness, votes). Counting is the first step toward optimizing.
===================================================================== */
(function () {
  const KEY = '2006';

  /* ---------- 1. timeline ---------- */
  const i2004 = ERAS.findIndex((e) => e.key === '2004');
  ERAS.splice(i2004 + 1, 0, {
    key: KEY, label: '2005–07', name: 'the social media boom',
    note: 'profiles, friend lists and a box that asks "what are you doing?". connection becomes visible — and countable. a friend is a number, a profile has a completeness bar, a story is worth its votes. nobody has a feed yet; you still go to people’s pages.',
  });
  eraPopupInterval[KEY] = 32000;

  const bar = document.getElementById('eraBar');
  const b2004 = bar.querySelector('.era-btn[data-era="2004"]');
  const btn = document.createElement('button');
  btn.className = 'era-btn';
  btn.dataset.era = KEY;
  btn.textContent = '2005–07';
  btn.onclick = () => setEra(KEY);
  (b2004 ? b2004.after(btn) : bar.appendChild(btn));

  /* ---------- 2. per-window chrome (hidden unless body.era-2006) ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const store = { status: [], voted: {} };

  function friends() { const S = window.ThirdSpaceNext; return 1 + (S && S.pop ? S.pop.accepted : 0); }
  function completeness() {
    const n = (typeof Trace !== 'undefined' ? Trace.fieldsFilled : 0) + store.status.length;
    return Math.min(100, 15 + n * 12);
  }

  Object.keys(windowTitles).forEach((id) => {
    const w = document.getElementById(id);
    if (!w || w.querySelector('.sb-chrome')) return;
    const title = windowTitles[id] || id;
    const chrome = document.createElement('div');
    chrome.className = 'sb-chrome';
    chrome.innerHTML =
      '<div class="sb-banner"><span class="sb-logo">[thirdspace]</span><span class="sb-beta">beta</span>' +
      '<span class="sb-nav"><a>home</a><a>search</a><a>browse</a><a>invite</a><a>help</a></span></div>' +
      '<div class="sb-bar"><b>' + esc(title) + '</b><span>your profile · <a>edit</a></span></div>' +
      '<div class="sb-status"><label>what are you doing?</label>' +
      '<input class="sb-in" maxlength="60" placeholder="e.g. writing a letter"><button class="sb-post">update</button>' +
      '<div class="sb-last"></div></div>' +
      '<div class="sb-vote"><button class="sb-up" title="digg this">▲</button><span class="sb-n">0</span><i>votes</i></div>';
    w.querySelector('.titlebar').after(chrome);

    const foot = document.createElement('div');
    foot.className = 'sb-foot';
    foot.innerHTML =
      '<div class="sb-meter"><span>profile completeness</span><div class="sb-track"><div class="sb-fill"></div></div><em class="sb-pct"></em></div>' +
      '<div class="sb-meta"><span class="sb-fr"></span><span><a>about</a> · <a>terms</a> · <a>privacy</a> · <a>rss</a></span></div>';
    w.appendChild(foot);

    const input = chrome.querySelector('.sb-in');
    const post = () => {
      const t = input.value.trim();
      if (!t) return;
      store.status.unshift(t);
      input.value = '';
      logReceipt('status: "' + t.slice(0, 24) + '"', 'public, 1 friend can see');
      if (typeof Trace !== 'undefined') Trace.fieldsFilled += 1;
      const g = window.ThirdSpaceGuide; if (g && g.signal) g.signal('status');
      refresh();
    };
    chrome.querySelector('.sb-post').onclick = post;
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') post(); });

    chrome.querySelector('.sb-up').onclick = () => {
      if (store.voted[id]) return;
      store.voted[id] = 1;
      logReceipt('voted up ' + title, 'ranked by votes');
      const S = window.ThirdSpaceNext; if (S && S.acts) S.acts.votes = (S.acts.votes || 0) + 1;
      refresh();
    };
  });

  function refresh() {
    const pct = completeness(), fr = friends();
    document.querySelectorAll('.sb-fill').forEach((e) => { e.style.width = pct + '%'; });
    document.querySelectorAll('.sb-pct').forEach((e) => { e.textContent = pct + '%'; });
    document.querySelectorAll('.sb-fr').forEach((e) => { e.textContent = fr + (fr === 1 ? ' friend' : ' friends'); });
    document.querySelectorAll('.sb-last').forEach((e) => { e.textContent = store.status.length ? 'now: ' + store.status[0] : ''; });
    Object.keys(windowTitles).forEach((id) => {
      const w = document.getElementById(id); if (!w) return;
      const n = w.querySelector('.sb-n'), up = w.querySelector('.sb-up');
      if (n) n.textContent = (id.length % 7) + 1 + (store.voted[id] ? 1 : 0);   // a stable fake baseline
      if (up) up.classList.toggle('on', !!store.voted[id]);
    });
  }
  document.addEventListener('click', () => setTimeout(refresh, 0));
  refresh();

  /* ---------- 3. guide + pop-up copy (via the hook guide.js exposes) ---------- */
  // guide.js loads after this file, so register on window and let it pick them up
  window.__era2006 = {
    beat: {
      say: '2005–07. profiles, friend lists, a box that asks what you’re doing. you can see your connections now, as a number.',
      miss: 'a quiet way to be known. here you are a page with a completeness bar.',
      task: { key: 'status', room: 'win-home', label: 'say something', text: 'post a status: what are you doing right now?' },
    },
    tag: 'social', chance: 0.4, tier: 'social',
    // one line per room; falls back to the early ads for rooms not listed
    copy: {
      'win-home': { t: 'you have 3 new friend requests', b: 'people you may know.', a: 'view' },
      desktop:   { t: 'you have 3 new friend requests', b: 'people you may know.', a: 'view' },
      'win-mail': { t: 'tell your friends about this', b: 'invite 5 and unlock more space.', a: 'invite' },
      'win-gallery': { t: 'your piece is on the front page', b: 'vote counts decide who sees it.', a: 'see votes' },
      'win-personal': { t: 'your profile is 55% complete', b: 'add a song and a top 8.', a: 'finish it' },
      'win-social': { t: 'who’s in your top 8?', b: 'they’ll see where they rank.', a: 'rank' },
      'win-data': { t: 'make your page public', b: 'so friends of friends can find you.', a: 'go public' },
      'win-receipt': { t: 'new: see who viewed your profile', b: 'it’s only fair.', a: 'show me' },
      'win-maze': { t: 'people who liked this also liked', b: '4 more pages.', a: 'see' },
      'win-whoknows': { t: 'ask your network', b: '12 friends are online.', a: 'ask' },
      'win-machine': { t: 'add a status for this', b: 'let your friends know.', a: 'post' },
      'win-future': { t: 'what’s next?', b: 'nobody knows yet.', a: 'ok' },
    },
  };
})();
