/* =====================================================================
   era2014.js — 2014, "web 3" is coined. Load AFTER era2010.js, BEFORE guide.js.
   Additive, like the other eras:
     - splices a new era in after 2010 (with its button), and registers a guide beat + pop-up copy through
       window.__era2014 (guide.js picks it up, the same way it does for era2006.js)
     - every window gets a full-bleed duotone hero with giant condensed caps (the room's name), a hamburger drawer
       that lists the rooms, and a light / dark switch
     - the welcome window gets a sign-up wall (facebook 2014): what it asks for is counted on the receipt
     - every footer gets three story cards, an orange "go mobile" band and a grey "web 3" band that mints a key
   The era's argument: the front door gets simpler (a photo, a menu, a form) and the ledger behind it gets longer.
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

  /* ---------- 2. desktop icons -> flat discs; parallax shared by ground + heroes ---------- */
  document.querySelectorAll('#desktop .icon').forEach((ic, i) => ic.classList.add('t14-' + (i % 8)));
  const desk = document.getElementById('desktop');
  let raf = 0;
  document.addEventListener('mousemove', (e) => {
    if (!inEra() || raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
      desk.style.setProperty('--mx', (nx * -40).toFixed(1) + 'px');
      desk.style.setProperty('--my', (ny * -24).toFixed(1) + 'px');
      document.querySelectorAll('.w3-hero').forEach((h) => {
        h.style.setProperty('--hx', (nx * 22).toFixed(1) + 'px');
        h.style.setProperty('--hy', (ny * 12).toFixed(1) + 'px');
      });
    });
  });

  /* ---------- 3. light / dark (one global state) ---------- */
  function setDark(on) { document.body.classList.toggle('dark-14', on); }

  /* ---------- 4. copy ---------- */
  const SUBS = {
    'win-home': 'sign up to see more', 'win-data': 'your week, in one chart', 'win-mail': 'short, fast, forgettable',
    'win-gallery': 'photography, full bleed', 'win-receipt': 'what you gave, itemized', 'win-personal': 'one profile, every network',
    'win-maze': 'results in 0.2 seconds', 'win-whoknows': 'ask the crowd', 'win-machine': 'now with suggestions',
    'win-social': 'your graph, mapped', 'win-about': 'about this project',
  };
  const STORIES = [
    ['culture', 'why every site now opens with a photo', 'a full-bleed hero is the new front door.'],
    ['privacy', 'what the sign-up form asks — and why', 'a birthday, a second email, a phone number.'],
    ['web 3', 'a developer calls the next web “web 3”', 'keys instead of accounts. who keeps the spare?'],
    ['mobile', 'the app that wants to be your homepage', 'notifications are the new front page.'],
    ['data', 'your map, annotated', 'every pin is somebody’s afternoon.'],
    ['design', 'flat is the new honest', 'the shadows came off. the tracking stayed on.'],
  ];
  const slug = (t) => String(t).toLowerCase().replace(/\.html?$/, '');
  const hashOf = (s) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

  /* ---------- 5. per-window chrome and footer ---------- */
  const ids = Object.keys(windowTitles);
  const CORE = ['win-home', 'win-data', 'win-mail', 'win-gallery', 'win-receipt', 'win-personal', 'win-maze', 'win-whoknows', 'win-machine', 'win-social'];
  ids.forEach((id) => {
    const w = document.getElementById(id);
    if (!w || w.querySelector('.w3-chrome')) return;
    const title = windowTitles[id] || id, n = hashOf(id);

    const chrome = document.createElement('div');
    chrome.className = 'w3-chrome';
    chrome.innerHTML =
      '<div class="w3-hero t' + (n % 5) + '">' +
      '<div class="w3-top"><button class="w3-burger" title="menu">☰</button><span class="w3-brand">third space</span><button class="w3-theme" title="light / dark">◐</button></div>' +
      '<div class="w3-hh"><div class="w3-sub">' + esc(SUBS[id] || 'scroll') + '</div><div class="w3-h1">' + esc(slug(title)) + '</div></div></div>' +
      '<div class="w3-drawer"><button class="x" title="close">✕</button>' +
      CORE.map((k, i) => '<a data-go="' + k + '"><i>' + String(i + 1).padStart(2, '0') + '</i>' + esc(slug(windowTitles[k])) + '</a>').join('') +
      '<p>web 3.0 — a proposal: you hold the keys, not the platform. (the keys cannot be reset.)</p></div>';
    w.querySelector('.titlebar').after(chrome);

    const drawer = chrome.querySelector('.w3-drawer');
    const setTop = () => { drawer.style.top = w.querySelector('.titlebar').offsetHeight + 'px'; };
    chrome.querySelector('.w3-burger').onclick = () => { setTop(); drawer.classList.toggle('open'); if (drawer.classList.contains('open')) log('opened the menu in ' + title, 'a tap, counted'); };
    drawer.querySelector('.x').onclick = () => drawer.classList.remove('open');
    drawer.querySelectorAll('a[data-go]').forEach((a) => { a.onclick = () => { drawer.classList.remove('open'); if (typeof openWindow === 'function') openWindow(a.dataset.go); }; });
    chrome.querySelector('.w3-theme').onclick = () => setDark(!document.body.classList.contains('dark-14'));

    /* sign-up wall — welcome window only */
    if (id === 'win-home') {
      const su = document.createElement('div');
      su.className = 'w3-signup';
      su.innerHTML =
        '<div class="l"><h3>connect with friends and the world around you.</h3>' +
        '<div class="w3-feat"><i></i><div><b>see photos and updates</b>from friends in your feed.</div></div>' +
        '<div class="w3-feat"><i></i><div><b>share what’s new</b>in your life on your profile.</div></div>' +
        '<div class="w3-feat"><i></i><div><b>find more</b>of what you’re looking for.</div></div></div>' +
        '<div class="r"><div class="form"><h4>Sign Up</h4><small>It’s free and always will be.</small>' +
        '<div class="w3-row"><input data-f="first" placeholder="First name"><input data-f="last" placeholder="Last name"></div>' +
        '<div class="w3-row"><input data-f="email" placeholder="Email or mobile number"></div>' +
        '<div class="w3-row"><input data-f="email2" placeholder="Re-enter email or mobile number"></div>' +
        '<div class="w3-row"><input data-f="pw" type="password" placeholder="New password"></div>' +
        '<div class="bd">Birthday</div><div class="w3-row"><select data-f="m"><option value="">Month</option><option>Jan</option><option>Feb</option><option>Mar</option><option>Apr</option><option>May</option><option>Jun</option><option>Jul</option><option>Aug</option><option>Sep</option><option>Oct</option><option>Nov</option><option>Dec</option></select>' +
        '<select data-f="d"><option value="">Day</option>' + Array.from({ length: 31 }, (_, i) => '<option>' + (i + 1) + '</option>').join('') + '</select>' +
        '<select data-f="y"><option value="">Year</option>' + Array.from({ length: 60 }, (_, i) => '<option>' + (2014 - i) + '</option>').join('') + '</select></div>' +
        '<div class="bd"><a class="whylink">Why do I need to provide my birthday?</a></div>' +
        '<p class="why">so we can show you more relevant things, at the right moment in your life.</p>' +
        '<div class="w3-row" style="font:12px Lato,sans-serif"><label><input type="radio" name="g14" data-f="g"> Female</label><label><input type="radio" name="g14" data-f="g2"> Male</label></div>' +
        '<button class="w3-go">Sign Up</button></div></div>';
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
        su.querySelector('.r').innerHTML =
          '<div class="w3-done"><b>welcome, ' + first + '.</b><br>we saved ' + gave + ' fields before showing you anything: ' +
          [get('last').value && 'name', get('email').value && 'email', 'password', get('m').value && 'birthday', su.querySelector('input[name="g14"]:checked') && 'gender'].filter(Boolean).join(', ') + '.<br>' +
          '<small style="color:#777">the form asked for ' + asked + ' things. you could see all of them — this time.</small></div>';
        log('signed up', gave + ' fields · asked for ' + asked + ' · before you saw anything');
        fill(gave);
        const g = window.ThirdSpaceGuide; if (g && g.signal) g.signal('signup');
      };
    }

    /* footer: cards, go-mobile band, web-3 band */
    const foot = document.createElement('div');
    foot.className = 'w3-foot';
    const picks = [0, 1, 2].map((k) => STORIES[(n + k * 2) % STORIES.length]);
    foot.innerHTML =
      '<div class="w3-cards">' + picks.map((s, i) => '<div class="w3-card" data-i="' + i + '"><em>' + esc(s[0]) + '</em><h5>' + esc(s[1]) + '</h5><p>' + esc(s[2]) + '</p></div>').join('') + '</div>' +
      '<div class="w3-band o"><span>go mobile</span><small>it’s better on your phone.</small><span class="sp"><button class="and">android</button><button class="ios">ios</button></span></div>' +
      '<div class="w3-band g"><span>web 3</span><small>you hold the key.</small><span class="sp"><span class="w3-key"></span><button class="mk">create key</button></span></div>' +
      '<div class="w3-legal">© 2014 thirdspace · terms · privacy · ads · cookies · a proposal for web 3.0</div>';
    w.appendChild(foot);

    foot.querySelectorAll('.w3-card').forEach((c, i) => { c.onclick = () => log('opened a story: ' + picks[i][1].slice(0, 24) + '…', 'time on card measured'); });
    const mob = (which) => () => { log('installed the app (' + which + ')', 'notifications: on · location: while using'); fill(); };
    foot.querySelector('.and').onclick = mob('android'); foot.querySelector('.ios').onclick = mob('ios');
    let minted = false;
    foot.querySelector('.mk').onclick = (e) => {
      const k = '0x' + Array.from({ length: 40 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
      foot.querySelector('.w3-key').textContent = k;
      e.target.textContent = 'minted';
      if (!minted) { minted = true; log('created a key: ' + k.slice(0, 8) + '…', 'permanent · public · cannot be reset'); fill(); }
    };
  });

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
