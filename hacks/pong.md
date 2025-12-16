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
  <div style="margin-bottom:12px;">
    <button id="startPvP" style="margin-right:8px; padding:8px 16px; font-size:16px;">Start PvP</button>
    <button id="startAI" style="padding:8px 16px; font-size:16px;">Start AI</button>
  </div>
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
  ball: { radius: 10, baseSpeedX: 5, maxRandomY: 2, spinFactor: 0.3, maxSpeed: 15 },
  powerUp: { spawnMinSec: 6, spawnMaxSec: 14, width: 28, height: 14, durationSec: 6, colors: { bg: '#ffdd57', border: '#ffaa00' } },
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
  constructor(canvasEl, restartBtn, opts = {}) {
    // Canvas
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext('2d');
    this.renderer = new Renderer(this.ctx);
    this.ai = !!opts.ai;

    // Systems
    this.input = new Input();

    // Entities
    const { width, height, speed } = Config.paddle;
    this.paddleLeft = new Paddle(0, (Config.canvas.height - height) / 2, width, height, speed, Config.canvas.height);
    this.paddleRight = new Paddle(Config.canvas.width - width, (Config.canvas.height - height) / 2, width, height, speed, Config.canvas.height);
    // support multiple balls (start with one)
    this.balls = [ new Ball(Config.ball.radius, Config.canvas.width, Config.canvas.height) ];

    // track last multi-ball trigger per player so we only spawn when they *reach* a multiple of 3
    this.multiTriggered = { p1: 0, p2: 0 };

    // Rules/state
    this.scores = { p1: 0, p2: 0 };
    this.gameOver = false;
    this.restartBtn = restartBtn;
    this.restartBtn.addEventListener("click", () => this.restart());

    this.loop = this.loop.bind(this);
    // pause state
    this.paused = false;
    this.audioCtx = null;
    // power-up state: null or {x,y,type,expiresAt}
    this.powerUp = null;
    this.nextPowerUpAt = performance.now() + this.randRange(Config.powerUp.spawnMinSec*1000, Config.powerUp.spawnMaxSec*1000);
    // active effects per paddle: { left: { until: timestamp, type }, right: { ... } }
    this.activeEffects = { left: null, right: null };
    // replay countdown state
    this.replayCountdown = null; // { until: timestamp }

    // bind pause key (space) — toggle paused
    document.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); this.togglePause(); }
    });
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
    // Player 2: either human or simple AI
    if (this.ai) {
      this.updateAI();
    } else {
      if (this.input.isDown(Config.keys.p2Up)) this.paddleRight.move(-this.paddleRight.speed);
      if (this.input.isDown(Config.keys.p2Down)) this.paddleRight.move(this.paddleRight.speed);
    }
  }

  // Simple AI: track ball Y and move paddle toward it (with small deadzone)
  updateAI() {
    if (!this.balls || this.balls.length === 0) return;
    // Only track balls that are on the AI's half (right side)
    const midX = Config.canvas.width / 2;
    const candidates = this.balls.filter(b => b.position.x >= midX);
    if (candidates.length === 0) return;
    // pick the ball closest vertically to the paddle center
    let target = candidates[0];
    let bestDist = Math.abs(target.position.y - (this.paddleRight.position.y + this.paddleRight.height / 2));
    for (let i = 1; i < candidates.length; i++) {
      const d = Math.abs(candidates[i].position.y - (this.paddleRight.position.y + this.paddleRight.height / 2));
      if (d < bestDist) { target = candidates[i]; bestDist = d; }
    }
    const centerY = this.paddleRight.position.y + this.paddleRight.height / 2;
    const diff = target.position.y - centerY;
    const deadzone = 6;
    if (Math.abs(diff) <= deadzone) return;
    const dir = diff > 0 ? 1 : -1;
    this.paddleRight.move(dir * this.paddleRight.speed * 0.9);
  }

  randRange(min, max) { return Math.random() * (max - min) + min; }

  togglePause() { this.paused = !this.paused; if (!this.paused) this.loop(); }

  update() {
    if (this.gameOver) return;
    // Update all balls
    for (const b of this.balls) b.update();

    // power-up spawn timer
    const now = performance.now();
    if (!this.powerUp && now >= this.nextPowerUpAt) {
      // spawn a random positioned power-up in the center area
      const margin = 60;
      const x = this.randRange(margin, Config.canvas.width - margin);
      const y = this.randRange(margin, Config.canvas.height - margin);
      this.powerUp = { x, y, w: Config.powerUp.width, h: Config.powerUp.height, type: null, spawnedAt: now };
      // schedule removal if not collected
      this.nextPowerUpAt = now + this.randRange(Config.powerUp.spawnMinSec*1000, Config.powerUp.spawnMaxSec*1000);
      // choose a random type (1: bigger paddle for hitter, 2: faster ball, 3: give opponent bigger paddle)
      const t = Math.floor(Math.random()*3)+1; this.powerUp.type = t;
    }

    // check ball collisions with power-up
    if (this.powerUp) {
      for (const b of this.balls) {
        if (this._ballHitsRect(b, this.powerUp)) {
          // determine last paddle to hit the ball
          const hitter = b.lastHit || (b.velocity.x > 0 ? 'p1' : 'p2');
          const player = (hitter === 'p1') ? 'left' : 'right';
          this._applyPowerUp(this.powerUp.type, player);
          this.powerUp = null;
          break;
        }
      }
    }

    // handle active effect expirations
    for (const side of ['left','right']) {
      const eff = this.activeEffects[side];
      if (eff && eff.until && now >= eff.until) {
        // revert effects
        if (eff.type === 'big') {
          // revert paddle size
          const p = (side === 'left') ? this.paddleLeft : this.paddleRight;
          p.height = Config.paddle.height;
        } else if (eff.type === 'big_opponent') {
          const p = (side === 'left') ? this.paddleRight : this.paddleLeft;
          p.height = Config.paddle.height;
        } else if (eff.type === 'ball_fast') {
          // revert ball velocities by dividing by factor
          const factor = eff.factor || 1.6;
          for (const bb of this.balls) { bb.velocity.x /= factor; bb.velocity.y /= factor; }
        }
        this.activeEffects[side] = null;
      }
    }

    // --- bumper collision (active once combined score reaches configured value) ---
    const bumperActive = ((this.scores.p1 + this.scores.p2) >= Config.bumper.enabledAtScore);
    if (bumperActive) {
      const cx = Config.canvas.width / 2;
      const cy = Config.canvas.height / 2;
      const br = Config.bumper.radius;
      for (const b of this.balls) {
        const dx = b.position.x - cx;
        const dy = b.position.y - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = br + b.radius;
        if (dist <= minDist) {
          const inv = dist === 0 ? 1 : 1 / dist;
          const nx = dx * inv;
          const ny = dy * inv;
          const vdotn = b.velocity.x * nx + b.velocity.y * ny;
          b.velocity.x = b.velocity.x - 2 * vdotn * nx;
          b.velocity.y = b.velocity.y - 2 * vdotn * ny;
          const overlap = (minDist - dist) + 0.5;
          b.position.x += nx * overlap;
          b.position.y += ny * overlap;
          this.capBallSpeedFor(b);
        }
      }
    }

    // Paddle collisions & scoring for each ball
    for (const b of this.balls) {
      // paddle hits
      const hitLeft = b.position.x - b.radius < this.paddleLeft.width &&
        b.position.y > this.paddleLeft.position.y &&
        b.position.y < this.paddleLeft.position.y + this.paddleLeft.height;
      if (hitLeft) {
        b.velocity.x *= -1;
        b.lastHit = 'p1';
        const delta = b.position.y - (this.paddleLeft.position.y + this.paddleLeft.height / 2);
        b.velocity.y = delta * Config.ball.spinFactor;
        if (typeof b.velocity.x === 'number') b.velocity.x = b.velocity.x * 1.25;
        if (typeof b.velocity.y === 'number') b.velocity.y = b.velocity.y * 1.25;
        this.capBallSpeedFor(b);
      }

      const hitRight = b.position.x + b.radius > (Config.canvas.width - this.paddleRight.width) &&
        b.position.y > this.paddleRight.position.y &&
        b.position.y < this.paddleRight.position.y + this.paddleRight.height;
      if (hitRight) {
        b.velocity.x *= -1;
        b.lastHit = 'p2';
        const delta = b.position.y - (this.paddleRight.position.y + this.paddleRight.height / 2);
        b.velocity.y = delta * Config.ball.spinFactor;
        if (typeof b.velocity.x === 'number') b.velocity.x = b.velocity.x * 1.25;
        if (typeof b.velocity.y === 'number') b.velocity.y = b.velocity.y * 1.25;
        this.capBallSpeedFor(b);
      }

      // scoring per-ball
      if (b.position.x - b.radius < 0) {
        this.scores.p2++;
        this.playScoreSound('p2');
        this.checkWin() || b.reset();
      } else if (b.position.x + b.radius > Config.canvas.width) {
        this.scores.p1++;
        this.playScoreSound('p1');
        this.checkWin() || b.reset();
      }
    }

    // Multi-ball triggers: spawn when an individual player reaches a multiple of 3
    const p1Multiple = (this.scores.p1 > 0 && this.scores.p1 % 3 === 0);
    const p2Multiple = (this.scores.p2 > 0 && this.scores.p2 % 3 === 0);

    // If a player just reached a new multiple of three and we currently have a single ball, spawn a second ball
    if (((p1Multiple && this.multiTriggered.p1 !== this.scores.p1) || (p2Multiple && this.multiTriggered.p2 !== this.scores.p2)) && this.balls.length === 1) {
      // mark which player triggered so we don't re-trigger until their score changes
      if (p1Multiple) this.multiTriggered.p1 = this.scores.p1;
      if (p2Multiple) this.multiTriggered.p2 = this.scores.p2;
      const b1 = this.balls[0];
      b1.position.x = Config.canvas.width / 2;
      b1.position.y = Config.canvas.height / 2;
      // ensure two balls go in opposite horizontal directions
      b1.velocity.x = -Math.abs(Config.ball.baseSpeedX);
      b1.velocity.y = (Math.random() * (2 * Config.ball.maxRandomY)) - Config.ball.maxRandomY;
      const b2 = new Ball(Config.ball.radius, Config.canvas.width, Config.canvas.height);
      b2.position.x = Config.canvas.width / 2;
      b2.position.y = Config.canvas.height / 2;
      b2.velocity.x = Math.abs(Config.ball.baseSpeedX);
      // give the second ball the inverse vertical velocity for clearer opposite movement
      b2.velocity.y = -b1.velocity.y;
      this.balls.push(b2);
    }

    // Remove extra ball when the triggering condition has passed (i.e., no player currently at the triggered score)
    if (this.balls.length > 1) {
      const keepP1 = (this.multiTriggered.p1 === this.scores.p1);
      const keepP2 = (this.multiTriggered.p2 === this.scores.p2);
      if (!keepP1 && !keepP2) {
        // return to single ball
        const keep = this.balls[0];
        keep.position.x = Config.canvas.width / 2;
        keep.position.y = Config.canvas.height / 2;
        keep.velocity.x = Math.sign(keep.velocity.x || 1) * Config.ball.baseSpeedX;
        keep.velocity.y = 0;
        this.balls = [keep];
      }
    }
  }

  checkWin() {
    if (this.scores.p1 >= Config.rules.winningScore || this.scores.p2 >= Config.rules.winningScore) {
      this.gameOver = true;
      this.restartBtn.style.display = "inline-block";
      // start a 5s replay countdown then auto-restart
      this.replayCountdown = { until: performance.now() + 5000 };
      setTimeout(() => {
        // only auto-restart if still gameOver
        if (this.gameOver) this.restart();
      }, 5000);
      return true;
    }
    return false;
  }

  // Cap ball speed to Config.ball.maxSpeed while preserving direction
  capBallSpeed() {
    const max = (Config.ball && Config.ball.maxSpeed) ? Config.ball.maxSpeed : 15;
    if (!this.balls || this.balls.length === 0) return;
    for (const ball of this.balls) {
      if (!ball || !ball.velocity) continue;
      const vx = ball.velocity.x || 0;
      const vy = ball.velocity.y || 0;
      const speed = Math.sqrt(vx * vx + vy * vy);
      if (speed > max && speed > 0) {
        const scale = max / speed;
        ball.velocity.x = vx * scale;
        ball.velocity.y = vy * scale;
      }
    }
  }

  // Cap speed for a specific ball object
  capBallSpeedFor(ball) {
    if (!ball || !ball.velocity) return;
    const max = (Config.ball && Config.ball.maxSpeed) ? Config.ball.maxSpeed : 15;
    const vx = ball.velocity.x || 0;
    const vy = ball.velocity.y || 0;
    const speed = Math.sqrt(vx * vx + vy * vy);
    if (speed > max && speed > 0) {
      const scale = max / speed;
      ball.velocity.x = vx * scale;
      ball.velocity.y = vy * scale;
    }
  }

  _ensureAudio() {
    if (this.audioCtx) return;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return; // no audio support
    this.audioCtx = new AudioCtx();
  }

  playScoreSound(player) {
    // player: 'p1' or 'p2'
    this._ensureAudio();
    if (!this.audioCtx) return;
    try {
      const ctx = this.audioCtx;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      // pitch: p1 higher, p2 lower
      const freq = (player === 'p1') ? 880 : 440;
      o.frequency.value = freq;
      g.gain.value = 0.0001;
      o.connect(g); g.connect(ctx.destination);
      const now = ctx.currentTime;
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.18, now + 0.01);
      o.start(now);
      g.gain.linearRampToValueAtTime(0.0001, now + 0.18);
      o.stop(now + 0.2);
    } catch (e) {
      // swallow errors silently
      console.warn('Audio play failed', e);
    }
  }

  // simple rect collision for ball and power-up
  _ballHitsRect(ball, rect) {
    const bx = ball.position.x;
    const by = ball.position.y;
    const rx = rect.x - rect.w/2 || rect.x;
    const ry = rect.y - rect.h/2 || rect.y;
    // rect may be stored as center coordinates; handle both
    const left = rect.x - (rect.w/2);
    const top = rect.y - (rect.h/2);
    const right = rect.x + (rect.w/2);
    const bottom = rect.y + (rect.h/2);
    // circle-rect approximate: check closest point
    const cx = Math.max(left, Math.min(bx, right));
    const cy = Math.max(top, Math.min(by, bottom));
    const dx = bx - cx; const dy = by - cy;
    return (dx*dx + dy*dy) <= (ball.radius * ball.radius);
  }

  _applyPowerUp(type, playerSide) {
    // playerSide: 'left' or 'right' indicating which paddle last hit the ball
    const now = performance.now();
    const dur = Config.powerUp.durationSec * 1000;
    if (type === 1) {
      // bigger paddle for hitter
      const p = (playerSide === 'left') ? this.paddleLeft : this.paddleRight;
      p.height = Math.min(Config.canvas.height, Config.paddle.height * 1.6);
      this.activeEffects[playerSide] = { type: 'big', until: now + dur };
    } else if (type === 2) {
      // faster ball temporarily
      const factor = 1.6;
      for (const b of this.balls) { b.velocity.x *= factor; b.velocity.y *= factor; }
      this.activeEffects[playerSide] = { type: 'ball_fast', until: now + dur, factor };
    } else if (type === 3) {
      // opponent bigger paddle
      const other = (playerSide === 'left') ? 'right' : 'left';
      const p = (other === 'left') ? this.paddleLeft : this.paddleRight;
      p.height = Math.min(Config.canvas.height, Config.paddle.height * 1.6);
      this.activeEffects[other] = { type: 'big_opponent', until: now + dur };
    }
  }

  draw() {
    this.renderer.clear(Config.canvas.width, Config.canvas.height);
    // dashed center line to mark halves
    this.ctx.save();
    this.ctx.strokeStyle = Config.visuals.fg;
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([10, 6]);
    const centerX = Config.canvas.width / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, 0);
    this.ctx.lineTo(centerX, Config.canvas.height);
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.restore();
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
    // draw all balls
    let maxSpeed = 0;
    for (const b of this.balls) {
      this.renderer.circle(b);
      const vx = b.velocity.x || 0;
      const vy = b.velocity.y || 0;
      const sp = Math.sqrt(vx * vx + vy * vy);
      if (sp > maxSpeed) maxSpeed = sp;
    }
    // draw active power-up (as centered rect)
    if (this.powerUp) {
      const pu = this.powerUp;
      this.ctx.save();
      this.ctx.fillStyle = Config.powerUp.colors.bg;
      this.ctx.strokeStyle = Config.powerUp.colors.border;
      this.ctx.lineWidth = 2;
      const x = pu.x - (pu.w/2), y = pu.y - (pu.h/2);
      this.ctx.fillRect(x, y, pu.w, pu.h);
      this.ctx.strokeRect(x, y, pu.w, pu.h);
      this.ctx.restore();
    }
    this.renderer.text(this.scores.p1, Config.canvas.width / 4, 50);
    this.renderer.text(this.scores.p2, 3 * Config.canvas.width / 4, 50);
    // Display current (fastest) ball speed for player reference
    this.renderer.text("Speed: " + maxSpeed.toFixed(2), Config.canvas.width - 200, 30);
    if (this.gameOver) {
      this.renderer.text("Game Over", Config.canvas.width / 2 - 80, Config.canvas.height / 2 - 20, Config.visuals.gameOver);
      const msg = this.scores.p1 >= Config.rules.winningScore ? "Player 1 Wins!" : "Player 2 Wins!";
      this.renderer.text(msg, Config.canvas.width / 2 - 120, Config.canvas.height / 2 + 20, Config.visuals.win);
      // show replay countdown if active
      if (this.replayCountdown && this.replayCountdown.until) {
        const secondsLeft = Math.ceil((this.replayCountdown.until - performance.now()) / 1000);
        this.renderer.text('Restarting in ' + secondsLeft + '...', Config.canvas.width / 2 - 140, Config.canvas.height / 2 + 70, Config.visuals.text);
      }
    }

    // paused overlay
    if (this.paused) {
      this.ctx.save();
      this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
      this.ctx.fillRect(0,0,Config.canvas.width, Config.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '36px Arial';
      this.ctx.fillText('PAUSED', Config.canvas.width/2 - 60, Config.canvas.height/2);
      this.ctx.restore();
    }
  }

  restart() {
    this.scores.p1 = 0; this.scores.p2 = 0;
    this.paddleLeft.position.y = (Config.canvas.height - this.paddleLeft.height) / 2;
    this.paddleRight.position.y = (Config.canvas.height - this.paddleRight.height) / 2;
    if (this.balls && this.balls.length > 0) {
      this.balls[0].reset(true);
      this.balls = [ this.balls[0] ];
    } else {
      this.balls = [ new Ball(Config.ball.radius, Config.canvas.width, Config.canvas.height) ];
    }
    this.gameOver = false;
    this.restartBtn.style.display = "none";
    // clear power-ups and effects
    this.powerUp = null;
    this.activeEffects = { left: null, right: null };
    this.replayCountdown = null;
  }

  loop() {
    // If paused, render one paused frame (overlay) and stop scheduling updates.
    if (this.paused) {
      this.draw();
      return;
    }
    this.handleInput();
    this.update();
    this.draw();
    requestAnimationFrame(this.loop);
  }
}

