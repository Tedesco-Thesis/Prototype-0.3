/* B. glitch, cyberculture, remix, internet-native art */
(function () {
  const P = window.SC_PAGES;

  P.cyberpunk = { w: 580, fx: ['jack in', 'jack out'], html: (h) => `
    <div class="cp-rain"></div>
    <header class="cp-head"><small>SYS//NODE_07 · ${h.years} · ${h.kind}</small><h3 data-t="${h.title}">${h.title}</h3><p>${h.did}</p></header>
    <div class="cp-grid">
      <section class="cp-p"><h4>▸ PALETTE_BUS</h4>${h.pal()}</section>
      <section class="cp-p cp-eye"><h4>▸ SURVEILLANCE</h4><div class="cp-cam"><i></i><b>◉</b><em>REC 02:47</em></div><small>2,481 SUBJECTS TRACKED</small></section>
    </div>
    <section class="cp-p"><h4>▸ ASSET_REGISTRY</h4>${h.assets((a, i) => '<em>0x' + (16 + i * 7).toString(16).toUpperCase() + '</em> ' + a)}</section>
    <div class="cp-act">${h.fx()}${h.count()}</div>
    <section class="cp-p"><h4>▸ TERMINAL</h4><div class="cp-term">&gt; ${h.gloss('enter term_', 'EXEC')}</div>${h.terms()}</section>` };

  P.netart = { w: 560, fx: ['follow the link', 'go back'], html: (h) => `
    <h1>${h.title}</h1>
    <p class="n-path">file:///between.htm</p>
    <hr>
    <p class="n-txt">${h.did} <a class="n-lnk" data-pick>click here</a> to be ${h.assets((a) => a)}</p>
    <p class="n-txt">${h.cname} — ${h.ctext}</p>
    <hr>
    <table class="n-tab" border="1"><tr><td>colour</td><td>${h.pal((x) => x.slice(1))}</td></tr></table>
    <p>${h.fx()} ${h.count()}</p>
    <hr>
    <p class="n-gl">add a word: ${h.gloss('', 'submit')}</p>${h.terms()}
    <p class="n-end">[ back ] [ forward ] [ reload ] [ you are here ]</p>` };

  P.demoscene = { w: 580, fx: ['start the effect', 'stop'], html: (h) => `
    <div class="ds-bars"><i></i><i></i><i></i><i></i><i></i></div>
    <div class="ds-top">
      <div class="ds-cube"><s></s><s></s><s></s><s></s><s></s><s></s></div>
      <div class="ds-ttl"><h3>${h.title}</h3><p>${h.cname} :: ${h.ctext}</p><small>${h.years} · 64 KB · 50 FPS</small></div>
    </div>
    <div class="ds-scroll"><span>*** GREETINGS TO ALL SCENERS *** ${h.did} *** CODE · MUSIC · GRAPHICS *** NO ASSETS, ONLY MATH *** GREETINGS TO ALL SCENERS ***</span></div>
    <pre class="ds-hd">PALETTE ──────────────────────────────</pre>${h.pal()}
    <pre class="ds-hd">PRODUCTIONS ───────────────────────────</pre>${h.assets((a, i) => '<em>' + String(i + 1).padStart(2, '0') + '</em>' + a + '<b>' + [4, 16, 8, 32, 64, 12][i % 6] + ' KB</b>')}
    <div class="ds-act">${h.fx()}${h.count()}</div>
    <pre class="ds-hd">GREETZ ───────────────────────────────</pre>${h.gloss('greet someone', 'SEND')}${h.terms()}` };

  P.nightcore = { w: 560, fx: ['speed it up ×1.5', 'normal speed'], html: (h) => `
    <div class="nc-speed"></div>
    <header class="nc-head"><h3>${h.title}</h3><small>${h.years} · SPED-UP EDITS · ${h.kind}</small></header>
    <div class="nc-player">
      <div class="nc-art"><span>🎧</span><i></i></div>
      <div class="nc-info"><b>${h.cname}</b><span>${h.ctext}</span>
        <div class="nc-wave">${'<i></i>'.repeat(26)}</div>
        <div class="nc-prog"><i></i></div>
        <div class="nc-ctl"><span>⏮</span><span class="nc-play">▶</span><span>⏭</span><em>174 BPM <u>×1.25</u></em></div>
      </div>
    </div>
    <div class="nc-lbl">COLOUR TAGS</div>${h.pal()}
    <div class="nc-lbl">PLAYLIST — CLICK TO ADD</div>${h.assets((a, i) => '<em>' + String(i + 1).padStart(2, '0') + '</em>' + a + '<b>' + ['1:42', '2:09', '1:58', '2:31', '1:47', '3:05'][i % 6] + '</b>')}
    <div class="nc-act">${h.fx()}${h.count()}</div>
    <div class="nc-lbl">COMMENT</div>${h.gloss('leave a comment…', 'POST')}${h.terms()}` };

  P.vaporwave = { w: 560, fx: ['ＲＥＷＩＮＤ', 'ＳＴＯＰ'], html: (h) => `
    <div class="vw-sky"><i class="vw-sun"></i><span class="vw-bust">🗿</span><span class="vw-palm vw-p1">🌴</span><span class="vw-palm vw-p2">🌴</span><i class="vw-floor"></i></div>
    <h3 class="vw-ttl">ｖａｐｏｒｗａｖｅ</h3><p class="vw-jp">ヴェイパーウェイブ ・ ${h.years}</p>
    <div class="vw-box"><div class="vw-tb"><span>▣ ${h.cname}.exe</span><em>_ □ ×</em></div><div class="vw-bd"><p>${h.did}</p></div></div>
    <div class="vw-two">
      <div class="vw-box"><div class="vw-tb"><span>▣ ｐａｌｅｔｔｅ</span><em>×</em></div><div class="vw-bd">${h.pal()}</div></div>
      <div class="vw-box"><div class="vw-tb"><span>▣ ｆｉｌｅｓ</span><em>×</em></div><div class="vw-bd">${h.assets((a) => '▤ ' + a)}</div></div>
    </div>
    <div class="vw-box"><div class="vw-tb"><span>▣ ｇｌｏｓｓａｒｙ</span><em>×</em></div><div class="vw-bd">${h.gloss('ａ ｗｏｒｄ', 'ＯＫ')}${h.terms()}<div class="vw-act">${h.fx()}${h.count()}</div></div></div>` };

  P.seapunk = { w: 560, fx: ['dive deeper', 'surface'], html: (h) => `
    <div class="sp-sea"><i class="sp-w1"></i><i class="sp-w2"></i><span class="sp-dol">🐬</span><b class="sp-tri"></b><u class="sp-bub sp-b1"></u><u class="sp-bub sp-b2"></u><u class="sp-bub sp-b3"></u></div>
    <header class="sp-head"><h3>${h.title}</h3><p>abyss.fm · ${h.years} · ${h.kind}</p></header>
    <div class="sp-menu"><p>${h.did}</p></div>
    <div class="sp-menu"><h4>≋ colour currents ≋</h4>${h.pal()}</div>
    <div class="sp-menu"><h4>≋ catalogue ≋</h4>${h.assets()}</div>
    <div class="sp-menu"><div class="sp-act">${h.fx()}${h.count()}</div>${h.gloss('whale song…', 'send')}${h.terms()}</div>` };

  P.futurefunk = { w: 580, fx: ['drop the needle', 'lift the needle'], html: (h) => `
    <div class="ff-wrap">
      <div class="ff-obi"><span>${h.pal((x) => '')}</span><em>シティポップ</em><small>CITY POP CLUB · 非売品</small></div>
      <div class="ff-sleeve">
        <div class="ff-sun"></div><div class="ff-sky"></div><div class="ff-city"></div><span class="ff-palm">🌴</span>
        <h3>${h.title}</h3><p>${h.years} · ${h.kind}</p>
      </div>
    </div>
    <p class="ff-did">${h.did}</p>
    <div class="ff-lbl">— CRATE · SIDE A —</div>${h.assets((a, i) => '<em>¥' + (1200 + i * 380) + '</em>' + a)}
    <div class="ff-act">${h.fx()}${h.count()}</div>
    <div class="ff-lbl">— LINER NOTES —</div>${h.gloss('write a liner note', 'press')}${h.terms()}` };

  P.mallsoft = { w: 560, fx: ['play the muzak', 'mute'], html: (h) => `
    <div class="ms-sign"><b>MALL DIRECTORY</b><span>LEVEL B1 · ${h.years}</span><em>●&nbsp;YOU ARE HERE</em></div>
    <div class="ms-map"><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <p class="ms-did">${h.did}</p>
    <div class="ms-lbl">TILE SAMPLES</div>${h.pal()}
    <div class="ms-lbl">STORE LISTING</div>${h.assets((a, i) => '<em>UNIT ' + (101 + i * 3) + '</em>' + a + '<b>CLOSED</b>')}
    <div class="ms-np"><span>▶ NOW PLAYING</span><em>fountain_loop_04.wav</em>${h.fx()}</div>
    <div class="ms-lbl">COMMENT CARD</div>${h.gloss('leave a note…', 'drop in box')}${h.terms()}<div class="ms-foot">${h.count()}</div>` };
})();
