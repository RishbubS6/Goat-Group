---
layout: null
permalink: /javascript/project/blackjack/
---

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Blackjack Card Game</title>
<link rel="stylesheet" href="/Goat-Group/assets/css/style.css"> <!-- your original CSS -->
<style>
  body { font-family: Arial, sans-serif; background:#f5f5f5; padding:20px; }
  #game-container, #menu, #how-to { display:none; margin-top:20px; }
  .card { display:inline-block; margin:5px; padding:10px; border:1px solid #000; border-radius:5px; background:white; font-size:18px; text-align:center; }
  button { margin:5px; padding:10px; }
  h1, h2 { margin:10px 0; }
</style>
</head>
<body>

<!-- ===== MENU PAGE ===== -->
<div id="menu">
  <h1>Blackjack Card Game</h1>
  <button onclick="startGame()">Play Game</button>
  <button onclick="showHowTo()">How to Play</button>
</div>

<!-- ===== HOW TO PLAY ===== -->
<div id="how-to">
  <h1>How to Play</h1>
  <p>Click "Hit" to draw a card. Click "Stand" to end your turn. Try not to exceed 21!</p>
  <button onclick="goBack()">Back to Menu</button>
</div>

<!-- ===== GAME PAGE ===== -->
<div id="game-container">
  <h2>Dealer</h2>
  <div id="dealer-cards"></div>
  <p>Points: <span id="dealer-points">0</span></p>

  <h2>Player</h2>
  <div id="player-cards"></div>
  <p>Points: <span id="player-points">0</span></p>

  <p id="message"></p>

  <div class="controls">
    <button id="new-game-btn">New Game</button>
    <button id="hit-btn">Hit</button>
    <button id="stand-btn">Stand</button>
  </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function() {

  // ===== MENU FUNCTIONS =====
  function startGame() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("how-to").style.display = "none";
    document.getElementById("game-container").style.display = "block";
    newGame();
  }

  function showHowTo() {
    document.getElementById("menu").style.display = "none";
    document.getElementById("how-to").style.display = "block";
  }

  function goBack() {
    document.getElementById("how-to").style.display = "none";
    document.getElementById("menu").style.display = "block";
  }

  // ===== ELEMENTS =====
  const dealerCardsEl = document.getElementById("dealer-cards");
  const playerCardsEl = document.getElementById("player-cards");
  const dealerScoreEl = document.getElementById("dealer-points");
  const playerScoreEl = document.getElementById("player-points");
  const messageEl = document.getElementById("message");

  const newGameBtn = document.getElementById("new-game-btn");
  const hitBtn = document.getElementById("hit-btn");
  const standBtn = document.getElementById("stand-btn");

  // ===== GAME STATE =====
  let deck = [];
  let playerHand = [];
  let dealerHand = [];
  let gameOver = false;

  let maxBet = 100;
  function resetBets() { maxBet = 100; }

  // ===== DECK FUNCTIONS =====
  function createDeck() {
    const suits = ["♠","♥","♦","♣"];
    const values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
    let newDeck = [];
    for (let suit of suits) {
      for (let value of values) {
        newDeck.push({ value, suit });
      }
    }
    return shuffle(newDeck);
  }

  function shuffle(deck) {
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i+1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function getCardValue(card) {
    if(["J","Q","K"].includes(card.value)) return 10;
    if(card.value === "A") return 11;
    return parseInt(card.value);
  }

  function calculateHand(hand) {
    let value=0, aces=0;
    for(let c of hand) {
      value += getCardValue(c);
      if(c.value === "A") aces++;
    }
    while(value>21 && aces>0) { value-=10; aces--; }
    return value;
  }

  function renderHand(hand, container, pointsContainer) {
    container.innerHTML="";
    for(let c of hand) {
      const cardEl = document.createElement("div");
      cardEl.className="card";
      cardEl.textContent=c.value+c.suit;
      cardEl.style.color=(c.suit==="♥"||c.suit==="♦")?"red":"black";
      container.appendChild(cardEl);
    }
    pointsContainer.textContent = calculateHand(hand);
  }

  function newGame() {
    deck = createDeck();
    playerHand=[deck.pop(),deck.pop()];
    dealerHand=[deck.pop(),deck.pop()];
    gameOver=false;
    messageEl.textContent="Current max bet: $"+maxBet;
    renderHand(playerHand,playerCardsEl,playerScoreEl);
    renderHand(dealerHand,dealerCardsEl,dealerScoreEl);
  }

  function hit() {
    if(gameOver) return;
    playerHand.push(deck.pop());
    renderHand(playerHand,playerCardsEl,playerScoreEl);
    if(calculateHand(playerHand)>21) {
      messageEl.textContent="You busted! Max bet reset to $100.";
      resetBets(); gameOver=true;
    }
  }

  function stand() {
    if(gameOver) return;
    while(calculateHand(dealerHand)<17) {
      dealerHand.push(deck.pop());
      renderHand(dealerHand,dealerCardsEl,dealerScoreEl);
    }
    gameOver=true;
    const playerValue = calculateHand(playerHand);
    const dealerValue = calculateHand(dealerHand);
    if(dealerValue>21 || playerValue>dealerValue) { maxBet+=10; messageEl.textContent="You win! Next max bet: $"+maxBet; }
    else if(dealerValue>playerValue) { resetBets(); messageEl.textContent="Dealer wins! Max bet reset to $100."; }
    else messageEl.textContent="Tie! Max bet stays at $"+maxBet;
  }

  // ===== EVENTS =====
  newGameBtn.addEventListener("click", newGame);
  hitBtn.addEventListener("click", hit);
  standBtn.addEventListener("click", stand);

  // Show menu first
  document.getElementById("menu").style.display="block";

});
</script>

</body>
</html>
