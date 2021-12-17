const readline = require('readline-sync');
const shuffle = require('shuffle-array');

class Card {
  constructor(value, suit) {
    this.value = value;
    this.suit = suit;
  }
  toString() {
    return this.value + ' of ' + this.suit;
  }
}

class Deck {
  static SUITS = ['Diamonds', 'Spades', 'Hearts', 'Clubs'];
  static VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10',
    'Jack', 'Queen', 'King', 'Ace'];

  constructor() {
    this.cards = [];
    Deck.SUITS.forEach(suit => {
      Deck.VALUES.forEach(value => {
        this.cards.push(new Card(value, suit));
      });
    });
    shuffle(this.cards);
  }

  deal(player, num = 1) {
    for (let count = 0; count < num; count++) {
      player.hand.push(this.cards.pop());
    }
  }
}

class Participant {
  static MAX_VALUE = 21;

  constructor() {
    this.score = 0;
    this.hand = [];
  }

  calcPoints() {
    let total = 0;

    this.hand.forEach(card => {
      if (['Jack', 'Queen', 'King'].includes(card.value)) {
        total += 10;
      } else if (card.value === 'Ace') {
        total += 11;
      } else {
        total += Number(card.value);
      }
    });

    if (this.hand.map(card => card.value).includes('Ace') && total > Participant.MAX_VALUE) {
      total -= 10;
    }

    return total;
  }

  isBusted() {
    return this.calcPoints() > Participant.MAX_VALUE;
  }

  incrementScore() {
    this.score++;
  }
}

class Player extends Participant {
  static INITIAL_MONEY = 5;
  static WINNING_MONEY = 10;
  constructor() {
    super();
    this.money = Player.INITIAL_MONEY;
  }

  hitOrStay() {
    let answer = readline.question("Your turn: hit or stay? ");
    if (!['hit', 'stay'].includes(answer.toLowerCase())) {
      console.log("Please enter hit or stay:");
      answer = readline.question();
    }
    return answer;
  }

  showCards() {
    let hand = this.hand.map(card => card.toString()).join(', ');
    let points = this.calcPoints();
    console.log(`You now have ${points} points: ${hand}`);
  }

  displayMoney() {
    console.log(`You currently have $${this.money} to play with.\n`);
  }
}

class Dealer extends Participant {
  constructor() {
    super();
  }

  showCards(both = false) {
    if (both) {
      let hand = this.hand.map(card => card.toString()).join(' and ');
      console.log(`Dealer has ${hand}.`);
    } else {
      console.log(`Dealer has ${this.hand[0].toString()} and an unknown card`);
    }
  }
}

class TwentyOneGame {
  constructor() {
    this.player = new Player();
    this.dealer = new Dealer();
    this.deck = new Deck();
  }

  playRound() {
    this.player = new Player();
    this.dealer = new Dealer();
    while (this.player.money > 0 && this.player.money < Player.WINNING_MONEY) {
      this.deck = new Deck();
      this.player.displayMoney();
      this.resetCards();
      this.player.showCards();
      this.dealer.showCards();
      this.playerTurn();
      if (!this.player.isBusted()) {
        this.dealerTurn();
      }
      this.displayResult();
    }
    this.showMoneyStatus();
  }

  start() {
    this.displayWelcomeMessage();
    while (true) {
      this.playRound();
      if (!this.playAgain()) break;
    }
    this.displayGoodbyeMessage();
  }

  resetCards() {
    this.player.hand = [];
    this.dealer.hand = [];
    this.deck.deal(this.player, 2);
    this.deck.deal(this.dealer, 2);
  }

  playerTurn() {
    let move = this.player.hitOrStay();
    console.clear();
    while (move === 'hit') {
      this.deck.deal(this.player);
      this.player.showCards();

      if (this.player.isBusted()) {
        console.log(`You have a total of ${this.player.calcPoints()}. You busted!`);
        this.player.money--;
        this.dealer.incrementScore();
        return;
      }
      move = this.player.hitOrStay();
    }

    console.log(`You chose to stay! You have a total of ${this.player.calcPoints()}`);
  }

  dealerTurn() {
    this.dealer.showCards(true);
    let total = this.dealer.calcPoints();
    while (total < (Participant.MAX_VALUE - 4)) {
      console.log("Dealer hits.");
      this.deck.deal(this.dealer);
      total = this.dealer.calcPoints();
      console.log(`Dealer now has a total of ${total}`);
    }

    if (total > Participant.MAX_VALUE) {
      console.log(`The dealer busted with a total of ${total}. Congratulations, you won!`);
      this.player.money++;
      this.player.incrementScore();
    } else {
      console.log("The dealer's turn has ended.");
    }
  }

  displayWelcomeMessage() {
    console.log("Welcome to 21! You have $5 to start. You lose when you go broke, and you win when you reach $10.");
  }

  displayGoodbyeMessage() {
    console.log("\nThanks for playing 21! Goodbye!\n");
  }

  displayResult() {
    console.log(`Score: You-${this.player.score} vs Dealer-${this.dealer.score}\n`);
  }

  showMoneyStatus() {
    if (this.player.money === 0) {
      console.log('Sorry, you ran out of money!');
    } else if (this.player.money === 10) {
      console.log("Yay! You're rich!");
    }
  }

  playAgain() {
    let answer = readline.question("Play again? (y/n): ");
    while (!['y', 'n'].includes(answer.toLowerCase())) {
      answer = readline.question("Please enter y or n: ");
    }
    return answer.toLowerCase() === 'y';
  }
}

let game = new TwentyOneGame();
game.start();