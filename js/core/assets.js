/* assets.js: the asset manifest and a tiny helper.
   Loaded FIRST (before script.js). Everything the prototype shows as an image is declared in the manifest below
   so that each one carries a label for who made it. The "authorship" argument of the thesis applies to the
   prototype itself.

   To add an image
   ---------------
   1. put the file in assets/eras/<era>/ or assets/cultures/<id>/  (any name)
   2. add an entry to "assets" below. for the default slots use the id  culture.<id>.hero  or  era.<era>.wallpaper
      (the field guide pages pick up culture.<id>.hero by themselves; see js/features/subcultures.js)
   3. set "kind" to mine / reconstructed / referenced, and fill "credit" / "source" if it is not yours
   Reload. The about window lists everything, grouped by kind, and says which scopes still have no image.

   In code:  Assets.img('culture.vaporwave.hero', 'my-class')  returns an <img> string, or '' if there is no file.
             Assets.src(id)  Assets.has(id)  Assets.list(scope)  Assets.todo()  Assets.credits()
*/
window.ASSET_MANIFEST = {
  "version": 1,
  "about": "every image the prototype uses is declared here, so each one can be labelled by who made it. edit this file, drop the image in assets/, and reload. no other code needs to change.",
  "kinds": {
    "mine": "made by isabella",
    "reconstructed": "redrawn or rebuilt by isabella from a reference (name the reference in \"source\")",
    "referenced": "found or archived, not made here (credit the source and check permission)",
    "unset": "not labelled yet"
  },
  "roles": {
    "era": [
      "wallpaper",
      "graphic"
    ],
    "culture": [
      "hero",
      "graphic"
    ]
  },
  "folders": {
    "era": "assets/eras/<era>/",
    "culture": "assets/cultures/<id>/"
  },
  "scopes": {
    "eras": [
      {
        "id": "1991",
        "name": "the first pages"
      },
      {
        "id": "1993",
        "name": "public domain & browsers"
      },
      {
        "id": "1996",
        "name": "the early web"
      },
      {
        "id": "1999",
        "name": "the dot-com era"
      },
      {
        "id": "2004",
        "name": "web 2.0"
      },
      {
        "id": "2005-07",
        "name": "social media boom"
      },
      {
        "id": "2008-09",
        "name": "foundations of web 3.0"
      },
      {
        "id": "2010-13",
        "name": "social & mobile"
      },
      {
        "id": "2014",
        "name": "2014"
      },
      {
        "id": "2016-19",
        "name": "the algorithmic feed"
      },
      {
        "id": "2020-26",
        "name": "optimized & monetized"
      }
    ],
    "cultures": [
      {
        "id": "y2k",
        "title": "y2k futurism",
        "years": "1999–2003",
        "family": "A"
      },
      {
        "id": "cyberpunk",
        "title": "cyberpunk",
        "years": "1980s–now",
        "family": "B"
      },
      {
        "id": "netart",
        "title": "net.art",
        "years": "1995–now",
        "family": "B"
      },
      {
        "id": "demoscene",
        "title": "demoscene",
        "years": "1980s–now",
        "family": "B"
      },
      {
        "id": "otherkin",
        "title": "otherkin",
        "years": "1990s–now",
        "family": "E"
      },
      {
        "id": "aero",
        "title": "frutiger aero",
        "years": "2005–2013",
        "family": "A"
      },
      {
        "id": "nightcore",
        "title": "nightcore",
        "years": "2001–now",
        "family": "B"
      },
      {
        "id": "witchhouse",
        "title": "witch house",
        "years": "2008–2012",
        "family": "E"
      },
      {
        "id": "solarpunk",
        "title": "solarpunk",
        "years": "2008–now",
        "family": "F"
      },
      {
        "id": "vaporwave",
        "title": "vaporwave",
        "years": "2010–now",
        "family": "B"
      },
      {
        "id": "seapunk",
        "title": "seapunk",
        "years": "2011–2013",
        "family": "B"
      },
      {
        "id": "softgrunge",
        "title": "soft grunge & 2014 tumblr",
        "years": "2012–2015",
        "family": "D"
      },
      {
        "id": "pastelgoth",
        "title": "pastel goth",
        "years": "2012–now",
        "family": "D"
      },
      {
        "id": "studyblr",
        "title": "studyblr & plant mom",
        "years": "2013–now",
        "family": "D"
      },
      {
        "id": "soulbonders",
        "title": "soulbonders",
        "years": "2010s–now",
        "family": "E"
      },
      {
        "id": "metro",
        "title": "flat design & metro",
        "years": "2010–now",
        "family": "A"
      },
      {
        "id": "futurefunk",
        "title": "future funk",
        "years": "2012–now",
        "family": "B"
      },
      {
        "id": "arthoe",
        "title": "art hoe",
        "years": "2014–now",
        "family": "D"
      },
      {
        "id": "healthgoth",
        "title": "health goth",
        "years": "2013–2016",
        "family": "E"
      },
      {
        "id": "livingdolls",
        "title": "living dolls",
        "years": "2010s–now",
        "family": "E"
      },
      {
        "id": "weirdcore",
        "title": "weirdcore & dreamcore",
        "years": "2017–now",
        "family": "C"
      },
      {
        "id": "liminal",
        "title": "liminal spaces & the backrooms",
        "years": "2019–now",
        "family": "C"
      },
      {
        "id": "horror",
        "title": "digital & analog horror",
        "years": "2015–now",
        "family": "C"
      },
      {
        "id": "deepfried",
        "title": "surreal & deep-fried memes",
        "years": "2015–2018",
        "family": "C"
      },
      {
        "id": "baddie",
        "title": "baddie",
        "years": "2016–now",
        "family": "D"
      },
      {
        "id": "desktopcore",
        "title": "desktopcore",
        "years": "2018–now",
        "family": "A"
      },
      {
        "id": "mallsoft",
        "title": "signalwave & mallsoft",
        "years": "2014–now",
        "family": "B"
      },
      {
        "id": "carpets",
        "title": "airport-carpet enthusiasts",
        "years": "2010s–now",
        "family": "F"
      },
      {
        "id": "gorecore",
        "title": "gorecore & gloomcore",
        "years": "2020–now",
        "family": "D"
      },
      {
        "id": "coquette",
        "title": "coquette",
        "years": "2021–now",
        "family": "D"
      },
      {
        "id": "indieweb",
        "title": "personal-web revival",
        "years": "2013–now",
        "family": "F"
      },
      {
        "id": "lofi",
        "title": "lo-fi reverie & algorithm dropouts",
        "years": "2020s",
        "family": "F"
      },
      {
        "id": "obscura",
        "title": "internet obscura",
        "years": "2020s",
        "family": "F"
      }
    ]
  },
  "assets": [
    {
      "id": "era.1999.pill-1",
      "scope": "era.1999",
      "role": "graphic",
      "file": "assets/1999/pill_1.png",
      "alt": "",
      "kind": "unset",
      "credit": "",
      "source": "",
      "note": "used on the 1999 splash (js/core/early-eras.js). set \"kind\" to say who made it."
    },
    {
      "id": "era.1999.pill-2",
      "scope": "era.1999",
      "role": "graphic",
      "file": "assets/1999/pill_2.png",
      "alt": "",
      "kind": "unset",
      "credit": "",
      "source": "",
      "note": "used on the 1999 splash (js/core/early-eras.js). set \"kind\" to say who made it."
    },
    {
      "id": "era.1999.pill-3",
      "scope": "era.1999",
      "role": "graphic",
      "file": "assets/1999/pill_3.png",
      "alt": "",
      "kind": "unset",
      "credit": "",
      "source": "",
      "note": "used on the 1999 splash (js/core/early-eras.js). set \"kind\" to say who made it."
    },
    {
      "id": "era.1999.pill-4",
      "scope": "era.1999",
      "role": "graphic",
      "file": "assets/1999/pill_4.png",
      "alt": "",
      "kind": "unset",
      "credit": "",
      "source": "",
      "note": "used on the 1999 splash (js/core/early-eras.js). set \"kind\" to say who made it."
    }
  ],
  "invented": [
    {
      "where": "js/features/cultures.js",
      "what": "the webring people (rufus, dee, mina) and their letters. scripted, not real.",
      "status": "placeholder"
    },
    {
      "where": "js/features/cultures.js",
      "what": "the \"1,204 impressions · 38 engagements · audience segment 7\" line.",
      "status": "placeholder"
    },
    {
      "where": "index.html (who knows? tab)",
      "what": "the people who answer are scripted.",
      "status": "placeholder"
    },
    {
      "where": "index.html (data room)",
      "what": "the partner's week is a stand-in, not a real trade.",
      "status": "placeholder"
    },
    {
      "where": "js/features/guide.js",
      "what": "pop-up numbers: \"closeness score: 71\", visitor counts, \"3 likes\".",
      "status": "placeholder"
    },
    {
      "where": "js/features/pages/40-D-identity.js",
      "what": "post and follower counts on the identity pages.",
      "status": "placeholder"
    },
    {
      "where": "js/features/pages/20-B-glitch.js",
      "what": "city-pop crate prices.",
      "status": "placeholder"
    },
    {
      "where": "js/eras/2020-26.js",
      "what": "the assistant's canned answers.",
      "status": "placeholder"
    },
    {
      "where": "js/features/subcultures.js",
      "what": "hex palettes, fonts and some start/end years come from notes or suggestions, not verified sources.",
      "status": "verify"
    }
  ]
};

