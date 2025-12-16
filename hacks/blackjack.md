---
layout: null
permalink: /javascript/project/blackjack/
---

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Blackjack</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      background: #f5f5f5;
      padding: 20px;
    }
    .card {
      display: inline-block;
      padding: 10px;
      margin: 5px;
      border: 1px solid #000;
      background: white;
    }
    button {
      margin: 5px;
      padding: 10px;
    }
  </style>
</head>

<body>

<h1>Blackjack</h1>

<div id="game-container">
  <h2>Dealer</h2>
  <div id="dealer-cards"></div>
  <div>Points: <span id="dealer-points">0</span></div>

  <h2>Player</h2>
  <div id="player-cards"></div>
  <div>Points: <span id="player-points">0</span></div>

  <p id="message"></p>

  <button id="new-game-btn">New Game</button>
  <button id="hit-btn">Hit</button>
  <button id="stand-btn">Stand</button>
</div>

<script>
console.log("JS IS RUNNING");

const dealerCardsEl = document.getElementById("dealer-cards");
const playerCardsEl = document.getElementById("player-cards");
const dealerPointsEl = document.getElementById("dealer-points");
const playerPointsEl = document.getElementById("player-points");
const messageEl = document.getElementById("message");

const newGameBtn = document.getElementById("new-game-btn");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");

let deck = [];
let playerHand = [];
let dealerHand = [];

function createDeck() {
  const suits = ["♠","♥","♦","♣"];
  const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  let d = [];
  for (let s of suits) {
    for (let v of values) {
      d.push({v,s});
    }
  }
  return d.sort(() => Math.random() - 0.5);
}

function value(hand) {
  let total = 0;
  let aces = 0;
  for (let c of hand) {
    if (c.v === "A") { total += 11; aces++; }
    else if (["J","Q","K"].includes(c.v)) total += 10;
    else total += Number(c.v);
  }
  while (total > 21 && aces--) total -= 10;
  return total;
}

function render() {
  dealerCardsEl.innerHTML = dealerHand.map(c => `<div class="card">${c.v}${c.s}</div>`).join("");
  playerCardsEl.innerHTML = playerHand.map(c => `<div class="card">${c.v}${c.s}</div>`).join("");
  dealerPointsEl.textContent = value(dealerHand);
  playerPointsEl.textContent = value(playerHand);
}

function newGame() {
  deck = createDeck();
  playerHand = [deck.pop(), deck.pop()];
  dealerHand = [deck.pop(), deck.pop()];
  messageEl.textContent = "Game started";
  render();
}

newGameBtn.onclick = newGame;
hitBtn.onclick = () => { playerHand.push(deck.pop()); render(); };
standBtn.onclick = () => { messageEl.textContent = "Stand"; };

</script>

</body>
</html>
