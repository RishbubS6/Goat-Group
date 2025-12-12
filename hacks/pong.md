---
layout: post
title: 🏓 Complete Pong Game Code Implementation
description: Complete HTML, CSS, and JavaScript code for building a fully functional 2-player Pong game
categories: ['Game Development', 'JavaScript', 'Canvas API', 'Code Implementation']
permalink: /custompong
menu: nav/tools_setup.html
toc: True
comments: True
---

## Pong Game Demo

<div class="game-canvas-container" style="text-align:center;">
  <canvas id="pongCanvas" width="800" height="500"></canvas>
  <br>
  <button id="restartBtn">Restart Game</button>
</div>

<style>
  .game-canvas-container {
    margin-top: 20px;
  }
  #pongCanvas {
    border: 2px solid #fff;
    background: #000;
  }
  #restartBtn {
    display: none;
    margin-top: 15px;
    padding: 10px 20px;
    font-size: 18px;
    border: none;
    border-radius: 6px;
    background: #4caf50;
    color: white;
    cursor: pointer;
  }
  #restartBtn:hover {
    background: #45a049;
  }
</style>

<script>
// =============================
// Pong (Object-Oriented Version)
// =============================
// This refactor makes the game easy to modify and includes student TODOs.
// Teachers: Encourage students to change the Config values and complete TODOs.

// -----------------------------
// Config: Tweak these values
// -----------------------------
const Config = {
  canvas: { width: 800, height: 500 },
  paddle: { width: 10, height: 100, speed: 10.5 },
  ball: { radius: 10, baseSpeedX: 5, maxRandomY: 2, spinFactor: 0.3, maxSpeed: 12 },
  bumper: { enabledAtScore: 9, radius: 40, color: "#ed1111ff" },
  rules: { winningScore: 11 },
  keys: {
    // TODO[Students]: Remap keys if desired
    p1Up: "w", p1Down: "s",
    p2Up: "ArrowUp", p2Down: "ArrowDown"
  },
  visuals: { bg: "#000", fg: "#fff", text: "#fff", gameOver: "red", win: "yellow" }
};

// Basic vector helper for clarity
class Vector2 {
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
}

class Paddle {
  constructor(x, y, width, height, speed, boundsHeight) {
    this.position = new Vector2(x, y);
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.boundsHeight = boundsHeight;
  }
  move(dy) {
    this.position.y = Math.min(
      this.boundsHeight - this.height,
      Math.max(0, this.position.y + dy)
    );
  }
  rect() { return { x: this.position.x, y: this.position.y, w: this.width, h: this.height }; }
}

class Ball {
  constructor(radius, boundsWidth, boundsHeight) {
    this.radius = radius;
    this.boundsWidth = boundsWidth;
    this.boundsHeight = boundsHeight;
    this.position = new Vector2();
    this.velocity = new Vector2();
    this.reset(true);
  }
  reset(randomDirection = false) {
    this.position.x = this.boundsWidth / 2;
    this.position.y = this.boundsHeight / 2;
    const dir = randomDirection && Math.random() > 0.5 ? 1 : -1;
    this.velocity.x = dir * Config.ball.baseSpeedX;
    this.velocity.y = (Math.random() * (2 * Config.ball.maxRandomY)) - Config.ball.maxRandomY;
  }
  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    // Bounce off top/bottom walls
    if (this.position.y + this.radius > this.boundsHeight || this.position.y - this.radius < 0) {
      this.velocity.y *= -1;
    }
  }
}

class Input {
  constructor() {
    this.keys = {};
    // Prevent default browser behavior for keys we use (arrow keys, space)
    document.addEventListener("keydown", e => {
      const k = e.key;
      if (k === 'ArrowUp' || k === 'ArrowDown' || k === ' ' || k === 'Spacebar') {
        e.preventDefault();
      }
      this.keys[k] = true;
    });
    document.addEventListener("keyup", e => {
      this.keys[e.key] = false;
    });
  }
  isDown(k) { return !!this.keys[k]; }
}

class Renderer {
  constructor(ctx) { this.ctx = ctx; }
  clear(w, h) {
    this.ctx.fillStyle = Config.visuals.bg;
    this.ctx.fillRect(0, 0, w, h);
  }
  rect(r, color = Config.visuals.fg) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(r.x, r.y, r.w, r.h);
  }
  circle(ball, color = Config.visuals.fg) {
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(ball.position.x, ball.position.y, ball.radius, 0, Math.PI * 2);
    this.ctx.closePath();
    this.ctx.fill();
  }
  text(t, x, y, color = Config.visuals.text) {
    this.ctx.fillStyle = color;
    this.ctx.font = "30px Arial";
    this.ctx.fillText(t, x, y);
  }
}

