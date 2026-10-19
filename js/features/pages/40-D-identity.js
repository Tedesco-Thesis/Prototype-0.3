/* D. Tumblr-era identity, fashion, emotional aesthetics */
(function () {
  const P = window.SC_PAGES;

  P.softgrunge = { w: 540, fx: ['add film grain', 'develop clean'], html: (h) => `
    <div class="sg-plaid"></div>
    <header class="sg-head"><h3>diary_2014</h3><small>${h.title} · ${h.years} · reblogged 2,014 times</small></header>
    <article class="sg-post">
      <div class="sg-pol"><div class="sg-ph"><span>🥀</span></div><p>3:14 am. nobody asked.</p><i class="sg-tape"></i></div>
      <div class="sg-txt"><q>${h.did}</q><span>— via ${h.cname.toLowerCase()}</span></div>
    </article>
    <div class="sg-lbl">film strip — colours</div>${h.pal()}
    <div class="sg-lbl">tagged</div>${h.assets((a) => '#' + a.replace(/ /g, ''))}
    <div class="sg-notes">♡ 2,014 notes · ↻ reblog · ${h.count()}</div>
    <div class="sg-act">${h.fx()}</div>
    <div class="sg-lbl">add to the diary</div>${h.gloss('type something sad & lowercase', 'post')}${h.terms()}` };

  P.pastelgoth = { w: 540, fx: ['summon the bats', 'dismiss the bats'], html: (h) => `
    <div class="pg-web"></div><span class="pg-bat pg-b1">🦇</span><span class="pg-bat pg-b2">🦇</span>
    <header class="pg-head"><h3>${h.title}</h3><p>graveyard.girl · a digital sticker collection · ${h.years}</p></header>
    <p class="pg-did">☠ ${h.did} ☠</p>
    <div class="pg-lbl">♥ hair dye colours ♥</div>${h.pal((x) => '♥')}
    <div class="pg-lbl">✝ sticker sheet ✝</div>${h.assets()}
    <div class="pg-act">${h.fx()}${h.count()}</div>
    <div class="pg-lbl">☾ epitaph ☾</div>${h.gloss('write on the headstone', 'bury')}${h.terms()}` };

  P.gorecore = { w: 540, fx: ['let it bleed', 'wipe it clean'], html: (h) => `
    <div class="gc-drips"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <header class="gc-head"><h3>gloom_archive</h3><small>${h.title} · ${h.years} · ${h.kind}</small></header>
    <p class="gc-did">${h.did}</p>
    <div class="gc-rule">❦ stains ❦</div>${h.pal()}
    <div class="gc-rule">❦ fragments ❦</div>${h.assets((a, i) => '<em>fragment ' + (i + 1) + '</em>' + a)}
    <div class="gc-act">${h.fx()}${h.count()}</div>
    <div class="gc-rule">❦ write one down ❦</div>${h.gloss('a mood, a word', 'record')}${h.terms()}` };

  P.arthoe = { w: 560, fx: ['frame it', 'take it down'], html: (h) => `
    <div class="ah-wall">
      <div class="ah-frame"><div class="ah-art"><i class="ah-sun"></i><i class="ah-hill"></i><i class="ah-flw">🌻</i></div></div>
      <div class="ah-plac"><b>${h.title}</b><span>oil, wishful thinking, ${h.years}</span><small>${h.did}</small></div>
      <i class="ah-tape ah-t1"></i><i class="ah-tape ah-t2"></i>
    </div>
    <p class="ah-note">notes on materials & influences →</p>
    <div class="ah-lbl">paint on the palette</div>${h.pal()}
    <div class="ah-lbl">in my sketchbook</div>${h.assets()}
    <div class="ah-act">${h.fx()}${h.count()}</div>
    <div class="ah-lbl">add a note to the margin</div>${h.gloss('a note on the margin', 'write')}${h.terms()}` };

  P.studyblr = { w: 560, fx: ['start a study session', 'end the session'], html: (h) => `
    <div class="st-rings">${'<i></i>'.repeat(12)}</div>
    <div class="st-page">
      <i class="st-washi st-w1"></i><i class="st-washi st-w2"></i><span class="st-plant">🪴</span>
      <h3><mark>small-rituals</mark></h3><small>${h.title} · ${h.years}</small>
      <p class="st-did">${h.did}</p>
      <div class="st-lbl">highlighters</div>${h.pal()}
      <div class="st-lbl">today's to-do</div>${h.assets((a) => '<u></u>' + a)}
      <div class="st-act">${h.fx()}${h.count()}</div>
      <div class="st-lbl">vocab list</div>${h.gloss('new word…', 'add')}${h.terms()}
    </div>` };

  P.coquette = { w: 540, fx: ['tie the ribbon', 'untie'], html: (h) => `
    <div class="cq-lace"></div>
    <header class="cq-head"><span class="cq-bow">🎀</span><h3>${h.title}</h3><p>ribbon.html · a visual diary · ${h.years}</p><div class="cq-pearls"><i></i><i></i><i></i><i></i><i></i></div></header>
    <p class="cq-did">${h.did}</p>
    <div class="cq-div">❦ palette ❦</div>${h.pal()}
    <div class="cq-div">❦ wardrobe ❦</div>${h.assets()}
    <div class="cq-act">${h.fx()}${h.count()}</div>
    <div class="cq-div">❦ a dear word ❦</div>${h.gloss('write a dear word', 'send')}${h.terms()}
    <div class="cq-lace cq-lb"></div>` };

  P.baddie = { w: 540, fx: ['add gloss', 'wipe it off'], html: (h) => `
    <header class="bd-mast"><h3>GLOSS</h3><small>${h.title} · ${h.years} · ✦ the beauty editorial ✦</small></header>
    <div class="bd-prof">
      <div class="bd-av"><i>💄</i></div>
      <div class="bd-stats"><b>@gloss.club</b><div><span><b>312</b> posts</span><span><b>48.2k</b> followers</span><span><b>86</b> following</span></div><p>${h.did}</p></div>
    </div>
    <div class="bd-lbl">STORY HIGHLIGHTS</div>${h.assets((a, i) => '<i>' + ['💋', '🕶', '💎', '⭐', '✂'][i % 5] + '</i><span>' + a + '</span>')}
    <div class="bd-lbl">THE PALETTE · LIMITED EDITION</div>${h.pal()}
    <div class="bd-act">${h.fx()}${h.count()}</div>
    <div class="bd-lbl">CAPTION</div>${h.gloss('add your caption…', 'POST')}${h.terms()}` };
})();
