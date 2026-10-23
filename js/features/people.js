/* =====================================================================
   people.js — the real people. The ONLY place names of other people live.

   Everything that used to be an invented webring name (vi, ana, rufus, dee, oskar)
   now reads from this list. The 6 entries below are PLACEHOLDERS (placeholder: true),
   so the site works today. Replace them with the 10-20 people who said yes.

   HOW TO ADD A PERSON
     1. send them contribute.html (a consent form that makes the entry for you)
     2. paste the block it gives you into PEOPLE below
     3. delete the placeholder entries (or leave a few until you have enough)
   Only list someone whose consent says "named" or "first name only".
   consent: 'named' | 'first' | 'anon'  — 'anon' shows as "someone, 2003".
   Nothing here is ever sent anywhere. It is all in this file.
===================================================================== */
(function () {
  'use strict';
  const PEOPLE = [
    { placeholder: true, handle: 'vi',    consent: 'first', year: 2003, firstMemory: 'a chat room on a school computer, after hours',   oldNames: ['moth_light'],  site: 'moth-light.net',    line: 'notes from a night-shift pharmacist. mostly about the quiet.' },
    { placeholder: true, handle: 'oskar', consent: 'first', year: 1999, firstMemory: 'a fan site for a band that no longer exists',     oldNames: ['kettle99'],    site: 'kettle & cable',    line: 'a repair diary. every post is something that was fixed, badly, then fixed again.' },
    { placeholder: true, handle: 'rufus', consent: 'first', year: 2001, firstMemory: 'a bus timetable i printed out and kept',          oldNames: ['rufus_ohio'],  site: 'the long wait',     line: 'bus timetables i love, with commentary.' },
    { placeholder: true, handle: 'dee',   consent: 'first', year: 2006, firstMemory: 'a flash game my cousin showed me',                oldNames: ['dee.d'],       site: 'pocket weather',    line: 'the forecast, but only for my window.' },
    { placeholder: true, handle: 'ana',   consent: 'first', year: 2008, firstMemory: 'a forum for people who grow tomatoes badly',      oldNames: ['ana_g'],       site: 'ugly tomatoes',     line: 'a garden log. the tomatoes are ugly. the log is honest.' },
    { placeholder: true, handle: 'mina',  consent: 'first', year: 2010, firstMemory: 'a letter i wrote to a stranger through a pen-pal site', oldNames: ['mina_w'], site: 'slow letters',      line: 'letters i send and the ones that come back.' },
  ];
  const label = (p) => p.consent === 'anon' ? 'someone, ' + p.year : p.handle;
  window.People = {
    list: PEOPLE,
    anyPlaceholder: PEOPLE.some((p) => p.placeholder),
    // the i-th person (wraps), as the name to show
    name: (i) => label(PEOPLE[((i % PEOPLE.length) + PEOPLE.length) % PEOPLE.length]),
    get: (i) => PEOPLE[((i % PEOPLE.length) + PEOPLE.length) % PEOPLE.length],
    ring: () => PEOPLE.map((p) => ({ site: p.site, by: label(p), line: p.line })),
    label,
  };
})();