class Game {
  constructor(canvasEl, restartBtn) {
    // Canvas
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.renderer = new Renderer(this.ctx);

    // Systems
    this.input = new Input();

    // Entities
    const { width, height, speed } = Config.paddle;
    this.paddleLeft = new Paddle(0, (Config.canvas.height - height) / 2, width, height, speed, Config.canvas.height);
    this.paddleRight = new Paddle(Config.canvas.width - width, (Config.canvas.height - height) / 2, width, height, speed, Config.canvas.height);
    this.ball = new Ball(Config.ball.radius, Config.canvas.width, Config.canvas.height);

    // Rules/state
    this.scores = { p1: 0, p2: 0 };
    this.gameOver = false;
    this.restartBtn = restartBtn;
    this.restartBtn.addEventListener("click", () => this.restart());

    this.loop = this.loop.bind(this);
  }

  // -------------------------------
  // TODO[Students]: Add an AI player
  // Replace the right paddle control with simple AI:
  // if (this.ball.position.y > centerY) move down else move up.
  // Try making difficulty adjustable with a speed multiplier.
  // -------------------------------

  handleInput() {
    if (this.gameOver) return;
    // Player 1 controls
    if (this.input.isDown(Config.keys.p1Up)) this.paddleLeft.move(-this.paddleLeft.speed);
    if (this.input.isDown(Config.keys.p1Down)) this.paddleLeft.move(this.paddleLeft.speed);
    // Player 2 controls (human). Swap to AI per TODO above.
    if (this.input.isDown(Config.keys.p2Up)) this.paddleRight.move(-this.paddleRight.speed);
    if (this.input.isDown(Config.keys.p2Down)) this.paddleRight.move(this.paddleRight.speed);
  }

  update() {
    if (this.gameOver) return;
    this.ball.update();

    // --- bumper collision (active once combined score reaches configured value) ---
    const bumperActive = ((this.scores.p1 + this.scores.p2) >= Config.bumper.enabledAtScore);
    if (bumperActive) {
      const cx = Config.canvas.width / 2;
      const cy = Config.canvas.height / 2;
      const br = Config.bumper.radius;
      const dx = this.ball.position.x - cx;
      const dy = this.ball.position.y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const minDist = br + this.ball.radius;
      if (dist <= minDist) {
        // normal vector from bumper center to ball
        const inv = dist === 0 ? 1 : 1 / dist;
        const nx = dx * inv;
        const ny = dy * inv;
        // reflect velocity around normal: v' = v - 2*(v·n)*n
        const vdotn = this.ball.velocity.x * nx + this.ball.velocity.y * ny;
        this.ball.velocity.x = this.ball.velocity.x - 2 * vdotn * nx;
        this.ball.velocity.y = this.ball.velocity.y - 2 * vdotn * ny;
        // push ball out of bumper to avoid sticking
        const overlap = (minDist - dist) + 0.5;
        this.ball.position.x += nx * overlap;
        this.ball.position.y += ny * overlap;
        // enforce max speed after bumper reflection
        this.capBallSpeed(10);
      }
    }

    // Paddle collisions with ball
    const hitLeft = this.ball.position.x - this.ball.radius < this.paddleLeft.width &&
      this.ball.position.y > this.paddleLeft.position.y &&
      this.ball.position.y < this.paddleLeft.position.y + this.paddleLeft.height;

    if (hitLeft) {
      this.ball.velocity.x *= -1;
      const delta = this.ball.position.y - (this.paddleLeft.position.y + this.paddleLeft.height / 2);
      this.ball.velocity.y = delta * Config.ball.spinFactor; // "spin"
      // Increase ball speed by 1.25x on paddle hit (preserve numeric safety)
      if (this.ball && this.ball.velocity && typeof this.ball.velocity.x === 'number') {
        this.ball.velocity.x = this.ball.velocity.x * 1.25;
      }
      if (this.ball && this.ball.velocity && typeof this.ball.velocity.y === 'number') {
        this.ball.velocity.y = this.ball.velocity.y * 1.25;
      }
      // enforce max speed
      this.capBallSpeed();
    }

    const hitRight = this.ball.position.x + this.ball.radius > (Config.canvas.width - this.paddleRight.width) &&
      this.ball.position.y > this.paddleRight.position.y &&
      this.ball.position.y < this.paddleRight.position.y + this.paddleRight.height;

    if (hitRight) {
      this.ball.velocity.x *= -1;
      const delta = this.ball.position.y - (this.paddleRight.position.y + this.paddleRight.height / 2);
      this.ball.velocity.y = delta * Config.ball.spinFactor;
      // Increase ball speed by 1.25x on paddle hit (preserve numeric safety)
      if (this.ball && this.ball.velocity && typeof this.ball.velocity.x === 'number') {
        this.ball.velocity.x = this.ball.velocity.x * 1.25;
      }
      if (this.ball && this.ball.velocity && typeof this.ball.velocity.y === 'number') {
        this.ball.velocity.y = this.ball.velocity.y * 1.25;
      }
      // enforce max speed
      this.capBallSpeed();
    }

    // Scoring
    if (this.ball.position.x - this.ball.radius < 0) {
      this.scores.p2++;
      this.checkWin() || this.ball.reset();
    } else if (this.ball.position.x + this.ball.radius > Config.canvas.width) {
      this.scores.p1++;
      this.checkWin() || this.ball.reset();
    }
  }

