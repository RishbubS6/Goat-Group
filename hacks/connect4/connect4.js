class Connect4 {
  constructor() {
    this.rows = 6;
    this.cols = 7;
    this.board = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(null)
    );
    this.currentPlayer = "red";
    this.gameOver = false;

    this.statusText = document.getElementById("status");
    this.boardDiv = document.getElementById("board");

    this.createBoard();
    this.updateStatus();
  }

  createBoard() {
    this.boardDiv.innerHTML = "";
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = document.createElement("div");
        cell.className =
          "w-16 h-16 bg-blue-200 rounded-full flex items-center justify-center cursor-pointer";
        cell.addEventListener("click", () => this.handleClick(c));
        this.boardDiv.appendChild(cell);
      }
    }
  }

  handleClick(col) {
    if (this.gameOver) return;

    for (let row = this.rows - 1; row >= 0; row--) {
      if (!this.board[row][col]) {
        this.board[row][col] = this.currentPlayer;
        this.render();

        if (this.checkWin(row, col)) {
          this.statusText.textContent =
            `Player ${this.currentPlayer.toUpperCase()} wins!`;
          this.gameOver = true;
        } else {
          this.switchPlayer();
        }
        return;
      }
    }
  }

  render() {
    const cells = this.boardDiv.children;
    let i = 0;

    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        cells[i].innerHTML = "";
        if (this.board[r][c]) {
          const piece = document.createElement("div");
          piece.className =
            `w-14 h-14 rounded-full ${
              this.board[r][c] === "red"
                ? "bg-red-500"
                : "bg-yellow-400"
            }`;
          cells[i].appendChild(piece);
        }
        i++;
      }
    }
  }

  switchPlayer() {
    this.currentPlayer =
      this.currentPlayer === "red" ? "yellow" : "red";
    this.updateStatus();
  }

  updateStatus() {
    this.statusText.textContent =
      `Player ${this.currentPlayer.toUpperCase()}'s turn`;
  }

  checkWin(row, col) {
    const directions = [
      [0, 1], [1, 0], [1, 1], [1, -1]
    ];

    for (let [dr, dc] of directions) {
      let count = 1;
      count += this.countDirection(row, col, dr, dc);
      count += this.countDirection(row, col, -dr, -dc);
      if (count >= 4) return true;
    }
    return false;
  }

  countDirection(r, c, dr, dc) {
    let total = 0;
    const player = this.currentPlayer;
    r += dr;
    c += dc;

    while (
      r >= 0 && r < this.rows &&
      c >= 0 && c < this.cols &&
      this.board[r][c] === player
    ) {
      total++;
      r += dr;
      c += dc;
    }
    return total;
  }

  reset() {
    this.board = Array.from({ length: this.rows }, () =>
      Array(this.cols).fill(null)
    );
    this.currentPlayer = "red";
    this.gameOver = false;
    this.render();
    this.updateStatus();
  }
}

const game = new Connect4();
