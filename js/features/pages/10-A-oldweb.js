/* A. old web, retro technology */
(function () {
  const P = window.SC_PAGES;

  P.y2k = { w: 560, fx: ['engage boosters', 'power down'], html: (h) => `
    <div class="y-hero">
      <div class="y-orbit"><i class="y-o1"></i><i class="y-o2"></i><i class="y-o3"></i><b class="y-core"></b></div>
      <div class="y-head"><small>PRODUCT LAUNCH ✦ ${h.years}</small><h3>${h.title}</h3><p>${h.did}</p></div>
    </div>
    <div class="y-tick"><span>★ ${h.cname} ★ ${h.ctext} ★ COUNTDOWN TO THE MILLENNIUM ★ ${h.cname} ★ ${h.ctext} ★</span></div>
    <div class="y-grid">
      <section><h4>◖ colour chips ◗</h4>${h.pal()}</section>
      <section><h4>◖ components ◗</h4>${h.assets()}</section>
    </div>
    <div class="y-act">${h.fx()}${h.count()}</div>
    <div class="y-lex"><h4>◖ add to the lexicon ◗</h4>${h.gloss('type a word…', 'upload')}${h.terms()}</div>` };

  P.aero = { w: 560, fx: ['add sunshine', 'back to clouds'], html: (h) => `
    <div class="a-sky"><i class="a-b1"></i><i class="a-b2"></i><i class="a-b3"></i><i class="a-b4"></i><i class="a-sun"></i></div>
    <nav class="a-nav"><b>Welcome</b><span>Home</span><span>Gallery</span><span>About</span><span class="a-on">${h.title}</span></nav>
    <header class="a-head"><h3>${h.title}</h3><p>${h.did}</p></header>
    <div class="a-two">
      <section class="a-glass"><h4>Colours</h4>${h.pal()}</section>
      <section class="a-glass"><h4>Gallery</h4>${h.assets((a) => '<i class="a-ic"></i>' + a)}</section>
    </div>
    <section class="a-glass a-wide"><h4>Guestbook</h4><div class="a-gb">${h.gloss('Write something nice…', 'Post')}${h.fx()}${h.count()}</div>${h.terms()}</section>
    <div class="a-hill"><i>💧</i><i>🌿</i><i>🐠</i></div>` };

  P.desktopcore = { w: 580, fx: ['restart in MS-DOS mode', 'back to Windows'], html: (h) => `
    <div class="d-desk">
      <div class="d-win d-w1"><div class="d-tb"><span>🎨 Paint — palette.bmp</span><em>_ □ ×</em></div><div class="d-bd">${h.pal()}<p class="d-st">click a swatch to pick the foreground colour</p></div></div>
      <div class="d-win d-w2"><div class="d-tb"><span>📁 My Assets</span><em>_ □ ×</em></div><div class="d-bd">${h.assets((a) => '<span class="d-ico"></span><u>' + a + '.exe</u>')}</div></div>
      <div class="d-win d-w3"><div class="d-tb"><span>📝 Notepad — glossary.txt</span><em>_ □ ×</em></div><div class="d-bd d-np">${h.terms()}${h.gloss('type here…', 'OK')}</div></div>
      <div class="d-dlg"><div class="d-tb"><span>About</span><em>×</em></div><div class="d-bd"><i class="d-warn">!</i><p>${h.did}</p>${h.fx()}</div></div>
    </div>
    <div class="d-task"><button class="d-start">⊞ Start</button><span>${h.title}</span><span class="d-clock">${h.count()}</span></div>` };

  P.metro = { w: 560, fx: ['flip the tiles', 'unflip'], html: (h) => `
    <div class="m-top"><small>${h.years} · ${h.kind}</small><h3>${h.title}</h3><p>${h.did}</p></div>
    <div class="m-sec">accent colours</div>${h.pal()}
    <div class="m-sec">tiles</div>${h.assets((a, i) => '<b>' + ['▲', '●', '■', '◆', '✚', '★'][i % 6] + '</b><span>' + a + '</span>')}
    <div class="m-bar">${h.fx()}${h.count()}</div>
    <div class="m-sec">add a word</div><div class="m-gl">${h.gloss('type a word', '→')}</div>${h.terms()}` };
})();
