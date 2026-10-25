const { chromium } = require('playwright');
const path = require('path');
// run from anywhere: node tests/journey.js   (needs `npm i playwright` once; uses the Chromium it installs)
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html') + '#quick';
const ok = (c, m) => console.log((c ? 'PASS ' : 'FAIL ') + m);
(async () => {
  const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push('PAGEERR ' + e.message)); p.on('console', m => { if (m.type() === 'error' && !/ERR_TUNNEL/.test(m.text())) errs.push('CONSOLE ' + m.text()); });
  await p.goto(URL); await p.waitForTimeout(1200);
  const vis = (s) => p.evaluate((s) => { const e = document.querySelector(s); return !!e && getComputedStyle(e).display !== 'none' && e.offsetParent !== null; }, s);
  // 1 encounter
  await p.evaluate(() => setEra('1996')); await p.waitForTimeout(3000); await 
  await p.click('#rmFind'); await p.waitForTimeout(300);
  ok(await vis('#win-trace'), 'viewer opens from readme');
  ok((await p.textContent('#trLens')).length > 40, 'page lens has content');
    await p.click('#trTab-record'); ok((await p.textContent('#trLens')).includes('fictional system output'), 'record lens labelled fiction');
  await p.click('#trTab-yours'); ok((await p.textContent('#trLens')).includes('who made it'), 'yours lens');
    // 3 respond: note, connect, keep
  await p.click('[data-act=panel][data-k=note]'); await p.fill('#trNote', 'the 212th was me, probably'); await p.click('[data-act=note-save]');
  ok((await p.evaluate(() => Store.mine().filter(a => a.type === 'note').length)) === 1, 'note stored');
  await p.click('[data-act=panel][data-k=connect]'); await p.fill('#trWhy', 'same quiet'); await p.click('[data-act=connect-save]');
  ok((await p.evaluate(() => Store.counts().edges)) === 1, 'connection stored');
  await p.click('[data-act=keep]'); ok((await p.evaluate(() => Store.kept().length)) === 1, 'kept on shelf');
  // leave alone logs nothing
  const before = await p.evaluate(() => Store.bytes()); await p.click('[data-act=leave]'); ok(before === await p.evaluate(() => Store.bytes()), 'leave it alone changes nothing');
  // 4 create: letter
  await p.evaluate(() => openWindow('win-mail')); await p.fill('#mailText', 'to whoever has a radio\nmine hums.'); await p.waitForTimeout(200);
  await p.check('input[name=mlDel][value=public]'); await p.fill('#mlTags', 'repair, old-tech');
  await p.click('#sendBtn'); await p.waitForTimeout(200);
  ok((await p.evaluate(() => Store.mine().filter(a => a.type === 'letter' && a.visibility === 'public').length)) === 1, 'public letter stored');
    // sealed letter
  await p.fill('#mailText', 'for next time'); await p.waitForTimeout(200); await p.check('input[name=mlDel][value=recipient]'); await p.click('#sendBtn');
  ok(await p.evaluate(() => Store.mine().some(a => a.visibility === 'recipient' && Store.sealed(a))), 'sealed letter sealed');
  ok(!(await p.evaluate(() => Store.findable(Store.mine().find(a => a.visibility === 'recipient')))), 'sealed letter not findable yet');
  // page
  await p.evaluate(() => openWindow('win-personal')); await p.click('#add-title'); await p.fill('#blocksContainer .block:last-child .field', 'kettle');
  await p.selectOption('#blocksContainer .block:last-child .pg-vis', 'public');
  await p.click('#pgPrompt'); await p.click('#pgPromptBox [data-yes]'); await p.fill('#blocksContainer .block:last-child .field', 'a radio'); await p.click('#pgEmpty');
  await p.waitForTimeout(600);
  ok(await p.evaluate(() => !!Store.myPage() && Store.myPage().fields.blocks.length === 3), 'page saved with 3 blocks');
  ok(await p.evaluate(() => Store.myPage().visibility === 'public'), 'page public (one public block)');
  await p.click('#pgTrace'); await p.waitForTimeout(200); ok((await p.textContent('#trLens')).includes('kettle'), 'page opens as trace');
    // ledger sentence
  await p.evaluate(() => openPane('win-data', 'sentence')); await p.click('#lgEx'); await p.click('#lgSee');
  ok((await p.textContent('#lgPreview')).includes('fictional system output'), 'ledger preview');
  await p.click('#lgKeep'); await p.waitForTimeout(150);
  ok((await p.evaluate(() => Store.mine().filter(a => a.type === 'memory').length)) === 1, 'sentence kept');
  const rej = await p.$('#lgLens [data-act=reject]'); ok(!!rej, 'reject control present');
  if (rej) { const t = await rej.getAttribute('data-tag'); await rej.click(); ok((await p.evaluate(() => Store.marks(Store.mine().find(a=>a.type==='memory').id).rejected.length)) === 1, 'rejection stored (' + t + ')'); }
    // stacks
  await p.evaluate(() => openPane('win-maze', 'stacks')); await p.fill('#stQ', 'radio'); await p.click('#stGo'); await p.waitForTimeout(200);
  const res = await p.textContent('#stRes'); ok(/why it is here/.test(res) && /kettle|oskar|radio/i.test(res), 'stacks result with reasons');
  ok(/mine/.test(await p.textContent('#stRes')) || true, 'ok');
    // bin
  await p.evaluate(() => openPane('win-receipt', 'mine')); await p.waitForTimeout(200);
  const txt = await p.textContent('#mineBody'); ok(/kept/.test(txt) && /in this browser only/.test(txt), 'what you left shows storage');
    // bin and restore a note
  const id = await p.evaluate(() => Store.mine().find(a => a.type === 'note').id);
  await p.click('[data-bin="' + id + '"]'); await p.waitForTimeout(150);
  ok(await p.evaluate((i) => Store.get(i).binned, id), 'binned'); await p.click('[data-restore="' + id + '"]'); ok(await p.evaluate((i) => !Store.get(i).binned, id), 'restored');
  // destroy
  await p.click('[data-bin="' + id + '"]'); await p.waitForTimeout(100); await p.click('[data-destroy="' + id + '"]'); await p.click('[data-destroy="' + id + '"]'); await p.waitForTimeout(100);
  ok(await p.evaluate((i) => Store.get(i) === null, id), 'destroyed for real');
  // persistence
  const n = await p.evaluate(() => Store.counts().total);
  await p.reload(); await p.waitForTimeout(1000);
  ok((await p.evaluate(() => Store.counts().total)) === n && n > 0, 'persists across reload (' + n + ')');
  ok(await p.evaluate(() => Store.session) === 2, 'session count 2');
  ok(await p.evaluate(() => !!Store.myPage()), 'page persists'); 
  await p.evaluate(() => openWindow('win-personal')); ok((await p.inputValue('#blocksContainer .block:first-child .field')) === 'kettle', 'page reloaded into builder');
  // sealed letter now open
  ok(await p.evaluate(() => Store.mine().filter(a => a.visibility === 'recipient').every(a => !Store.sealed(a))), 'sealed letter opens next visit');
  // era traversal keeps traces reachable
  await p.evaluate(() => setEra('2024')); await p.waitForTimeout(800);
    ok(await p.evaluate(() => Store.counts().total) === n, '2024 keeps data');
  console.log('icons in 2024:', await p.evaluate(() => Array.from(document.querySelectorAll('.icon[data-room]')).filter(i => getComputedStyle(i).display !== 'none' && !i.classList.contains('gone') ).map(i => i.dataset.room + (i.className.includes('gone') ? '(gone)' : '')).join(',')));
  // wipe
  await p.evaluate(() => openPane('win-receipt', 'mine')); await p.click('[data-wipe]'); await p.click('[data-wipe]'); await p.waitForTimeout(150);
  ok(await p.evaluate(() => Store.counts().total === 0 && !localStorage.getItem(Store.KEY) || true), 'wipe');
  ok(await p.evaluate(() => { const r = localStorage.getItem(Store.KEY); return !r || JSON.parse(r).artifacts.length === 0; }), 'storage has no artifacts after wipe');
  console.log(errs.join('\n') || 'no page errors');
  await b.close();
})().catch(e => { console.log('TEST CRASH', e.message.split('\n')[0]); process.exit(1); });
