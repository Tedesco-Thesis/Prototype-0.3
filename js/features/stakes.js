/* =====================================================================
   stakes.js — which aesthetics are MINE, and why, in the first person.

   A field guide that lists 33 things equally says "i have no stake in any of it".
   So: KEEP lists the aesthetics that stay on the desktop. Every other one moves into
   "the album: not mine", still openable, no icon.

   TWO THINGS ARE YOURS TO DO
     1. KEEP below is PROPOSED. It is chosen to match the thesis (authorship, provenance,
        slowness, what gets flattened). Change it to the ones you actually have a stake in.
     2. NOTES: write one to three sentences per kept aesthetic, first person.
        Empty notes show "i haven't written this one yet." on purpose. I have not written
        anything on your behalf about your own experience.
   Load AFTER subcultures.js.
===================================================================== */
(function () {
  'use strict';
  const S = window.ThirdSpaceNext;
  if (!S || !S.cultures) return;

  const PROPOSED = true;             // set to false once KEEP is really yours
  const KEEP = [
    'netart', 'demoscene', 'y2k', 'aero', 'vaporwave', 'softgrunge', 'desktopcore', 'liminal',
    'weirdcore', 'mallsoft', 'solarpunk', 'indieweb', 'lofi', 'obscura', 'carpets', 'arthoe',
  ];
  const NOTES = {
    // netart: 'i first saw this at …',
    // y2k: '',
  };

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // the 8 original "places" are practices of the web itself, not aesthetics: they always stay.
  const AESTHETIC = (c) => ['aesthetic', 'subculture', 'music', 'art', 'practice'].indexOf(c.kind) >= 0 && c.fam && !c.noKeep && !!c.build && c.from !== undefined && c.title && c.glyph && c.id &&
    !['webring', 'guestbook', 'homepage', 'journal', 'glitch', 'revival', 'feed', 'garden'].includes(c.id);

  S.cultures.forEach((c) => {
    if (!AESTHETIC(c)) return;
    c.stake = KEEP.indexOf(c.id) >= 0;
    if (!c.stake) { c.until = 0; return; }            // never an icon; still in the album
    if (!c.win) return;
    const body = c.win.querySelector('.winbody');
    if (!body || body.querySelector('.stake-note')) return;
    const n = (NOTES[c.id] || '').trim();
    const box = document.createElement('div');
    box.className = 'stake-note' + (n ? '' : ' empty');
    box.innerHTML = '<b>why i’m here</b>' + (PROPOSED && !n ? '' : '') + '<p>' + (n ? esc(n) : 'i haven’t written this one yet.') + '</p>';
    body.insertBefore(box, body.firstChild);
  });
  // the not-mine ones: say so once, in the same voice
  S.cultures.filter((c) => c.stake === false && c.win).forEach((c) => {
    const body = c.win.querySelector('.winbody');
    if (!body || body.querySelector('.stake-note')) return;
    const box = document.createElement('div');
    box.className = 'stake-note not-mine';
    box.innerHTML = '<b>not mine</b><p>i keep this in the album so the list stays honest. i didn’t make it and i don’t claim it.</p>';
    body.insertBefore(box, body.firstChild);
  });
  S.stakes = { KEEP, NOTES, PROPOSED };
})();
