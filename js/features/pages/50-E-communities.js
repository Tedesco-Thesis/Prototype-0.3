/* E. online identities, fandoms, niche communities and music scenes */
(function () {
  const P = window.SC_PAGES;

  P.otherkin = { w: 580, fx: ['light the moon', 'let it set'], html: (h) => `
    <div class="ok-ban"><i class="ok-moon"></i><span class="ok-wolf">🐺</span><span class="ok-tree">🌲</span><span class="ok-tree ok-t2">🌲</span><div><h3>fieldnotes.of.self</h3><small>${h.title} · ${h.years} · a community board</small></div></div>
    <div class="ok-crumb">Index › Boards › Kin Registry › <b>read this first</b></div>
    <div class="ok-cols">
      <aside class="ok-user"><div class="ok-sigil"><i></i></div><b>newcomer</b><small>Species: <em>?</em><br>Registered: 2009<br>Posts: 0</small>${h.pal()}</aside>
      <div class="ok-main">
        <div class="ok-post"><div class="ok-ph">Posted: just now</div><p>${h.did}</p></div>
        <div class="ok-th">Threads — click to follow</div>${h.assets((a, i) => '<span class="ok-ic">☾</span><b>' + a + '</b><em>' + [3, 12, 7, 21, 4, 9][i % 6] + ' replies</em>')}
      </div>
    </div>
    <div class="ok-act">${h.fx()}${h.count()}</div>
    <div class="ok-reply"><div class="ok-th">Quick reply — add a word to the community glossary</div>${h.gloss('a term, in your own words', 'post reply')}${h.terms()}</div>` };

  P.witchhouse = { w: 540, fx: ['distort', 'clear the signal'], html: (h) => `
    <div class="wh-tri"><i></i><b>⛧</b></div>
    <h3 class="wh-ttl" data-t="${h.title}">▲ ${h.title} ▲</h3>
    <p class="wh-meta">T̷I̷M̷E̷ 04:44 † ${h.years} † ${h.kind} †</p>
    <p class="wh-did">${h.did}</p>
    <div class="wh-lbl">‡ pigment ‡</div>${h.pal()}
    <div class="wh-lbl">‡ tracklist ‡</div>${h.assets((a, i) => '<em>' + String(i + 1).padStart(2, '0') + ' ▲</em>' + a + '<b>' + ['0:00', '6:66', '4:44', '3:33', '5:55'][i % 5] + '</b>')}
    <div class="wh-act">${h.fx()}${h.count()}</div>
    <div class="wh-lbl">‡ inscribe ‡</div>${h.gloss('☩ …', '†')}${h.terms()}` };

  P.soulbonders = { w: 560, fx: ['light a candle', 'blow it out'], html: (h) => `
    <div class="sb-sky"></div>
    <header class="sb-head"><span class="sb-lock">🔒 private by default</span><h3>character_archive</h3><small>${h.title} · ${h.years}</small></header>
    <div class="sb-sheet">
      <div class="sb-port"><i></i><span>🕯</span></div>
      <dl><dt>name</dt><dd>__________</dd><dt>from</dt><dd>a story you love</dd><dt>bonded since</dt><dd>always</dd><dt>speaks when</dt><dd>it is quiet</dd></dl>
    </div>
    <p class="sb-did">${h.did}</p>
    <div class="sb-lbl">inks</div>${h.pal()}
    <div class="sb-lbl">timeline — add to the archive</div>${h.assets((a, i) => '<em>' + ['I', 'II', 'III', 'IV', 'V', 'VI'][i % 6] + '.</em>' + a)}
    <div class="sb-act">${h.fx()}${h.count()}</div>
    <div class="sb-lbl">a line in their voice</div>${h.gloss('write a line they would say', 'seal')}${h.terms()}` };

  P.healthgoth = { w: 580, fx: ['run the test', 'cool down'], html: (h) => `
    <header class="hg-head"><small>BODY.SYSTEM — ${h.years} — LOOKBOOK / 01</small><h3>${h.title.toUpperCase()}</h3><div class="hg-sl"></div></header>
    <div class="hg-grid"><p>${h.did}</p><div class="hg-num"><b>01</b><span>/05</span></div></div>
    <div class="hg-lbl">COLOURWAY</div>${h.pal()}
    <div class="hg-lbl">SPECIFICATIONS — SELECT TO ADD</div>${h.assets((a, i) => '<em>M-0' + (i + 1) + '</em><b>' + a.toUpperCase() + '</b><span>' + ['3-LAYER MESH', 'BONDED SEAMS', 'REFLECTIVE', 'MATTE BLACK', 'HEART RATE 62', 'N/A'][i % 6] + '</span>')}
    <div class="hg-act">${h.fx()}${h.count()}</div>
    <div class="hg-lbl">NOTES</div>${h.gloss('add a spec note', 'LOG')}${h.terms()}` };

  P.livingdolls = { w: 540, fx: ['open the box', 'close the box'], html: (h) => `
    <div class="ld-box">
      <div class="ld-top"><b>${h.title.toUpperCase()}™</b><small>porcelain.studio · COLLECTION No. 14 · ${h.years}</small></div>
      <div class="ld-win"><span class="ld-doll">🎎</span><i class="ld-bow l"></i><i class="ld-bow r"></i><div class="ld-lace"></div></div>
      <div class="ld-side"><h4>ACCESSORIES INCLUDED</h4>${h.assets((a) => '<u></u>' + a)}</div>
    </div>
    <p class="ld-did">${h.did}</p>
    <div class="ld-lbl">OUTFIT SWATCHES</div>${h.pal()}
    <div class="ld-act">${h.fx()}${h.count()}</div>
    <div class="ld-lbl">ADD TO THE BOX</div>${h.gloss('name her…', 'add')}${h.terms()}
    <div class="ld-foot"><i class="ld-bar"></i><span>AGES 13+ · DISPLAY ONLY · BATTERIES NOT INCLUDED</span></div>` };
})();
