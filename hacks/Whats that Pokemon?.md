---
layout: opencs
title: "Who's That Pokémon? (Kanto — 151)"
description: A small guessing game showing a silhouette of a Kanto Pokémon and four choices.
permalink: /whos-that-pokemon
categories: ['Game', 'Pokemon', 'JavaScript']
toc: false
---

## Who's That Pokémon? — Kanto (Original 151)

<div style="max-width:760px; margin:12px auto; text-align:center;">
  <p>Guess the Pokémon from its silhouette. Choose one of the two game modes to start.</p>
  <div id="modeSelect" style="position:relative; margin:10px auto 18px; display:flex; gap:12px; justify-content:center;">
    <button id="modeEasy">Easy (4-choice)</button>
    <button id="modeMedium">Medium (type answer)</button>
    <button id="modeHard">Hard (pixel sprites)</button>
  </div>
  <div style="display:flex; gap:12px; align-items:center; justify-content:center; margin-bottom:8px;">
    <div style="text-align:left;">Score: <span id="score">0</span> &nbsp; Highscore (Easy): <span id="highscore-easy">0</span> &nbsp; Medium: <span id="highscore-medium">0</span> &nbsp; Hard: <span id="highscore-hard">0</span> / Attempts: <span id="attempts">0</span></div>
    <button id="skipBtn">Skip</button>
    <button id="newBtn">New</button>
  </div>
  <canvas id="pokeCanvas" width="480" height="360" style="border:1px solid #ccc; background:transparent; display:block; margin:0 auto 12px;"></canvas>
  <div id="options" style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center;"></div>
  <div id="typeInput" style="display:none; gap:8px; justify-content:center; margin-top:8px; flex-direction:column; align-items:center;"></div>
  <div id="feedback" style="height:28px; margin-top:10px; color:#111;"></div>
  <div id="timer" style="height:20px; margin-top:6px; color:#555; font-weight:600;"></div>
  <div id="gameOver" style="display:none; position:fixed; left:0; right:0; top:0; bottom:0; background:rgba(0,0,0,0.7); color:#fff; align-items:center; justify-content:center; text-align:center; padding:20px; font-size:20px; z-index:9999;">
    <div id="gameOverMsg"></div>
  </div>
</div>

<style>
  #options button { padding:8px 12px; font-size:16px; cursor:pointer; }
  #options button.correct { background: #4caf50; color: #fff; }
  #options button.wrong { background: #f44336; color: #fff; }
</style>

