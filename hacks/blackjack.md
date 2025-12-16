---
layout: default
title: Blackjack Card Game
permalink: /javascript/project/blackjack
---

{% raw %}
<script>
document.addEventListener("DOMContentLoaded", function () {

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
const dealerScoreEl = document.getElementById("dealer-points");
const playerScoreEl = document.getElementById("player-points");
const messageEl = document.getElementById("message");

const newGameBtn = document.getElementById("new-game-btn");
const hitBtn = document.getElementById("hit-btn");
const standBtn = document.getElementById("stand-btn");

let deck = [];
let playerHand = [];
let dealerHand = [];
let gameOver = false;
let maxBet = 100;

function resetBets() {
    maxBet = 100;
}

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
        container.appendChild(cardEl);
    }
    pointsContainer.textContent = calculateHand(hand);
}

function renderDealerInitial() {
    dealerCardsEl.innerHTML = "";
    const firstCard = dealerHand[0];
    const cardEl = document.createElement("div");
    cardEl.className = "card";
    cardEl.textContent = firstCard.value + firstCard.suit;
    dealerCardsEl.appendChild(cardEl);
    const hidden = document.createElement("div");
    hidden.className = "card";
    hidden.textContent = "🂠";
    dealerCardsEl.appendChild(hidden);
    dealerScoreEl.textContent = getCardValue(firstCard);
}

function newGame() {
    deck = createDeck();
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    gameOver = false;
    renderHand(playerHand, playerCardsEl, playerScoreEl);
    renderDealerInitial();
    messageEl.textContent = "Current max bet: $" + maxBet;
}

function hit() {
    if (gameOver) return;
    playerHand.push(deck.pop());
    renderHand(playerHand, playerCardsEl, playerScoreEl);
}

function stand() {
    if (gameOver) return;
    gameOver = true;
}

newGameBtn.addEventListener("click", newGame);
hitBtn.addEventListener("click", hit);
standBtn.addEventListener("click", stand);

});
</script>
{% endraw %}