// -------------------------------
// Bootstrapping (start via buttons)
// -------------------------------
const canvas = document.getElementById('pongCanvas');
const restartBtn = document.getElementById('restartBtn');
const startPvPBtn = document.getElementById('startPvP');
const startAIBtn = document.getElementById('startAI');

// Ensure canvas matches Config every load (keeps HTML in sync)
canvas.width = Config.canvas.width;
canvas.height = Config.canvas.height;

let game = null;

function startGameWithAI(useAI) {
  if (game) {
    // if already running, just restart and set AI flag
    game.ai = !!useAI;
    game.restart();
    return;
  }
  game = new Game(canvas, restartBtn, { ai: !!useAI });
  // hide start buttons once started
  startPvPBtn.style.display = 'none';
  startAIBtn.style.display = 'none';
  game.loop();
}

startPvPBtn.addEventListener('click', function(e){ e.preventDefault(); startGameWithAI(false); canvas.focus(); });
startAIBtn.addEventListener('click', function(e){ e.preventDefault(); startGameWithAI(true); canvas.focus(); });

// -----------------------------------------
// Student Challenges (inline TODO checklist)
// -----------------------------------------
// 1) Make it YOUR game: change colors in Config.visuals, dimensions/speeds in Config.
// 2) Add AI: implement simple tracking for right paddle in handleInput (hint above). DONE
// 3) Rally speed-up: every time the ball hits a paddle, slightly increase |velocity.x|. - Complete
// 4) Center line + score SFX: draw a dashed midline; play an audio on score.
// 5) Power-ups: occasionally spawn a small rectangle; when ball hits it, apply effect (bigger paddle? faster ball?).
// 6) Pause/Resume: map a key to toggle pause state in Game and skip updates when paused.
// 7) Win screen polish: show a replay countdown, then auto-restart.
</script>