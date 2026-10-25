# Third Space 0.6 — "leave a trace"

0.5 was a good argument and a thin toy: the rooms forgot everything on reload and shared nothing.
0.6 gives the family computer a memory you can see, and a way to meet what other people left.
This file is the hand-off for the brief ("Prototype Evolution Brief"): journey, change log, technical notes, limitations, testing, next steps.

## 1. The journey (3–5 minutes, none of it required)

1. **Encounter.** The readme now opens with a quiet invitation: *someone left something on this computer.* "meet something someone left" opens a trace; "just look around" dismisses it. No name, no account, nothing to write.
2. **Interpret.** The trace window holds one artifact three ways, and follows the era bar: **1996 · the page** (the thing itself, in its maker's order, signed) · **2024 · the record** (what a platform would keep: a labelled fiction, nine plain rules, say no to any category) · **2030 · yours** (the same words with nothing filled in, who made it, its history, its connections, where it lives and how to take it back).
3. **Respond.** Write a note on it · connect it to something (with a reason, in your words) · keep it on the shelf · reply by letter · **leave it as it is** (changes and counts nothing).
4. **Create.** `my page` (blocks, each with its own visibility, an "unfinished" mark, an empty space left on purpose, optional prompts) · `letters` (to someone or to whoever finds it; attach a link or a 12×12 drawing; keep in the drawer, seal until the next visit, or put in the archive) · `the shelf` (drafts are revisions; "sign" makes a signed piece) · `the ledger › one sentence` (one sentence, seen as record / timeline / metric / category).
5. **See what happens next.** What you put "in the archive" appears in **lost & found › the stacks** — each result says exactly why it is there. A letter sealed for "the next visit" opens when you reload.
6. **Review.** **recycle bin › what you left**: everything kept, how big, in this browser only; withdraw from the archive, move to the bin, restore, delete forever, download a copy, clear everything.
7. **Return.** Follow a connection from any trace to another, with a back button that remembers where you were.

One thing carries the thesis through all of it: every artifact has an **author line**. Samples show a made-up person, yours says "you (no name given)", and the 2024 record always says `author: not retained`.

## 2. Change log

**Preserved:** the family-computer metaphor, every era skin, the vanishing desktop (the bin is the one icon that never leaves, so in 2024 *what you left* is still reachable), mote, the rituals, the next-web scoring, `people.js` as the only home for other people's names, VOICE.md.

**Wired in (these files were in the 0.5 zip but not loaded, and their markup was missing):** `store.js`, `samples.js`, `lenses.js`, `viewer.js`, `rooms.js`, `traces.css`. The page markup they expect was rebuilt in `index.html`.

**Added to `index.html`:** the trace window (`#win-trace`), the readme invitation, tabs: *the drawer* (letters), *one sentence* (ledger), *the stacks* (lost & found, now the first tab), *what you left* (recycle bin); page builder controls (background, invitation, empty space, tags, keep a version, open as trace, move to bin); toast; the sample/shelf lists.
**Changed in `script.js`:** the `PANES` registry and `windowTitles` only.
**Fixed in this pass:** the record lens printed a sentence twice (a title that is a shortened copy of the body was counted as text); the trace window's title bar sat under the era banner; windows on small screens now open below whatever height the era bar has.
**New:** the trace follows the era bar (before 2010 as a page, 2010–24 as a record, 2030 as "yours").
**Removed:** nothing. The old `receipt` tab, the three search speeds and *who knows?* are still there.

## 3. Technical notes

**One store, many views.** `js/core/store.js` is the only place a visitor's data lives: `localStorage` key `thirdspace.traces.v1` (an in-memory fallback if the browser refuses; the page tells you). Samples (`samples.js`) are generated from `people.js` plus invented extras, are read-only and are never written to storage.

**An artifact** (the same shape for samples and visitors): `id` (`S-…` sample, `TS-V-0001` visitor), `origin` (`sample` | `contributed` | `visitor`), `type` (page, letter, note, memory, link, work, drawing), `author {handle, consent}`, `year`, `title`, `body`, `fields`, `tags` (words its maker declared), `refs` (pages it mentions), `visibility` (`private` | `recipient` | `public`), `revisions[]`, `keepHistory`, `events[]`, `binned`, optional `about` (a note on another artifact) and `unlock` (the visit number a sealed letter opens).
**Relationships** are explicit edges `{from, to, why, t}` (yours) or `links` on a sample. Nothing is inferred from clicks.
**Representations are not stored.** `lenses.js` draws the page / record / yours views from the artifact each time. What the visitor decided *about* a representation (a category said no to) is stored on the artifact (`marks`), so it holds on every tab and in the ledger profile.
**Discovery logic** (`rooms.js › drawStacks`, `viewer.js › reasons`): four paths — words, declared words, pages mentioned, chance — ordered oldest first then by title. Each result lists why: the word is in the title / the text / its maker's tags; or "picked at random; nothing about you was used". Related items in a trace are listed by how many things they share (tags, mentioned pages, an explicit connection), then oldest first. No clicks, no popularity.
**Visibility.** `private` is invisible to every search and list. `public` is findable once any `unlock` has passed. `recipient` ("left for the next visit") is a local simulation: it seals now and opens when `Store.session` reaches `unlock`. A page is public if *any* block is public; only public blocks are copied into the searchable `body`, and the "preview as a visitor" shows exactly those.
**Deletion has four levels, and they do different things.** withdraw from the archive (keeps a private copy) · move to the bin (hidden everywhere, restorable) · delete forever (`Store.destroy`: the artifact, its revisions, its edges, notes about it, its place on the shelf and its marks are removed and storage is rewritten) · clear everything (`destroyAll` removes the key). Revisions can be switched off per artifact, which erases the ones already kept. Tested: after "clear everything" `localStorage` holds no artifacts.
**Order of scripts** (added after `stakes.js`, before `sound.js`): `store → samples → lenses → viewer → rooms`. `rooms.js` keeps the old global names mote relies on (`addBlock`, `removeBlock`, `updateBlock`, `renderBuild`, `renderFindings`, `setTab`, `renderPreview`, `syncCompare`, `onMailInput`, `sendMail`, `saveDraft`, `signWork`).
**All visitor text goes through `esc()`** before it is put in markup.

## 4. Known limitations (stated in the interface too)

- No server. Nothing is delivered to anyone; "letters" and "the archive" are local simulations. "A future visitor" is the same person on a later visit. The interface says so wherever it matters.
- "Delete forever" removes data from *this browser*. It cannot touch a downloaded export, a screenshot or anything outside the browser, and says that.
- The record is a fiction: nine keyword rules, an invented score and invented confidence numbers (listed in `about this computer › who made what`). It is not machine learning.
- The six people and their extra letters, notes, link and drawing are placeholders written for the prototype (labelled "fictional sample"). Replace them through `contribute.html` + `people.js`; real entries then appear on their own.
- The visitor has one page. Drawings can be attached to a letter but there is no standalone drawing room.
- The old 1991/1993 entry is untouched, so a first-time visitor reaches the desktop after the hypertext page. Add a skip link if you want testers on the desktop at once (or use `index.html#quick` then the 1996 button).
- Mote does not yet know about traces (it still speaks only from the bin and what you gave it).
- Not yet done: a screen-reader pass, sound listening, testing with people (the brief's most valuable step).

## 5. Testing report

Run with `node tests/journey.js` and `node tests/eras-sweep.js` (Playwright; no dependencies in the site itself).
- **journey.js** (32 checks, all pass): open a trace from the readme; all three lenses; note, connection, shelf; "leave it as it is" changes nothing in storage; public letter; sealed letter is sealed, not findable, then opens after reload; page with three blocks saved and public because one block is; a private block stays out of the searchable body; open the page as a trace; ledger preview and keep; rejecting a category is stored; stacks search returns results with reasons; storage panel; bin / restore / delete forever; persistence across reload (and visit count); 2024 keeps the data and leaves only the bin on the desktop; clear everything leaves no artifacts.
- **eras-sweep.js**: every era 1991→2030 with every window and every new tab open: no page errors. Enter opens a focused desktop icon; Escape closes a trace.
- Also checked by eye (1440×900 and 390×844): 1996, 2004, 2010, 2016, 2024, 2030 with a trace open; no horizontal scroll on mobile.
- Console note when offline: Google Fonts requests fail; the site falls back to system fonts.
- Bugs found and fixed: see section 2.

## 6. Next steps (most valuable first)

1. Put it in front of 3–5 people who don't know it. Watch where they click, ask what they remember. (Brief §14.)
2. Replace the placeholder people; then re-read every sample for consent and tone.
3. Write your notes for the aesthetics you keep (`stakes.js`), then decide whether *authorship* is the keystone (see `THIRD_SPACE_SESSION_NOTES.md` §5).
4. Let mote speak about traces ("you kept 2 things from other people; you left 1 in the archive") using only what is in the store.
5. A screen-reader pass on the trace window and the page builder; add a visible "skip to the desktop" on the 1991 page.
6. Real delivery (if ever): needs a backend and consent for strangers' words; the interface is built so the store could be swapped for one.
