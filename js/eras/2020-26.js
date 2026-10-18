/* =====================================================================
   2020-26.js — 2020–26, optimized, monetized & automated. Load AFTER 2016-19.js, BEFORE guide.js.
   Additive, like the other eras: it renames the existing 2024 entry "2020–26" (the guide's 2024 beat, the late-tier
   pop-ups and the cookie bar are unchanged) and adds, to every window:
     - a greeting bar that already knows your name, and an "ask anything" box with suggestion chips.
       The answers are fluent and confident, and they replace reading: asking is written to the receipt
     - a "your wrapped" block in the footer: the receipt, handed back to you as a gift (stats, a persona, a share button)
   The era's argument: the system stops asking you to do things and starts doing them for you, and it turns what it
   kept into something you'll want to share. Convenience and surveillance arrive in the same card.
===================================================================== */
(function () {
  const KEY = '2024';
  const S = window.ThirdSpaceNext;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const log = (a, b) => { if (typeof logReceipt === 'function') logReceipt(a, b); };
  if (S) { S.flags = S.flags || {}; S.acts = S.acts || {}; }

  /* ---------- 1. rename the existing era ---------- */
  const era = ERAS.find((e) => e.key === KEY);
  if (era) {
    era.label = '2020–26';
    era.name = 'optimized, monetized & automated';
    era.note = 'every page greets you by name and offers to do it for you. an assistant answers before you’ve read, a consent banner asks you to choose in one click, and the year ends with a “wrapped” — what was kept about you, handed back as a gift. friction is treated as a bug, including the friction that used to mean something.';
  }
  const eraBtn = document.querySelector('.era-btn[data-era="' + KEY + '"]');
  if (eraBtn) eraBtn.textContent = '2020–26';

  /* ---------- 2. what the assistant says (fluent, confident, and it replaces reading) ---------- */
  const ids = Object.keys(windowTitles);
  const BLURB = {
    'win-home': 'the front door of this site', 'win-data': 'where your clicks are turned into a trade',
    'win-mail': 'a place where messages take time to send', 'win-gallery': 'where work is signed by its maker',
    'win-receipt': 'a list of what this site kept about you', 'win-personal': 'a page you build yourself, block by block',
    'win-maze': 'search, with three different amounts of friction', 'win-whoknows': 'search answered by people instead of rankings',
    'win-machine': 'an AI that edits a real conversation', 'win-social': 'your data, shown back as a dashboard', 'win-about': 'what this project is about',
  };
  const nextOf = (id) => windowTitles[ids[(ids.indexOf(id) + 1) % ids.length]];
  function answer(id, q) {
    const t = windowTitles[id], b = BLURB[id] || 'a room in this site';
    if (q === 'summarize this room') return 'in short: <b>' + esc(t) + '</b> is ' + esc(b) + '. you can skip reading it.';
    if (q === 'what should i do next?') return 'open <b>' + esc(nextOf(id)) + '</b> next. most people like you do.';
    if (q === 'write it for me') return 'done. i wrote it for you. you can edit it, but you won’t need to.';
    return 'great question. the short version: ' + esc(t) + ' is ' + esc(b) + '. want me to do it for you?';
  }
  const CHIPS = ['summarize this room', 'what should i do next?', 'write it for me'];

  /* ---------- 3. wrapped: the receipt, as a gift ---------- */
  function wrapped() {
    const T = typeof Trace !== 'undefined' ? Trace : { totalClicks: 0, entries: [] };
    const opened = new Set(T.entries.filter((e) => /^opened /.test(e.label)).map((e) => e.label)).size;
    const shown = S && S.pop ? S.pop.shown : 0, acc = S && S.pop ? S.pop.accepted : 0;
    const asks = (S && S.acts.askedAI) || 0;
    const persona = asks >= 2 || (shown && acc / shown > .5) ? 'the delegator' : opened >= 5 ? 'the wanderer' : 'the reader';
    const handle = S && S.me && S.me.handle ? S.me.handle : 'you';
    return { handle, clicks: T.totalClicks || 0, opened, asks, said: shown ? acc + ' of ' + shown : '0 of 0', persona, kept: T.entries.length };
  }

  /* ---------- 4. per-window chrome (hidden unless body.era-2024) ---------- */
  ids.forEach((id) => {
    const w = document.getElementById(id);
    if (!w || w.querySelector('.ai-chrome')) return;
    const title = windowTitles[id];
    const chrome = document.createElement('div');
    chrome.className = 'ai-chrome';
    chrome.innerHTML =
      '<div class="ai-hi"><b class="ai-name"></b><span class="ai-dots"><i></i><i></i><i></i></span></div>' +
      '<form class="ai-ask"><span>✦</span><input placeholder="ask anything about ' + esc(title) + '" maxlength="80"><button>ask</button></form>' +
      '<div class="ai-chips">' + CHIPS.map((c) => '<a data-q="' + c + '">' + c + '</a>').join('') + '</div>' +
      '<div class="ai-ans"></div>';
    w.querySelector('.titlebar').after(chrome);

    const foot = document.createElement('div');
    foot.className = 'ai-foot';
    foot.innerHTML =
      '<div class="ai-wrap"><small>your 2026 wrapped</small><b class="ai-persona"></b>' +
      '<div class="ai-stats"></div><button class="ai-share">share my wrapped</button></div>';
    w.appendChild(foot);

    const ans = chrome.querySelector('.ai-ans'), input = chrome.querySelector('input');
    const ask = (q) => {
      q = (q || '').trim(); if (!q) return;
      ans.innerHTML = '<span>✦</span> ' + answer(id, q); ans.classList.add('on'); input.value = '';
      log('asked the assistant: "' + q.slice(0, 28) + '"', 'sent to a model; kept to improve it');
      if (S) { S.acts.askedAI = (S.acts.askedAI || 0) + 1; S.flags.usedAI = true; }
      if (typeof Trace !== 'undefined') Trace.fieldsFilled += 1;
      paint();
    };
    chrome.querySelector('form').onsubmit = (e) => { e.preventDefault(); ask(input.value); };
    chrome.querySelectorAll('.ai-chips a').forEach((a) => { a.onclick = () => ask(a.dataset.q); });
    foot.querySelector('.ai-share').onclick = (e) => {
      log('shared your wrapped', 'public · “' + wrapped().persona + '”');
      if (S) S.flags.sharedWrapped = true;
      e.target.textContent = 'shared ✓'; setTimeout(() => { e.target.textContent = 'share my wrapped'; }, 1600);
    };
  });

  function paint() {
    const W = wrapped();
    ids.forEach((id) => {
      const w = document.getElementById(id); if (!w || !w.querySelector('.ai-name')) return;
      w.querySelector('.ai-name').textContent = 'hi ' + W.handle + ', welcome back.';
      w.querySelector('.ai-persona').textContent = W.persona;
      w.querySelector('.ai-stats').innerHTML =
        '<div><b>' + W.clicks + '</b>clicks counted</div><div><b>' + W.opened + '</b>rooms opened</div>' +
        '<div><b>' + W.said + '</b>pop-ups you said yes to</div><div><b>' + W.kept + '</b>lines on your receipt</div>';
    });
  }
  document.addEventListener('click', () => setTimeout(paint, 0));
  paint();
})();
