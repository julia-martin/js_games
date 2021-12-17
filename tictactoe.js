/* eslint-disable max-lines-per-function */
const readline = require('readline-sync');

const INITIAL_MARKER = ' ';
const HUMAN_MARKER = 'X';
const COMPUTER_MARKER = 'O';
const NUM_GAMES_TO_WIN = 5;
const PLAYER_OPTIONS = ['player', 'computer', 'choose'];
const WINNING_LINES = [
  [1, 2, 3], [4, 5, 6], [7, 8, 9], // rows
  [1, 4, 7], [2, 5, 8], [3, 6, 9], // columns
  [1, 5, 9], [3, 5, 7]             // diagonals
];

function prompt(message) {
  console.log(`=> ${message}`);
}

function joinOr(arr, sep = ', ', word = 'or') {
  if (arr.length === 0) {
    return '';
  } else if (arr.length === 1) {
    return arr[0];
  } else if (arr.length === 2) {
    return `${arr[0]} ${word} ${arr[1]}`;
  }
  let firstPart = arr.slice(0, arr.length - 1).join(sep);
  return `${firstPart}${sep}${word} ${arr[arr.length - 1]}`;
}

function whoPlaysFirst() {
  prompt("Who would like to go first? (player/computer/choose) ");
  let player = readline.question().toLowerCase();

  while (!PLAYER_OPTIONS.includes(player)) {
    prompt("Sorry, please pick one of the 3 options.");
    player = readline.question();
  }

  if (player === 'choose') {
    player = PLAYER_OPTIONS[Math.floor(Math.random() * 2)];
  }
  return player;
}

function displayBoard(board) {
  console.clear();

  console.log(`You are ${HUMAN_MARKER}. Computer is ${COMPUTER_MARKER}`);

  console.log('');
  console.log('     |     |');
  console.log(`  ${board['1']}  |  ${board['2']}  |  ${board['3']}`);
  console.log('     |     |');
  console.log('-----+-----+-----');
  console.log('     |     |');
  console.log(`  ${board['4']}  |  ${board['5']}  |  ${board['6']}`);
  console.log('     |     |');
  console.log('-----+-----+-----');
  console.log('     |     |');
  console.log(`  ${board['7']}  |  ${board['8']}  |  ${board['9']}`);
  console.log('     |     |');
  console.log('');
}

function initializeBoard() {
  let board = {};
  for (let square = 1; square <= 9; square++) {
    board[String(square)] = INITIAL_MARKER;
  }
  return board;
}

function emptySquares(board) {
  return Object.keys(board).filter(key => board[key] === INITIAL_MARKER);
}

function playerChoosesSquare(board) {
  let square;
  while (true) {
    prompt(`Choose a square ${joinOr(emptySquares(board))}:`);
    square = readline.question().trim();
    if (emptySquares(board).includes(square)) break;
    prompt("Sorry, that's not a valid choice.");
  }
  board[square] = HUMAN_MARKER;
}

function findAtRiskSquare(line, board, marker) {
  let markersInLine = line.map(square => board[square]);

  if (markersInLine.filter(val => val === marker).length === 2) {
    let unusedSquare = line.find(square => board[square] === INITIAL_MARKER);
    if (unusedSquare !== undefined) {
      return unusedSquare;
    }
  }
  return null;
}

// eslint-disable-next-line max-lines-per-function
// eslint-disable-next-line max-statements
function computerChoosesSquare(board) {
  let square;
  // OFFENSE
  if (!square) {
    for (let idx = 0; idx < WINNING_LINES.length; idx++) {
      let line = WINNING_LINES[idx];
      square = findAtRiskSquare(line, board, COMPUTER_MARKER);
      if (square) break;
    }
  }
  // defense
  for (let idx = 0; idx < WINNING_LINES.length; idx++) {
    let line = WINNING_LINES[idx];
    square = findAtRiskSquare(line, board, HUMAN_MARKER);
    if (square) break;
  }
  // Square 5
  if (board['5'] === INITIAL_MARKER) {
    square = '5';
  }
  // RANDOM
  if (!square) {
    let randomIndex = Math.floor(Math.random() * emptySquares(board).length);
    square = emptySquares(board)[randomIndex];
  }
  board[square] = COMPUTER_MARKER;
}

function chooseSquare(board, player) {
  if (player === 'computer') {
    computerChoosesSquare(board);
  } else {
    playerChoosesSquare(board);
  }
}

function alternatePlayer(currentPlayer) {
  return (currentPlayer === 'player' ? 'computer' : 'player');
}

function boardFull(board) {
  return emptySquares(board).length === 0;
}

function detectWinner(board) {
  for (let line = 0; line < WINNING_LINES.length; line++) {
    let [sq1, sq2, sq3] = WINNING_LINES[line];
    if (
      board[sq1] === HUMAN_MARKER &&
      board[sq2] === HUMAN_MARKER &&
      board[sq3] === HUMAN_MARKER) {
      return 'Player';
    } else if (
      board[sq1] === COMPUTER_MARKER &&
      board[sq2] === COMPUTER_MARKER &&
      board[sq3] === COMPUTER_MARKER) {
      return 'Computer';
    }
  }
  return null;
}

function someoneWon(board) {
  return !!detectWinner(board);
}

function playAgain() {
  prompt('Play again? (y or n)');
  let answer = readline.question().toLowerCase();
  while (answer !== 'y' && answer !== 'n') {
    prompt("Error, please enter y or n");
    answer = readline.question().toLowerCase();
  }
  return answer;
}

// New match
while (true) {
  let score = {player: 0, computer: 0};
  // New game
  while (score.player < NUM_GAMES_TO_WIN && score.computer < NUM_GAMES_TO_WIN) {
    let currentPlayer = whoPlaysFirst();
    let board = initializeBoard();
    displayBoard(board);
    // New turn
    while (true) {
      displayBoard(board);
      chooseSquare(board, currentPlayer);
      currentPlayer = alternatePlayer(currentPlayer);
      if (someoneWon(board) || boardFull(board)) break;
    }

    displayBoard(board);

    if (someoneWon(board)) {
      let winner = detectWinner(board);
      prompt(`${winner} won!`);
      score[winner.toLowerCase()] += 1;
    } else {
      prompt("It's a tie!");
    }

    let continuePlaying = playAgain();
    if (continuePlaying !== 'y') break;
  }

  if (score.player === NUM_GAMES_TO_WIN) {
    prompt("Congrats, You have won the match!");
  } else if (score.computer === NUM_GAMES_TO_WIN) {
    prompt("Sorry, the computer has won the match.");
  }

  let answer = playAgain();
  if (answer !== 'y') break;
}

prompt('Thanks for playing Tic Tac Toe!');