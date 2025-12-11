---
layout: opencs
title: Background with Object
description: Use JavaScript to have an in motion background.
sprite: images/platformer/sprites/flying-ufo.png
background: images/platformer/backgrounds/alien_planet1.jpg
permalink: /background
---

<canvas id="world"></canvas>

<script>
  const canvas = document.getElementById("world");
  const ctx = canvas.getContext('2d');
  const backgroundImg = new Image();
  const spriteImg = new Image();
  const obstacleImg = new Image();
  backgroundImg.src = '{{page.background}}';
  spriteImg.src = '{{page.sprite}}';
  // try to load an asteroid sprite; fall back to circle obstacles if missing
  obstacleImg.src = '/images/astroid.png';

  let imagesLoaded = 0;
  backgroundImg.onload = function() {
    imagesLoaded++;
    startGameWorld();
  };
  spriteImg.onload = function() {
    imagesLoaded++;
    startGameWorld();
  };
  obstacleImg.onload = function() { obstacleImg.ready = true; };
  obstacleImg.onerror = function() { obstacleImg.ready = false; };

  function startGameWorld() {
    if (imagesLoaded < 2) return;

    class GameObject {
      constructor(image, width, height, x = 0, y = 0, speedRatio = 0) {
        this.image = image;
        this.width = width;
        this.height = height;
        this.x = x;
        this.y = y;
        this.speedRatio = speedRatio;
        this.speed = GameWorld.gameSpeed * this.speedRatio;
      }
      update() {}
      draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      }
    }

    class Background extends GameObject {
      constructor(image, gameWorld) {
        // Fill entire canvas
        super(image, gameWorld.width, gameWorld.height, 0, 0, 0.1);
      }
      update() {
        this.x = (this.x - this.speed) % this.width;
      }
      draw(ctx) {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
      }
    }

    class Player extends GameObject {
      constructor(image, gameWorld) {
        const width = image.naturalWidth / 2;
        const height = image.naturalHeight / 2;
        const x = (gameWorld.width - width) / 2;
        const y = (gameWorld.height - height) / 2;
        super(image, width, height, x, y);
        this.vx = 0;
        this.vy = 0;
        this.speed = 6; // movement speed (pixels per frame)
        this.keys = { w: false, a: false, s: false, d: false };
        this.frame = 0;
        this.hit = false; // collision flag
      }

      handleInput() {
        // update velocity from keys
        this.vx = 0; this.vy = 0;
        if (this.keys.a) this.vx = -this.speed;
        if (this.keys.d) this.vx = this.speed;
        if (this.keys.w) this.vy = -this.speed;
        if (this.keys.s) this.vy = this.speed;
      }

      update(gameWorld) {
        // gentle bob when not moving vertically
        this.handleInput();
        this.x += this.vx;
        this.y += this.vy;
        // clamp to viewport
        this.x = Math.max(10, Math.min(gameWorld.width - this.width - 10, this.x));
        this.y = Math.max(10, Math.min(gameWorld.height - this.height - 10, this.y));
        this.frame++;
      }
    }

    // --- Obstacle class (image or circle fallback) ---
    class Obstacle {
      constructor(x, y, r, vx, img = null) {
        this.x = x; this.y = y; this.r = r; this.vx = vx; this.img = img; this.color = '#8B4513';
        this.w = this.h = this.r * 2;
      }
      update() { this.x += this.vx; }
      draw(ctx) {
        ctx.save();
        if (this.img && this.img.ready && this.img.complete && this.img.naturalWidth > 0) {
          const drawW = this.w; const drawH = this.h;
          ctx.drawImage(this.img, this.x - drawW/2, this.y - drawH/2, drawW, drawH);
        } else {
          ctx.fillStyle = this.color; ctx.beginPath(); ctx.arc(this.x, this.y, this.r, 0, Math.PI*2); ctx.fill();
        }
        ctx.restore();
      }
    }

    class GameWorld {
      static gameSpeed = 5;
      constructor(backgroundImg, spriteImg) {
        this.canvas = document.getElementById("world");
        this.ctx = this.canvas.getContext('2d');
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;
        this.canvas.style.position = 'absolute';
        this.canvas.style.left = `0px`;
        this.canvas.style.top = `${(window.innerHeight - this.height) / 2}px`;

        // Core objects: background and player
        this.player = new Player(spriteImg, this);
        this.background = new Background(backgroundImg, this);

        this.gameObjects = [ this.background, this.player ];

        // Obstacles
        this.obstacles = [];
        this.spawnTimer = 0;
        this.spawnInterval = 90;
        this.obstacleImage = obstacleImg;

        // Score and pause state
        this.score = 0;
        this.paused = false;

        // HUD (score display) and retry button
        this.hud = document.createElement('div');
        Object.assign(this.hud.style, {
          position: 'fixed', left: '12px', top: '12px', zIndex: 9999,
          color: 'white', background: 'rgba(0,0,0,0.45)', padding: '6px 10px', borderRadius: '6px', fontFamily: 'monospace'
        });
        this.hud.innerHTML = `Score: <span id="rps-score">0</span>`;
        document.body.appendChild(this.hud);
        this.hudScore = this.hud.querySelector('#rps-score');

        this.retryBtn = document.createElement('button');
        this.retryBtn.textContent = 'Retry';
        Object.assign(this.retryBtn.style, {
          position: 'fixed', right: '12px', top: '12px', zIndex: 9999, padding: '8px 12px', display: 'none'
        });
        document.body.appendChild(this.retryBtn);
        this.retryBtn.addEventListener('click', () => { this.resetGame(); });

        // Input handling (WASD)
        window.addEventListener('keydown', (e) => {
          const k = e.key.toLowerCase();
          if (k === 'w' || k === 'a' || k === 's' || k === 'd') {
            this.player.keys[k] = true;
            e.preventDefault();
          }
        });
        window.addEventListener('keyup', (e) => {
          const k = e.key.toLowerCase();
          if (k === 'w' || k === 'a' || k === 's' || k === 'd') {
            this.player.keys[k] = false;
            e.preventDefault();
          }
        });
      }

      spawnObstacle() {
        const r = 18 + Math.random() * 18;
        const x = this.width + r + 10;
        const y = 20 + Math.random() * (this.height - 40);
        const speed = GameWorld.gameSpeed * (1 + Math.random() * 0.6) + 1;
        this.obstacles.push(new Obstacle(x, y, r, -speed, this.obstacleImage));
      }

      gameLoop() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        // update/draw background and player
        this.background.update();
        this.background.draw(this.ctx);
        this.player.update(this);
        this.player.draw(this.ctx);

        // spawn obstacles
        this.spawnTimer--;
        if (this.spawnTimer <= 0) {
          this.spawnObstacle();
          this.spawnTimer = this.spawnInterval + Math.floor(Math.random() * 40) - 20;
        }

  // update/draw obstacles and check collisions
  for (let i = this.obstacles.length - 1; i >= 0; i--) {
          const obs = this.obstacles[i];
          obs.update();
          obs.draw(this.ctx);
          if (obs.x + obs.r < -50) {
            // passed off screen: count as dodged
            this.obstacles.splice(i, 1);
            this.score += 1;
          }

          if (!this.player.hit && this.checkCollision(obs, this.player)) {
            // on collision: reset score, pause and show retry
            this.player.hit = true;
            console.log('Collision! You were hit by an obstacle.');
            this.flashPlayer();
            this.score = 0; // restart score per user request
            this.hudScore.textContent = String(this.score);
            this.paused = true;
            this.retryBtn.style.display = 'block';
            break;
          }
        }

        // update HUD score
        if (this.hudScore) this.hudScore.textContent = String(this.score);

        if (!this.paused) {
          requestAnimationFrame(this.gameLoop.bind(this));
        }
      }

      flashPlayer() {
        const ctx = this.ctx;
        const p = this.player;
        ctx.save();
        ctx.fillStyle = 'rgba(255,0,0,0.25)';
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.restore();
      }

      checkCollision(obs, player) {
        const cx = obs.x;
        const cy = obs.y;
        const rx = player.x;
        const ry = player.y;
        const rw = player.width;
        const rh = player.height;
        const closestX = Math.max(rx, Math.min(cx, rx + rw));
        const closestY = Math.max(ry, Math.min(cy, ry + rh));
        const dx = cx - closestX;
        const dy = cy - closestY;
        return (dx * dx + dy * dy) < (obs.r * obs.r);
      }

      start() {
        this.gameLoop();
      }
    }

    // reset game state and resume
    GameWorld.prototype.resetGame = function() {
      // clear obstacles, reset player, reset score, hide retry button and resume
      this.obstacles = [];
      this.player.hit = false;
      // center player
      this.player.x = (this.width - this.player.width) / 2;
      this.player.y = (this.height - this.player.height) / 2;
      this.score = 0;
      if (this.hudScore) this.hudScore.textContent = String(this.score);
      this.retryBtn.style.display = 'none';
      this.paused = false;
      // restart loop
      this.gameLoop();
    };

    const world = new GameWorld(backgroundImg, spriteImg);
    world.start();
  }
