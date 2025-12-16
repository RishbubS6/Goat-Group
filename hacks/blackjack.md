---
layout: null
permalink: /javascript/project/blackjack/
---

<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Blackjack Card Game</title>

<!-- Custom font if your site had one -->
<link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">

<style>
  body {
    font-family: 'Roboto', sans-serif;
    margin:0;
    padding:0;
    background:#0b3d0b; /* dark green table background */
    color:white;
    text-align:center;
  }

  h1,h2 { margin:15px 0; }
  button {
    padding:10px 20px;
    margin:10px;
    font-size:16px;
    border:none;
    border-radius:5px;
    cursor:pointer;
    background:#ffd700;
    color:#000;
    font-weight:bold;
    transition: transform 0.1s;
  }
  button:hover { transform: scale(1.05); }

  #menu, #how-to, #game-container { display:none; }

  #game-container {
    margin-top:20px;
  }

  .cards {
    margin:10px 0;
    display:flex;
    justify-content:center;
    flex-wrap: wrap;
  }

  .card {
    background:white;
    color:black;
    border-radius:8px;
    width:60px;
    height:90px;
    display:flex;
    justify-content:center;
    align-items:center;
    margin:5px;
    font-weight:bold;
    font-size:20px;
    box-shadow: 2px 2px 5px #000;
  }

  #dealer-cards .card.red, #player-cards .card.red { color:red; }
  #message {
    margin:15px 0;
    font-size:18px;
    font-weight:bold;
  }

</style>
</head>
<body>

<!-- ===== MENU ===== -->
<div id="menu">
  <h1>Blackjack</h1>
  <button onclick="startGame()">Play Game</button>
  <button onclick="showHowTo()">How to Play</button>
</div>

<!-- ===== HOW TO PLAY ===== -->
<div id="how-to">
  <h1>How to Play</h1>
  <p>Click <b>Hit</b> to draw a card. Click <b>Stand</b> to end your turn. Try not to exceed 21!</p>
  <p>Each win increases your max bet by $10. Losing resets it to $100.</p>
  <button onclick="goBack()">Back</button>
</div>

<!-- ===== GAME ===== -->
<div id="game-container">
  <h2>Dealer</h2>
  <div id="dealer-cards" class="cards"></div>
  <p>Points: <span id="dealer-points">0</span></p>

  <h2>Player</h2>
  <div id="player-cards" class="cards"></div>
  <p>Points: <span id="player-points">0</span></p>

  <p id="message"></p>

  <div>
    <button id="new-game-btn">New Game</button>
    <button id="hit-btn">Hit</button>
    <button id="stand-btn">Stand</button>
  </div>
</div>

<script>
document.addEventListener("DOMContentLoaded", function(){

// ===== MENU FUNCTIONS =====
function startGame(){
  document.getElementById("menu").style.display="none";
  document.getElementById("how-to").style.display="none";
  document.getElementById("game-container").style.display="block";
  newGame();
}
function showHowTo(){
  document.getElementById("menu").style.display="none";
  document.getElementById("how-to").style.display="block";
}
function goBack(){
  document.getElementById("how-to").style.display="none";
  document.getElementById("menu").style.display="block";
}

// ===== ELEMENTS =====
const dealerCardsEl=document.getElementById("dealer-cards");
const playerCardsEl=document.getElementById("player-cards");
const dealerScoreEl=document.getElementById("dealer-points");
const playerScoreEl=document.getElementById("player-points");
const messageEl=document.getElementById("message");
const newGameBtn=document.getElementById("new-game-btn");
const hitBtn=document.getElementById("hit-btn");
const standBtn=document.getElementById("stand-btn");

// ===== GAME STATE =====
let deck=[],playerHand=[],dealerHand=[],gameOver=false;
let maxBet=100;
function resetBets(){ maxBet=100; }

// ===== DECK FUNCTIONS =====
function createDeck(){
  const suits=["♠","♥","♦","♣"];
  const values=["A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  let d=[];
  for(let s of suits){ for(let v of values){ d.push({value:v,suit:s}); } }
  return shuffle(d);
}
function shuffle(deck){
  for(let i=deck.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [deck[i],deck[j]]=[deck[j],deck[i]]; }
  return deck;
}
function getCardValue(c){ if(["J","Q","K"].includes(c.value)) return 10; if(c.value==="A") return 11; return parseInt(c.value); }
function calculateHand(hand){
  let val=0,aces=0;
  for(let c of hand){ val+=getCardValue(c); if(c.value==="A") aces++; }
  while(val>21 && aces>0){ val-=10; aces--; }
  return val;
}
function renderHand(hand,container,points){
  container.innerHTML="";
  for(let c of hand){
    const card=document.createElement("div");
    card.className="card "+((c.suit==="♥"||c.suit==="♦")?"red":"");
    card.textContent=c.value+c.suit;
    container.appendChild(card);
  }
  points.textContent=calculateHand(hand);
}

// ===== GAME LOGIC =====
function newGame(){
  deck=createDeck();
  playerHand=[deck.pop(),deck.pop()];
  dealerHand=[deck.pop(),deck.pop()];
  gameOver=false;
  messageEl.textContent="Current max bet: $"+maxBet;
  renderHand(playerHand,playerCardsEl,playerScoreEl);
  renderHand(dealerHand,dealerCardsEl,dealerScoreEl);
}
function hit(){
  if(gameOver) return;
  playerHand.push(deck.pop());
  renderHand(playerHand,playerCardsEl,playerScoreEl);
  if(calculateHand(playerHand)>21){ messageEl.textContent="You busted! Max bet reset to $100."; resetBets(); gameOver=true; }
}
function stand(){
  if(gameOver) return;
  while(calculateHand(dealerHand)<17){ dealerHand.push(deck.pop()); renderHand(dealerHand,dealerCardsEl,dealerScoreEl); }
  gameOver=true;
  const pv=calculateHand(playerHand), dv=calculateHand(dealerHand);
  if(dv>21||pv>dv){ maxBet+=10; messageEl.textContent="You win! Next max bet: $"+maxBet; }
  else if(dv>pv){ resetBets(); messageEl.textContent="Dealer wins! Max bet reset to $100."; }
  else messageEl.textContent="Tie! Max bet stays at $"+maxBet;
}

// ===== EVENTS =====
newGameBtn.addEventListener("click",newGame);
hitBtn.addEventListener("click",hit);
standBtn.addEventListener("click",stand);

// Show menu first
document.getElementById("menu").style.display="block";

});
</script>

</body>
</html>