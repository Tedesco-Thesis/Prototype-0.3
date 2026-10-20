/* =====================================================================
   2014.js — 2014, "web 3" is coined. Load AFTER 2010-13.js, BEFORE guide.js.
   Additive, like the other eras:
     - splices a new era in after 2010 (with its button), and registers a guide beat + pop-up copy through
       window.__era2014 (guide.js picks it up, the same way it does for 2005-07.js)
     - the ground is a full-bleed picture (an original scene: a coast at dusk, a lighthouse); a black rail on the left lists the rooms
     - every window gets a hero cut from the same scene, with the room's name over it, a hamburger drawer and an afternoon / dusk switch
     - the welcome window's hero has a search box that predicts as you type, and a sign-up wall under it; what the form asks for is
       counted on the receipt, and the result is shown back as one big number and a legend
     - every footer gets a card grid, an app + key row, a plain link row and a stats line
   References: the Bing home page (picture + search), a floating-panel map (the sign-up result), Myspace's 2013 relaunch (black rail,
   cards), the Pirate Bay's plain link row (the footer).
   The era's argument: the front door gets simpler (a picture, a menu, a form) and the ledger behind it gets longer.
   "web 3" promises you hold the key instead of the platform — the key is permanent, public and cannot be reset.
===================================================================== */
(function () {
  const KEY = '2014';
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const log = (a, b) => { if (typeof logReceipt === 'function') logReceipt(a, b); };
  const fill = (n) => { if (typeof Trace !== 'undefined') Trace.fieldsFilled += (n || 1); };
  const inEra = () => document.body.classList.contains('era-' + KEY);

  /* ---------- 1. timeline: a new era right after 2010 ---------- */
  const i10 = ERAS.findIndex((e) => e.key === '2010');
  ERAS.splice(i10 + 1, 0, {
    key: KEY, label: '2014', name: 'flat, full-bleed & “web 3”',
    note: '2014: flat, full-bleed and mobile-first — a photo hero, a hamburger, a grid of cards, and a sign-up form in the doorway. a developer coins “web 3”: a web run on keys you hold instead of accounts someone else holds. the front door gets simpler. the ledger behind it gets longer.',
  });
  eraPopupInterval[KEY] = 21000;

  const bar = document.getElementById('eraBar');
  const b10 = bar.querySelector('.era-btn[data-era="2010"]');
  const btn = document.createElement('button');
  btn.className = 'era-btn'; btn.dataset.era = KEY; btn.textContent = '2014'; btn.onclick = () => setEra(KEY);
  (b10 ? b10.after(btn) : bar.appendChild(btn));

  /* ---------- 2. the art: one scene, drawn once, reused by the backdrop and by every hero ----------
     (original artwork: a coast at dusk with a lighthouse. light mode is afternoon, dark mode is dusk.
      the bing / map / myspace references all lead with a full-bleed picture, so the web 3 era does too.) */
  const stars = Array.from({ length: 36 }, (_, i) => '<circle cx="' + ((i * 277) % 1600) + '" cy="' + ((i * 131) % 380) + '" r="' + (1 + (i % 3) * 0.6) + '"/>').join('');
  const refl = [120, 96, 78, 62, 48, 36, 26, 18].map((w, i) => '<rect x="' + (1130 - w / 2) + '" y="' + (572 + i * 17) + '" width="' + w + '" height="4" rx="2"/>').join('');
  const par = (k) => 'style="transform:translate(calc(var(--hx,0px)*' + k + '),calc(var(--hy,0px)*' + (k * 0.8).toFixed(2) + '))"';
  const ART = '<svg id="art14" width="0" height="0" style="position:absolute;pointer-events:none" aria-hidden="true" focusable="false"><defs>' +
    '<linearGradient id="a14-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--s1)"/><stop offset=".55" style="stop-color:var(--s2)"/><stop offset="1" style="stop-color:var(--s3)"/></linearGradient>' +
    '<linearGradient id="a14-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--w1)"/><stop offset="1" style="stop-color:var(--w2)"/></linearGradient>' +
    '<radialGradient id="a14-sun"><stop offset="0" style="stop-color:var(--sunc);stop-opacity:.85"/><stop offset="1" style="stop-color:var(--sunc);stop-opacity:0"/></radialGradient>' +
    '<linearGradient id="a14-beam" x1="1" y1="0" x2="0" y2="0"><stop offset="0" style="stop-color:var(--lamp);stop-opacity:.75"/><stop offset="1" style="stop-color:var(--lamp);stop-opacity:0"/></linearGradient>' +
    '<symbol id="scene14" viewBox="0 0 1600 900">' +
    '<rect width="1600" height="900" fill="url(#a14-sky)"/>' +
    '<g fill="#fff" style="opacity:var(--stars)">' + stars + '</g>' +
    '<circle cx="1130" cy="452" r="230" fill="url(#a14-sun)"/><circle cx="1130" cy="454" r="42" style="fill:var(--sunc)"/>' +
    '<g ' + par(0.2) + ' fill="#fff" opacity=".22"><ellipse cx="380" cy="190" rx="170" ry="20"/><ellipse cx="520" cy="214" rx="110" ry="14"/><ellipse cx="1340" cy="150" rx="150" ry="18"/><ellipse cx="900" cy="120" rx="90" ry="11"/></g>' +
    '<g ' + par(0.3) + '><path style="fill:var(--h1)" d="M-40 570L-40 520C80 478 200 500 320 468C470 428 560 500 700 490C820 480 900 438 1040 470C1200 506 1330 468 1450 448C1530 436 1600 452 1660 470L1660 570Z"/></g>' +
    '<g ' + par(0.5) + '><path style="fill:var(--h2)" d="M-40 570L-40 540C160 518 300 546 460 530C640 512 760 548 920 536C1100 522 1240 542 1400 528L1660 542L1660 570Z"/></g>' +
    '<rect y="566" width="1600" height="340" fill="url(#a14-sea)"/>' +
    '<g style="fill:var(--sunc)" opacity=".42">' + refl + '</g>' +
    '<g ' + par(0.8) + '>' +
    '<path style="fill:var(--h3)" d="M1140 920L1140 810C1230 780 1310 742 1390 704C1450 676 1500 652 1560 644C1582 640 1592 644 1620 650L1620 920Z"/>' +
    '<path style="fill:var(--h3)" d="M-40 920L-40 826C60 800 150 828 250 850C330 866 380 884 430 920Z"/>' +
    '<polygon fill="url(#a14-beam)" style="opacity:var(--beam)" points="1520,497 640,420 640,580"/>' +
    '<polygon style="fill:var(--lh1)" points="1494,652 1546,652 1535,524 1505,524"/>' +
    '<polygon style="fill:var(--lh2)" points="1498,620 1542,620 1539,586 1501,586"/><polygon style="fill:var(--lh2)" points="1503,556 1537,556 1535,532 1505,532"/>' +
    '<rect x="1498" y="514" width="44" height="10" style="fill:var(--h3)"/><rect x="1508" y="486" width="24" height="28" style="fill:var(--lamp)"/>' +
    '<polygon style="fill:var(--h3)" points="1502,486 1538,486 1520,462"/>' +
    '</g></symbol></defs></svg>';
  document.body.insertAdjacentHTML('beforeend', ART);
  const CROPS = ['880 330 720 360', '0 380 820 330', '420 300 820 360', '700 130 900 420', '0 420 1600 360'];
  const artSvg = (crop) => '<svg class="w3-art" viewBox="' + crop + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><use href="#scene14" width="1600" height="900"/></svg>';

  const desk = document.getElementById('desktop');
  desk.insertAdjacentHTML('afterbegin', '<svg id="bg14" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><use href="#scene14" width="1600" height="900"/></svg>');
  const bg = document.getElementById('bg14');
  let raf = 0;
  document.addEventListener('mousemove', (e) => {
    if (!inEra() || raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      desk.style.setProperty('--mx', (nx * -30).toFixed(1) + 'px');
      desk.style.setProperty('--my', (ny * -18).toFixed(1) + 'px');
      bg.style.setProperty('--hx', (nx * 40).toFixed(1) + 'px');
      bg.style.setProperty('--hy', (ny * 20).toFixed(1) + 'px');
      document.querySelectorAll('.w3-hero').forEach((h) => {
        h.style.setProperty('--hx', (nx * 26).toFixed(1) + 'px');
        h.style.setProperty('--hy', (ny * 14).toFixed(1) + 'px');
      });
    });
  });

  /* ---------- 3. light / dark (one global state: afternoon / dusk) ---------- */
  function setDark(on) { document.body.classList.toggle('dark-14', on); }

  /* ---------- 4. copy ---------- */
  const SUBS = {
    'win-home': 'sign up to see more', 'win-data': 'your week, in one chart', 'win-mail': 'short, fast, forgettable',
    'win-gallery': 'photography, full bleed', 'win-receipt': 'what you gave, itemized', 'win-personal': 'one profile, every network',
    'win-maze': 'results in 0.2 seconds', 'win-machine': 'now with suggestions',
    'win-about': 'about this project',
  };
  const STORIES = [
    ['culture', 'why every site now opens with a photo', 'a full-bleed hero is the new front door.'],
    ['privacy', 'what the sign-up form asks — and why', 'a birthday, a second email, a phone number.'],
    ['web 3', 'a developer calls the next web “web 3”', 'keys instead of accounts. who keeps the spare?'],
    ['mobile', 'the app that wants to be your homepage', 'notifications are the new front page.'],
    ['data', 'your map, annotated', 'every pin is somebody’s afternoon.'],
    ['design', 'flat is the new honest', 'the shadows came off. the tracking stayed on.'],
  ];
  const HUE = { culture: 24, privacy: 205, 'web 3': 262, mobile: 152, data: 188, design: 338 };
  const slug = (t) => String(t).toLowerCase().replace(/\.html?$/, '');
  const cap = (t) => t.charAt(0).toUpperCase() + t.slice(1);
  const hashOf = (s) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

  /* ---------- 5a. the rail: a black left column that lists the rooms (the myspace layout) ---------- */
  const ICON = {
    'win-home': '<path d="M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10"/>',
    'win-personal': '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
    'win-maze': '<circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/>',
    'win-data': '<path d="M4 6c0-2 16-2 16 0s-16 2-16 0M4 6v12c0 2 16 2 16 0V6M4 12c0 2 16 2 16 0"/>',
    'win-mail': '<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 7l9 7 9-7"/>',
    'win-machine': '<rect x="4" y="8" width="16" height="11" rx="2"/><path d="M12 8V4M9 13h.01M15 13h.01"/>',
    'win-gallery': '<path d="M4 20l4-1 11-11-3-3L5 16zM14 7l3 3"/>',
    'win-receipt': '<path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/>',
  };
  const RAIL = ['win-home', 'win-personal', 'win-maze', 'win-data', 'win-mail', 'win-machine', 'win-gallery', 'win-receipt'];
  const svgI = (id) => '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[id] + '</svg>';
  const rail = document.createElement('nav');
  rail.id = 'rail14';
  rail.innerHTML =
    '<div class="r-brand"><i class="mk"></i><b>third space</b></div>' +
    '<button class="r-search">' + svgI('win-maze') + '<span>Search</span></button>' +
    '<div class="r-h">ROOMS</div>' +
    RAIL.map((k) => '<a data-go="' + k + '">' + svgI(k) + '<span>' + esc(slug(windowTitles[k])) + '</span></a>').join('') +
    '<div class="r-gap"></div><button class="r-signup">Sign up</button>' +
    '<div class="r-foot"><a data-go="win-home">Help</a> • <a data-go="win-about">Site info</a><br><a data-go="win-receipt">Privacy</a> • <a data-t="terms">Terms</a></div>';
  desk.appendChild(rail);
  const focusSearch = () => {
    if (typeof openWindow === 'function') openWindow('win-home');
    setTimeout(() => { const i = document.querySelector('#win-home .w3-search input'); if (i) { i.focus(); i.scrollIntoView({ block: 'nearest' }); } }, 60);
  };
  rail.querySelectorAll('a[data-go]').forEach((a) => { a.onclick = () => { if (typeof openWindow === 'function') openWindow(a.dataset.go); }; });
  rail.querySelector('a[data-t="terms"]').onclick = () => { log('opened the terms', 'scrolled 0% · accepted anyway'); fill(); };
  rail.querySelector('.r-search').onclick = focusSearch;
  rail.querySelector('.r-signup').onclick = () => {
    if (typeof openWindow === 'function') openWindow('win-home');
    setTimeout(() => { const f = document.querySelector('#win-home .w3-signup input'); if (f) { f.scrollIntoView({ block: 'center' }); f.focus(); } }, 60);
  };
  setInterval(() => {
    if (!inEra()) return;
    rail.querySelectorAll('a[data-go]').forEach((a) => {
      const w = document.getElementById(a.dataset.go);
      a.classList.toggle('on', !!(w && w.classList.contains('open') && w.style.display !== 'none'));
    });
  }, 500);

  /* ---------- 5b. per-window chrome and footer ---------- */
  const ids = Object.keys(windowTitles);
  const CORE = RAIL;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  ids.forEach((id) => {
    const w = document.getElementById(id);
    if (!w || w.querySelector('.w3-chrome')) return;
    const title = windowTitles[id] || id, n = hashOf(id), home = id === 'win-home';

    const chrome = document.createElement('div');
    chrome.className = 'w3-chrome';
    chrome.innerHTML =
      '<div class="w3-hero' + (home ? ' home' : '') + '">' + artSvg(home ? CROPS[0] : CROPS[n % CROPS.length]) + '<div class="w3-scrim"></div>' +
      '<div class="w3-top"><button class="w3-burger" title="menu">☰</button><span class="w3-brand"><i class="mk"></i>third space</span><button class="w3-theme" title="afternoon / dusk">◐</button></div>' +
      (home ? '<form class="w3-search" autocomplete="off"><input placeholder="Search the web" maxlength="60"><button title="search">' + svgI('win-maze') + '</button><div class="w3-sug"></div></form>' : '') +
      '<div class="w3-hh"><div class="w3-sub">' + esc(SUBS[id] || 'scroll') + '</div><div class="w3-h1">' + esc(cap(slug(title))) + '</div></div>' +
      (home ? '<div class="w3-dots">' + CROPS.slice(0, 4).map((_, i) => '<i' + (i === 0 ? ' class="on"' : '') + ' data-i="' + i + '"></i>').join('') + '</div>' : '') +
      '</div>' +
      '<div class="w3-drawer"><button class="x" title="close">✕</button>' +
      CORE.map((k, i) => '<a data-go="' + k + '"><i>' + String(i + 1).padStart(2, '0') + '</i>' + esc(slug(windowTitles[k])) + '</a>').join('') +
      '<p>web 3.0 — a proposal: you hold the keys, not the platform. (the keys cannot be reset.)</p></div>';
    w.querySelector('.titlebar').after(chrome);

    const drawer = chrome.querySelector('.w3-drawer');
    const setTop = () => { const h = w.querySelector('.titlebar').offsetHeight; drawer.style.top = (w.scrollTop + h) + 'px'; drawer.style.height = (w.clientHeight - h) + 'px'; };
    chrome.querySelector('.w3-burger').onclick = () => { setTop(); drawer.classList.toggle('open'); if (drawer.classList.contains('open')) log('opened the menu in ' + title, 'a tap, counted'); };
    drawer.querySelector('.x').onclick = () => drawer.classList.remove('open');
    drawer.querySelectorAll('a[data-go]').forEach((a) => { a.onclick = () => { drawer.classList.remove('open'); if (typeof openWindow === 'function') openWindow(a.dataset.go); }; });
    chrome.querySelector('.w3-theme').onclick = () => setDark(!document.body.classList.contains('dark-14'));

    /* home: the search box prints suggestions as you type (a prediction, logged), and the hero dots change the picture */
    if (home) {
      const form = chrome.querySelector('.w3-search'), inp = form.querySelector('input'), sug = form.querySelector('.w3-sug');
      const art = chrome.querySelector('.w3-art');
      let typedLogged = false;
      const suggest = (q) => (q ? [q + ' near me', q + ' 2014', 'what is ' + q] : ['flat design', 'web 3', 'sign up']);
      const show = () => {
        const q = inp.value.trim();
        sug.innerHTML = suggest(q).map((s) => '<a>' + esc(s) + '</a>').join('') + '<small>' + (q ? 'suggested for you · ' : 'trending · ') + 'sent as you type</small>';
        sug.classList.add('on');
        sug.querySelectorAll('a').forEach((a) => { a.onmousedown = (e) => { e.preventDefault(); inp.value = a.textContent; log('accepted a suggested search', 'prediction accepted: “' + a.textContent.slice(0, 24) + '”'); fill(); run(); }; });
      };
      const run = () => {
        const q = inp.value.trim(); if (!q) return;
        sug.innerHTML = '<a class="res">showing results for “' + esc(q) + '”</a><small>3 sponsored · 1 organic · 0 chosen by you</small>';
        sug.classList.add('on');
        log('searched the front page: “' + q.slice(0, 28) + '”', '+1 query log · 3 suggestions shown first'); fill();
      };
      inp.addEventListener('focus', show);
      inp.addEventListener('input', () => {
        show();
        if (!typedLogged) { typedLogged = true; log('typed in the search box', 'every keystroke is sent, to predict the next one'); }
      });
      inp.addEventListener('blur', () => setTimeout(() => sug.classList.remove('on'), 120));
      form.addEventListener('submit', (e) => { e.preventDefault(); run(); });
      chrome.querySelectorAll('.w3-dots i').forEach((d) => { d.onclick = () => {
        chrome.querySelectorAll('.w3-dots i').forEach((x) => x.classList.toggle('on', x === d));
        art.setAttribute('viewBox', CROPS[+d.dataset.i]);
      }; });
    }

    /* sign-up wall — welcome window only */
    if (home) {
      const su = document.createElement('div');
      su.className = 'w3-signup';
      const ficon = (p) => '<span class="fi"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg></span>';
      su.innerHTML =
        '<div class="l"><h3>Connect with friends and the world around you.</h3>' +
        '<div class="w3-feat">' + ficon('<rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.5"/>') + '<div><b>See photos and updates</b>from friends in your feed.</div></div>' +
        '<div class="w3-feat">' + ficon('<path d="M4 20l4-1 11-11-3-3L5 16z"/>') + '<div><b>Share what’s new</b>in your life on your profile.</div></div>' +
        '<div class="w3-feat">' + ficon('<circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/>') + '<div><b>Find more</b>of what you’re looking for.</div></div></div>' +
        '<div class="r"><div class="form"><h4>Sign up</h4><small>It’s free and always will be.</small>' +
        '<div class="w3-row"><input data-f="first" placeholder="First name"><input data-f="last" placeholder="Last name"></div>' +
        '<div class="w3-row"><input data-f="email" placeholder="Email or mobile number"></div>' +
        '<div class="w3-row"><input data-f="email2" placeholder="Re-enter email or mobile number"></div>' +
        '<div class="w3-row"><input data-f="pw" type="password" placeholder="New password"></div>' +
        '<div class="bd">Birthday</div><div class="w3-row"><select data-f="m"><option value="">Month</option>' + MONTHS.map((m) => '<option>' + m + '</option>').join('') + '</select>' +
        '<select data-f="d"><option value="">Day</option>' + Array.from({ length: 31 }, (_, i) => '<option>' + (i + 1) + '</option>').join('') + '</select>' +
        '<select data-f="y"><option value="">Year</option>' + Array.from({ length: 60 }, (_, i) => '<option>' + (2014 - i) + '</option>').join('') + '</select></div>' +
        '<div class="bd"><a class="whylink">Why do I need to provide my birthday?</a></div>' +
        '<p class="why">so we can show you more relevant things, at the right moment in your life.</p>' +
        '<div class="w3-row g"><label><input type="radio" name="g14" data-f="g"> Female</label><label><input type="radio" name="g14" data-f="g2"> Male</label></div>' +
        '<button class="w3-go">Sign up</button></div></div>';
      chrome.after(su);

      su.querySelector('.whylink').onclick = () => su.querySelector('.why').classList.toggle('on');
      su.querySelector('.w3-go').onclick = () => {
        const get = (f) => su.querySelector('[data-f="' + f + '"]');
        const need = ['first', 'email', 'pw'];
        let ok = true;
        need.forEach((f) => { const el = get(f); const bad = !el.value.trim(); el.classList.toggle('bad', bad); if (bad) ok = false; });
        if (!ok) return;
        const asked = 9;                                     // name x2, email x2, password, birthday x3, gender
        const gave = ['first', 'last', 'email', 'email2', 'pw', 'm', 'd', 'y'].filter((f) => get(f).value).length + (su.querySelector('input[name="g14"]:checked') ? 1 : 0);
        const first = esc(get('first').value.trim());
        const hasG = !!su.querySelector('input[name="g14"]:checked');
        const rows = [
          ['name', !!(get('first').value || get('last').value), 'matching you to people'],
          ['email', !!get('email').value, 'targeting, and everything else'],
          ['password', !!get('pw').value, 'kept (hashed, probably)'],
          ['birthday', !!(get('m').value && get('d').value && get('y').value), '“more relevant things”'],
          ['gender', hasG, 'ad categories'],
        ];
        // the map panel: one big number, then a legend of what each field was "used for"
        su.querySelector('.r').innerHTML =
          '<div class="w3-done"><div class="hi">Welcome, ' + first + '.</div>' +
          '<div class="big"><b>' + gave + '</b> fields saved</div>' +
          '<div class="sub">the form asked for ' + asked + ' things before showing you anything. you could see all of them — this time.</div>' +
          '<div class="leg">' + rows.map((r) => '<div class="lr' + (r[1] ? ' y' : '') + '"><i></i><span>' + r[0] + '</span><em>' + (r[1] ? r[2] : 'skipped') + '</em></div>').join('') + '</div>' +
          '<small>what each field is “used for” is illustrative.</small></div>';
        log('signed up', gave + ' fields · asked for ' + asked + ' · before you saw anything');
        fill(gave);
        const g = window.ThirdSpaceGuide; if (g && g.signal) g.signal('signup');
      };
    }

    /* footer: a card grid (myspace), an app + key row, then a plain link row and a stats line (the promo bay's) */
    const foot = document.createElement('div');
    foot.className = 'w3-foot';
    const picks = [0, 1, 2].map((k) => STORIES[(n + k * 2) % STORIES.length]);
    foot.innerHTML =
      '<div class="w3-cards">' + picks.map((s, i) => '<div class="w3-card" data-i="' + i + '"><div class="im" style="--h:' + (HUE[s[0]] || 200) + '"><span>' + esc(s[0]) + '</span></div><h5>' + esc(cap(s[1])) + '</h5><p>' + esc(cap(s[2])) + '</p></div>').join('') + '</div>' +
      '<div class="w3-acts"><div class="a"><b>Get the app</b><small>it’s better on your phone.</small><span><button class="and">Android</button><button class="ios">iOS</button></span></div>' +
      '<div class="a"><b>Web 3</b><small>you hold the key.</small><span><code class="w3-key"></code><button class="mk">Create key</button></span></div></div>' +
      '<div class="w3-links"><a data-t="login">Login</a> | <a data-t="register">Register</a> | <a data-go="win-about">About</a> | <a data-go="win-receipt">Privacy</a> | <a data-t="terms">Terms</a> | <a data-t="cookies">Cookies</a> | <a data-go="win-receipt">Receipt</a></div>' +
      '<div class="w3-stats"></div>' +
      '<div class="w3-legal">© 2014 thirdspace · a proposal for web 3.0</div>';
    w.appendChild(foot);

    foot.querySelectorAll('.w3-card').forEach((c, i) => { c.onclick = () => log('opened a story: ' + picks[i][1].slice(0, 24) + '…', 'time on card measured'); });
    const mob = (which) => () => { log('installed the app (' + which + ')', 'notifications: on · location: while using'); fill(); };
    foot.querySelector('.and').onclick = mob('android'); foot.querySelector('.ios').onclick = mob('ios');
    let minted = false;
    foot.querySelector('.mk').onclick = (e) => {
      const k = '0x' + Array.from({ length: 40 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
      foot.querySelector('.w3-key').textContent = k;
      e.target.textContent = 'Minted';
      if (!minted) { minted = true; log('created a key: ' + k.slice(0, 8) + '…', 'permanent · public · cannot be reset'); fill(); }
    };
    foot.querySelectorAll('a[data-go]').forEach((a) => { a.onclick = () => { if (typeof openWindow === 'function') openWindow(a.dataset.go); }; });
    foot.querySelectorAll('a[data-t]').forEach((a) => {
      a.onclick = () => {
        const t = a.dataset.t;
        if (t === 'login' || t === 'register') { if (typeof openWindow === 'function') openWindow('win-home'); setTimeout(() => { const f = document.querySelector('#win-home .w3-signup input'); if (f) { f.scrollIntoView({ block: 'center' }); f.focus(); } }, 60); return; }
        log(t === 'cookies' ? 'opened the cookie settings' : 'opened the terms', t === 'cookies' ? '14 partners · all on by default' : 'scrolled 0% · accepted anyway'); fill();
      };
    });
  });
  // the stats line: the receipt's own numbers, in the promo bay's plain voice
  const upd = () => {
    if (!inEra() || typeof Trace === 'undefined') return;
    const d = new Date(), p = (x) => String(x).padStart(2, '0');
    const txt = '4,812 visitors. ' + (Trace.entries ? Trace.entries.length : 0) + ' things itemized, ' + (Trace.totalClicks || 0) + ' clicks counted. last updated ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()) + '.';
    document.querySelectorAll('.w3-stats').forEach((el) => { el.textContent = txt; });
  };
  setInterval(upd, 1500);

  /* ---------- 6. guide beat + pop-up copy (guide.js reads window.__era2014) ---------- */
  const C = (t, b, a) => ({ t, b, a });
  window.__era2014 = {
    beat: {
      say: '2014. flat, full-bleed, mobile-first — and someone coins “web 3”: you hold the key, not the platform. notice the front door.',
      miss: 'a page you can read before you give anything. here the doorway is a form, and the form asks for more than it shows.',
      task: { key: 'signup', room: 'win-home', label: 'welcome', text: 'sign up. before you do, read what the form asks for.' },
    },
    tag: 'promoted', chance: 0.55, tier: 'flat',
    copy: {
      desktop: C('get the app', 'it’s better on mobile.', 'install'),
      'win-home': C('sign up to see more', 'it takes 30 seconds.', 'sign up'),
      'win-data': C('see your week in a map', 'share it with 3 friends.', 'share'),
      'win-mail': C('turn on notifications', 'never miss a reply.', 'turn on'),
      'win-gallery': C('go full screen', 'photos look better big.', 'expand'),
      'win-receipt': C('download your data', 'in 4–6 weeks.', 'request'),
      'win-personal': C('connect another account', 'one profile, everywhere.', 'connect'),
      'win-maze': C('open in the app', 'results are faster there.', 'open'),
      'win-whoknows': C('invite your contacts', 'we’ll find who’s here.', 'invite'),
      'win-machine': C('allow suggestions', 'we’ll finish your sentences.', 'allow'),
      'win-social': C('create a key', 'own your graph. (it can’t be reset.)', 'create'),
    },
  };
})();
