/* C. surreal, liminal, unsettling */
(function () {
  const P = window.SC_PAGES;

  P.weirdcore = { w: 540, fx: ['look again', 'look away'], html: (h) => `
    <div class="wc-sky"><i class="wc-cl1"></i><i class="wc-cl2"></i><i class="wc-cl3"></i><b class="wc-eye"><u></u></b><span class="wc-bal">🎈</span><span class="wc-door"></span></div>
    <p class="wc-lost">?? °N · ??? °W · you have been here before</p>
    <h3 class="wc-ttl">${h.title}</h3>
    <p class="wc-did">${h.did}</p>
    <p class="wc-q">do you remember this place?</p>
    <div class="wc-pal">${h.pal()}</div>
    <div class="wc-as">${h.assets()}</div>
    <p class="wc-note">somewhere.unknown — ${h.ctext}</p>
    <div class="wc-act">${h.fx()}${h.count()}</div>
    <div class="wc-gl">${h.gloss('tell us what you remember', 'ok')}</div>${h.terms()}` };

  P.liminal = { w: 560, fx: ['keep walking', 'stop'], html: (h) => `
    <div class="lm-ceil"><i></i><i></i><i></i><i></i></div>
    <div class="lm-wall">
      <div class="lm-lvl"><b>LEVEL 0</b><span>"the lobby" · ROOM 0037 · ${h.years}</span></div>
      <h3>${h.title}</h3>
      <p>${h.did}</p>
      <p class="lm-warn">⚠ IF YOU ARE READING THIS YOU ARE NOT SUPPOSED TO BE HERE. EXIT: NOT FOUND.</p>
      <div class="lm-lbl">wallpaper samples</div>${h.pal()}
      <div class="lm-lbl">rooms</div>${h.assets((a, i) => '<em>ROOM ' + String(11 + i * 8).padStart(4, '0') + '</em>' + a)}
      <div class="lm-act">${h.fx()}${h.count()}</div>
      <div class="lm-lbl">leave a note for the next wanderer</div>${h.gloss('', 'leave')}${h.terms()}
    </div>
    <div class="lm-floor"></div>` };

  P.horror = { w: 560, fx: ['rewind', 'stop'], html: (h) => `
    <div class="hr-scr">
      <div class="hr-osd"><span>▶ PLAY</span><span class="hr-rec">● REC</span></div>
      <div class="hr-body">
        <h3>${h.title}</h3>
        <p class="hr-eas">THIS IS A TEST OF THE BROADCAST SYSTEM. THIS IS ONLY A TEST. IF THIS WERE AN ACTUAL EMERGENCY, YOU WOULD ALREADY KNOW.</p>
        <p>${h.did}</p>
      </div>
      <div class="hr-time">SEP 14 1998&nbsp;&nbsp;02:13:47 AM&nbsp;&nbsp;SP</div>
      <i class="hr-trk"></i>
    </div>
    <div class="hr-bars">${h.pal()}</div>
    <div class="hr-lbl">TAPE ARCHIVE — broadcast_07</div>${h.assets((a, i) => '<em>TAPE ' + String(i + 1).padStart(2, '0') + '</em>' + a)}
    <div class="hr-act">${h.fx()}${h.count()}</div>
    <div class="hr-lbl">TRANSCRIPT (UNRELIABLE)</div>${h.gloss('add a line to the transcript', 'log')}${h.terms()}` };

  P.deepfried = { w: 540, fx: ['fry it more', 'unfry'], html: (h) => `
    <div class="df-meme">
      <h3 class="df-top">${h.title}</h3>
      <div class="df-pile"><span>😂</span><span>💯</span><span>🔥</span><span>👌</span><span>😂</span><i class="df-flare"></i></div>
      <p class="df-bot">${h.cname}</p>
    </div>
    <p class="df-q">${h.did}</p>
    <div class="df-lbl">JPEG QUALITY: 3% · GENERATIONS: 41</div>
    <div class="df-pal">${h.pal()}</div>
    <div class="df-as">${h.assets()}</div>
    <div class="df-act">${h.fx()}${h.count()}</div>
    <div class="df-gl">${h.gloss('CAPTION HERE', 'POST')}</div>${h.terms()}` };

  P.carpets = { w: 580, fx: ['compare side by side', 'single view'], html: (h) => `
    <header class="cw-head"><span class="cw-pin">📍</span><div><h3>carpet.world</h3><p>${h.title} · ${h.years} · a community-sourced atlas</p></div><em>${h.count()}</em></header>
    <p class="cw-did">${h.did}</p>
    <div class="cw-lbl">DYE LOT — PICK A COLOUR</div>${h.pal()}
    <div class="cw-lbl">SPECIMENS — CLICK TO CATALOGUE</div>
    ${h.assets((a, i) => '<span class="cw-sw cw-s' + (i % 6) + '"></span><em>CW-' + String(23 + i * 11).padStart(3, '0') + '</em><b>' + a + '</b><small>' + ['PDX · Concourse C', 'ATL · Terminal S', 'DFW · Gate A22', 'SEA · Link Hall', 'LGW · North', 'YVR · Pier D'][i % 6] + '</small>')}
    <div class="cw-act">${h.fx()}</div>
    <div class="cw-lbl">SUBMIT A TAG / LOCATION</div>${h.gloss('e.g. PDX teal, 1992', 'submit')}${h.terms()}` };
})();
