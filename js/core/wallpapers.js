/* wallpapers.js — puts your processed image behind an era.
   Load AFTER next.js (and the other era scripts), BEFORE guide.js.

   If the manifest has an image with the id  era.<scope>.wallpaper  it becomes that era's desktop background
   (cover, centred). The era's own overlays (grid lines, vignette, the 2014 scene) are kept or hidden as noted below.
   No image = nothing changes. Make one with:   python3 tools/ts_filter.py photo.jpg --scope era.2014 --role wallpaper --register
   era key (setEra) -> manifest scope: 2006 = 2005-07, 2008 = 2008-09, 2010 = 2010-13, 2016 = 2016-19, 2024 = 2020-26; the rest match.
   2014: the drawn coast scene is hidden when a wallpaper is set (it would cover it). */
(function () {
  'use strict';
  const MAP = { '2006': '2005-07', '2008': '2008-09', '2010': '2010-13', '2016': '2016-19', '2024': '2020-26' };
  const st = document.createElement('style');
  st.textContent = 'body.has-wallpaper #bg14{display:none !important}';
  document.head.appendChild(st);
  function apply(key) {
    const d = document.getElementById('desktop');
    if (!d || !window.Assets) return;
    const id = 'era.' + (MAP[key] || key) + '.wallpaper';
    if (Assets.has(id)) {
      d.style.setProperty('background-image', 'url("' + Assets.src(id) + '")', 'important');
      d.style.setProperty('background-size', 'cover', 'important');
      d.style.setProperty('background-position', 'center', 'important');
      d.style.setProperty('background-repeat', 'no-repeat', 'important');
      document.body.classList.add('has-wallpaper');
    } else {
      ['background-image', 'background-size', 'background-position', 'background-repeat'].forEach((p) => d.style.removeProperty(p));
      document.body.classList.remove('has-wallpaper');
    }
  }
  const _setEra = window.setEra;
  window.setEra = function (key) { const r = _setEra.apply(this, arguments); apply(key); return r; };
  apply(window.currentEra || '1991');
})();
