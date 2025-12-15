---
title: Rock Paper Scissors
comments: true
hide: true
layout: opencs
description: Learn how to experiment with the console, elements, and see OOP in action while playing Rock paper Scissors!
permalink: /rock-paper-scissors/
---


<div id="mainGameBox" style="max-width:700px;margin:64px auto 48px auto;position:relative;z-index:2;">
  <div id="gameContainer">
    <canvas id='gameCanvas' style="display:none"></canvas>
  </div>
</div>

<style>
  /* keyboard focus styles for the icon buttons */
  #images button:focus-visible {
    outline: 3px solid #ffd700;
    outline-offset: 4px;
    box-shadow: 0 0 12px #ffd700;
    border-radius: 10px;
  }
  /* ensure images show pointer and are selectable targets */
  #images img { cursor: pointer; }
</style>

<script type="module">
  // --- UI (blue box) ---
    const instructionsStyle = `
  position: relative;
  margin: 64px auto 48px auto;
    background: linear-gradient(135deg, black, blue);
    color: white;
    padding: 30px;
    border-radius: 15px;
    z-index: 1000;
    max-width: 600px;
    width: 90%;
    max-height: 80vh;      /* added */
    overflow-y: auto;      /* added */
    font-family: 'Press Start 2P', cursive;
    border: 3px solid blue;
    box-shadow: 0 0 20px rgba(0, 60, 128, 0.5);
    text-align: center;
    `;

  const instructionsHTML = `
    <h2 style="color: blue; margin-bottom: 20px;">Rock Paper Scissors SHOOT!</h2>
    <div style="margin-bottom: 20px;">
      <p>Play the game from your browser console, by clicking an icon, or by pressing the keys <code>R</code>, <code>P</code>, or <code>S</code> on your keyboard.</p>
    </div>
    <div id="images" style="display:flex; justify-content:center; gap:20px; margin-bottom:14px;">
      <button id="rock-btn" aria-label="play rock" tabindex="0" style="background:none; border:none; padding:0; cursor:pointer;">
        <img id="rock-img" src="{{site.baseurl}}/images/rock.png"
             alt="Rock" role="img" style="width:100px; border:2px solid white; border-radius:10px;">
      </button>
      <button id="paper-btn" aria-label="play paper" tabindex="0" style="background:none; border:none; padding:0; cursor:pointer;">
        <img id="paper-img" src="{{site.baseurl}}/images/paper.png"
             alt="Paper" role="img" style="width:100px; border:2px solid white; border-radius:10px;">
      </button>
      <button id="scissors-btn" aria-label="play scissors" tabindex="0" style="background:none; border:none; padding:0; cursor:pointer;">
        <img id="scissors-img" src="{{site.baseurl}}/images/scissors.png"
             alt="Scissors" role="img" style="width:100px; border:2px solid white; border-radius:10px;">
      </button>
    </div>
    <div style="margin-bottom:18px; font-size:1.1em; color:#ffd700;">
      Click any icon to customize using the console!
    </div>
    <!-- mount battle canvas INSIDE the purple box so you can see it -->
    <div id="battleMount" style="display:block; margin:12px auto;"></div>

  <div id="resultBox" role="status" aria-live="polite" style="margin-top: 16px; font-size: 16px; color: yellow;"></div>
  `;
  const container = document.createElement("div");
  container.setAttribute("style", instructionsStyle);
  container.innerHTML = instructionsHTML;
  document.getElementById("mainGameBox").appendChild(container);

  // --- helper: highlight chosen image ---
  function highlightImage(id){
    ["rock-img","paper-img","scissors-img"].forEach(i=>{
      const el = document.getElementById(i);
      if(el) el.style.boxShadow = "";
    });
    const picked = document.getElementById(id);
    if(picked) picked.style.boxShadow = "0 0 30px 10px gold";
  }

  // --- OOP classes ---
  class BattleBackground {
    constructor(image, width, height, speedRatio=0.1){
      this.image = image;
      this.width = width;
      this.height = height;
      this.x = 0; this.y = 0;
      this.speed = 2 * speedRatio;
    }
    update(){ this.x = (this.x - this.speed) % this.width; }
    draw(ctx){
      if(!this.image.complete || this.image.naturalWidth===0) return;
      ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
      ctx.drawImage(this.image, this.x + this.width, this.y, this.width, this.height);
    }
  }

  class BattleSprite {
    constructor(image, width, height, x, y){
      this.image = image;
      this.width = width; this.height = height;
      this.homeX = x; this.homeY = y;
      this.x = x; this.y = y;
      this.targetX = x; this.targetY = y;
      this.opacity = 1; this.scale = 1; this.rotation = 0;
      this.animating = false;
    }
    update(){
      if(this.animating){
        this.x += (this.targetX - this.x)*0.12;
        this.y += (this.targetY - this.y)*0.12;
      } else {
        // drift gently back to home
        this.x += (this.homeX - this.x)*0.08;
        this.y += (this.homeY - this.y)*0.08;
      }
    }
    draw(ctx){
      if(!this.image.complete || this.image.naturalWidth===0) return;
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x + this.width/2, this.y + this.height/2);
      ctx.rotate(this.rotation);
      ctx.scale(this.scale, this.scale);
      ctx.drawImage(this.image, -this.width/2, -this.height/2, this.width, this.height);
      ctx.restore();
    }
    resetVisuals(){
      this.opacity = 1; this.scale = 1; this.rotation = 0;
    }
    resetPosition(){
      this.x = this.homeX; this.y = this.homeY;
      this.targetX = this.homeX; this.targetY = this.homeY;
      this.animating = false;
    }
  }

  // --- Canvas mounted inside purple box ---
  const battleCanvas = document.createElement('canvas');
  battleCanvas.width = 360;
  battleCanvas.height = 180;
  battleCanvas.style.display = 'block';
  battleCanvas.style.margin = '0 auto';
  battleCanvas.style.background = '#001a33';
  battleCanvas.style.borderRadius = '12px';
  battleCanvas.style.boxShadow = '0 2px 12px rgba(0,0,0,0.18)';
  document.getElementById('battleMount').appendChild(battleCanvas);
  const ctx = battleCanvas.getContext('2d');

  // --- assets ---
  const bgImage = new Image();
  bgImage.src = '{{site.baseurl}}/images/platformer/backgrounds/alien_planet1.jpg';

  const rockImg = new Image();
  rockImg.src = '{{site.baseurl}}/images/rps/rock.jpg';
  const paperImg = new Image();
  paperImg.src = '{{site.baseurl}}/images/rps/paper.jpeg';
  const scissorsImg = new Image();
  scissorsImg.src = '{{site.baseurl}}/images/rps/scissors.jpeg';

  const bg = new BattleBackground(bgImage, battleCanvas.width, battleCanvas.height, 0.12);

  const sprites = {
  rock:     new BattleSprite(rockImg,     96, 96,  10, 42),
  paper:    new BattleSprite(paperImg,    96, 96, 132, 42),
  scissors: new BattleSprite(scissorsImg, 96, 96, 254, 42)
  };

  // Floating background sprites (appear when a round is played)
  class FloatingSprite {
    constructor(image, w, h, x, y, vx = -0.6, vy = 0, ttl = 300) {
      this.image = image;
      this.w = w; this.h = h;
      this.x = x; this.y = y;
      this.vx = vx; this.vy = vy;
      this.angle = Math.random() * Math.PI * 2;
      this.angularSpeed = (Math.random() * 0.04 - 0.02);
      this.ttl = ttl; // frames to live
      this.opacity = 0.9;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.angle += this.angularSpeed; this.ttl--; this.opacity = Math.max(0, this.ttl / 300 * 0.9);
    }
    draw(ctx) {
      if(!this.image || !this.image.complete || this.image.naturalWidth===0) return;
      ctx.save(); ctx.globalAlpha = this.opacity;
      ctx.translate(this.x + this.w/2, this.y + this.h/2);
      ctx.rotate(this.angle);
      ctx.drawImage(this.image, -this.w/2, -this.h/2, this.w, this.h);
      ctx.restore();
    }
  }

  const floating = [];

  function getImageFor(choice){
    if(choice === 'rock') return rockImg;
    if(choice === 'paper') return paperImg;
    return scissorsImg;
  }

  function resetAll(){
    Object.values(sprites).forEach(s=>{
      s.resetVisuals();
    });
    sprites.rock.x = 10; sprites.rock.y = 42; sprites.rock.targetX = 10; sprites.rock.targetY = 42; sprites.rock.homeX = 10; sprites.rock.homeY = 42;
    sprites.paper.x = 132; sprites.paper.y = 42; sprites.paper.targetX = 132; sprites.paper.targetY = 42; sprites.paper.homeX = 132; sprites.paper.homeY = 42;
    sprites.scissors.x = 254; sprites.scissors.y = 42; sprites.scissors.targetX = 254; sprites.scissors.targetY = 42; sprites.scissors.homeX = 254; sprites.scissors.homeY = 42;
  }

  // --- global battle state, rendered by a continuous loop ---
  const battle = {
    active: false,
    winner: null,
    loser: null,
    frames: 0,
    max: 120,
    tie: null
  };

  function startBattle(winner, loser){
    battle.active = true;
    battle.tie = null;
    battle.winner = winner;
    battle.loser = loser;
    battle.frames = 0;

    // set targets for "winner moves toward loser"
    sprites[winner].animating = true;
    sprites[winner].targetX = sprites[loser].homeX;
    sprites[winner].targetY = sprites[loser].homeY;

    // loser will fade/scale/rotate in the render loop
    sprites[loser].animating = false; // stays put, gets affected visually
  }

  function startTie(choice){
    battle.active = true;
    battle.tie = choice;
    battle.winner = null;
    battle.loser = null;
    battle.frames = 0;

    // small wiggle, no target move
    Object.values(sprites).forEach(s=>{ s.animating = false; });
  }

  // --- continuous render loop (always runs) ---
  function render(){
  ctx.clearRect(0,0,battleCanvas.width,battleCanvas.height);
  bg.update();  bg.draw(ctx);
  // update/draw floating background sprites (behind the battle sprites)
  for(let i = floating.length - 1; i >= 0; i--) {
    const f = floating[i];
    f.update();
    // remove when expired or out of bounds
    if (f.ttl <= 0 || f.x < -f.w - 20 || f.x > battleCanvas.width + 20 || f.y < -f.h - 20 || f.y > battleCanvas.height + 20) {
      floating.splice(i, 1);
      continue;
    }
    f.draw(ctx);
  }
  // Draw 'Animated Battle: OOP' text (smaller)
  ctx.save();
  ctx.font = "bold 14px 'Press Start 2P', cursive";
  ctx.fillStyle = "cyan";
  ctx.textAlign = "center";
  ctx.fillText("Animated Battle: OOP", battleCanvas.width/2, 24);
  ctx.restore();

    if(battle.active){
      const t = battle.frames / battle.max; // 0..1

      if(battle.tie){
        const wobble = Math.sin(battle.frames*0.3)*4;
        sprites[battle.tie].rotation = wobble * Math.PI/180;
      } else {
        // winner punch-in / pulse
        const w = sprites[battle.winner];
        const l = sprites[battle.loser];

        // winner pulse scale up then down
        const pulse = (battle.frames < battle.max/2)
          ? 1 + (battle.frames/(battle.max/2))*0.2
          : 1.2 - ((battle.frames - battle.max/2)/(battle.max/2))*0.2;
        w.scale = pulse;

        // loser fades & shrinks
        l.opacity = Math.max(0.15, 1 - t*0.85);
        l.scale   = Math.max(0.6, 1 - t*0.4);

        // matchup-specific flair
        if(battle.winner === "rock" && battle.loser === "scissors"){
          l.rotation = -t * (Math.PI/4);
        }
        if(battle.winner === "paper" && battle.loser === "rock"){
          // paper "covers" rock by moving slightly past center
          w.targetX = l.homeX - 6; w.targetY = l.homeY - 6;
        }
        if(battle.winner === "scissors" && battle.loser === "paper"){
          w.rotation =  t * (Math.PI/10);
          l.rotation = -t * (Math.PI/10);
        }
      }

      battle.frames++;
      if(battle.frames >= battle.max){
        battle.active = false;
        Object.values(sprites).forEach(s=>{ s.resetVisuals(); s.animating = false; });
      }
    }

    // update/draw sprites every frame
    Object.values(sprites).forEach(s=>{ s.update(); s.draw(ctx); });

    requestAnimationFrame(render);
  }
  render(); // kick off the engine once

  // --- game logic + console entry point ---
  window.playRPS = function(playerChoice){
    const choices = ["rock","paper","scissors"];
    if(!choices.includes(playerChoice)){
      console.log("Invalid choice. Use 'rock', 'paper', or 'scissors'.");
      return;
    }
    highlightImage(playerChoice+"-img");

    const computerChoice = choices[Math.floor(Math.random()*choices.length)];
    let resultText, winner=null, loser=null;

    if(playerChoice === computerChoice){
      resultText = "Tie!";
      startTie(playerChoice);
    } else if(
      (playerChoice==="rock" && computerChoice==="scissors") ||
      (playerChoice==="paper" && computerChoice==="rock") ||
      (playerChoice==="scissors" && computerChoice==="paper")
    ){
      resultText = "You Win!";
      winner = playerChoice; loser = computerChoice;
    } else {
      resultText = "You Lose!";
      winner = computerChoice; loser = playerChoice;
    }

    document.getElementById("resultBox").innerHTML = `
      <p>You chose: <b>${playerChoice.toUpperCase()}</b></p>
      <p>Computer chose: <b>${computerChoice.toUpperCase()}</b></p>
      <h3 style="color: cyan;">${resultText}</h3>
    `;

    if(winner && loser) startBattle(winner, loser);

    // spawn floating background sprites for player and computer picks
    try {
      const pImg = getImageFor(playerChoice);
      const cImg = getImageFor(computerChoice);
      // player floats to the right, computer floats to the left for a nice cross effect
      floating.push(new FloatingSprite(pImg, 40, 40, Math.random()*battleCanvas.width, Math.random()*battleCanvas.height, 0.6 + Math.random()*0.6, (Math.random()-0.5)*0.4, 260));
      floating.push(new FloatingSprite(cImg, 40, 40, Math.random()*battleCanvas.width, Math.random()*battleCanvas.height, -0.6 - Math.random()*0.6, (Math.random()-0.5)*0.4, 260));
    } catch (e) { /* ignore if images missing */ }

    console.log(`You chose: ${playerChoice.toUpperCase()}`);
    console.log(`Computer chose: ${computerChoice.toUpperCase()}`);
    console.log(`Result: ${resultText}`);
  };

  class GameObject {
    constructor(id) {
      this.el = document.getElementById(id);
      if (!this.el) {
        // Make the class tolerant if the element isn't present in the DOM
        // (useful for progressive enhancement or when loaded in a context
        // where images are missing). Provide a minimal fake element with a
        // style object so calls like .style.* won't fail.
        console.warn(`GameObject: element #${id} not found — using a dummy element.`);
        this.el = { style: {} };
      }
    }

    rotate(deg) {
      this.el.style.transform = `rotate(${deg}deg)`;
      return this;
    }

    setBorder(style) {
      this.el.style.border = style;
      return this;
    }

    setWidth(px) {
      this.el.style.width = `${px}px`;
      return this;
    }

    setColor(color) {
      this.el.style.backgroundColor = color;
      return this;
    }

    reset() {
      this.el.style.transform = "";
      this.el.style.border = "";
      this.el.style.width = "";
      this.el.style.backgroundColor = "";
      return this;
    }
  }

  // --- Specialized classes (extend GameObject) ---
  class Rock extends GameObject {
    constructor() { super("rock-img"); }
  }

  class Paper extends GameObject {
    constructor() { super("paper-img"); }
  }

  class Scissors extends GameObject {
    constructor() { super("scissors-img"); }
  }

  // --- Instances (global) ---
  const rock = new Rock();
  const paper = new Paper();
  const scissors = new Scissors();

  window.rock = rock;
  window.paper = paper;
  window.scissors = scissors;

  // --- inspect-learning alerts (unchanged) ---
  // Clicking the icons will play that choice; console tips are logged instead of blocking alerts.
  document.getElementById("rock-btn").addEventListener("click", () => {
    console.log("Tip: try in console -> rock.setBorder('4px solid lime');");
    playRPS('rock');
  });
  document.getElementById("paper-btn").addEventListener("click", () => {
    console.log("Tip: try in console -> paper.rotate(15);");
    playRPS('paper');
  });
  document.getElementById("scissors-btn").addEventListener("click", () => {
    console.log("Tip: try in console -> scissors.setWidth(150);");
    playRPS('scissors');
  });

  // Keyboard support: press R / P / S (case-insensitive) to play
  document.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (key === 'r') playRPS('rock');
    if (key === 'p') playRPS('paper');
    if (key === 's') playRPS('scissors');
  });

  // Ensure Enter / Space activate focused buttons for accessibility
  document.querySelectorAll('#images button').forEach(btn => {
    btn.addEventListener('keydown', (ev) => {
      if (ev.key === 'Enter' || ev.key === ' ') {
        ev.preventDefault();
        btn.click();
      }
    });
  });
</script>