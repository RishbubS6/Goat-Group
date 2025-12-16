---
layout: opencs
title: Connect 4 Game
permalink: /connect-4-game/
---

<div class="flex flex-col items-center gap-6 p-6 bg-blue-100 rounded-xl shadow-xl border-8 border-double border-blue-800">

  <!-- Title -->
  <div class="text-5xl font-extrabold text-blue-900 drop-shadow-lg">
    🔴 Connect 4 🟡
  </div>

  <!-- Status Text -->
  <div id="status" class="text-xl font-semibold text-blue-900">
    Player Red's turn
  </div>

  <!-- Game Board -->
  <div
    id="board"
    class="grid grid-cols-7 gap-2 bg-blue-600 p-4 rounded-xl shadow-inner"
  ></div>

  <!-- Restart Button -->
  <button
    onclick="game.reset()"
    class="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg shadow font-semibold"
  >
    Restart Game
  </button>

</div>

<!-- TailwindCSS -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Game Logic -->
<script src="{{site.baseurl}}/hacks/connect4/connect4.js"></script>
