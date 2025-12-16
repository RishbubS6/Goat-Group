---
layout: post
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
    state.locked = true;
    feedbackEl.textContent = '';
    optionsEl.innerHTML = '';

    // Choose correct id
    let correctId;
    do { correctId = randId(); } while (correctId === state.correctId);
    state.correctId = correctId;

    // Fetch correct Pokemon data
    let data;
    try {
      data = await fetchPokemon(correctId);
    } catch (e) {
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
    const fetches = idArr.map(id => (id === correctId) ? Promise.resolve(data) : fetchPokemon(id).catch(() => ({ name: 'Unknown' })));
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

    state.locked = false;
  }

  function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  async function onChoose(id, btn) {
    if (state.locked) return;
    state.locked = true;
    const correct = Number(id) === Number(state.correctId);
    state.attempts = (state.attempts || 0) + 1;
    attemptsEl.textContent = state.attempts;
    if (correct) {
      state.score = (state.score || 0) + 1;
      scoreEl.textContent = state.score;
      btn.classList.add('correct');
      feedbackEl.textContent = 'Correct! ' + capitalize(state.correctName);
    } else {
      btn.classList.add('wrong');
      feedbackEl.textContent = 'Wrong — it was ' + capitalize(state.correctName);
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

  skipBtn.addEventListener('click', () => { if (state.locked) return; revealImage(state.correctImg); Array.from(optionsEl.children).forEach(b=>b.disabled=true); state.attempts = (state.attempts||0)+1; attemptsEl.textContent = state.attempts; setTimeout(() => newQuestion(), 900); });
  newBtn.addEventListener('click', () => { if (state.locked) return; newQuestion(); });

  // start first question
  newQuestion();
  } catch (err) {
    console.error('Who\'s That Pokémon error', err);
    const fb = document.getElementById('feedback');
    if (fb) fb.textContent = 'Error: ' + (err && err.message ? err.message : String(err));
  }
});
</script>