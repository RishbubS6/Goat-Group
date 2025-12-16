---
layout: opencs
title: Blackjack Card Game
permalink: /javascript/project/blackjack
---
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

/* ===== BET PROGRESSION SYSTEM ===== */
let maxBet = 100;

function resetBets() {
    maxBet = 100;
}

/* ================================ */

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
        messageEl.textContent =
            "You busted! You lost everything. Max bet reset to $100.";
        resetBets();
        gameOver = true;
        return;
    }

    if (dealerValue > 21) {
        maxBet += 10;
        messageEl.textContent =
            "Dealer busted! You win! Next max bet: $" + maxBet;
        gameOver = true;
        return;
    }

    if (gameOver) {
        if (playerValue > dealerValue) {
            maxBet += 10;
            messageEl.textContent =
                "You win! Next max bet: $" + maxBet;
        } else if (dealerValue > playerValue) {
            resetBets();
            messageEl.textContent =
                "Dealer wins! You lost everything. Max bet reset to $100.";
        } else {
            messageEl.textContent =
                "It's a tie. Max bet stays at $" + maxBet;
        }
    }
}

function newGame() {
    deck = createDeck();
    playerHand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    gameOver = false;

    renderHand(playerHand, playerCardsEl, document.getElementById("player-points"));
    renderDealerInitial();
    messageEl.textContent =
        "Current max bet: $" + maxBet + ". Your move.";
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