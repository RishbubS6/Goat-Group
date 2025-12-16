---
layout: opencs
title: Connect 4 Game
permalink: /connect-4-game/
---

<div id="title-screen" class="flex flex-col items-center gap-6 p-6 bg-blue-100 rounded-xl shadow-xl border-8 border-double border-blue-800">
  <!-- Title -->
  <div class="text-5xl font-extrabold text-blue-900 drop-shadow-lg">
    🔴 Connect 4 🟡
  </div>

  <!-- Timer Selection -->
  <div class="flex gap-4">
    <button onclick="game.startGame(60)" class="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow font-semibold">1 Minute</button>
    <button onclick="game.startGame(180)" class="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg shadow font-semibold">3 Minutes</button>
    <button onclick="game.startGame(300)" class="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow font-semibold">5 Minutes</button>
  </div>
</div>

<div id="game-screen" class="flex flex-col items-center gap-6 p-6 bg-blue-100 rounded-xl shadow-xl border-8 border-double border-blue-800 hidden">
  <!-- Game Title -->
  <div class="text-5xl font-extrabold text-blue-900 drop-shadow-lg">🔴 Connect 4 🟡</div>

  <!-- Status & Timers -->
  <div id="status" class="text-xl font-semibold text-blue-900">Player Red's turn</div>
  <div class="flex gap-8">
    <div>Red Timer: <span id="red-timer">00:00</span></div>
    <div>Yellow Timer: <span id="yellow-timer">00:00</span></div>
  </div>

  <!-- Game Board -->
  <div id="board" class="grid grid-cols-7 gap-2 bg-blue-600 p-4 rounded-xl shadow-inner"></div>

  <!-- Restart Button -->
  <button onclick="game.reset()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow font-semibold">
    Restart Game
  </button>

  <!-- Winner Overlay -->
  <div id="winner-overlay" class="hidden fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50">
    <div class="bg-white p-10 rounded-xl shadow-lg text-center">
      <div id="winner-text" class="text-4xl font-bold mb-4">Player Red Wins!</div>
      <button onclick="game.reset()" class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow font-semibold">
        Play Again
      </button>
    </div>
    <!-- Confetti Canvas -->
    <canvas id="confetti-canvas" class="absolute inset-0 pointer-events-none"></canvas>
  </div>
</div>

<script src="https://cdn.tailwindcss.com"></script>
<script src="{{site.baseurl}}/hacks/connect4/connect4.js"></script>
