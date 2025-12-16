class Connect4 {
    constructor() {
        this.rows = 6;
        this.cols = 7;
        this.currentPlayer = "Red";
        this.selectedTime = 180; // default 3 min
        this.redTime = this.selectedTime;
        this.yellowTime = this.selectedTime;
        this.timerInterval = null;
        this.board = [];
        this.discSpeed = 10; // pixels per frame
        this.confettiParticles = [];
        this.initBoard();
        this.renderBoard();
        this.setupCanvas();
    }

    initBoard() {
        this.board = [];
        for (let r = 0; r < this.rows; r++) {
            this.board[r] = [];
            for (let c = 0; c < this.cols; c++) this.board[r][c] = null;
        }
    }

    renderBoard() {
        const boardDiv = document.getElementById("board");
        boardDiv.innerHTML = "";
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                const cell = document.createElement("div");
                cell.classList.add(
                    "w-14","h-14","rounded-full","bg-blue-300",
                    "flex","items-center","justify-center",
                    "shadow-md","cursor-pointer"
                );
                cell.dataset.row = r;
                cell.dataset.col = c;
                cell.addEventListener("click", () => this.placePiece(c));
                if (this.board[r][c]) {
                    const disc = document.createElement("div");
                    disc.classList.add("w-12","h-12","rounded-full","shadow-inner");
                    disc.style.backgroundColor = this.board[r][c];
                    cell.appendChild(disc);
                }
                boardDiv.appendChild(cell);
            }
        }
    }

    placePiece(col) {
        for (let r = this.rows - 1; r >= 0; r--) {
            if (!this.board[r][col]) {
                this.animateDiscDrop(r, col, this.currentPlayer);
                this.board[r][col] = this.currentPlayer;
                if (this.checkWinner(r, col)) {
                    this.showWinner(this.currentPlayer);
                    this.stopTimers();
                } else {
                    this.switchPlayer();
                }
                break;
            }
        }
    }

    animateDiscDrop(row, col, color) {
        const boardDiv = document.getElementById("board");
        boardDiv.style.position = "relative"; 
        const disc = document.createElement("div");
        disc.classList.add("w-12","h-12","rounded-full","shadow-inner","absolute");
        disc.style.backgroundColor = color;

        const cell = boardDiv.children[row * this.cols + col];
        const rect = cell.getBoundingClientRect();
        const boardRect = boardDiv.getBoundingClientRect();

        // Center disc perfectly inside the cell
        const discSize = 48; // w-12/h-12 = 48px
        const cellCenterX = rect.left - boardRect.left + rect.width / 2;
        const cellCenterY = rect.top - boardRect.top + rect.height / 2;

        disc.style.left = (cellCenterX - discSize/2) + "px";
        disc.style.top = "-50px"; // start above the board

        boardDiv.appendChild(disc);

        const targetTop = cellCenterY - discSize/2;

        const animate = () => {
            let currentTop = parseFloat(disc.style.top);
            if (currentTop < targetTop) {
                disc.style.top = Math.min(currentTop + this.discSpeed, targetTop) + "px";
                requestAnimationFrame(animate);
            } else {
                disc.remove();
                this.renderBoard();
            }
        };
        animate();
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === "Red" ? "Yellow" : "Red";
        document.getElementById("status").innerText = `${this.currentPlayer}'s turn`;
    }

    checkWinner(row, col) {
        const color = this.board[row][col];
        return (
            this.checkDirection(row, col, 0, 1, color) + this.checkDirection(row, col, 0, -1, color) > 2 ||
            this.checkDirection(row, col, 1, 0, color) > 2 ||
            this.checkDirection(row, col, 1, 1, color) + this.checkDirection(row, col, -1, -1, color) > 2 ||
            this.checkDirection(row, col, 1, -1, color) + this.checkDirection(row, col, -1, 1, color) > 2
        );
    }

    checkDirection(r, c, dr, dc, color) {
        let count = 0;
        let i = r + dr;
        let j = c + dc;
        while (i >= 0 && i < this.rows && j >= 0 && j < this.cols && this.board[i][j] === color) {
            count++;
            i += dr;
            j += dc;
        }
        return count;
    }

    showWinner(color) {
        document.getElementById("winner-text").innerText = `Player ${color} Wins!`;
        document.getElementById("winner-overlay").classList.remove("hidden");
        this.launchConfetti();
    }

    hideWinnerOverlay() {
        document.getElementById("winner-overlay").classList.add("hidden");
    }

    startTimers() {
        this.stopTimers();
        this.updateTimerDisplay();
        this.timerInterval = setInterval(() => {
            if (this.currentPlayer === "Red") {
                this.redTime--;
                if (this.redTime <= 0) { this.showWinner("Yellow"); this.stopTimers(); }
            } else {
                this.yellowTime--;
                if (this.yellowTime <= 0) { this.showWinner("Red"); this.stopTimers(); }
            }
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimers() { clearInterval(this.timerInterval); }
    updateTimerDisplay() {
        document.getElementById("red-timer").innerText = this.formatTime(this.redTime);
        document.getElementById("yellow-timer").innerText = this.formatTime(this.yellowTime);
    }
    formatTime(sec) {
        const m = Math.floor(sec / 60).toString().padStart(2,"0");
        const s = (sec % 60).toString().padStart(2,"0");
        return `${m}:${s}`;
    }

    startGame(seconds) {
        this.selectedTime = seconds;
        this.redTime = seconds;
        this.yellowTime = seconds;
        document.getElementById("title-screen").classList.add("hidden");
        document.getElementById("game-screen").classList.remove("hidden");
        this.startTimers();
    }

    reset() {
        this.stopTimers();
        this.initBoard();
        this.renderBoard();
        this.currentPlayer = "Red";
        this.redTime = this.selectedTime;
        this.yellowTime = this.selectedTime;
        this.updateTimerDisplay();
        this.hideWinnerOverlay();
        document.getElementById("game-screen").classList.add("hidden");
        document.getElementById("title-screen").classList.remove("hidden");
    }

    // Confetti
    setupCanvas() {
        this.canvas = document.getElementById("confetti-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    launchConfetti() {
        this.confettiParticles = [];
        for (let i = 0; i < 100; i++) {
            this.confettiParticles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                r: Math.random() * 6 + 4,
                color: i % 2 === 0 ? "red" : "yellow",
                dx: Math.random() * 4 - 2,
                dy: Math.random() * 4 + 2
            });
        }
        requestAnimationFrame(() => this.updateConfetti());
    }

    updateConfetti() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let p of this.confettiParticles) {
            p.x += p.dx;
            p.y += p.dy;
            if (p.y > this.canvas.height) p.y = 0;
            if (p.x > this.canvas.width) p.x = 0;
            if (p.x < 0) p.x = this.canvas.width;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
            this.ctx.fill();
        }
        requestAnimationFrame(() => this.updateConfetti());
    }
}

const game = new Connect4();  
