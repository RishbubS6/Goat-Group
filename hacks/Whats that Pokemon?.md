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
  <p>Guess the Pokémon from its silhouette. Choose one of the four options — the silhouette will be revealed after your guess.</p>
  <div style="display:flex; gap:12px; align-items:center; justify-content:center; margin-bottom:8px;">
    <div style="text-align:left;">Score: <span id="score">0</span> / <span id="attempts">0</span></div>
    <button id="skipBtn">Skip</button>
    <button id="newBtn">New</button>
  </div>
  <canvas id="pokeCanvas" width="480" height="360" style="border:1px solid #ccc; background:#fff; display:block; margin:0 auto 12px;"></canvas>
  <div id="options" style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center;"></div>
  <div id="feedback" style="height:28px; margin-top:10px; color:#111;"></div>
  <div id="timer" style="height:20px; margin-top:6px; color:#555; font-weight:600;"></div>
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
  const skipBtn = document.getElementById('skipBtn');
  const newBtn = document.getElementById('newBtn');

  let state = { correctId: null, correctName: '', correctImg: null, score: 0, attempts: 0, locked: false };
  // local cache to avoid repeated network requests and reduce API pressure
  state.cache = {};

  function randId() { return Math.floor(Math.random() * (MAX_ID - MIN_ID + 1)) + MIN_ID; }

  function shuffle(arr) { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; }

  async function fetchPokemon(id) {
    const res = await fetch(API_BASE + id);
    if (!res.ok) throw new Error('fetch failed for ' + id);
    return res.json();
  }

  function clearCanvas() { ctx.clearRect(0,0,canvas.width,canvas.height); }

  function drawCenteredImage(img) {
    clearCanvas();
    const cw = canvas.width, ch = canvas.height;
    const iw = img.width, ih = img.height;
    const scale = Math.min(cw / iw, ch / ih) * 0.9;
    const w = iw * scale, h = ih * scale;
    const x = (cw - w) / 2, y = (ch - h) / 2;
    ctx.drawImage(img, x, y, w, h);
    return { x, y, w, h };
  }

  function drawSilhouetteFromImage(img) {
    const pos = drawCenteredImage(img);
    // create silhouette: fill with black only where image exists
    ctx.globalCompositeOperation = 'source-in';
    ctx.fillStyle = '#000';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.globalCompositeOperation = 'source-over';
  }

  function revealImage(img) { clearCanvas(); drawCenteredImage(img); }

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

    // use official artwork if available, otherwise front_default sprite
    const imgUrl = (data.sprites && data.sprites.other && data.sprites.other['official-artwork'] && data.sprites.other['official-artwork'].front_default) || data.sprites.front_default;
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

    // Show options
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
      // time expired — treat as wrong
      clearAnswerTimer();
      if (state.locked) return; // already answered
      state.locked = true;
      state.attempts = (state.attempts || 0) + 1;
      attemptsEl.textContent = state.attempts;
      feedbackEl.textContent = 'Time up — it was ' + capitalize(state.correctName);
      revealImage(state.correctImg);
      Array.from(optionsEl.children).forEach(b => { b.disabled = true; if (Number(b.dataset.id) === Number(state.correctId)) b.classList.add('correct'); });
      // schedule next
      setTimeout(() => { state.locked = false; clearAnswerTimer(); newQuestion(); }, 1400);
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

  async function onChoose(id, btn) {
    if (state.locked) return;
    // answered — stop timer but keep displayed elapsed ms
    const elapsedMs = stopAnswerTimerKeepDisplay();
    state.locked = true;
    const correct = Number(id) === Number(state.correctId);
    state.attempts = (state.attempts || 0) + 1;
    attemptsEl.textContent = state.attempts;
    if (correct) {
      state.score = (state.score || 0) + 1;
      scoreEl.textContent = state.score;
      btn.classList.add('correct');
      feedbackEl.textContent = 'Correct! ' + capitalize(state.correctName) + (elapsedMs != null ? ' — ' + elapsedMs + ' ms' : '');
    } else {
      btn.classList.add('wrong');
      feedbackEl.textContent = 'Wrong — it was ' + capitalize(state.correctName) + (elapsedMs != null ? ' — answered in ' + elapsedMs + ' ms' : '');
    }
    // reveal colored image
    revealImage(state.correctImg);

    // highlight the correct option
    Array.from(optionsEl.children).forEach(b => {
      if (Number(b.dataset.id) === Number(state.correctId)) b.classList.add('correct');
      b.disabled = true;
    });

    // auto-next after short delay
    setTimeout(() => { state.locked = false; newQuestion(); }, 1400);
  }

  skipBtn.addEventListener('click', () => { if (state.locked) return; clearAnswerTimer(); revealImage(state.correctImg); Array.from(optionsEl.children).forEach(b=>b.disabled=true); state.attempts = (state.attempts||0)+1; attemptsEl.textContent = state.attempts; setTimeout(() => newQuestion(), 900); });
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