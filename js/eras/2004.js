/* =====================================================================
   2004.js — 2004, web 2.0, redesigned as the weblog / design-portfolio web.
   Load AFTER early-eras.js (and 2005-07.js), BEFORE guide.js. Additive, like the other eras.
     - rewrites the 2004 era note
     - builds the torn-paper window edge (one clip-path, set as a CSS variable)
     - adds a blog masthead (above) and footer (below) to every window, hidden outside 2004
     - the footer's comment box and RSS button write to the receipt: this is the era where
       ordinary people publish under their own name, and where "subscribe" first means
       "the page now comes to you" (the seed of the feed)
===================================================== */
(function () {
  const era = ERAS.find((e) => e.key === '2004');
  if (era) {
    era.name = 'web 2.0 · the weblog era';
    era.note = 'ordinary people publish in public, under their own names: weblogs, permalinks, comments, RSS. pages are still places you go to — but platforms start remembering you between visits, the first pop-ups appear (still polite, still easy to close) and moderation is manual and inconsistent.';
  }

  /* torn paper: a jittered polygon, the same for every window (seeded so it never flickers) */
  let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  const J = () => Math.round(rnd() * 8);                       // 0-8px bite out of the edge
  const pts = [], N = 36;
  for (let i = 0; i <= N; i++) pts.push(`${(i / N * 100).toFixed(1)}% ${J()}px`);                     // top
  for (let i = 1; i <= 24; i++) pts.push(`calc(100% - ${J()}px) ${(i / 24 * 100).toFixed(1)}%`);       // right
  for (let i = N; i >= 0; i--) pts.push(`${(i / N * 100).toFixed(1)}% calc(100% - ${J()}px)`);         // bottom
  for (let i = 23; i >= 1; i--) pts.push(`${J()}px ${(i / 24 * 100).toFixed(1)}%`);                    // left
  document.documentElement.style.setProperty('--paper-clip', 'polygon(' + pts.join(',') + ')');

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const MONTHS = ['january','february','march','april','may','june','july','august','september','october','november','december'];
  const d = new Date();
  const dateline = MONTHS[d.getMonth()] + ' ' + String(d.getDate()).padStart(2, '0') + ', 2004';
  const comments = {};

  Object.keys(windowTitles).forEach((id) => {
    const w = document.getElementById(id);
    if (!w || w.querySelector('.wb-chrome')) return;
    const title = windowTitles[id] || id;
    comments[id] = 0;

    const chrome = document.createElement('div');
    chrome.className = 'wb-chrome';
    chrome.innerHTML =
      '<div class="wb-top"><i></i><b></b></div>' +
      '<div class="wb-mast"><span>third space<br>a weblog about how people say things</span>' +
      '<span><a>front</a><a>archive</a><a>about</a><a>submit</a></span></div>' +
      '<div class="wb-date">' + esc(dateline) + ' · ' + esc(title) + '</div>';
    w.querySelector('.titlebar').after(chrome);

    const foot = document.createElement('div');
    foot.className = 'wb-foot';
    foot.innerHTML =
      '<div class="wb-row"><span>posted by you : ' + esc(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })) +
      ' &nbsp; <a class="wb-cm">comment(<span class="wb-n">0</span>)</a> | <a>trackback(0)</a></span>' +
      '<a class="wb-rss wb-sub" title="subscribe">RSS</a></div>' +
      '<div class="wb-say"><input maxlength="80" placeholder="leave a comment (your name will show)"><button>post</button></div>' +
      '<div class="wb-last"></div>' +
      '<div class="wb-best">best viewed with: 1024×768 · 16-bit colour · ie 5.5+ · firefox</div>' +
      '<div class="wb-ring">[&lt;&lt;] [third space ring] [&gt;&gt;] [?] · powered by movable type 2.64</div>';
    w.appendChild(foot);

    const say = foot.querySelector('.wb-say'), input = say.querySelector('input'), last = foot.querySelector('.wb-last');
    foot.querySelector('.wb-cm').onclick = () => { say.classList.toggle('on'); if (say.classList.contains('on')) input.focus(); };
    const post = () => {
      const t = input.value.trim(); if (!t) return;
      comments[id] += 1; input.value = '';
      foot.querySelector('.wb-n').textContent = comments[id];
      last.textContent = 'you: ' + t;
      logReceipt('comment on ' + title + ': "' + t.slice(0, 22) + '"', 'public, under your name');
      if (typeof Trace !== 'undefined') Trace.fieldsFilled += 1;
    };
    say.querySelector('button').onclick = post;
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') post(); });
    foot.querySelector('.wb-sub').onclick = () => {
      logReceipt('subscribed to ' + title + ' (rss)', 'the page now comes to you');
      const b = foot.querySelector('.wb-sub'); b.textContent = 'OK'; setTimeout(() => { b.textContent = 'RSS'; }, 1500);
    };
  });
})();
