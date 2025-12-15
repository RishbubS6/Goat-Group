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
  obstacleImg.src = '/images/asteroid.png';

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

  // Create HUD early so it's visible even if images are slow or fail to load.
    if (!document.getElementById('bg-hud')) {
    const earlyHud = document.createElement('div');
    earlyHud.id = 'bg-hud';
    Object.assign(earlyHud.style, {
      position: 'fixed', left: '12px', top: '12px', zIndex: 9999,
      color: 'white', background: 'rgba(0,0,0,0.65)', padding: '8px 12px', borderRadius: '8px', fontFamily: 'monospace',
      fontSize: '14px', lineHeight: '1.2'
    });
    earlyHud.innerHTML = 'Score: <span id="rps-score">0</span> &nbsp; High: <span id="rps-high">0</span> &nbsp; Lives: <span id="rps-lives" style="font-weight:700;color:#ffdd57">0</span>';
    document.body.appendChild(earlyHud);
  }

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
        // rotation state for animated asteroids
        this.angle = Math.random() * Math.PI * 2;
        this.angularSpeed = (Math.random() * 0.06 - 0.03); // -0.03..0.03 rad/frame
      }
      update() { this.x += this.vx; this.angle += this.angularSpeed; }
      draw(ctx) {
        ctx.save();
        if (this.img && this.img.ready && this.img.complete && this.img.naturalWidth > 0) {
          const drawW = this.w; const drawH = this.h;
          ctx.translate(this.x, this.y);
          ctx.rotate(this.angle);
          ctx.drawImage(this.img, -drawW/2, -drawH/2, drawW, drawH);
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

        // Score, lives, high score and pause state
        this.score = 0;
        this.initialLives = 3; // starting lives
        this.lives = this.initialLives;
        this.paused = false;
        // persistent high score (localStorage key)
        this.highScoreKey = 'bg_highscore';
        this.highScore = parseInt(localStorage.getItem(this.highScoreKey) || '0', 10) || 0;

        // Periodic scoring: award points every N milliseconds while game is running
        this.scoreTickValue = 10; // points awarded per tick
        this.scoreTickMs = 3000; // 3 seconds
        this._scoreTicker = null;
        // start the periodic scoring ticker (guarded to prevent duplicates)
        this._startScoreTicker = () => {
          if (this._scoreTicker) return;
          this._scoreTicker = setInterval(() => {
            try {
              if (!this.paused && this.lives > 0) {
                this.score += this.scoreTickValue;
                if (this.hudScore) this.hudScore.textContent = String(this.score);
                // update high score if needed
                if (this.score > this.highScore) {
                  this.highScore = this.score;
                  try { localStorage.setItem(this.highScoreKey, String(this.highScore)); } catch (e) { /* ignore storage errors */ }
                  if (this.hudHigh) this.hudHigh.textContent = String(this.highScore);
                  this.pulseHigh();
                }
              }
            } catch (err) {
              // Defensive: don't let ticker throw and stop subsequent ticks
              console.error('Score ticker error', err);
            }
          }, this.scoreTickMs);
        };
        this._stopScoreTicker = () => { if (this._scoreTicker) { clearInterval(this._scoreTicker); this._scoreTicker = null; } };

        // HUD (score + high score + lives) and retry button
        // If an "early" HUD was injected before images loaded, reuse it instead
        const existingHud = document.getElementById('bg-hud');
        if (existingHud) {
          this.hud = existingHud;
          this.hudScore = document.getElementById('rps-score');
          this.hudHigh = document.getElementById('rps-high');
          this.hudLives = document.getElementById('rps-lives');
          // ensure values are up-to-date
          if (this.hudHigh) this.hudHigh.textContent = String(this.highScore);
          if (this.hudLives) this.hudLives.textContent = String(this.lives);
        } else {
          this.hud = document.createElement('div');
          Object.assign(this.hud.style, {
            position: 'fixed', left: '12px', top: '12px', zIndex: 9999,
            color: 'white', background: 'rgba(0,0,0,0.65)', padding: '8px 12px', borderRadius: '8px', fontFamily: 'monospace',
            fontSize: '14px', lineHeight: '1.2'
          });
          this.hud.innerHTML = `Score: <span id="rps-score">0</span> &nbsp; High: <span id="rps-high">${this.highScore}</span> &nbsp; Lives: <span id="rps-lives" style="font-weight:700;color:#ffdd57">${this.lives}</span>`;
          document.body.appendChild(this.hud);
          this.hudScore = this.hud.querySelector('#rps-score');
          this.hudHigh = this.hud.querySelector('#rps-high');
          this.hudLives = this.hud.querySelector('#rps-lives');
        }

        // Retry button: reuse if present, otherwise create
        let existingRetry = document.getElementById('game-retry-btn');
        if (existingRetry) {
          this.retryBtn = existingRetry;
          // attach/replace handlers to point to this instance
          this.retryBtn.onclick = () => { this.resetGame(); };
          this.retryBtn.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.resetGame(); } };
        } else {
          this.retryBtn = document.createElement('button');
          this.retryBtn.id = 'game-retry-btn';
          this.retryBtn.setAttribute('aria-label', 'Retry game');
          this.retryBtn.textContent = 'Retry';
          Object.assign(this.retryBtn.style, {
            position: 'fixed', right: '12px', top: '12px', zIndex: 2147483647, padding: '10px 14px',
            display: 'none', background: '#ff4757', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.35)'
          });
          this.retryBtn.setAttribute('aria-hidden', 'true');
          document.body.appendChild(this.retryBtn);
          this.retryBtn.addEventListener('click', () => { this.resetGame(); });
          // allow keyboard activation when visible
          this.retryBtn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.resetGame(); } });
        }

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

          // Canvas fallback: draw a visible Lives indicator on the canvas so it's always visible
          try {
            const text = `Lives: ${this.lives}`;
            const fontSize = Math.max(14, Math.floor(this.width * 0.018));
            this.ctx.save();
            this.ctx.font = `${fontSize}px monospace`;
            this.ctx.textBaseline = 'top';
            const metrics = this.ctx.measureText(text);
            const padX = 10;
            const padY = 6;
            const tx = 12;
            const ty = 12;
            // semi-opaque background for readability
            this.ctx.fillStyle = 'rgba(0,0,0,0.5)';
            this.ctx.fillRect(tx - padX/2, ty - padY/2, metrics.width + padX, fontSize + padY);
            // text
            this.ctx.fillStyle = '#ffdd57';
            this.ctx.fillText(text, tx, ty);
            this.ctx.restore();
          } catch (e) {
            // ignore drawing errors
          }

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
              // update high score if needed
              if (this.score > this.highScore) {
                this.highScore = this.score;
                try { localStorage.setItem(this.highScoreKey, String(this.highScore)); } catch (e) { /* ignore storage errors */ }
                // update HUD and visual indicator for new high
                if (this.hudHigh) this.hudHigh.textContent = String(this.highScore);
                this.pulseHigh();
              }
            }

            if (!this.player.hit && this.checkCollision(obs, this.player)) {
              // on collision: decrement lives, reset score, pause and show retry
              this.player.hit = true;
              console.log('Collision! You were hit by an obstacle.');
              this.flashPlayer();
              // remove the hitting obstacle so it doesn't keep colliding
              this.obstacles.splice(i, 1);
              this.lives -= 1;
              this.score = 0; // restart score per user request
              if (this.hudScore) this.hudScore.textContent = String(this.score);
              if (this.hudHigh) this.hudHigh.textContent = String(this.highScore);
              if (this.hudLives) this.hudLives.textContent = String(this.lives);
              this.paused = true;
              this.retryBtn.style.display = 'block';
              this.retryBtn.setAttribute('aria-hidden', 'false');
              // if out of lives, show game over on the button
              if (this.lives <= 0) {
                this.retryBtn.textContent = 'Game Over - Restart';
              } else {
                this.retryBtn.textContent = 'Retry';
              }
              break;
            }
          }

    // update HUD score & lives every frame
    if (this.hudScore) this.hudScore.textContent = String(this.score);
    if (this.hudHigh) this.hudHigh.textContent = String(this.highScore);
    if (this.hudLives) this.hudLives.textContent = String(this.lives);

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

        // briefly pulse the high score element to indicate a new high
        pulseHigh() {
          if (!this.hudHigh) return;
          const el = this.hudHigh;
          const orig = el.style.transition;
          el.style.transition = 'transform 0.25s ease, color 0.25s ease';
          el.style.transform = 'scale(1.25)';
          el.style.color = '#ffd700';
          setTimeout(() => { el.style.transform = ''; el.style.color = ''; el.style.transition = orig || ''; }, 500);
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
        // clear obstacles, reset player flag, reset score, hide retry button and resume
        this.obstacles = [];
        this.player.hit = false;
        // center player
        this.player.x = (this.width - this.player.width) / 2;
        this.player.y = (this.height - this.player.height) / 2;
        // if out of lives, restart lives
        if (this.lives <= 0) {
          this.lives = this.initialLives;
        }
        this.score = 0;
        if (this.hudScore) this.hudScore.textContent = String(this.score);
        if (this.hudHigh) this.hudHigh.textContent = String(this.highScore);
        if (this.hudLives) this.hudLives.textContent = String(this.lives);
        this.retryBtn.style.display = 'none';
        this.retryBtn.setAttribute('aria-hidden', 'true');
        this.retryBtn.textContent = 'Retry';
        this.paused = false;
        // restart the periodic scoring ticker when the game resumes
        if (typeof this._startScoreTicker === 'function') this._startScoreTicker();
        // restart loop
        this.gameLoop();
      };

      const world = new GameWorld(backgroundImg, spriteImg);
      world.start();
    }
</script>
