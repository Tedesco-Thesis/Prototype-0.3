/* =====================================================================
   sound.js — each profile (era) has its own system sounds. All synthesized with
   WebAudio: no audio files. OFF by default (browsers block autoplay, and sound
   should be a choice). The toggle lives in the taskbar.

   Sound.play(name) where name is one of: open close popup login vanish back rattle wake
   Edit VOICES to change an era's sound. Each voice maps names to a small recipe.
===================================================================== */
(function () {
  'use strict';
  let ctx = null, on = false;
  const year = () => parseInt(typeof currentEra !== 'undefined' ? currentEra : '1996', 10) || 1996;

  function ac() {
    if (!ctx) { try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { ctx = null; } }
    if (ctx && ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // tone: freq, seconds, wave, volume, slide-to-freq, start delay
  function tone(f, d, type, v, to, at) {
    const c = ac(); if (!c) return;
    const t0 = c.currentTime + (at || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(f, t0);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + d);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v || 0.05, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + d + 0.05);
  }
  function noise(d, v, lp, at) {
    const c = ac(); if (!c) return;
    const t0 = c.currentTime + (at || 0), n = Math.floor(c.sampleRate * d);
    const b = c.createBuffer(1, n, c.sampleRate), data = b.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
    s.buffer = b; f.type = 'lowpass'; f.frequency.value = lp || 1200; g.gain.value = v || 0.05;
    s.connect(f); f.connect(g); g.connect(c.destination); s.start(t0);
  }

  // one voice per era group. 1991-99 square blips and a modem; 2004-08 soft chimes; 2010-14 glass ticks;
  // 2016 muted taps; 2024 almost nothing; 2030 a warm bell that takes its time.
  const VOICES = {
    early: {
      open: () => { tone(440, 0.07, 'square', 0.03); tone(660, 0.09, 'square', 0.03, 0, 0.07); },
      close: () => { tone(660, 0.07, 'square', 0.03); tone(330, 0.1, 'square', 0.03, 0, 0.07); },
      popup: () => { [0, 0.1, 0.2].forEach((a) => tone(880, 0.06, 'square', 0.03, 0, a)); },
      login: () => { [0, 0.18, 0.36, 0.6, 0.8].forEach((a, i) => tone(1100 + i * 170, 0.16, 'square', 0.025, 0, a)); noise(0.9, 0.03, 3000, 0.9); },
      vanish: () => tone(300, 0.25, 'square', 0.03, 90),
      back: () => tone(300, 0.25, 'square', 0.03, 600),
      rattle: () => noise(0.25, 0.06, 900),
      wake: () => { tone(330, 0.12, 'square', 0.03); tone(495, 0.12, 'square', 0.03, 0, 0.14); tone(660, 0.2, 'square', 0.03, 0, 0.28); },
    },
    soft: {
      open: () => { tone(880, 0.25, 'sine', 0.04); tone(1320, 0.3, 'sine', 0.025, 0, 0.06); },
      close: () => tone(660, 0.22, 'sine', 0.035, 440),
      popup: () => tone(400, 0.14, 'sine', 0.05, 900),
      login: () => { tone(523, 0.5, 'sine', 0.04); tone(659, 0.5, 'sine', 0.04, 0, 0.16); tone(784, 0.7, 'sine', 0.04, 0, 0.32); },
      vanish: () => tone(700, 0.4, 'sine', 0.03, 300),
      back: () => tone(500, 0.4, 'sine', 0.03, 900),
      rattle: () => noise(0.18, 0.04, 1500),
      wake: () => { tone(523, 0.4, 'sine', 0.04); tone(784, 0.6, 'sine', 0.04, 0, 0.18); },
    },
    glass: {
      open: () => tone(1500, 0.06, 'triangle', 0.04),
      close: () => tone(1100, 0.06, 'triangle', 0.035),
      popup: () => { tone(1800, 0.05, 'triangle', 0.04); tone(1800, 0.05, 'triangle', 0.04, 0, 0.09); },
      login: () => { tone(1200, 0.08, 'triangle', 0.04); tone(1800, 0.12, 'triangle', 0.04, 0, 0.1); },
      vanish: () => tone(900, 0.12, 'triangle', 0.03, 400),
      back: () => tone(600, 0.12, 'triangle', 0.03, 1200),
      rattle: () => noise(0.12, 0.04, 2500),
      wake: () => { tone(1200, 0.1, 'triangle', 0.04); tone(1600, 0.16, 'triangle', 0.04, 0, 0.1); },
    },
    tap: {
      open: () => noise(0.04, 0.05, 700), close: () => noise(0.04, 0.035, 500),
      popup: () => { noise(0.05, 0.05, 900); noise(0.05, 0.05, 900, 0.08); },
      login: () => noise(0.08, 0.04, 600), vanish: () => noise(0.08, 0.03, 400), back: () => noise(0.08, 0.03, 900),
      rattle: () => noise(0.1, 0.04, 700), wake: () => noise(0.1, 0.04, 800),
    },
    hush: {                    // optimized: you can barely hear it. that is the point.
      open: () => tone(110, 0.05, 'sine', 0.02), close: () => tone(90, 0.05, 'sine', 0.015),
      popup: () => tone(100, 0.08, 'sine', 0.025), login: () => {}, vanish: () => tone(80, 0.08, 'sine', 0.012),
      back: () => {}, rattle: () => tone(70, 0.1, 'sine', 0.02), wake: () => tone(100, 0.1, 'sine', 0.015),
    },
    bell: {
      open: () => { tone(523, 1.2, 'sine', 0.04); tone(784, 1.4, 'sine', 0.02, 0, 0.02); },
      close: () => tone(392, 1.0, 'sine', 0.03),
      popup: () => tone(659, 1.1, 'sine', 0.03),
      login: () => { tone(392, 1.6, 'sine', 0.04); tone(523, 1.6, 'sine', 0.04, 0, 0.35); tone(659, 2.0, 'sine', 0.04, 0, 0.7); },
      vanish: () => tone(392, 1.0, 'sine', 0.03, 330),
      back: () => { tone(523, 1.4, 'sine', 0.035); tone(784, 1.6, 'sine', 0.025, 0, 0.06); },
      rattle: () => tone(262, 0.8, 'sine', 0.03),
      wake: () => { tone(392, 1.4, 'sine', 0.04); tone(588, 1.8, 'sine', 0.035, 0, 0.3); },
    },
  };
  const voiceFor = (y) => (y <= 1999 ? 'early' : y <= 2008 ? 'soft' : y <= 2014 ? 'glass' : y <= 2016 ? 'tap' : y <= 2026 ? 'hush' : 'bell');

  const Sound = {
    get on() { return on; },
    voice: () => voiceFor(year()),
    play(name) { if (!on) return; const v = VOICES[voiceFor(year())]; if (v && v[name]) { try { v[name](); } catch (e) { /* audio unavailable */ } } },
    toggle(force) {
      on = typeof force === 'boolean' ? force : !on;
      if (on) ac();
      const b = document.getElementById('soundbtn');
      if (b) { b.textContent = 'sound: ' + (on ? 'on' : 'off'); b.classList.toggle('on', on); }
      if (on) Sound.play('wake');
      return on;
    },
  };
  window.Sound = Sound;
})();
