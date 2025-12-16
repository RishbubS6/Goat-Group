---
layout: opencs
title: Blackjack Card Game
permalink: /javascript/project/blackjack
---
<style>
    #game-container {
        width: 800px;
        margin: 0 auto;
        background-color: #fff;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        display: none;
    }

    #menu, #how-to {
        text-align: center;
        margin-top: 100px;
    }

    .points-list {
        list-style: none;
        margin-left: 20px;
        padding: 0;
        font-size: 18px;
        font-weight: bold;
        color: #333;
    }

    #message {
        color: black !important;
        font-weight: bold;
    }

    .player-area {
        margin-bottom: 20px;
    }

    .cards-container {
        display: flex;
        justify-content: center;
        min-height: 120px;
    }

    .card {
        width: 80px;
        height: 110px;
        border: 1px solid #333;
        border-radius: 5px;
        margin: 5px;
        display: flex;
        justify-content: center;
        align-items: center;
        font-size: 24px;
        font-weight: bold;
        background-color: #fff;
        box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
    }

    button {
        padding: 10px 20px;
        margin: 10px;
        font-size: 16px;
        cursor: pointer;
    }

    .hand-container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }
</style>

<div id="menu">
    <h1>Blackjack</h1>
    <button onclick="startGame()">Play Game</button>
    <button onclick="showHowTo()">How to Play</button>
</div>

<div id="how-to" style="display:none;">
    <h2>How to Play</h2>
    <p>
        Try to get as close to 21 as possible without going over.<br>
        Face cards are worth 10.<br>
        Aces are worth 1 or 11.<br>
        Dealer hits on 16.
    </p>
    <button onclick="goBack()">Back</button>
</div>

<div id="game-container">
    <h2>Blackjack</h2>
    <p>Dealer hits on 16</p>

    <div id="dealer-area" class="player-area">
        <h2>Dealer's Hand: <span id="dealer-score">0</span></h2>
        <div class="hand-container">
            <div id="dealer-cards" class="cards-container"></div>
            <div id="dealer-points" class="points-list"></div>
        </div>
    </div>

    <div id="player-area" class="player-area">
        <h2>Your Hand: <span id="player-score">0</span></h2>
        <div class="hand-container">
            <div id="player-cards" class="cards-container"></div>
            <div id="player-points" class="points-list"></div>
        </div>
    </div>

    <div id="game-controls">
        <button id="new-game-btn">New Game</button>
        <button id="hit-btn">Hit</button>
        <button id="stand-btn">Stand</button>
    </div>

    <p id="message"></p>
</div>

<script>
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

const dealerCardsEl = document.getElementById("dealer-cards");
const playerCardsEl = document.getElementById("player-cards");
const dealerScoreEl = document.getElementById("dealer-score");
const playerScoreEl = document.getElementById("player-score");
const messageEl = document.getElementById("message");

const newGameBtn = document.getElementById("new-game-btn");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");

let deck = [];
let playerHand = [];
let dealerHand = [];
let gameOver = false;

function createDeck() {
    const suits = ["♠", "♥", "♦", "♣"];
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
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function getCardValue(card) {
    if (["J","Q","K"].includes(card.value)) return 10;
    if (card.value === "A") return 11;
    return parseInt(card.value);
}

function calculateHand(hand) {
    let value = 0;
    let aces = 0;

    for (let card of hand) {
        value += getCardValue(card);
        if (card.value === "A") aces++;
    }

    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }
    return value;
}

function renderHand(hand, container, pointsContainer) {
    container.innerHTML = "";
    for (let card of hand) {
        const cardEl = document.createElement("div");
        cardEl.className = "card";
        cardEl.textContent = card.value + card.suit;
        cardEl.style.color =
            (card.suit === "♥" || card.suit === "♦") ? "red" : "black";
        container.appendChild(cardEl);
    }
    pointsContainer.textContent = calculateHand(hand);
}

function renderDealerInitial() {
    dealerCardsEl.innerHTML = "";

    const firstCard = dealerHand[0];
    const cardEl1 = document.createElement("div");
    cardEl1.className = "card";
    cardEl1.textContent = firstCard.value + firstCard.suit;
    cardEl1.style.color =
        (firstCard.suit === "♥" || firstCard.suit === "♦") ? "red" : "black";
    dealerCardsEl.appendChild(cardEl1);

    const hiddenCard = document.createElement("div");
    hiddenCard.className = "card";
    hiddenCard.textContent = "🂠";
    dealerCardsEl.appendChild(hiddenCard);

    document.getElementById("dealer-points").textContent =
        getCardValue(firstCard);
}

function updateScores() {
    dealerScoreEl.textContent = calculateHand(dealerHand);
    playerScoreEl.textContent = calculateHand(playerHand);
}

function checkGameOver() {
    const playerValue = calculateHand(playerHand);
    const dealerValue = calculateHand(dealerHand);

    if (playerValue > 21) {
        messageEl.textContent = "You busted! Dealer wins.";
        gameOver = true;
        return;
    }

    if (dealerValue > 21) {
        messageEl.textContent = "Dealer busted! You win!";
        gameOver = true;
        return;
    }

    if (gameOver) {
        if (playerValue > dealerValue) messageEl.textContent = "You win!";
        else if (dealerValue > playerValue) messageEl.textContent = "Dealer wins!";
        else messageEl.textContent = "It's a tie.";
    }
}

function newGame() {
    deck = createDeck();
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    gameOver = false;

    renderHand(playerHand, playerCardsEl, document.getElementById("player-points"));
    renderDealerInitial();
    messageEl.textContent = "Your move.";
}

function hit() {
    if (gameOver) return;
    playerHand.push(deck.pop());
    renderHand(playerHand, playerCardsEl, document.getElementById("player-points"));
    if (calculateHand(playerHand) > 21) checkGameOver();
}

function stand() {
    if (gameOver) return;

    dealerCardsEl.children[1].textContent =
        dealerHand[1].value + dealerHand[1].suit;

    dealerCardsEl.children[1].style.color =
        (dealerHand[1].suit === "♥" || dealerHand[1].suit === "♦") ? "red" : "black";

    document.getElementById("dealer-points").textContent =
        calculateHand(dealerHand);

    while (calculateHand(dealerHand) < 17) {
        dealerHand.push(deck.pop());
        renderHand(
            dealerHand,
            dealerCardsEl,
            document.getElementById("dealer-points")
        );
    }

    updateScores();
    gameOver = true;
    checkGameOver();
}

newGameBtn.addEventListener("click", newGame);
hitBtn.addEventListener("click", hit);
standBtn.addEventListener("click", stand);
</script>