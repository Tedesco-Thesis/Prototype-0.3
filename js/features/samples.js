/* =====================================================================
   samples.js — what the visitor finds already on the family computer.

   Two sources, both READ-ONLY and never saved to the visitor's browser:
   1. every person in people.js becomes a small page ("what this is") and a first-memory note.
      So when the six placeholders are replaced by real, consenting people, their pages appear here by themselves,
      credited the way they chose.
   2. EXTRAS: a few short letters, notes, a link and a drawing, written for this prototype by Isabella (not by the
      people). They are only shown while the person in that slot is still a PLACEHOLDER. They are invented, and the
      viewer says so every time ("fictional sample"). They are listed in the invented-content register in assets.js.

   An artifact: { id, origin, type, author{handle,consent,label}, year, title, body, fields, tags, refs, links, visibility,
                  revisions, events }. Same shape the store gives the visitor's own.
   ===================================================================== */
(function () {
  'use strict';
  const P = () => (window.People && People.list) || [];
  const cap = (s) => s;
  const lab = (p) => (window.People ? People.label(p) : p.handle);

  // invented extras, keyed by the handle of the person they belong to. Only used while that person is a placeholder.
  const EXTRAS = {
    vi: [{
      suffix: 'letter', type: 'letter', title: 'to whoever finds this', year: 2003,
      body: 'the first page i loved had a counter at the bottom that stopped at 212. i went back until it stopped answering. i still wonder who the 212th was, and whether they kept anything.',
      fields: { to: 'whoever finds this', attach: { kind: 'link', url: 'the long wait', why: 'a page i found through it, years later' } },
      tags: ['home-site', 'old-tech'], refs: ['the long wait'],
    }],
    oskar: [{
      suffix: 'memory', type: 'memory', title: 'sunday', year: 1999,
      body: "I spent Sunday fixing something that wasn't broken. The radio worked. It just didn't sound like my dad's.",
      tags: ['repair', 'no-reason', 'old-tech'], refs: [],
    }],
    rufus: [{
      suffix: 'link', type: 'link', title: 'a scanned timetable', year: 2001,
      body: 'the 4:15 never came. i kept the sheet anyway.',
      fields: { url: 'the long wait / timetable-2001', why: 'saved because it was wrong in a way i liked' }, tags: ['collecting', 'old-tech'], refs: ['the long wait'],
    }, {
      suffix: 'drawing', type: 'drawing', title: 'a bus stop, drawn badly', year: 2001,
      body: 'drawn on a grid, in four colours, on a school computer.',
      fields: { grid: ['000000000000', '000000333300', '000000300300', '000000333300', '000000010000', '000000010000', '000000010000', '000000010000', '022222222220', '020000000020', '020000000020', '111111111111'] },
      tags: ['no-reason', 'collecting'], refs: [],
    }],
    dee: [{
      suffix: 'note', type: 'note', title: 'one city', year: 2006,
      body: "pocket weather has one city and it is my window. i keep not finishing it. today the window says gray.",
      tags: ['unfinished', 'no-reason', 'weather'], refs: [],
    }],
    ana: [{
      suffix: 'note', type: 'note', title: 'day 41', year: 2008,
      body: 'day 41: one tomato. it is ugly. the log stays honest.',
      tags: ['unfinished', 'gardening', 'no-reason'], refs: [],
    }],
    mina: [{
      suffix: 'letter', type: 'letter', title: 'to oskar', year: 2010,
      body: "i read your note about the radio. mine doesn't sound like anyone's. i keep it on a shelf and turn it on when the house is too quiet.",
      fields: { to: 'oskar', attach: null, replyTo: 'S-oskar-memory' }, tags: ['repair', 'letters', 'old-tech'], refs: [],
      links: [{ to: 'S-oskar-memory', why: 'a reply: a different radio, the same quiet' }],
    }],
  };

  window.TS_SAMPLES = function () {
    const out = [];
    P().forEach((p) => {
      const label = lab(p), ph = !!p.placeholder;
      const author = { handle: p.handle, label, consent: p.consent, placeholder: ph };
      const origin = ph ? 'sample' : 'contributed';
      const base = { origin, author, visibility: 'public', revisions: [], keepHistory: false, events: [{ t: null, what: ph ? 'written for this prototype (fictional)' : 'shared with consent (' + p.consent + ')' }], binned: false };
      const hid = String(p.handle).toLowerCase();
      out.push(Object.assign({}, base, {
        id: 'S-' + hid + '-page', type: 'page', year: p.year, title: p.site || (label + "'s page"), body: p.line || '',
        fields: { bg: 'paper', blocks: [
          { id: 'line', label: 'what this is', text: p.line || '', vis: 'public' },
          { id: 'first', label: 'the first thing i remember doing online', text: p.firstMemory || '', vis: 'public' },
          { id: 'old', label: 'used to be called', text: (p.oldNames || []).join(', '), vis: 'public', skip: !(p.oldNames || []).length },
        ].filter((b) => !b.skip && b.text) },
        tags: (p.tags || []).slice(), refs: p.site ? [p.site] : [],
      }));
      if (p.firstMemory) out.push(Object.assign({}, base, {
        id: 'S-' + hid + '-first', type: 'memory', year: p.year, title: 'a first memory', body: p.firstMemory,
        fields: {}, tags: (p.tags || []).slice(0, 1), refs: [],
      }));
      if (ph) (EXTRAS[hid] || []).forEach((x) => out.push(Object.assign({}, base, {
        id: 'S-' + hid + '-' + x.suffix, type: x.type, year: x.year, title: x.title, body: x.body, fields: x.fields || {},
        tags: (x.tags || []).slice(), refs: (x.refs || []).slice(), links: x.links || [],
        events: [{ t: null, what: 'written for this prototype (fictional, invented by the maker)' }],
        invented: true,
      })));
    });
    // a sample that is anchored to the ones that come next: whoever mentions the same site, or says "repair"
    return out;
  };
  window.TS_FEATURED = () => { const s = window.TS_SAMPLES(); return (s.find((a) => a.type === 'letter') || s[0] || null); };
})();