  checkWin() {
    if (this.scores.p1 >= Config.rules.winningScore || this.scores.p2 >= Config.rules.winningScore) {
      this.gameOver = true;
      this.restartBtn.style.display = "inline-block";
      return true;
    }
    return false;
  }

  // Cap ball speed to Config.ball.maxSpeed while preserving direction
  capBallSpeed() {
    if (!this.ball || !this.ball.velocity) return;
    const max = (Config.ball && Config.ball.maxSpeed) ? Config.ball.maxSpeed : 15;
    const vx = this.ball.velocity.x || 0;
    const vy = this.ball.velocity.y || 0;
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > max && speed > 0) {
      const scale = max / speed;
      this.ball.velocity.x = vx * scale;
      this.ball.velocity.y = vy * scale;
    }
  }

  draw() {
    this.renderer.clear(Config.canvas.width, Config.canvas.height);
    this.renderer.rect(this.paddleLeft.rect());
    this.renderer.rect(this.paddleRight.rect());
    // draw bumper if active (draw before ball so ball is visible on top)
    const bumperActive = ((this.scores.p1 + this.scores.p2) >= Config.bumper.enabledAtScore);
    if (bumperActive) {
      const cx = Config.canvas.width / 2;
      const cy = Config.canvas.height / 2;
      const br = Config.bumper.radius;
      this.renderer.circle({ position: { x: cx, y: cy }, radius: br }, Config.bumper.color);
    }
    this.renderer.circle(this.ball);
    this.renderer.text(this.scores.p1, Config.canvas.width / 4, 50);
    this.renderer.text(this.scores.p2, 3 * Config.canvas.width / 4, 50);
    // Display current ball speed for player reference
    if (this.ball && this.ball.velocity) {
      const vx = this.ball.velocity.x || 0;
      const vy = this.ball.velocity.y || 0;
      const speed = Math.sqrt(vx * vx + vy * vy);
      this.renderer.text("Speed: " + speed.toFixed(2), Config.canvas.width - 200, 30);
    }
    if (this.gameOver) {
      this.renderer.text("Game Over", Config.canvas.width / 2 - 80, Config.canvas.height / 2 - 20, Config.visuals.gameOver);
      const msg = this.scores.p1 >= Config.rules.winningScore ? "Player 1 Wins!" : "Player 2 Wins!";
      this.renderer.text(msg, Config.canvas.width / 2 - 120, Config.canvas.height / 2 + 20, Config.visuals.win);
    }
  }

  restart() {
    this.scores.p1 = 0; this.scores.p2 = 0;
    this.paddleLeft.position.y = (Config.canvas.height - this.paddleLeft.height) / 2;
    this.paddleRight.position.y = (Config.canvas.height - this.paddleRight.height) / 2;
    this.ball.reset(true);
    this.gameOver = false;
    this.restartBtn.style.display = "none";
  }

  loop() {
    this.handleInput();
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  }
}

// -------------------------------
// Bootstrapping
// -------------------------------
const canvas = document.getElementById('pongCanvas');
const restartBtn = document.getElementById('restartBtn');

// Ensure canvas matches Config every load (keeps HTML in sync)
canvas.width = Config.canvas.width;
canvas.height = Config.canvas.height;

const game = new Game(canvas, restartBtn);
game.loop();

// -----------------------------------------
// Student Challenges (inline TODO checklist)
// -----------------------------------------
// 1) Make it YOUR game: change colors in Config.visuals, dimensions/speeds in Config.
// 2) Add AI: implement simple tracking for right paddle in handleInput (hint above).
// 3) Rally speed-up: every time the ball hits a paddle, slightly increase |velocity.x|.
// 4) Center line + score SFX: draw a dashed midline; play an audio on score.
// 5) Power-ups: occasionally spawn a small rectangle; when ball hits it, apply effect (bigger paddle? faster ball?).
// 6) Pause/Resume: map a key to toggle pause state in Game and skip updates when paused.
// 7) Win screen polish: show a replay countdown, then auto-restart.
</script>