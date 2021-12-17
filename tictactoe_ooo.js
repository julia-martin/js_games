let readline = require('readline-sync');

class Square {
  static UNUSED_SQUARE = " ";
  static HUMAN_MARKER = "X";
  static COMPUTER_MARKER = "O";

  constructor(marker = Square.UNUSED_SQUARE) {
    this.marker = marker;
  }

  toString() {
    return this.marker;
  }

  setMarker(marker) {
    this.marker = marker;
  }

  getMarker() {
    return this.marker;
  }

  isUnused() {
    return this.marker === Square.UNUSED_SQUARE;
  }
}

class Board {
  constructor() {
    this.squares = {};
    for (let counter = 1; counter <= 9; counter++) {
      this.squares[String(counter)] = new Square();
    }
  }

  display() {
    console.log("");
    console.log("     |     |");
    console.log(`  ${this.squares["1"]}  |  ${this.squares["2"]}  |  ${this.squares["3"]}`);
    console.log("     |     |");
    console.log("-----+-----+-----");
    console.log("     |     |");
    console.log(`  ${this.squares["4"]}  |  ${this.squares["5"]}  |  ${this.squares["6"]}`);
    console.log("     |     |");
    console.log("-----+-----+-----");
    console.log("     |     |");
    console.log(`  ${this.squares["7"]}  |  ${this.squares["8"]}  |  ${this.squares["9"]}`);
    console.log("     |     |");
    console.log("");
  }

  markSquareAt(key, marker) {
    this.squares[key].setMarker(marker);
  }

  unusedSquares() {
    let keys = Object.keys(this.squares);
    return keys.filter(key => this.squares[key].isUnused());
  }

  isFull() {
    return this.unusedSquares().length === 0;
  }

  countMarkersFor(player, keys) {
    let markers = keys.filter(key => {
      return this.squares[key].getMarker() === player.getMarker();
    });
    return markers.length;
  }

  displayWithClear() {
    console.clear();
    this.display();
  }
}

class Player {
  constructor(marker) {
    this.marker = marker;
    this.score = 0;
  }

  getMarker() {
    return this.marker;
  }

  incrementScore() {
    this.score++;
  }
}

class Human extends Player {
  constructor() {
    super(Square.HUMAN_MARKER);
  }
}

class Computer extends Player {
  constructor() {
    super(Square.COMPUTER_MARKER);
  }
}

class TTTGame {
  static MATCH_GOAL = 3;
  static POSSIBLE_WINNING_ROWS = [
    [ "1", "2", "3" ],            // top row of board
    [ "4", "5", "6" ],            // center row of board
    [ "7", "8", "9" ],            // bottom row of board
    [ "1", "4", "7" ],            // left column of board
    [ "2", "5", "8" ],            // middle column of board
    [ "3", "6", "9" ],            // right column of board
    [ "1", "5", "9" ],            // diagonal: top-left to bottom-right
    [ "3", "5", "7" ],            // diagonal: bottom-left to top-right
  ];

  static joinOr(array, delim = ', ', word = 'or') {
    if (array.length <= 2) {
      return array.join(' ' + word + ' ');
    } else {
      return array.slice(0, array.length - 1).join(delim) + ' ' + word + ' ' + array[array.length - 1];
    }
  }

  constructor() {
    this.board = new Board();
    this.human = new Human();
    this.computer = new Computer();
    this.firstPlayer = this.human;
  }

  pickFirstPlayer() {
    let answer = readline.question("Who wants to go first, the human (h) or the computer (c)? ");
    while (!['h', 'c'].includes(answer.toLowerCase())) {
      answer = readline.question("Invalid input. Please type 'h' or 'c': ");
    }
    if (answer.toLowerCase() === 'c') {
      this.firstPlayer = this.computer;
    }
  }

  togglePlayer(currPlayer) {
    return (currPlayer === this.human) ? this.computer : this.human;
  }

  playerMoves(currPlayer) {
    if (currPlayer === this.human) {
      this.humanMoves();
    } else {
      this.computerMoves();
    }
  }

