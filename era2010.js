/* =====================================================================
   era2010.js — 2010–13, social & mobile. Load AFTER eras.js / era2006.js / era2004.js, BEFORE guide.js.
   Additive, like the other eras (nothing in the base files is edited):
     - renames the 2010 era "2010–13" and gives it two looks: gloss (2010) and flat (2013), switched by body.flat-13
     - gives every window a browser frame: address row, facebook-style top bar, favourites row,
       a "what's on your mind?" box and — in the footer — a like row and a sponsored strip
     - the welcome window gets a three-slide banner carousel (twitter / xbox / office 365)
     - desktop icons become app tiles; the ground drifts with the cursor (parallax)
     - a terms-of-service notice (the receipt records how long you took to "read" it) and a chat dock
   The era's argument: for the first time the page is built around a SIGNAL (like, share, search, click)
   and everything you do with it is quietly kept. Every action here writes a receipt line.
===================================================================== */
(function () {
  const KEY = '2010';
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const log = (a, b) => { if (typeof logReceipt === 'function') logReceipt(a, b); };
  const fill = () => { if (typeof Trace !== 'undefined') Trace.fieldsFilled += 1; };

  /* ---------- 1. the era: one entry, two looks ---------- */
  const NOTE_10 = 'accounts, feeds and terms of service nobody reads. the page is built around a signal — a like, a share, a search — and each one is kept. your friends are one click away, and so are the people paying to be seen by you.';
  const NOTE_13 = '2013: the gloss comes off. flat tiles, big light type, photo-first. it looks calmer and cleaner — and the page now arrives already knowing you: sign-in, recommendations and a feed are the default front door.';
  const era = ERAS.find((e) => e.key === KEY);
  if (era) {
    era.label = '2010–13';
    era.name = 'social & mobile';
    Object.defineProperty(era, 'note', { get: () => (document.body.classList.contains('flat-13') ? NOTE_13 : NOTE_10), configurable: true });
  }
  const eraBtn = document.querySelector('.era-btn[data-era="' + KEY + '"]');
  if (eraBtn) eraBtn.textContent = '2010–13';

  /* ---------- 2. desktop icons -> app tiles ---------- */
  document.querySelectorAll('#desktop .icon').forEach((ic, i) => ic.classList.add('tile-' + (i % 8)));

  /* ---------- 3. parallax ground (only while this era is showing) ---------- */
  const desk = document.getElementById('desktop');
  let raf = 0;
  document.addEventListener('mousemove', (e) => {
    if (!document.body.classList.contains('era-' + KEY) || raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      desk.style.setProperty('--mx', ((e.clientX / innerWidth - 0.5) * -34).toFixed(1) + 'px');
      desk.style.setProperty('--my', ((e.clientY / innerHeight - 0.5) * -22).toFixed(1) + 'px');
    });
  });

  /* ---------- 4. the 2010 <-> 2013 toggle (one global state) ---------- */
  function setDrift(flat) {
    document.body.classList.toggle('flat-13', flat);
    document.querySelectorAll('.fb-drift').forEach((b) => {
      b.children[0].classList.toggle('on', !flat);
      b.children[1].classList.toggle('on', flat);
    });
    if (document.body.classList.contains('era-' + KEY)) {
      const n = document.getElementById('eraNote'); if (n) n.textContent = flat ? NOTE_13 : NOTE_10;
    }
  }

  /* ---------- 5. contextual "sponsored" copy: the ad always knows which room you're in ---------- */
  const ADS = {
    'win-home':     ['find old friends fast', '12 people you may know are already here.', '👥'],
    'win-data':     ['track your week. win badges.', 'streaks keep you coming back.', '🔥'],
    'win-mail':     ['write faster with smartreply™', 'never type a whole sentence again.', '✎'],
    'win-gallery':  ['get 10× more likes on your art', 'post at the best time. we’ll tell you when.', '❤'],
    'win-receipt':  ['see who viewed your profile', 'upgrade to premium to see the list.', '👁'],
    'win-personal': ['your profile is 55% complete', 'pick a category and we’ll fill in the rest.', '✔'],
    'win-maze':     ['find anything in 0.2 seconds', 'top result: whatever paid for it.', '⌕'],
    'win-whoknows': ['ask your friends instantly', 'or 4,000 strangers, ranked.', '?'],
    'win-machine':  ['say it better with autotone', 'beta · reads your message before you send it.', '✉'],
    'win-social':   ['share your life in one click', 'we’ll remember it for you.', '☁'],
    'win-about':    ['learn more about thirdspace', 'built by people who read the terms.', 'i'],
  };
  const adFor = (id) => ADS[id] || ['you might also like this', 'based on your activity on this page.', '★'];
  const slug = (t) => String(t).toLowerCase().replace(/\.html?$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  /* ---------- 6. per-window chrome (hidden unless body.era-2010) ---------- */
  const state = { posts: {}, liked: {} };
  const baseLikes = (id) => (id.length * 7) % 23 + 3;

  Object.keys(windowTitles).forEach((id) => {
    const w = document.getElementById(id);
    if (!w || w.querySelector('.fb-chrome')) return;
    const title = windowTitles[id] || id;
    state.posts[id] = [];

    const favs = Object.keys(windowTitles).filter((k) => k !== 'win-about')
      .map((k) => '<a data-go="' + k + '" class="' + (k === id ? 'cur' : '') + '">' + esc(windowTitles[k]) + '</a>').join('');

    const chrome = document.createElement('div');
    chrome.className = 'fb-chrome';
    chrome.innerHTML =
      '<div class="fb-url"><span class="fb-nav"><i>◀</i><i>▶</i><i>⟳</i></span>' +
      '<div class="fb-addr">🔒 <span class="fb-host">www.thirdspace.com</span><span class="fb-path">/' + esc(slug(title)) + '</span></div><span class="fb-star">☆</span></div>' +
      '<div class="fb-bar"><span class="fb-logo">thirdspace</span>' +
      '<span class="fb-search"><input placeholder="Search" maxlength="40"></span>' +
      '<span class="fb-links"><a>Home</a><a>Profile</a></span>' +
      '<button class="fb-drift" title="the same web, 2010 or 2013"><b class="on">2010</b><b>2013</b></button></div>' +
      '<div class="fb-fav"><em>FAVORITES</em>' + favs + '</div>' +
      '<div class="fb-share"><div class="fb-tabs"><span>Update Status</span><span>Add Photo</span><span>Ask Question</span></div>' +
      '<div class="fb-say"><input maxlength="90" placeholder="What’s on your mind?"><button class="fb-go">Share</button></div>' +
      '<div class="fb-story"></div></div>';
    w.querySelector('.titlebar').after(chrome);

    /* hero carousel — only on the welcome window */
    if (id === 'win-home') {
      const hero = document.createElement('div');
      hero.className = 'fb-hero';
      hero.innerHTML =
        '<div class="fb-slide s0 on"><h3>your friends, all in one place.</h3><button>Sign up ›</button></div>' +
        '<div class="fb-slide s1"><h3>now with mobile. we go where you go.</h3><button>Learn more</button></div>' +
        '<div class="fb-slide s2"><h3>get in the cloud. we’ll keep it all for you.</h3><button>Sign up for Beta ›</button></div>' +
        '<div class="fb-dots"><button class="on">1</button><button>2</button><button>3</button></div>';
      chrome.after(hero);
      const slides = [...hero.querySelectorAll('.fb-slide')], dots = [...hero.querySelectorAll('.fb-dots button')];
      let cur = 0, hover = false;
      const show = (n) => { cur = (n + 3) % 3; slides.forEach((s, i) => s.classList.toggle('on', i === cur)); dots.forEach((d, i) => d.classList.toggle('on', i === cur)); };
      dots.forEach((d, i) => { d.onclick = () => show(i); });
      hero.onmouseenter = () => { hover = true; }; hero.onmouseleave = () => { hover = false; };
      setInterval(() => { if (!hover && document.body.classList.contains('era-' + KEY)) show(cur + 1); }, 6500);
      slides.forEach((s) => { s.querySelector('button').onclick = () => log('clicked a banner: "' + s.querySelector('h3').textContent.slice(0, 26) + '…"', 'the banner measured your interest'); });
    }

    const foot = document.createElement('div');
    foot.className = 'fb-foot';
    const ad = adFor(id);
    foot.innerHTML =
      '<div class="fb-actions"><a class="fb-lk">Like</a>·<a class="fb-cm">Comment</a>·<a class="fb-sh">Share</a><span class="fb-n"></span></div>' +
      '<div class="fb-spons"><header><span>Sponsored</span><a>Create an Ad</a></header>' +
      '<div class="fb-ad"><div class="fb-adimg tile-' + (id.length % 8) + '">' + ad[2] + '</div>' +
      '<div class="fb-adtx"><a>' + esc(ad[0]) + '</a>' + esc(ad[1]) + '</div><button class="fb-like">Like</button></div></div>' +
      '<div class="fb-legal"><a>About</a> · <a>Advertising</a> · <a>Privacy</a> · <a>Terms</a> · <a>Cookies</a> &nbsp;thirdspace © 2010</div>';
    w.appendChild(foot);

    /* --- behaviour: every signal writes a receipt line --- */
    const input = chrome.querySelector('.fb-say input'), story = chrome.querySelector('.fb-story');
    const share = () => {
      const t = input.value.trim(); if (!t) return;
      state.posts[id].unshift(t); input.value = '';
      story.innerHTML = state.posts[id].slice(0, 2).map((p) =>
        '<div class="fb-post"><div class="fb-av">y</div><div><b>you</b> ' + esc(p) + '<small>just now · public</small></div></div>').join('');
      log('shared: "' + t.slice(0, 24) + '"', 'public · used to target ads');
      fill();
    };
    chrome.querySelector('.fb-go').onclick = share;
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') share(); });

    const sq = chrome.querySelector('.fb-search input');
    sq.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || !sq.value.trim()) return;
      log('searched: "' + sq.value.trim().slice(0, 22) + '"', 'search history kept'); fill(); sq.value = '';
    });

    chrome.querySelectorAll('.fb-fav a').forEach((a) => { a.onclick = () => { if (typeof openWindow === 'function') openWindow(a.dataset.go); }; });
    chrome.querySelector('.fb-drift').onclick = (e) => { e.stopPropagation(); setDrift(!document.body.classList.contains('flat-13')); };

    const lk = foot.querySelector('.fb-lk'), n = foot.querySelector('.fb-n');
    const paint = () => {
      const c = baseLikes(id) + (state.liked[id] ? 1 : 0);
      lk.textContent = state.liked[id] ? 'Unlike' : 'Like'; lk.classList.toggle('on', !!state.liked[id]);
      n.textContent = '▲ ' + c + ' people like this';
    };
    paint();
    lk.onclick = () => {
      state.liked[id] = !state.liked[id]; paint();
      if (state.liked[id]) { log('liked ' + title, 'a signal ads can read'); fill(); }
    };
    foot.querySelector('.fb-cm').onclick = () => { input.focus(); };
    foot.querySelector('.fb-sh').onclick = () => { log('shared ' + title + ' with friends', 'your friends are now in the data'); };
    const adLike = foot.querySelector('.fb-like');
    adLike.onclick = () => { adLike.classList.toggle('on'); adLike.textContent = adLike.classList.contains('on') ? 'Liked' : 'Like'; if (adLike.classList.contains('on')) log('liked a sponsored story: ' + ad[0].slice(0, 22), 'someone paid for this'); };
    foot.querySelector('.fb-adtx a').onclick = () => log('clicked a sponsored story: ' + ad[0].slice(0, 22), 'someone paid for this');
  });

  /* ---------- 7. terms-of-service notice: the receipt records how long you "read" it ---------- */
  const terms = document.createElement('div');
  terms.id = 'fbTerms';
  terms.innerHTML =
    '<p><b>we’ve updated our Terms of Service and Data Use Policy</b> (11,812 words). by continuing to use thirdspace you agree to them.</p>' +
    '<button class="fb-cta">Continue</button><a class="lm">Learn more</a>' +
    '<p class="more">in short: we may use your activity to show you things we think you’ll like, and you let us keep it. you can leave at any time — we keep what you left behind.</p>';
  document.body.appendChild(terms);
  let termsShownAt = 0, termsDone = false;
  terms.querySelector('.lm').onclick = () => terms.classList.toggle('open');
  terms.querySelector('.fb-cta').onclick = () => {
    termsDone = true; terms.classList.remove('show');
    log('agreed to the terms of service', 'read for ' + ((Date.now() - termsShownAt) / 1000).toFixed(1) + 's · 11,812 words');
    fill();
  };

  /* ---------- 8. chat dock: friends reduced to presence ---------- */
  const chat = document.createElement('div');
  chat.id = 'fbChat';
  const ppl = [['mom', 1], ['someone you met once', 1], ['a classmate', 1], ['your manager', 1], ['j.', 0, 'seen 2 yrs ago'], ['a friend of a friend', 1]];
  chat.innerHTML =
    '<div class="fbc-head"><span class="fbc-dot"></span>Chat (<b id="fbcN">5</b>)</div>' +
    '<div class="fbc-list">' + ppl.map((p) => '<div class="fbc-row' + (p[1] ? '' : ' off') + '" data-n="' + esc(p[0]) + '"><i></i>' + esc(p[0]) + (p[2] ? '<em>' + esc(p[2]) + '</em>' : '') + '</div>').join('') + '</div>';
  document.body.appendChild(chat);
  chat.querySelector('.fbc-head').onclick = () => chat.classList.toggle('open');
  chat.querySelectorAll('.fbc-row').forEach((r) => {
    r.onclick = () => {
      const em = r.querySelector('em') || r.appendChild(document.createElement('em')), prev = em.textContent;
      em.textContent = 'typing…'; setTimeout(() => { em.textContent = prev; }, 1600);
      log('opened a chat with ' + r.dataset.n, 'your presence is public');
    };
  });
  let online = 5;
  setInterval(() => {
    if (!document.body.classList.contains('era-' + KEY)) return;
    online = Math.max(3, Math.min(12, online + (Math.random() < 0.5 ? -1 : 1)));
    $('#fbcN').textContent = online;
  }, 6000);

  /* ---------- 9. on entering the era: show the terms notice once ---------- */
  let wasIn = false;
  const sync = () => {
    const inEra = document.body.classList.contains('era-' + KEY);
    if (inEra && !wasIn && !termsDone) { termsShownAt = Date.now(); terms.classList.add('show'); }
    if (!inEra) terms.classList.remove('show');
    wasIn = inEra;
  };
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  sync();
})();
