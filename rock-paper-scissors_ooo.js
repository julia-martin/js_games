const readline = require('readline-sync');

class Player {
  constructor() {
    this.move = null;
    this.score = 0;
    this.choices = ['rock', 'paper', 'scissors', 'lizard', 'spock'];
    this.shortMove = {r: 'rock', p: 'paper', sc: 'scissors', l: 'lizard', sp: 'spock'};
  }

}
class Computer extends Player {
  constructor() {
    super();
    this.winningMoves = {rock: 0, paper: 0, scissors: 0, lizard: 0, spock: 0};
  }
  addWeightsToWinningMoves() {
    for (let move in this.winningMoves) {
      for (let count = 0; count < this.winningMoves[move]; count++) {
        this.choices.push(move);
      }
    }
  }
  choose() {
    this.addWeightsToWinningMoves();
    // console.log(`Computer's move choices: ${this.choices}`); // for testing
    let randomIndex = Math.floor(Math.random() * this.choices.length);
    this.move = this.choices[randomIndex];
  }
}
class Human extends Player {
  constructor() {
    super();
  }
  choose() {
    while (true) {
      console.log('Please choose rock (r), paper (p), scissors (sc), lizard (l), or spock (sp):');
      let choice = readline.question();
      if (Object.keys(this.shortMove).includes(choice)) {
        this.move = this.shortMove[choice];
        break;
      }
      console.log('Sorry, invalid choice.');
    }
  }
}

class RPSGame {
  constructor() {
    this.winScore = 5;
    this.moveCombos = {
      rock: ['scissors', 'lizard'],
      paper: ['rock', 'spock'],
      scissors: ['paper', 'lizard'],
      lizard: ['spock', 'paper'],
      spock: ['rock', 'scissors']
    };
    this.human = new Human();
    this.computer = new Computer();
  }

  displayWelcomeMessage() {
    console.clear();
    console.log('Welcome to Rock, Paper, Scissors, Lizard, Spock! First person to win 5 rounds wins the game!');
  }

  displayGoodbyeMessage() {
    console.log('Thanks for playing Rock, Paper, Scissors, Lizard, Spock. Goodbye!');
  }

  displayWinner() {
    let humanMove = this.human.move;
    let computerMove = this.computer.move;
    console.log(`You chose: ${this.human.move}`);
    console.log(`The computer chose: ${this.computer.move}`);

    if (this.moveCombos[humanMove].includes(computerMove)) {
      this.human.score++;
      console.log(`You win!\nScore: You ${this.human.score} vs Computer ${this.computer.score}`);
    } else if (humanMove === computerMove) {
      console.log("It's a tie");
      console.log(`Score: You ${this.human.score} vs Computer ${this.computer.score}`);
    } else {
      this.computer.score++;
      this.computer.winningMoves[computerMove] += 1;
      console.log(`Computer wins!\nScore: You ${this.human.score} vs Computer ${this.computer.score}`);
    }
  }

  continue() {
    console.log('Press c to continue');
    let answer = readline.question();
    if (answer === 'c') {
      console.clear();
      return true;
    }
    return false;
  }

  playAgain() {
    console.log(`${this.human.score > this.computer.score ? 'Congrats, you won!' : 'Computer won.'}`);
    let answer;
    while (!answer || !['y', 'n'].includes(answer.toLowerCase())) {
      console.log('Would you like to play again? (y/n)');
      answer = readline.question();
    }
    return answer.toLowerCase() === 'y';
  }

  play() {
    // Start match
    while (true) {
      this.displayWelcomeMessage();
      this.human.score = 0;
      this.computer.score = 0;
      // Start individual game
      while (this.human.score < this.winScore &&
        this.computer.score < this.winScore) {
        this.human.choose();
        this.computer.choose();
        this.displayWinner();
        if (!this.continue()) break;
      }
      // ask to start new match
      if (!this.playAgain()) break;
    }
    this.displayGoodbyeMessage();
  }
}

let game = new RPSGame();
game.play();