  playOne() {
    this.board = new Board();
    this.board.display();
    // start moves
    let currPlayer = this.firstPlayer;
    while (true) {
      this.playerMoves(currPlayer);
      this.board.displayWithClear();
      if (this.gameOver()) break;
      currPlayer = this.togglePlayer(currPlayer);
    }
    this.board.displayWithClear();
    this.displayResults();
  }

  play() {
    this.displayWelcomeMessage();
    this.pickFirstPlayer();
    while (true) {
      this.playOne();
      if (this.human.score >= TTTGame.MATCH_GOAL ||
        this.computer.score >= TTTGame.MATCH_GOAL) break;
      if (!this.playAgain()) break;
    }
    this.displayGoodbyeMessage();
  }

  displayWelcomeMessage() {
    console.clear();
    console.log("Welcome to Tic Tac Toe!\nThe first player to win 3 rounds wins the match!");
  }

  determineWinner() {
    let winner = this.human.score > this.computer.score ? "You" : "Computer";
    console.log(`${winner} won the match!`);
  }

  displayGoodbyeMessage() {
    this.determineWinner();
    console.log("Thanks for playing Tic Tac Toe! Goodbye!");
  }

  updateScore(player) {
    player.incrementScore();
  }

  displayResults() {
    if (this.isWinner(this.human)) {
      this.updateScore(this.human);
      console.log("You won! Congratulations!");
    } else if (this.isWinner(this.computer)) {
      this.updateScore(this.computer);
      console.log("I won! I won! Take that, human!");
    } else {
      console.log("A tie game. How boring.");
    }
    console.log(`Score:\nYou: ${this.human.score} vs. Computer: ${this.computer.score}`);
  }

  humanMoves() {
    let choice;
    while (true) {
      let validChoices = this.board.unusedSquares();
      const prompt = `Choose a square (${TTTGame.joinOr(validChoices)}): `;
      choice = readline.question(prompt);
      if (validChoices.includes(choice)) break;

      console.log("Sorry, that's not a valid choice\n");
    }
    this.board.markSquareAt(choice, this.human.getMarker());
  }

  findAtRiskSquare(player, row) {
    if (this.board.countMarkersFor(player, row) === 2) {
      let unusedSquare = row.find(key => {
        return this.board.squares[key].getMarker() === Square.UNUSED_SQUARE;
      });
      if (unusedSquare !== undefined) {
        return unusedSquare;
      }
    }
    return null;
  }

  smartComputerMove(type) {
    for (let idx = 0; idx < TTTGame.POSSIBLE_WINNING_ROWS.length; idx++) {
      let row = TTTGame.POSSIBLE_WINNING_ROWS[idx];
      let openSquare;
      if (type === 'offense') {
        openSquare = this.findAtRiskSquare(this.computer, row);
      } else if (type === 'defense') {
        openSquare = this.findAtRiskSquare(this.human, row);
      }
      if (openSquare) {
        return openSquare;
      }
    }
    return null;
  }

  computerMoves() {
    let choice = (this.board.unusedSquares().includes('5')) ? '5' : null;
    if (!choice) {
      choice = this.smartComputerMove('offense');
    }
    if (!choice) {
      choice = this.smartComputerMove('defense');
    }
    if (!choice) {
      let validChoices = this.board.unusedSquares();
      do {
        choice = Math.floor((Math.random() * 9) + 1).toString();
      } while (!validChoices.includes(choice));
    }
    this.board.markSquareAt(choice, this.computer.getMarker());
  }

  gameOver() {
    return this.board.isFull() || this.someoneWon();
  }

  someoneWon() {
    return this.isWinner(this.human) || this.isWinner(this.computer);
  }

  isWinner(player) {
    return TTTGame.POSSIBLE_WINNING_ROWS.some(row => {
      return this.board.countMarkersFor(player, row) === 3;
    });
  }

  playAgain() {
    let answer = readline.question("Play again? (y/n): ");
    if (!['y', 'n'].includes(answer.toLowerCase())) {
      console.log('Please type y or n');
      answer = readline.question("Play again? (y/n): ");
    }
    return answer.toLowerCase() === 'y';
  }
}


let game = new TTTGame();
game.play();