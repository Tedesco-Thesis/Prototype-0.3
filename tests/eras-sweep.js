const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto('file://' + require('path').resolve(__dirname, '..', 'index.html') + '#quick'); await p.waitForTimeout(800);
  for (const e of ['1991','1993','1996','1999','2004','2006','2008','2010','2014','2016','2024','2030']) {
    try { await p.evaluate((e) => setEra(e), e); } catch (x) { errs.push('setEra ' + e + ' ' + x.message.split('\n')[0]); continue; }
    await p.waitForTimeout(900);
    await p.evaluate(() => { ['win-home','win-data','win-mail','win-gallery','win-receipt','win-personal','win-maze','win-trace'].forEach(id => { if (id === 'win-trace') Viewer.open(TS_FEATURED().id); else openWindow(id); });
      openPane('win-data','sentence'); openPane('win-maze','stacks'); openPane('win-mail','drawer'); openPane('win-receipt','mine'); });
    const n = await p.evaluate(() => document.querySelectorAll('.window.open').length);
    console.log(e, 'windows open:', n);
  }
  // keyboard
  await p.evaluate(() => setEra('1996')); await p.waitForTimeout(800);
  await p.evaluate(() => { document.querySelector('.icon[data-room="win-mail"]').focus(); }); await p.keyboard.press('Enter');
  console.log('enter opens letters:', await p.evaluate(() => document.getElementById('win-mail').classList.contains('open')));
  await p.evaluate(() => Viewer.open(TS_FEATURED().id)); await p.focus('#win-trace #trTab-yours').catch(()=>{}); await p.keyboard.press('Escape');
  console.log('escape closes viewer:', await p.evaluate(() => !document.getElementById('win-trace').classList.contains('open')));
  console.log(errs.join('\n') || 'no page errors'); await b.close();
})().catch(e => { console.log('CRASH', e.message.split('\n')[0]); process.exit(1); });
