---
layout: opencs
title: Background with Object
description: Use JavaScript to have an in motion background.
sprite: images/platformer/sprites/flying-ufo.png
background: images/platformer/backgrounds/alien_planet1.jpg
permalink: /backgrounds
---

<canvas id="world"></canvas>

<script>
  const canvas = document.getElementById("world");
  const ctx = canvas.getContext('2d');
  const backgroundImg = new Image();
  const spriteImg = new Image();
  backgroundImg.src = '{{page.background}}';
  spriteImg.src = '{{page.sprite}}';

  let imagesLoaded = 0;
  backgroundImg.onload = function() {
    imagesLoaded++;
    startGameWorld();
  };
  spriteImg.onload = function() {
    imagesLoaded++;
    startGameWorld();
  };

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

        // Obstacles will be simple circles (no external image required)
        this.obstacles = [];
        this.spawnTimer = 0; // frames until next spawn
        this.spawnInterval = 90; // spawn every ~90 frames (~1.5s at 60fps)

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
        // spawn at right edge with random y
        const r = 18 + Math.random() * 18; // radius
        const x = this.width + r + 10;
        const y = 20 + Math.random() * (this.height - 40);
        const speed = GameWorld.gameSpeed * (1 + Math.random() * 0.6) + 1;
        this.obstacles.push(new Obstacle(x, y, r, -speed));
      }

      gameLoop() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // update background and player
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
          // remove if off-screen left
          if (obs.x + obs.r < -50) this.obstacles.splice(i, 1);

          if (!this.player.hit && this.checkCollision(obs, this.player)) {
            this.player.hit = true;
            console.log('Collision! You were hit by an obstacle.');
            // visual indication: tint player briefly
            this.flashPlayer();
          }
        }

        requestAnimationFrame(this.gameLoop.bind(this));
      }

      flashPlayer() {
        // simple flash: draw a translucent red rectangle over player for a few frames
        const ctx = this.ctx;
        const p = this.player;
        const orig = ctx.globalCompositeOperation;
        ctx.save();
        ctx.fillStyle = 'rgba(255,0,0,0.25)';
        ctx.fillRect(p.x, p.y, p.width, p.height);
        ctx.restore();
        ctx.globalCompositeOperation = orig;
      }

      checkCollision(obs, player) {
        // circle-rectangle collision detection
        const cx = obs.x;
        const cy = obs.y;
        const rx = player.x;
        const ry = player.y;
        const rw = player.width;
        const rh = player.height;

        // find closest point to circle within the rectangle
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

    const world = new GameWorld(backgroundImg, spriteImg);
    world.start();
  }

    // --- Obstacle class (simple circle obstacles) ---
    class Obstacle {
      constructor(x, y, r, vx) {
        this.x = x; this.y = y; this.r = r; this.vx = vx; this.color = '#8B4513';
      }
      update() {
        this.x += this.vx;
      }
      draw(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }
