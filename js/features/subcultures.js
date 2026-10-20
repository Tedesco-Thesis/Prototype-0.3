/* =====================================================================
   subcultures.js — the field guide: ~30 more internet aesthetics and subcultures, each with
   its own desktop icon in the years it emerged or was most relevant.
   Load AFTER cultures.js and BEFORE early-eras.js (so the era chrome wraps these windows too).

   Source: two research notes (an academic-style field guide to internet aesthetics, and a visual-recipe
   guide). Fonts and hex values are the notes' design suggestions, not claims about the original communities.

   Every place is the same kind of object as the original eight (a window, an icon, a "keep this" button
   that records what you SAID) plus three small things to DO, each of which is itemised on the receipt:
     - take a colour from its palette
     - collect an asset into your own board
     - add a word to its shared glossary (and, where it has one, apply its look)
   The receipt window also gets an "interest profile": the interactions, sorted into six families, the way
   a platform would sort you. A field guide icon opens an index of every place, whether or not it has
   an icon in the current era.
===================================================================== */
(function () {
  'use strict';
  const S = window.ThirdSpaceNext;
  if (!S || !S.addCulture) { console.warn('subcultures.js: cultures.js did not load'); return; }
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const log = (a, b) => { if (typeof logReceipt === 'function') logReceipt(a, b); };

  /* ---------- families (the six groupings from the research note) ---------- */
  const FAM = {
    A: { name: 'old web & digital nostalgia',               ads: 'retro skins, nostalgia hardware, “vintage tech” resale' },
    B: { name: 'glitch, cyberculture & experimental media',  ads: 'streaming playlists, synths and plug-ins, neon decor' },
    C: { name: 'surreal, liminal & unsettling',              ads: 'horror games, ambient streams, “comfort” viewing' },
    D: { name: 'identity, fashion & emotional aesthetics',   ads: 'fashion, beauty, stationery, plant subscriptions' },
    E: { name: 'niche identity communities & music scenes',  ads: 'fandom merch, small-label music, collectibles' },
    F: { name: 'independence, collecting & resistance to optimization', ads: 'hosting, newsletters, notebooks, “digital detox”' },
  };
  S.FAMILIES = FAM;
  S.famName = (c) => (c && c.fam && FAM[c.fam] ? FAM[c.fam].name : 'unsorted');
  // the original eight, sorted into the same families
  Object.entries({ webring: 'F', guestbook: 'A', homepage: 'A', journal: 'D', glitch: 'B', revival: 'A', feed: 'F', garden: 'F' })
    .forEach(([id, f]) => { const c = S.cultures.find((x) => x.id === id); if (c) { c.fam = f; c.kind = c.kind || 'practice'; } });
  const orig = (id) => S.cultures.find((x) => x.id === id);
  if (orig('webring')) orig('webring').until = 2024;   // (archived by 2024)
  if (orig('guestbook')) orig('guestbook').until = 2010;
  if (orig('homepage')) orig('homepage').until = 2014;

  /* ---------- the roster ----------
     from / until: the eras (by year) in which the icon is on the desktop. `fx` picks a visual treatment.
     kind: aesthetic | music | subculture | practice | art (the note's own distinction). dark: 1 = dark page. */
  const D = [
    // ---- A. old web, retro technology -------------------------------------------------------
    { id: 'y2k', title: 'y2k futurism', glyph: '💿', label: 'y2k', from: 1999, until: 2006, years: '1999–2003', fam: 'A', kind: 'aesthetic', axis: 'seams', fx: 'chrome',
      font: "'Michroma','Orbitron',Arial,sans-serif", pal: ['#C8D7E8', '#00D9FF', '#B4FF39', '#F4A7FF', '#27213D'],
      did: 'an optimistic future imagined around the millennium: chrome, translucent plastic, orbital rings.',
      assets: ['chrome heart', 'CD', 'flip phone', 'wired earbuds', 'translucent iMac', 'orbital diagram'],
      concept: 'future.exe: a launch page for a fictional device, with navigation shaped like an orbit.',
      dir: 'a future imagined around 1999–2003: digital abundance, and uncertainty about the millennium.', trait: 'practice: the future is something you can see, and it is shiny.' },
    { id: 'cyberpunk', title: 'cyberpunk', glyph: '🌃', label: 'cyberpunk', from: 1999, until: 2004, years: '1980s–now', fam: 'B', kind: 'aesthetic', axis: 'visibility', fx: 'neon', dark: 1,
      font: "'Orbitron','Rajdhani','Space Mono',monospace", pal: ['#0B0B16', '#FF2E88', '#00F5FF', '#7733FF', '#E9E9F2'],
      did: 'high technology and urban decay: corporate power, surveillance, technological alienation.',
      assets: ['neon sign', 'surveillance camera', 'terminal window', 'city photograph', 'glitch overlay'],
      concept: 'a dense dark dashboard where every panel is watching another panel.',
      dir: 'technology as a source of power and conflict. (cyberprep keeps the gloss and drops the decay.)', trait: 'practice: naming who is watching.' },
    { id: 'netart', title: 'net.art', glyph: '🧭', label: 'net.art', from: 1996, until: 2004, years: '1995–now', fam: 'B', kind: 'art', axis: 'seams', fx: 'paper',
      font: "'Times New Roman',Arial,'Courier New',serif", pal: ['#F4F0E8', '#151515', '#FF3F79', '#5A55E7', '#B7D95D'],
      did: 'the browser, the hyperlink and the network used as the artistic material itself.',
      assets: ['hyperlink as a line', 'text as image', 'custom cursor', 'layered html', 'browser window'],
      concept: 'between.htm: a site about mediated communication where each click shows a different relationship to a machine.',
      dir: 'the web is the medium, not a delivery channel. how you navigate is part of the work.', trait: 'practice: navigation is authorship.' },
    { id: 'demoscene', title: 'demoscene', glyph: '🕹', label: 'demoscene', from: 1996, until: 1999, years: '1980s–now', fam: 'B', kind: 'subculture', axis: 'authorship', fx: 'scan', dark: 1,
      font: "'Share Tech Mono','IBM Plex Mono','Space Mono',monospace", pal: ['#080A12', '#00F5D4', '#FF3CAC', '#7B61FF', '#F4F4F5'],
      did: 'a computer-art scene built on technical skill and tight limits: real-time audiovisual shows in a few kilobytes.',
      assets: ['shader render', 'wireframe', 'vector grid', 'terminal readout', 'music-synced graphic'],
      concept: 'demo.exe: short procedural pieces, each shown with its code, hardware limits and production notes.',
      dir: 'skill, constraint and real-time work. the making is the point.', trait: 'practice: limits as a way of making.' },
    { id: 'otherkin', title: 'otherkin', glyph: '🐺', label: 'otherkin', from: 1996, until: 2004, years: '1990s–now', fam: 'E', kind: 'subculture', axis: 'visibility', fx: 'paper',
      font: "'Cormorant Garamond','IM Fell English',Lora,serif", pal: ['#23382F', '#A6B9A0', '#D6C5A6', '#8478A7', '#E8E1D4'],
      did: 'an online identity community: people who describe themselves as nonhuman, or as having a deep nonhuman identity.',
      assets: ['creature drawing', 'symbolic sigil', 'forest photograph', 'star chart', 'journal page'],
      concept: 'fieldnotes.of.self: a personal identity journal with optional symbolism and community-written definitions.',
      dir: 'shared language around personal experience. no single look, and not every member believes the same thing.', trait: 'practice: members define themselves, not the platform.' },
    { id: 'aero', title: 'frutiger aero', glyph: '🫧', label: 'aero', from: 2006, until: 2008, years: '2005–2013', fam: 'A', kind: 'aesthetic', axis: 'seams', fx: 'glass',
      font: "'Segoe UI','Source Sans 3',Lato,Arial,sans-serif", pal: ['#5BB5E5', '#69C45A', '#A0D8F0', '#FFFFFF', '#C5E86C'],
      did: 'glossy glass, blue skies, water and grass: technology and nature as if they were perfectly compatible.',
      assets: ['glass panel', 'water droplet', 'bubble', 'tropical fish', 'globe', 'leaf'],
      concept: 'edenOS: a fictional operating system that shows ecological information in glossy widgets.',
      dir: 'an optimistic, tactile interface. (frutiger eco adds solar panels and wind turbines.)', trait: 'practice: the interface wants to feel kind.' },
    { id: 'nightcore', title: 'nightcore', glyph: '🎧', label: 'nightcore', from: 2008, until: 2008, years: '2001–now', fam: 'B', kind: 'music', axis: 'provenance', fx: 'neon', dark: 1,
      font: "'Bebas Neue','Orbitron','Montserrat',sans-serif", pal: ['#FF3EB5', '#6B5BFF', '#29E7FF', '#17132B', '#FFFFFF'],
      did: 'sped-up, pitched-up edits of existing songs, shared as thumbnails and fan edits.',
      assets: ['waveform', 'equalizer', 'headphones', 'speed lines', 'BPM counter'],
      concept: 'nightdrive.mp3: an archive organised by tempo, mood and fan-made edit.',
      dir: 'transformation and circulation. editing someone else’s work becomes a shared language.', trait: 'practice: remixing is participation.' },
    { id: 'witchhouse', title: 'witch house', glyph: '🪦', label: 'witch house', from: 2008, until: 2008, years: '2008–2012', fam: 'E', kind: 'music', axis: 'memory', fx: 'grain', dark: 1,
      font: "'UnifrakturCook','Special Elite','Space Mono',serif", pal: ['#100D13', '#322337', '#68435F', '#A5A0AB', '#E8E0E8'],
      did: 'a dark electronic scene known for distorted vocals, occult-looking imagery and odd unicode lettering.',
      assets: ['grainy portrait', 'cross motif', 'waveform', 'cassette', 'dark floral photo'],
      concept: 'witchhouse.fm: a dark music archive with cryptic navigation.',
      dir: 'lo-fi imagery and obscurity as presentation. a scene you had to find.', trait: 'practice: being hard to find on purpose.' },
    { id: 'solarpunk', title: 'solarpunk', glyph: '🌻', label: 'solarpunk', from: 2008, until: 2008, years: '2008–now', fam: 'F', kind: 'aesthetic', axis: 'memory', fx: 'flat',
      font: "'Fraunces','Space Grotesk','DM Sans',serif", pal: ['#234B3A', '#7DAA78', '#E6D8A8', '#E7F1E2', '#D78D54'],
      did: 'a hopeful, ecological speculative aesthetic: technology organised around community and sustainability.',
      assets: ['solar panel', 'community garden', 'greenhouse', 'wind turbine', 'botanical drawing'],
      concept: 'a city map where every building shows what it gives back.',
      dir: 'technology for collective well-being, not only consumer novelty.', trait: 'practice: designing for the commons.' },
    // ---- 2010–13 -----------------------------------------------------------------------------
    { id: 'vaporwave', title: 'vaporwave', glyph: '🗿', label: 'vaporwave', from: 2010, until: 2014, years: '2010–now', fam: 'B', kind: 'music', axis: 'provenance', fx: 'grid', dark: 1,
      font: "'Outfit','Montserrat','Space Grotesk',sans-serif", pal: ['#FF71CE', '#01CDFE', '#B967FF', '#05FFA1', '#24103F'],
      did: 'a music and visual culture that remixes corporate imagery, mall music and obsolete graphics. a critique, or just a mood.',
      assets: ['greek bust', 'old computer window', 'CD', 'obsolete logo', 'sunset grid', 'palm tree'],
      concept: 'mallsoft.fm: a fictional shopping-mall radio archive with an old store directory.',
      dir: 'consumer nostalgia and the strange residue of corporate media, transformed by remix.', trait: 'practice: remix as critique.' },
    { id: 'seapunk', title: 'seapunk', glyph: '🐬', label: 'seapunk', from: 2010, until: 2010, years: '2011–2013', fam: 'B', kind: 'music', axis: 'provenance', fx: 'glass', dark: 1,
      font: "'Audiowide','Orbitron','Arial Rounded MT Bold',sans-serif", pal: ['#00E5D4', '#00A9FF', '#B5FFEE', '#FF62C0', '#071E54'],
      did: 'an early-2010s internet microculture: dolphins, turquoise water, neon gradients and early 3D graphics. it began as a joke.',
      assets: ['low-poly dolphin', 'shell', 'pixel wave', 'trident', 'bubble'],
      concept: 'abyss.fm: an underwater radio station with translucent menus.',
      dir: 'a niche joke that became a visual language, then a fashion trend.', trait: 'practice: a joke becoming a world.' },
    { id: 'softgrunge', title: 'soft grunge & 2014 tumblr', glyph: '🥀', label: 'soft grunge', from: 2010, until: 2014, years: '2012–2015', fam: 'D', kind: 'aesthetic', axis: 'visibility', fx: 'grain',
      font: "'Special Elite','Courier Prime',Lora,serif", pal: ['#2B292B', '#71666A', '#A63F46', '#C6B7B0', '#E8E1DE'],
      did: 'polaroids, muted colours and reblogged images: a feed that felt like a personal diary.',
      assets: ['polaroid', 'handwritten note', 'concert ticket', 'pressed flower', 'cassette', 'torn paper'],
      concept: 'diary_2014: a chronological mood archive of music, photographs and quotes.',
      dir: 'curated emotional identity, music fandom, and the wish to make a feed feel intimate.', trait: 'practice: a feed as a diary.' },
    { id: 'pastelgoth', title: 'pastel goth', glyph: '🦇', label: 'pastel goth', from: 2010, until: 2010, years: '2012–now', fam: 'D', kind: 'aesthetic', axis: 'visibility', fx: 'flat',
      font: "'UnifrakturCook','Bodoni Moda','DM Sans',serif", pal: ['#E8B7D0', '#C9B6E4', '#F3EAF1', '#222027', '#A7D8D2'],
      did: 'cute and macabre at once: skulls and bats in pastel pinks, lace and ribbons.',
      assets: ['cartoon skull', 'black bow', 'bat', 'lace texture', 'pastel heart', 'sticker'],
      concept: 'graveyard.girl: a sticker collection with pastel backgrounds and dark borders.',
      dir: 'a deliberate contradiction between sweet and dark, often expressed through fashion.', trait: 'practice: contradiction as style.' },
    { id: 'studyblr', title: 'studyblr & plant mom', glyph: '📚', label: 'studyblr', from: 2010, until: 2014, years: '2013–now', fam: 'D', kind: 'practice', axis: 'pace', fx: 'paper',
      font: "'Nunito Sans','Lora','DM Mono',sans-serif", pal: ['#E6DCCB', '#A7C4A0', '#E6B6B2', '#D5B9E8', '#454A43'],
      did: 'notebooks, schedules and houseplants: an aesthetic that grew around an activity rather than a look.',
      assets: ['notebook scan', 'highlighter', 'leaf drawing', 'plant label', 'checklist', 'handwritten note'],
      concept: 'small-rituals: a dashboard for study sessions, plant care and reading notes.',
      dir: 'the everyday practice of studying or caring for plants becomes a shareable ritual.', trait: 'practice: a routine made visible.' },
    { id: 'soulbonders', title: 'soulbonders', glyph: '🕯', label: 'soulbonders', from: 2010, until: 2010, years: '2010s–now', fam: 'E', kind: 'subculture', axis: 'visibility', fx: 'paper',
      font: "'Lora','Cormorant Garamond','Courier Prime',serif", pal: ['#E7D7D0', '#B7C5DA', '#F5EBDD', '#655D79', '#393540'],
      did: 'people who describe close relationships with fictional characters they experience as independent personalities.',
      assets: ['character reference card', 'letter', 'journal page', 'annotated screenshot', 'fan drawing'],
      concept: 'character_archive: a private-by-default collection of letters, memories and notes.',
      dir: 'a private archive, not a commercial fan site. experiences are not uniform across the community.', trait: 'practice: some things are kept private on purpose.' },
    { id: 'metro', title: 'flat design & metro', glyph: '🟦', label: 'flat / metro', from: 2010, until: 2014, years: '2010–now', fam: 'A', kind: 'aesthetic', axis: 'seams', fx: 'flat',
      font: "'Segoe UI','Open Sans',Inter,sans-serif", pal: ['#00A4EF', '#7FBA00', '#F25022', '#FFB900', '#FFFFFF'],
      did: 'glossy realism gives way to square tiles, bold colour fields and simple pictograms.',
      assets: ['square tile', 'pictogram', 'colour field', 'geometric symbol', 'flat icon'],
      concept: 'a modular grid where nothing looks like a button because everything is one.',
      dir: 'efficiency, legibility and standardisation: the transition away from ornament.', trait: 'practice: less ornament, more sameness.' },
    // ---- 2014 ---------------------------------------------------------------------------------
    { id: 'futurefunk', title: 'future funk', glyph: '🪩', label: 'future funk', from: 2014, until: 2014, years: '2012–now', fam: 'B', kind: 'music', axis: 'provenance', fx: 'grid',
      font: "'Bowlby One SC','Outfit','Bebas Neue',sans-serif", pal: ['#FF4F9A', '#FFB45C', '#45D7E8', '#4B2E83', '#FFF0D8'],
      did: '80s japanese city-pop, sampled and rebuilt as dance music with anime sleeves and disco lighting.',
      assets: ['cassette', 'disco ball', 'sunburst', 'music sleeve', 'vintage speaker'],
      concept: 'citypop.club: a fictional online record store and listening room.',
      dir: 'nostalgia reconstructed through sampling and internet circulation.', trait: 'practice: sampling as a way of remembering.' },
    { id: 'arthoe', title: 'art hoe', glyph: '🎨', label: 'art hoe', from: 2014, until: 2014, years: '2014–now', fam: 'D', kind: 'aesthetic', axis: 'authorship', fx: 'paper',
      font: "'Karla','DM Sans','Lora',sans-serif", pal: ['#F4D35E', '#F28C8C', '#75B9A7', '#B9A5E8', '#F6F0E4'],
      did: 'sketchbooks, paintings, flowers and museum visits: self-expression through making, looking and collecting.',
      assets: ['sunflower', 'pencil', 'museum ticket', 'sketchbook scan', 'art reproduction'],
      concept: 'artclub.jpg: an online sketchbook with gallery visits and notes about materials.',
      dir: 'more than a yellow-and-sunflower palette: it grows out of the practice of making.', trait: 'practice: making and looking, then sharing.' },
    { id: 'healthgoth', title: 'health goth', glyph: '🏃', label: 'health goth', from: 2014, until: 2014, years: '2013–2016', fam: 'E', kind: 'aesthetic', axis: 'visibility', fx: 'flat',
      font: "'Archivo','Helvetica Neue','Space Grotesk',sans-serif", pal: ['#101114', '#34383D', '#E7E8EA', '#FFFFFF', '#8A9DA8'],
      did: 'goth references combined with sportswear: monochrome technical fabrics and a futuristic athletic image.',
      assets: ['performance wear', 'mesh texture', 'athletic footwear', 'gym architecture', 'biometric graphic'],
      concept: 'body.system: a fictional technical-sportswear editorial with product specifications.',
      dir: 'a fashion and music aesthetic. not a unified fitness philosophy.', trait: 'practice: a look built from two worlds.' },
    { id: 'livingdolls', title: 'living dolls', glyph: '🎎', label: 'living dolls', from: 2014, until: 2014, years: '2010s–now', fam: 'E', kind: 'subculture', axis: 'visibility', fx: 'soft',
      font: "'Bodoni Moda','Cormorant Garamond','Playfair Display',serif", pal: ['#F3D9DF', '#FFF7F0', '#B8A5C9', '#A65F75', '#3E3340'],
      did: 'doll-inspired self-fashioning: porcelain styling, lace and ribbons, and a tension between person and performance.',
      assets: ['vintage doll', 'ribbon', 'lace', 'doll box', 'studio portrait'],
      concept: 'porcelain.studio: a fashion archive arranged like illustrated doll boxes.',
      dir: 'a label that covers different communities. it says nothing about any one person.', trait: 'practice: constructing how you appear.' },
    // ---- 2016–19 ------------------------------------------------------------------------------
    { id: 'weirdcore', title: 'weirdcore & dreamcore', glyph: '👁', label: 'weirdcore', from: 2016, until: 2016, years: '2017–now', fam: 'C', kind: 'aesthetic', axis: 'seams', fx: 'soft',
      font: "Arial,'Comic Sans MS','Space Mono','Quicksand',sans-serif", pal: ['#A8B7D1', '#C8C1D9', '#D9D5A6', '#FF6B6B', '#1D1C29'],
      did: 'familiar images in unfamiliar combinations. weirdcore unsettles; dreamcore is softer and more wistful.',
      assets: ['blurry cloud', 'empty playground', 'distorted eye', 'pixelated text', 'door in a field', 'balloon'],
      concept: 'somewhere.unknown: a map of places that cannot be reached twice.',
      dir: 'the feeling of recognising something you cannot place. the instability of memory.', trait: 'practice: showing that memory is unreliable.' },
    { id: 'liminal', title: 'liminal spaces & the backrooms', glyph: '🚪', label: 'liminal', from: 2016, until: 2024, years: '2019–now', fam: 'C', kind: 'subculture', axis: 'discovery', fx: 'scan',
      font: "Arial,Helvetica,'IBM Plex Mono',sans-serif", pal: ['#D9D3C5', '#B9C5C0', '#C6B85C', '#747B76', '#24241F'],
      did: 'empty places made for people: corridors, waiting rooms, malls after closing. the backrooms adds shared fiction.',
      assets: ['hotel corridor', 'empty school', 'parking garage', 'waiting room', 'room-number label', 'floor plan'],
      concept: 'level_001/: a building directory where navigation slowly becomes unreliable.',
      dir: 'the eerie sensation of a place with no one in it. collaborative horror built from shared references.', trait: 'practice: telling a story together.' },
    { id: 'horror', title: 'digital & analog horror', glyph: '📼', label: 'analog horror', from: 2016, until: 2016, years: '2015–now', fam: 'C', kind: 'aesthetic', axis: 'provenance', fx: 'scan', dark: 1,
      font: "'VT323','Share Tech Mono','Courier New',monospace", pal: ['#050505', '#A4C639', '#C9C2B5', '#9B1C31', '#3D4548'],
      did: 'fake broadcasts, error screens and damaged recordings: fear from familiar information systems becoming untrustworthy.',
      assets: ['broadcast ID', 'timestamp overlay', 'cassette label', 'surveillance frame', 'error message'],
      concept: 'broadcast_07: a public-information archive with contradictory alerts and an unreliable transcript.',
      dir: 'the official-looking presentation is what makes it unsettling.', trait: 'practice: doubting the source.' },
    { id: 'deepfried', title: 'surreal & deep-fried memes', glyph: '💥', label: 'deep-fried', from: 2016, until: 2016, years: '2015–2018', fam: 'C', kind: 'practice', axis: 'provenance', fx: 'glitch',
      font: "Impact,'Arial Black','Comic Sans MS',sans-serif", pal: ['#FFEA00', '#FF2D55', '#00E5FF', '#7D00FF', '#111111'],
      did: 'memes that get stranger with every repost: compressed, over-sharpened, covered in text.',
      assets: ['reaction image', 'distorted emoji', 'low-res crop', 'fake notification', 'layered screenshot'],
      concept: 'meme_rotator: one image’s successive edits shown as a family tree.',
      dir: 'humour through repetition and degradation. you need to know where it circulates to get it.', trait: 'practice: context as the joke.' },
    { id: 'baddie', title: 'baddie', glyph: '💄', label: 'baddie', from: 2016, until: 2016, years: '2016–now', fam: 'D', kind: 'aesthetic', axis: 'visibility', fx: 'chrome',
      font: "'Anton','Bebas Neue','Montserrat',sans-serif", pal: ['#F42A8B', '#17151B', '#D7B6C7', '#B7A3FF', '#FFFFFF'],
      did: 'glossy beauty photography and bold headlines: confident, deliberate self-presentation shaped by social visibility.',
      assets: ['makeup compact', 'sunglasses', 'rhinestone', 'chrome star', 'beauty cutout'],
      concept: 'gloss.club: a fictional beauty editorial with image-led cards.',
      dir: 'self-presentation shaped by beauty culture and being seen. a look, not a belief system.', trait: 'practice: being seen on purpose.' },
    { id: 'desktopcore', title: 'desktopcore', glyph: '🖥', label: 'desktopcore', from: 2016, until: 2024, years: '2018–now', fam: 'A', kind: 'aesthetic', axis: 'authorship', fx: 'scan',
      font: "'VT323','Pixelify Sans',Tahoma,monospace", pal: ['#C0C0C0', '#FFFFFF', '#000080', '#008080', '#808080'],
      did: 'a new fascination with old operating systems: crt monitors, dialog boxes, desktop icons and pixelated windows.',
      assets: ['folder icon', 'floppy disk', 'trash can', 'dialog box', 'pixel cursor'],
      concept: 'archive://desktop: a fictional computer you open folder by folder. (this site is a small example.)',
      dir: 'nostalgia for a computer that felt personal, and a space you could organise yourself.', trait: 'practice: the computer as a place.' },
    { id: 'mallsoft', title: 'signalwave & mallsoft', glyph: '🛗', label: 'mallsoft', from: 2016, until: 2016, years: '2014–now', fam: 'B', kind: 'music', axis: 'memory', fx: 'grain',
      font: "'IBM Plex Mono','Courier New',Arial,monospace", pal: ['#D5C7B7', '#7D8792', '#27334A', '#BBA5D8', '#E6A47C'],
      did: 'empty shopping malls, old signage and vhs artefacts, made into nostalgia through ambient sound.',
      assets: ['escalator', 'store directory', 'crt television', 'empty food court', 'analog clock'],
      concept: 'mall_archive/: a searchable archive of empty malls and forgotten retail soundscapes.',
      dir: 'public and commercial spaces turned uncanny, then comforting.', trait: 'practice: preserving what was meant to be forgotten.' },
    { id: 'carpets', title: 'airport-carpet enthusiasts', glyph: '🧳', label: 'carpets', from: 2016, until: 2016, years: '2010s–now', fam: 'F', kind: 'subculture', axis: 'discovery', fx: 'flat',
      font: "'DIN','IBM Plex Sans','Space Mono',sans-serif", pal: ['#1E6D69', '#54476D', '#C5B69A', '#D8D7CF', '#29353B'],
      did: 'people who photograph, compare and catalogue the carpet patterns of airports around the world.',
      assets: ['carpet swatch', 'airport code', 'terminal map', 'pattern close-up', 'location tag'],
      concept: 'carpet.world: a community atlas where visitors submit patterns and identify airports.',
      dir: 'an ordinary object becomes a subject of shared expertise and affection. attention as a collective act.', trait: 'practice: caring about something very small, together.' },
    // ---- 2020–26 ------------------------------------------------------------------------------
    { id: 'gorecore', title: 'gorecore & gloomcore', glyph: '🥀', label: 'gloomcore', from: 2024, until: 2024, years: '2020–now', fam: 'D', kind: 'aesthetic', axis: 'visibility', fx: 'grain', dark: 1,
      font: "'Oswald','Special Elite','Cormorant Garamond',serif", pal: ['#171719', '#493B43', '#7B2936', '#9D9298', '#D5C6C9'],
      did: 'dark emotional expression. gloomcore is melancholy and heaviness; gorecore can involve body horror. they are not synonyms.',
      assets: ['dead flower', 'scratched photograph', 'dark forest', 'torn paper', 'distressed texture'],
      concept: 'gloom_archive: a dark visual diary arranged by mood.',
      dir: 'decide whether it is melancholy, confrontation or horror. they lead to different choices.', trait: 'practice: naming a hard feeling.' },
    { id: 'coquette', title: 'coquette', glyph: '🎀', label: 'coquette', from: 2024, until: 2024, years: '2021–now', fam: 'D', kind: 'aesthetic', axis: 'visibility', fx: 'soft',
      font: "'Cormorant Garamond','Bodoni Moda','Playfair Display',serif", pal: ['#F5DCE5', '#FFF8F5', '#B88B9A', '#D8C5B1', '#6E4657'],
      did: 'ribbons, bows, lace and pearls: romanticised femininity and carefully styled self-presentation.',
      assets: ['ribbon', 'lace border', 'rose', 'pearl', 'perfume bottle', 'ballet photo'],
      concept: 'ribbon.html: a digital wardrobe and visual diary.',
      dir: 'a style that can carry different cultural and political readings. it is not one ideology.', trait: 'practice: styling as a diary.' },
    { id: 'indieweb', title: 'personal-web revival', glyph: '🔓', label: 'indie web', from: 2024, until: 2024, years: '2013–now', fam: 'F', kind: 'practice', axis: 'authorship', fx: 'paper',
      font: "'DM Mono','Space Mono',Verdana,Georgia,monospace", pal: ['#F4EBDD', '#253D5B', '#D95D39', '#83A59B', '#1F1F1F'],
      did: 'hand-coded pages, webrings, link directories and small badges: independent publishing, away from platforms.',
      assets: ['88×31 button', 'link directory', 'hand-drawn site map', 'custom cursor', 'guestbook'],
      concept: 'thirdspace.net: independently authored rooms for correspondence, art and shared resources.',
      dir: 'ownership and small communities. a retro theme is not the same as an anti-platform practice.', trait: 'practice: owning the page.' },
    { id: 'lofi', title: 'lo-fi reverie & algorithm dropouts', glyph: '📷', label: 'lo-fi', from: 2024, until: 2024, years: '2020s', fam: 'F', kind: 'aesthetic', axis: 'pace', fx: 'grain',
      font: "'IBM Plex Mono','Courier Prime','DM Sans',monospace", pal: ['#D8D0C2', '#898F87', '#A8B7C8', '#B98E77', '#343434'],
      did: 'grainy photos, old devices and modest interfaces: an interest in slower, less polished digital life.',
      assets: ['digital-camera photo', 'scanned notebook', 'old keyboard', 'cassette player', 'handwritten note'],
      concept: 'slow.network: chronological updates, no engagement score, no recommendation feed.',
      dir: 'interpretive trend labels, not proof of a unified movement.', trait: 'practice: choosing less polish.' },
    { id: 'obscura', title: 'internet obscura', glyph: '🗂', label: 'obscura', from: 2024, until: 2024, years: '2020s', fam: 'F', kind: 'art', axis: 'discovery', fx: 'paper',
      font: "'IBM Plex Mono','Space Mono','Source Serif 4',serif", pal: ['#F1EEE6', '#222B33', '#D5BBA3', '#8B9A8B', '#C45D48'],
      did: 'an archive of niche online communities: a catalogue that makes obscure things legible without flattening them.',
      assets: ['specimen card', 'archival label', 'classification number', 'contact sheet', 'cross-reference'],
      concept: 'obscura.index: a searchable atlas of 100 niche communities, with visual language, practices and history.',
      dir: 'classification is an editorial act: what you include and how you name it shapes the collection.', trait: 'practice: documenting without taming.' },
  ];
  const KIND_WORD = { aesthetic: 'visual aesthetic', music: 'music culture', subculture: 'subculture', practice: 'practice', art: 'art practice' };

  /* ---------- the generic window: one shape, ten treatments ---------- */
  const lum = (h) => { const n = parseInt(h.slice(1), 16); return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255); };
  const handle = () => (S.me && S.me.handle) || 'anon';
  const st = {};   // per culture: { collected:Set, colours:Set, terms:[] }

  /* ---------- the page (each culture has its own template in js/features/pages/) ----------
     the template decides the layout and markup; this file only wires up the three things to DO
     (take a colour, collect an asset, add a word) plus the "turn it up" toggle, and logs each to the receipt. */
  function helpers(c) {
    const i = c.concept.indexOf(':');
    const h = {
      c, e: esc,
      title: esc(c.title), did: esc(c.did), years: esc(c.years), kind: esc(KIND_WORD[c.kind] || c.kind),
      cname: esc(i > -1 ? c.concept.slice(0, i) : c.concept), ctext: esc(i > -1 ? c.concept.slice(i + 1).trim() : ''),
      trait: esc(c.trait),
    };
    h.pal = (fn) => '<div class="sc-pal">' + c.pal.map((x, k) =>
      '<button class="sc-sw" data-h="' + x + '" style="--c:' + x + '" title="' + x + '"><span>' + (fn ? fn(x, k) : x.slice(1)) + '</span></button>').join('') + '</div>';
    h.assets = (fn) => '<div class="sc-assets">' + c.assets.map((a, k) =>
      '<button class="sc-chip" data-a="' + esc(a) + '">' + (fn ? fn(esc(a), k) : esc(a)) + '</button>').join('') + '</div>';
    h.fx = () => '<button class="sc-btn sc-fxbtn"></button>';
    h.count = () => '<span class="sc-count"></span>';
    h.gloss = (ph, btn) => '<span class="sc-addrow"><input class="sc-in" maxlength="40" placeholder="' + esc(ph) + '"><button class="sc-btn sc-add">' + esc(btn || 'add') + '</button></span>';
    h.terms = () => '<div class="sc-terms"></div>';
    // your own image for this aesthetic: h.asset('hero') or h.asset('graphic'). declared in js/core/assets.js; '' if none yet.
    h.asset = (role, cls) => { h._assetUsed = true; return window.Assets ? Assets.img('culture.' + c.id + '.' + (role || 'hero'), cls || 'sc-asset') : ''; };
    return h;
  }

  function build(c) {
    return function (stage, api, ctx) {
      const me = (st[c.id] = { collected: new Set(), colours: new Set(), terms: [] });
      const win = stage.closest('.window');
      const page = (window.SC_PAGES || {})[c.id];
      const sorted = c.pal.slice().sort((a, b) => lum(a) - lum(b));
      const dark = !!c.dark;
      // palette + font are set on the window so the whole page (not just the stage) can use them
      const set = (k, v) => win.style.setProperty(k, v);
      c.pal.forEach((x, k) => set('--p' + (k + 1), x));
      set('--bg', dark ? sorted[0] : sorted[4]); set('--ink', dark ? sorted[4] : sorted[0]); set('--acc', dark ? sorted[3] : sorted[2]);
      set('--font', c.font);
      win.classList.add('sc-win'); win.dataset.sc = c.id;
      stage.classList.add('sc-stage');
      if (page && page.w) win.style.width = page.w + 'px';
      const fxLabels = (page && page.fx) || ['turn it up', 'turn it down'];
      const hh = helpers(c);
      stage.innerHTML = page ? page.html(hh) : '<p>' + esc(c.did) + '</p>';
      // if the template did not place the hero image itself, put it at the top so a dropped-in file always shows
      if (!hh._assetUsed && window.Assets && Assets.has('culture.' + c.id + '.hero')) stage.insertAdjacentHTML('afterbegin', Assets.img('culture.' + c.id + '.hero', 'sc-asset sc-asset-hero'));

      const count = () => stage.querySelectorAll('.sc-count').forEach((el) => { el.textContent = 'collected ' + me.collected.size + ' · colours ' + me.colours.size + ' · words ' + me.terms.length; });
      stage.querySelectorAll('.sc-sw').forEach((b) => {
        b.onclick = () => { const h = b.dataset.h; if (!me.colours.has(h)) { me.colours.add(h); b.classList.add('got'); api.act('colour', 0.5, 'took ' + h.toUpperCase() + ' from the palette'); } count(); };
      });
      stage.querySelectorAll('.sc-chip').forEach((b) => {
        b.onclick = () => {
          const a = b.dataset.a;
          if (me.collected.has(a)) { me.collected.delete(a); b.classList.remove('got'); } else { me.collected.add(a); b.classList.add('got'); api.act('collect', 1, 'collected \u201c' + a + '\u201d'); }
          count();
        };
      });
      const fxb = $('.sc-fxbtn', stage);
      if (fxb) {
        fxb.textContent = fxLabels[0];
        fxb.onclick = () => {
          const on = win.classList.toggle('fx-on');
          fxb.textContent = fxLabels[on ? 1 : 0];
          if (on) api.act('look', 0.5, 'turned up its look (' + fxLabels[0] + ')');
        };
      }
      const addTerm = () => {
        const inp = $('.sc-in', stage), t = inp.value.trim(); if (!t) return;
        me.terms.unshift(t); inp.value = '';
        const box = $('.sc-terms', stage);
        if (box) box.innerHTML = me.terms.slice(0, 4).map((x) => '<span>\u201c' + esc(x) + '\u201d <i>' + esc(handle()) + '</i></span>').join('');
        api.act('term', 2, 'added \u201c' + t + '\u201d to the shared glossary');
        count();
      };
      const addb = $('.sc-add', stage);
      if (addb) addb.onclick = addTerm;
      const inp = $('.sc-in', stage);
      if (inp) inp.addEventListener('keydown', (e) => { if (e.key === 'Enter') addTerm(); });
      count();
    };
  }

  D.forEach((c) => { c.build = build(c); S.addCulture(c); });

  /* ---------- the interest profile (on the receipt) ----------
     what the interactions add up to, the way a platform would sort you */
  function profile() {
    const fam = {}; let total = 0;
    S.cultures.forEach((c) => {
      const w = (S.acts[c.id] || 0) + ((S.dwell[c.id] || 0) >= 20 ? 1 : 0) + (S.keptBy[c.id] ? 1 : 0);
      if (!w || !c.fam) return;
      fam[c.fam] = (fam[c.fam] || 0) + w; total += w;
    });
    const top = Object.keys(fam).sort((a, b) => fam[b] - fam[a]);
    const best = S.cultures.filter((c) => (S.acts[c.id] || 0) > 0).sort((a, b) => (S.acts[b.id] || 0) - (S.acts[a.id] || 0))[0];
    return { fam, top, total, best };
  }
  const rb = $('#win-receipt .winbody');
  let cat = null;
  if (rb) {
    cat = document.createElement('div');
    cat.className = 'rc-cat';
    const sum = $('.receipt-summary', rb);
    (sum ? sum.after(cat) : rb.appendChild(cat));
  }
  S.renderCatalog = function () {
    if (!cat) return;
    const P = profile();
    if (!P.total) { cat.innerHTML = '<b>interest profile</b><div class="rc-none">nothing sorted yet. open an aesthetic or a subculture and do something there.</div>'; return; }
    cat.innerHTML =
      '<b>interest profile</b> <small>(inferred · not asked for)</small>' +
      P.top.slice(0, 3).map((k) => '<div class="rc-row"><span>' + esc(FAM[k].name) + '</span><i style="width:' + Math.round(100 * P.fam[k] / P.total) + '%"></i><em>' + Math.round(100 * P.fam[k] / P.total) + '%</em></div>').join('') +
      '<div class="rc-seg">segment: <b>“' + esc(P.best ? P.best.title : FAM[P.top[0]].name) + '”</b> · likely ad categories: ' + esc(FAM[P.top[0]].ads) + '.</div>';
  };
  S.renderCatalog();
  document.addEventListener('click', () => setTimeout(S.renderCatalog, 0));

  /* ---------- the field guide: every place, with or without an icon ---------- */
  const fgBody = '<div class="kicker">FIELD GUIDE · INTERNET AESTHETICS & SUBCULTURES</div><h2 class="roomtitle">field guide</h2>' +
    '<div class="q">an aesthetic is how something looks. a subculture is how a community behaves. a practice is what people make with the network itself. they overlap. this is every place on the desktop, by family.</div><div class="fg-list"></div>' +
    '<div class="cult-foot"><span class="keepnote">classification is an editorial act: what is included, and how it is named, shapes the collection.</span></div>';
  const fgWin = S.makeWindow('win-fieldguide', 'field guide', 540, fgBody);
  function drawGuide() {
    const y = typeof currentEra !== 'undefined' ? parseInt(currentEra, 10) : 1996;
    const html = Object.keys(FAM).map((k) => {
      const rows = S.cultures.filter((c) => c.fam === k).sort((a, b) => a.from - b.from);
      return '<div class="fg-fam"><h4>' + esc(FAM[k].name) + '</h4>' + rows.map((c) => {
        const here = y >= c.from && (c.until == null || y <= c.until);
        const seen = S.opened[c.id] ? ' seen' : '';
        return '<button class="fg-row' + (here ? ' here' : '') + seen + '" data-id="' + c.id + '"><span class="fg-g">' + c.glyph + '</span><span class="fg-t">' + esc(c.title) + '</span><span class="fg-y">' + esc(c.years) + '</span><span class="fg-k">' + esc(KIND_WORD[c.kind] || c.kind || 'practice') + '</span></button>';
      }).join('') + '</div>';
    }).join('');
    $('.fg-list', fgWin).innerHTML = html;
    fgWin.querySelectorAll('.fg-row').forEach((b) => {
      b.onclick = () => { const c = S.cultures.find((x) => x.id === b.dataset.id); S.opened[c.id] = true; log('opened ' + c.title + ' from the field guide', 'interest noted'); openWindow(c.winId); drawGuide(); };
    });
  }
  const fgIcon = S.addIcon('fieldguide', '🗺', 'field guide', () => { drawGuide(); openWindow('win-fieldguide'); });
  S.pinned.push({ cid: 'fieldguide', from: 1996 });
  const prevSync = S.syncIcons;
  S.syncIcons = function (year) { prevSync(year); if (fgWin) drawGuide(); };

  S.syncIcons(typeof currentEra !== 'undefined' ? parseInt(currentEra, 10) : 1991);
})();
