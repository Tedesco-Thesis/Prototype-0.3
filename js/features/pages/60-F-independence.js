/* F. independence, collecting, resistance to optimization */
(function () {
  const P = window.SC_PAGES;

  P.solarpunk = { w: 560, fx: ['sunrise', 'dusk'], html: (h) => `
    <div class="sol-sun"><i></i></div>
    <header class="sol-head"><h3>${h.title}</h3><p>${h.years} · ${h.kind} · ☀ 87% sunlight today</p></header>
    <div class="sol-arch"><p>${h.did}</p></div>
    <div class="sol-two">
      <section><h4>leaf palette</h4>${h.pal()}</section>
      <section><h4>seed packets</h4>${h.assets()}</section>
    </div>
    <div class="sol-act">${h.fx()}${h.count()}</div>
    <section class="sol-note"><h4>plant a word</h4>${h.gloss('a word for the commons', 'plant')}${h.terms()}</section>
    <div class="sol-vine"></div>` };

  P.indieweb = { w: 540, fx: ['view source', 'hide source'], html: (h) => `
    <div class="iw-page">
      <header class="iw-card h-card"><div class="iw-av">◐</div><div><b class="p-name">thirdspace.net</b><small>${h.title} · since ${h.years.split('–')[0]}</small><p>${h.did}</p></div></header>
      <nav class="iw-nav"><a>/now</a><a>/about</a><a>/links</a><a>/feed.xml ⟡</a></nav>
      <h4>/colours</h4><pre class="iw-code">:root {</pre>${h.pal((x) => '--c: #' + x.slice(1) + ';')}<pre class="iw-code">}</pre>
      <h4>/links</h4>${h.assets()}
      <p class="iw-act">${h.fx()} ${h.count()}</p>
      <h4>/guestbook</h4>${h.gloss('say hello (no account needed)', 'sign')}${h.terms()}
      <footer>hand-coded · no tracking · no feed · <i>rel="me"</i></footer>
    </div>` };

  P.lofi = { w: 540, fx: ['add dust & light leaks', 'clean the lens'], html: (h) => `
    <header class="lf-head"><h3>slow.network</h3><small>${h.title} · ${h.years} · chronological · no engagement score</small></header>
    <div class="lf-stack">
      <div class="lf-pol lf-p1"><div class="lf-ph"></div><p>kitchen, tuesday</p></div>
      <div class="lf-pol lf-p2"><div class="lf-ph"></div><p>not posted anywhere</p></div>
      <time class="lf-stamp">'26&nbsp;10&nbsp;18</time>
    </div>
    <p class="lf-did">${h.did}</p>
    <div class="lf-lbl">colour notes</div>${h.pal()}
    <div class="lf-lbl">contact sheet — pick your frames</div>${h.assets((a, i) => '<em>' + (12 + i) + 'A</em>' + a)}
    <div class="lf-act">${h.fx()}${h.count()}</div>
    <div class="lf-lbl">write it on the back</div>${h.gloss('a few slow words', 'file it')}${h.terms()}
    <div class="lf-foot">0 likes · no recommendations · full archive visible</div>` };

  P.obscura = { w: 580, fx: ['stamp it', 'lift the stamp'], html: (h) => `
    <div class="ob-tab">OBSCURA.INDEX</div>
    <div class="ob-sheet">
      <header class="ob-head"><div><small>ATLAS OF 100 NICHE ONLINE COMMUNITIES</small><h3>${h.title}</h3></div><span class="ob-stamp">CATALOGUED</span></header>
      <p class="ob-did">${h.did}</p>
      <div class="ob-key"><span>COLOUR KEY</span>${h.pal()}</div>
      <div class="ob-lbl">SPECIMENS — FILE A CARD</div>${h.assets((a, i) => '<small>No. ' + (47 + i) + '.' + (i + 1) + '</small><b>' + a + '</b><em>see also: ' + (100 + i * 7) + '</em>')}
      <div class="ob-act">${h.fx()}${h.count()}</div>
      <div class="ob-lbl">CROSS-REFERENCE — ADD A TERM</div>${h.gloss('classify a term…', 'file')}${h.terms()}
    </div>` };
})();