(function () {
  'use strict';
  const M = window.ASSET_MANIFEST;
  const byId = {};
  M.assets.forEach((a) => { byId[a.id] = a; });
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  const Assets = {
    manifest: M,
    get: (id) => byId[id] || null,
    has: (id) => !!(byId[id] && byId[id].file),
    src: (id) => (byId[id] && byId[id].file) || '',
    list: (scope) => M.assets.filter((a) => !scope || a.scope === scope),
    kindLabel: (k) => M.kinds[k] || M.kinds.unset,
    // an <img> that quietly removes itself if the file is missing, so a wrong path never shows a broken-image icon
    img(id, cls, style) {
      const a = byId[id];
      if (!a || !a.file) return '';
      return '<img class="' + esc(cls || 'asset') + '" src="' + esc(a.file) + '" alt="' + esc(a.alt || '') + '"' +
        ' data-asset="' + esc(a.id) + '" data-kind="' + esc(a.kind) + '"' + (style ? ' style="' + esc(style) + '"' : '') +
        ' onerror="this.remove()">';
    },
    // scopes that have no image for a given role yet
    todo() {
      const out = [];
      M.scopes.eras.forEach((e) => M.roles.era.forEach((r) => { if (!byId['era.' + e.id + '.' + r]) out.push('era.' + e.id + '.' + r); }));
      M.scopes.cultures.forEach((c) => M.roles.culture.forEach((r) => { if (!byId['culture.' + c.id + '.' + r]) out.push('culture.' + c.id + '.' + r); }));
      return out;
    },
    // a short readable account for the about window
    credits() {
      const groups = {};
      M.assets.forEach((a) => { (groups[a.kind] = groups[a.kind] || []).push(a); });
      let h = '';
      Object.keys(M.kinds).forEach((k) => {
        const g = groups[k];
        if (!g) return;
        h += '<p style="margin:6px 0 2px;"><b>' + esc(k) + '</b> · ' + esc(M.kinds[k]) + ' (' + g.length + ')</p><ul style="margin:0 0 4px 18px;">' +
          g.map((a) => '<li>' + esc(a.id) + (a.credit ? ' — ' + esc(a.credit) : '') + '</li>').join('') + '</ul>';
      });
      const todo = Assets.todo();
      h += '<p style="margin:8px 0 2px;"><b>not yet drawn</b> · ' + todo.length + ' empty slots across ' + M.scopes.eras.length + ' eras and ' + M.scopes.cultures.length + ' aesthetics.</p>';
      h += '<p style="margin:8px 0 2px;"><b>invented content</b> · written for this prototype, not documented:</p><ul style="margin:0 0 4px 18px;">' +
        M.invented.map((i) => '<li>' + esc(i.what) + ' <em>(' + esc(i.status) + ')</em></li>').join('') + '</ul>';
      return h;
    },
  };
  window.Assets = Assets;
})();