<script>
// Who's That Pokémon? — Kanto 1..151 using PokeAPI
document.addEventListener('DOMContentLoaded', () => {
  try {
  const API_BASE = 'https://pokeapi.co/api/v2/pokemon/';
  const MIN_ID = 1, MAX_ID = 151;
  const canvas = document.getElementById('pokeCanvas');
  const ctx = canvas.getContext('2d');
  const optionsEl = document.getElementById('options');
  const scoreEl = document.getElementById('score');
  const attemptsEl = document.getElementById('attempts');
  const feedbackEl = document.getElementById('feedback');
  const typeInputEl = document.getElementById('typeInput');
  const timerEl = document.getElementById('timer');
  const skipBtn = document.getElementById('skipBtn');
  const newBtn = document.getElementById('newBtn');
  const modeSelect = document.getElementById('modeSelect');
  const modeEasyBtn = document.getElementById('modeEasy');
  const modeMediumBtn = document.getElementById('modeMedium');
  const modeHardBtn = document.getElementById('modeHard');

  let state = { correctId: null, correctName: '', correctImg: null, currentRunScore: 0, attempts: 0, locked: false };
  // local cache to avoid repeated network requests and reduce API pressure
  state.cache = {};
  // highscore persistent keys (separate for easy/medium/hard)
  const HS_KEY_EASY = 'wtp_highscore_easy';
  const HS_KEY_MED = 'wtp_highscore_medium';
  const HS_KEY_HARD = 'wtp_highscore_hard';
  const highscoreEasyEl = document.getElementById('highscore-easy');
  const highscoreMedEl = document.getElementById('highscore-medium');
  const highscoreHardEl = document.getElementById('highscore-hard');
  function updateHighscoreUI() {
    const se = parseInt(localStorage.getItem(HS_KEY_EASY) || '0', 10) || 0;
    const sm = parseInt(localStorage.getItem(HS_KEY_MED) || '0', 10) || 0;
    const sh = parseInt(localStorage.getItem(HS_KEY_HARD) || '0', 10) || 0;
    if (highscoreEasyEl) highscoreEasyEl.textContent = se;
    if (highscoreMedEl) highscoreMedEl.textContent = sm;
    if (highscoreHardEl) highscoreHardEl.textContent = sh;
  }
  updateHighscoreUI();
  if (scoreEl) scoreEl.textContent = String(state.currentRunScore);
  // mode will be 'easy' or 'medium'
  state.mode = null;

  // normalize input: remove diacritics, punctuation, and lowercase
  function normalizeAnswer(s) {
    if (!s) return '';
    // NFD normalize and remove diacritics
    try {
      s = s.normalize('NFD').replace(/\p{Diacritic}/gu, '');
    } catch (e) {
      // fallback for environments without \p{Diacritic}
      s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    // keep letters and digits only
    s = s.replace(/[^a-zA-Z0-9 ]+/g, '');
    s = s.trim().toLowerCase();
    return s;
  }

  // Levenshtein distance (iterative) for fuzzy matching
  function levenshtein(a, b) {
    const la = a.length, lb = b.length;
    if (la === 0) return lb;
    if (lb === 0) return la;
    const v0 = new Array(lb + 1).fill(0);
    const v1 = new Array(lb + 1).fill(0);
    for (let j = 0; j <= lb; j++) v0[j] = j;
    for (let i = 0; i < la; i++) {
      v1[0] = i + 1;
      for (let j = 0; j < lb; j++) {
        const cost = a[i] === b[j] ? 0 : 1;
        v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
      }
      for (let j = 0; j <= lb; j++) v0[j] = v1[j];
    }
    return v1[lb];
  }

  // fuzzyMatch returns true when strings are similar enough to be accepted
  function fuzzyMatch(userNorm, targetNorm) {
    if (!userNorm || !targetNorm) return false;
    if (userNorm === targetNorm) return true;
    // allow substring matches (user typed partial but clearly intended)
    if (targetNorm.includes(userNorm) || userNorm.includes(targetNorm)) return true;
    const dist = levenshtein(userNorm, targetNorm);
    // allow up to max(1, 20% of target length)
    const maxAllow = Math.max(1, Math.floor(targetNorm.length * 0.2));
    return dist <= maxAllow;
  }

  function startMode(mode) {
    state.mode = mode;
    if (modeSelect) modeSelect.style.display = 'none';
    // show/hide input container
    if (typeInputEl) typeInputEl.style.display = (mode === 'medium' || mode === 'hard') ? 'flex' : 'none';
    // hide timer entirely for medium and hard
    if (timerEl) timerEl.style.display = (mode === 'medium' || mode === 'hard') ? 'none' : '';
    // start first question
    newQuestion();
  }

  modeEasyBtn.addEventListener('click', () => startMode('easy'));
  modeMediumBtn.addEventListener('click', () => startMode('medium'));
  modeHardBtn.addEventListener('click', () => startMode('hard'));

  function randId() { return Math.floor(Math.random() * (MAX_ID - MIN_ID + 1)) + MIN_ID; }

  function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }

  async function fetchPokemon(id) {
    const res = await fetch(API_BASE + id);
    if (!res.ok) throw new Error('fetch failed for ' + id);
    return res.json();
  }

  function clearCanvas() { ctx.clearRect(0,0,canvas.width,canvas.height); }

  // draw pokeball components with optional top-lift and glow
  function drawPokeballBackgroundWithParams(topDy = 0, glow = 0) {
    const cw = canvas.width, ch = canvas.height;
    const cx = cw / 2, cy = ch / 2;
    const r = Math.min(cw, ch) * 0.45;
    // clear
    ctx.clearRect(0,0,cw,ch);
    // glow (radial)
    if (glow > 0) {
      const g = ctx.createRadialGradient(cx, cy, r*0.2, cx, cy, r*1.2);
      g.addColorStop(0, `rgba(255,50,50,${Math.min(0.6, glow*0.6)})`);
      g.addColorStop(0.6, `rgba(255,50,50,${Math.min(0.18, glow*0.18)})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,cw,ch);
    }
    // top red semicircle (liftable)
    const topCenterY = cy + topDy;
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.arc(cx, topCenterY, r, Math.PI, 0, false);
    ctx.closePath();
    ctx.fillStyle = '#d62828';
    ctx.fill();
    // bottom white semicircle
    ctx.beginPath();
    ctx.moveTo(cx - r, cy);
    ctx.arc(cx, cy, r, Math.PI, 0, true);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    // black horizontal band
    const bandH = Math.max(8, r * 0.18);
    ctx.fillStyle = '#111';
    ctx.fillRect(cx - r, cy - bandH/2, r*2, bandH);
    // center button (white circle with black outline and inner small circle)
    const btnR = Math.max(10, r * 0.18);
    ctx.beginPath(); ctx.arc(cx, cy, btnR, 0, Math.PI*2); ctx.fillStyle = '#fff'; ctx.fill();
    ctx.lineWidth = Math.max(4, r * 0.04); ctx.strokeStyle = '#111'; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, btnR * 0.45, 0, Math.PI*2); ctx.fillStyle = '#ddd'; ctx.fill();
  }

  function drawPokeballBackground() { drawPokeballBackgroundWithParams(0,0); }


  function drawCenteredImage(img) {
    const cw = canvas.width, ch = canvas.height;
    const iw = img.width, ih = img.height;
    const scale = Math.min(cw / iw, ch / ih) * 0.9;
    const w = iw * scale, h = ih * scale;
    const x = (cw - w) / 2, y = (ch - h) / 2;
    ctx.drawImage(img, x, y, w, h);
    return { x, y, w, h };
  }

  function drawSilhouetteFromImage(img) {
    // draw pokeball background first
    drawPokeballBackground();
    const cw = canvas.width, ch = canvas.height;
    const iw = img.width, ih = img.height;
    // center target area
    const scale = Math.min(cw / iw, ch / ih) * 0.9;
    const w = iw * scale, h = ih * scale;
    const x = (cw - w) / 2, y = (ch - h) / 2;
    if (state.mode === 'hard') {
      // create a small offscreen canvas to render the sprite at low res then upscale without smoothing
      const smallW = Math.max(32, Math.floor(Math.min(iw, ih) * 0.5));
      const smallH = Math.max(32, Math.floor(smallW * (ih/iw)));
      const off = document.createElement('canvas'); off.width = smallW; off.height = smallH;
      const oc = off.getContext('2d');
      oc.clearRect(0,0,smallW,smallH);
      // draw image scaled down into small canvas
      oc.drawImage(img, 0, 0, iw, ih, 0, 0, smallW, smallH);
      // convert to silhouette (black) in small canvas
      oc.globalCompositeOperation = 'source-in';
      oc.fillStyle = '#000';
      oc.fillRect(0,0,smallW,smallH);
      // upscale onto main canvas with pixelated look
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(off, 0, 0, smallW, smallH, x, y, w, h);
      ctx.imageSmoothingEnabled = true;
    } else {
      // draw image into offscreen canvas and convert to black silhouette
      const off = document.createElement('canvas'); off.width = cw; off.height = ch;
      const oc = off.getContext('2d');
      oc.clearRect(0,0,cw,ch);
      oc.drawImage(img, x, y, w, h);
      oc.globalCompositeOperation = 'source-in';
      oc.fillStyle = '#000';
      oc.fillRect(0,0,cw,ch);
      // now overlay the silhouette on top of the pokeball background
      ctx.drawImage(off, 0, 0);
    }
  }

  function revealImage(img) { drawPokeballBackground(); drawCenteredImage(img); }

  function revealImagePixelated(img) {
    drawPokeballBackground();
    const cw = canvas.width, ch = canvas.height;
    const iw = img.width, ih = img.height;
    const scale = Math.min(cw / iw, ch / ih) * 0.9;
    const w = iw * scale, h = ih * scale;
    const x = (cw - w) / 2, y = (ch - h) / 2;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, x, y, w, h);
    ctx.imageSmoothingEnabled = true;
  }

  function animatePokeballRelease(callback) {
    const cw = canvas.width, ch = canvas.height;
    const cx = cw / 2, cy = ch / 2;
    const r = Math.min(cw, ch) * 0.45;
    const duration = 800;
    const start = performance.now();
    function easeInOut(t) { return t<0.5 ? 2*t*t : -1 + (4-2*t)*t; }
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const e = easeInOut(t);
      const topDy = -r * 0.6 * e;
      const glow = e;
      drawPokeballBackgroundWithParams(topDy, glow);
      if (t < 1) requestAnimationFrame(frame);
      else {
        // final flash then callback
        const grad = ctx.createRadialGradient(cx, cy, r*0.1, cx, cy, r*1.6);
        grad.addColorStop(0, 'rgba(255,80,80,0.9)');
        grad.addColorStop(0.6, 'rgba(255,80,80,0.18)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad; ctx.fillRect(0,0,cw,ch);
        if (callback) setTimeout(callback, 120);
      }
    }
    requestAnimationFrame(frame);
  }

  async function loadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (e) => reject(e);
      img.src = url;
    });
  }

  async function newQuestion() {
    if (state.locked) return;
    // clear any previous answer timer
    if (state.answerTimer) { clearTimeout(state.answerTimer); state.answerTimer = null; }
    state.locked = true;
    feedbackEl.textContent = '';
    optionsEl.innerHTML = '';

    // Choose correct id
    let correctId;
    do { correctId = randId(); } while (correctId === state.correctId);
    state.correctId = correctId;

    // Fetch correct Pokemon data with retry and cache
    let data = null;
    const maxAttempts = 6;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        data = await (async (id) => {
          if (state.cache[id]) return state.cache[id];
          const d = await fetchPokemon(id);
          state.cache[id] = d;
          return d;
        })(correctId);
        break;
      } catch (e) {
        // try a different id to avoid a stuck id or transient API failure
        correctId = randId();
        // ensure we don't repeat the immediate previous correctId
        if (correctId === state.correctId) correctId = randId();
        state.correctId = correctId;
        data = null;
      }
    }
    if (!data) {
      feedbackEl.textContent = 'Network error. Try again.';
      state.locked = false;
      return;
    }

    // choose image url based on mode: hard prefers generation-iii (GBA) sprites when available
    let imgUrl = null;
    if (state.mode === 'hard') {
      try {
        imgUrl = ((data.sprites && data.sprites.versions && data.sprites.versions['generation-iii'] && (data.sprites.versions['generation-iii']['firered-leafgreen'] || data.sprites.versions['generation-iii']['ruby-sapphire'])) || {});
        // attempt known gen3 keys
        if (data.sprites && data.sprites.versions && data.sprites.versions['generation-iii']) {
          const g3 = data.sprites.versions['generation-iii'];
          imgUrl = (g3['firered-leafgreen'] && g3['firered-leafgreen'].front_default) || (g3['ruby-sapphire'] && g3['ruby-sapphire'].front_default) || null;
        }
      } catch (e) { imgUrl = null; }
    }
    if (!imgUrl) imgUrl = (data.sprites && data.sprites.other && data.sprites.other['official-artwork'] && data.sprites.other['official-artwork'].front_default) || data.sprites.front_default;
    if (!imgUrl) { feedbackEl.textContent = 'Image not available.'; state.locked = false; return; }

    const img = await loadImage(imgUrl).catch(() => null);
    if (!img) { feedbackEl.textContent = 'Failed to load image.'; state.locked = false; return; }
    state.correctImg = img;
    state.correctName = data.name;

    // Build options (1 correct + 3 random other names)
    const ids = new Set([correctId]);
    while (ids.size < 4) ids.add(randId());
    const idArr = Array.from(ids);
    // fetch names for all ids (some already fetched)
    // fetch names for all ids (use cache when possible)
    const fetches = idArr.map(id => (async () => {
      if (id === correctId) return data;
      if (state.cache[id]) return state.cache[id];
      try {
        const d = await fetchPokemon(id);
        state.cache[id] = d;
        return d;
      } catch (e) { return { name: 'Unknown' }; }
    })());
    const datas = await Promise.all(fetches);
    const names = datas.map(d => d.name);
    const paired = idArr.map((id, i) => ({ id, name: names[i] }));
    shuffle(paired);

    // Draw silhouette
    drawSilhouetteFromImage(img);

    // Show options (easy) or input (medium/hard)
    optionsEl.innerHTML = '';
    if (state.mode === 'medium' || state.mode === 'hard') {
      // create input and submit
      if (typeInputEl) typeInputEl.innerHTML = '';
      const input = document.createElement('input'); input.type = 'text'; input.placeholder = 'Type the Pokémon name...'; input.style.padding = '8px'; input.style.fontSize = '16px'; input.style.width = '260px';
      const submit = document.createElement('button'); submit.textContent = 'Submit'; submit.style.padding = '8px 12px';
      typeInputEl.appendChild(input); typeInputEl.appendChild(submit);
      // handle submission
      function doSubmit() {
        if (state.locked) return;
        const val = input.value || '';
        onTypeSubmit(val);
      }
      submit.addEventListener('click', doSubmit);
      input.addEventListener('keydown', (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); doSubmit(); } });
      // prepare (timer runs but is hidden in medium mode)
      state.locked = false;
      startAnswerTimer(20000);
      // focus for ease
      setTimeout(() => input.focus(), 80);
    } else {
      for (const p of paired) {
        const btn = document.createElement('button');
        btn.textContent = capitalize(p.name.replace(/-/g,' '));
        btn.dataset.id = p.id;
        btn.addEventListener('click', () => onChoose(p.id, btn));
        optionsEl.appendChild(btn);
      }
      // allow answering and start a 2s timer
      state.locked = false;
      startAnswerTimer(2000);
    }
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function clearAnswerTimer() {
    if (state.answerTimer) {
      try { if (state.answerTimer.timeout) clearTimeout(state.answerTimer.timeout); } catch (e) {}
      try { if (state.answerTimer.interval) clearInterval(state.answerTimer.interval); } catch (e) {}
      state.answerTimer = null;
    }
    const tEl = document.getElementById('timer'); if (tEl) tEl.textContent = '';
  }

  function startAnswerTimer(durationMs) {
    clearAnswerTimer();
    const end = performance.now() + durationMs;
    const interval = setInterval(() => {
      const rem = Math.max(0, end - performance.now());
      const ms = Math.ceil(rem);
      const tEl = document.getElementById('timer'); if (tEl) tEl.textContent = ms + ' ms';
    }, 16);
    const timeout = setTimeout(() => {
      // time expired — treat as wrong and end run
      const elapsed = stopAnswerTimerKeepDisplay();
      if (state.locked) return; // already answered
      state.attempts = (state.attempts || 0) + 1;
      attemptsEl.textContent = state.attempts;
      gameOver('timeout', elapsed);
    }, durationMs);
    state.answerTimer = { timeout, interval, end, duration: durationMs };
  }

  // Stop the timer but keep the final elapsed ms visible (returns elapsed ms)
  function stopAnswerTimerKeepDisplay() {
    if (!state.answerTimer) return null;
    const now = performance.now();
    const end = state.answerTimer.end || now;
    const duration = state.answerTimer.duration || 0;
    const remaining = Math.max(0, end - now);
    const elapsed = Math.max(0, Math.round(duration - remaining));
    try { if (state.answerTimer.interval) clearInterval(state.answerTimer.interval); } catch (e) {}
    try { if (state.answerTimer.timeout) clearTimeout(state.answerTimer.timeout); } catch (e) {}
    state.answerTimer = null;
    const tEl = document.getElementById('timer'); if (tEl) tEl.textContent = elapsed + ' ms';
    return elapsed;
  }

  function showGameOverOverlay(msg) {
    const go = document.getElementById('gameOver');
    const gm = document.getElementById('gameOverMsg');
    if (!go || !gm) return;
    gm.innerHTML = msg;
    go.style.display = 'flex';
  }

  function hideGameOverOverlay() {
    const go = document.getElementById('gameOver'); if (go) go.style.display = 'none';
  }

  // (no-op duplicate removed) the highscore UI is updated by the top-level updateHighscoreUI

  function gameOver(reason, elapsedMs) {
    // Reveal correct and stop interactions
    clearAnswerTimer();
    state.locked = true;
    if (state.mode === 'hard') revealImagePixelated(state.correctImg); else revealImage(state.correctImg);
    Array.from(optionsEl.children).forEach(b => b.disabled = true);
    const current = state.currentRunScore || 0;
    // update stored highscore
    const key = (state.mode === 'hard') ? HS_KEY_HARD : (state.mode === 'medium') ? HS_KEY_MED : HS_KEY_EASY;
    const prev = parseInt(localStorage.getItem(key) || '0', 10) || 0;
    const newHS = Math.max(prev, current);
    try { localStorage.setItem(key, String(newHS)); } catch (e) {}
    updateHighscoreUI();
    const reasonText = reason === 'timeout' ? 'Time up' : (reason === 'wrong' ? 'Wrong' : 'Game over');
    const elapsedText = (elapsedMs != null) ? (' — ' + elapsedMs + ' ms') : '';
    const msg = `<div style="font-size:28px; font-weight:700; margin-bottom:8px;">Game Over</div><div>Score: ${current} — Highscore: ${newHS}</div><div style="margin-top:8px;">${reasonText}${elapsedText}</div>`;
    showGameOverOverlay(msg);
    // restart after 5s
    setTimeout(() => {
      hideGameOverOverlay();
      state.currentRunScore = 0;
      if (scoreEl) scoreEl.textContent = '0';
      state.locked = false;
      // if mode not selected, show mode select again
      if (!state.mode) {
        if (modeSelect) modeSelect.style.display = 'flex';
      }
      newQuestion();
    }, 5000);
  }

  async function onChoose(id, btn) {
    if (state.locked) return;
    // answered — stop timer but keep displayed elapsed ms
    const elapsedMs = stopAnswerTimerKeepDisplay();
    state.locked = true;
    const correct = Number(id) === Number(state.correctId);
    state.attempts = (state.attempts || 0) + 1;
    attemptsEl.textContent = state.attempts;
    if (correct) {
      state.currentRunScore = (state.currentRunScore || 0) + 1;
      scoreEl.textContent = state.currentRunScore;
      // update persistent highscore if beaten
      const key = (state.mode === 'hard') ? HS_KEY_HARD : (state.mode === 'medium') ? HS_KEY_MED : HS_KEY_EASY;
      const prevHS = parseInt(localStorage.getItem(key) || '0', 10) || 0;
      if (state.currentRunScore > prevHS) {
        try { localStorage.setItem(key, String(state.currentRunScore)); } catch (e) {}
        updateHighscoreUI();
      }
      btn.classList.add('correct');
      feedbackEl.textContent = 'Correct! ' + capitalize(state.correctName) + (elapsedMs != null ? ' — ' + elapsedMs + ' ms' : '');
    } else {
      btn.classList.add('wrong');
      feedbackEl.textContent = 'Wrong — it was ' + capitalize(state.correctName) + (elapsedMs != null ? ' — answered in ' + elapsedMs + ' ms' : '');
    }
    if (correct) {
      // animate pokeball opening then reveal
      animatePokeballRelease(() => {
        if (state.mode === 'hard') revealImagePixelated(state.correctImg); else revealImage(state.correctImg);
        Array.from(optionsEl.children).forEach(b => {
          if (Number(b.dataset.id) === Number(state.correctId)) b.classList.add('correct');
          b.disabled = true;
        });
        setTimeout(() => { state.locked = false; newQuestion(); }, 900);
      });
    } else {
      // reveal immediately and end run
      if (state.mode === 'hard') revealImagePixelated(state.correctImg); else revealImage(state.correctImg);
      Array.from(optionsEl.children).forEach(b => { if (Number(b.dataset.id) === Number(state.correctId)) b.classList.add('correct'); b.disabled = true; });
      gameOver('wrong', elapsedMs);
    }
  }

  // handle typed submission for medium mode
  function onTypeSubmit(text) {
    if (state.locked) return;
    const elapsedMs = stopAnswerTimerKeepDisplay();
    state.locked = true;
    state.attempts = (state.attempts || 0) + 1;
    attemptsEl.textContent = state.attempts;
    const norm = normalizeAnswer(text);
    const correctNorm = normalizeAnswer(state.correctName.replace(/-/g,' '));
    const accepted = fuzzyMatch(norm, correctNorm) || (norm === 'ditto');
    if (accepted) {
      state.currentRunScore = (state.currentRunScore || 0) + 1;
      scoreEl.textContent = state.currentRunScore;
      const key = (state.mode === 'hard') ? HS_KEY_HARD : HS_KEY_MED;
      const prevHS = parseInt(localStorage.getItem(key) || '0', 10) || 0;
      if (state.currentRunScore > prevHS) {
        try { localStorage.setItem(key, String(state.currentRunScore)); } catch (e) {}
        updateHighscoreUI();
      }
      feedbackEl.textContent = 'Correct! ' + capitalize(state.correctName) + (elapsedMs != null ? ' — ' + elapsedMs + ' ms' : '');
      // animate and reveal
      animatePokeballRelease(() => { if (state.mode === 'hard') revealImagePixelated(state.correctImg); else revealImage(state.correctImg); setTimeout(() => { state.locked = false; newQuestion(); }, 900); });
    } else {
      feedbackEl.textContent = 'Wrong — it was ' + capitalize(state.correctName) + (elapsedMs != null ? ' — answered in ' + elapsedMs + ' ms' : '');
      if (state.mode === 'hard') revealImagePixelated(state.correctImg); else revealImage(state.correctImg);
      gameOver('wrong', elapsedMs);
    }
  }

  skipBtn.addEventListener('click', () => { if (state.locked) return; clearAnswerTimer(); if (state.mode === 'hard') revealImagePixelated(state.correctImg); else revealImage(state.correctImg); Array.from(optionsEl.children).forEach(b=>b.disabled=true); state.attempts = (state.attempts||0)+1; attemptsEl.textContent = state.attempts; setTimeout(() => newQuestion(), 900); });
  newBtn.addEventListener('click', () => { if (state.locked) return; clearAnswerTimer(); newQuestion(); });

  // start first question
  newQuestion();
  } catch (err) {
    console.error('Who\'s That Pokémon error', err);
    const fb = document.getElementById('feedback');
    if (fb) fb.textContent = 'Error: ' + (err && err.message ? err.message : String(err));
  }
});
</script>