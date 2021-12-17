const readline = require('readline-sync');
const POINTS_TO_WIN = 5;
const MAX_HAND_VALUE = 21;
let score = {player: 0, dealer: 0};

function shuffle(array) {
  for (let index = array.length - 1; index > 0; index--) {
    let otherIndex = Math.floor(Math.random() * (index + 1)); // 0 to index
    [array[index], array[otherIndex]] = [array[otherIndex], array[index]]; // swap elements
  }
}

function refill(hand, deck, number = 1) {
  for (let idx = 0; idx < number; idx++) {
    hand.push(deck.pop());
  }
}

function calcHand(hand) {
  let total = 0;
  hand.forEach(card => {
    if (['Jack', 'Queen', 'King'].includes(card[0])) {
      total += 10;
    } else if (card[0] === 'Ace') {
      total += 11;
    } else {
      total += Number(card[0]);
    }
  });
  if (hand.map(card => card[0]).includes('Ace') && total > MAX_HAND_VALUE) {
    total -= 10;
  }
  // console.log(`Your total is ${total}`);
  return total;
}

function updateDealer(dealerHand) {
  shuffle(dealerHand);
  console.log(`Dealer has: ${dealerHand[0][0]} and unknown card`);
}
function hitOrStay() {
  console.log("Your turn: hit or stay?");
  let answer = readline.question().toLowerCase();
  if (answer !== 'hit' && answer !== 'stay') {
    console.log("Please enter hit or stay");
    answer = readline.question();
  }
  return answer;
}
function playerTurn(hand, dealerHand, deck) {
  // Returns 1 if player lost
  while (true) {
    updateDealer(dealerHand, deck);
    console.log(`You have: ${hand.map(card => card[0]).join(', ')}`);
    let answer = hitOrStay();
    if (answer === 'hit') {
      hand.push(deck.pop());
      console.log(`You now have: ${hand.map(card => card[0]).join(', ')}`);
    }
    if (answer === 'stay' || calcHand(hand) > 21) break;
  }
  if (calcHand(hand) > MAX_HAND_VALUE) {
    console.log("You lost!");
    score.dealer += 1;
    return 1;
  } else {
    console.log("You chose to stay!");  // if player didn't bust, must have stayed to get here
    return 0;
  }
}

function dealerTurn(hand, deck) {
  // Returns 1 if dealer lost
  let total = calcHand(hand);
  while (total < (MAX_HAND_VALUE - 4)) {
    console.log("Dealer hits.");
    hand.push(deck.pop());
    total = calcHand(hand);
    console.log(`Dealer now has a total of ${total}`);
  }

  if (calcHand(hand) > MAX_HAND_VALUE) {
    console.log("The dealer busted. Congratulations, you won!");
    score.player += 1;
    return 1; // Signal to end game
  } else {
    console.log("The dealer's turn has ended.");
    return 0;
  }
}

function determineWinner(playerHand, dealerHand) {
  if (calcHand(playerHand) > calcHand(dealerHand)) {
    console.log("Congratulations, you won!");
    score.player += 1;
  } else if (calcHand(dealerHand) > calcHand(playerHand)) {
    console.log("Sorry, the dealer won.");
    score.dealer += 1;
  } else {
    console.log("It was a tie!");
  }
}

function playAgain() {
  console.log("Play again? (y/n)");
  let answer = readline.question().toLowerCase();
  while (answer !== 'y' && answer !== 'n') {
    console.log("Please enter y or n");
    answer = readline.question().toLowerCase();
  }
  return answer;
}

while (true) {
  score.player = 0;
  score.dealer = 0;
  console.clear();
  console.log(`Welcome to ${MAX_HAND_VALUE}! The first player to win 5 rounds wins the match!`);
  while (score.player < POINTS_TO_WIN && score.dealer < POINTS_TO_WIN) {
    let currentDeck = [
      ['2', 'D'], ['2', 'S'], ['2', 'H'], ['2', 'C'],
      ['3', 'D'], ['3', 'S'], ['3', 'H'], ['3', 'C'],
      ['4', 'D'], ['4', 'S'], ['4', 'H'], ['4', 'C'],
      ['5', 'D'], ['5', 'S'], ['5', 'H'], ['5', 'C'],
      ['6', 'D'], ['6', 'S'], ['6', 'H'], ['6', 'C'],
      ['7', 'D'], ['7', 'S'], ['7', 'H'], ['7', 'C'],
      ['8', 'D'], ['8', 'S'], ['8', 'H'], ['8', 'C'],
      ['9', 'D'], ['9', 'S'], ['9', 'H'], ['9', 'C'],
      ['10', 'D'], ['10', 'S'], ['10', 'H'], ['10', 'C'],
      ['Jack', 'D'], ['Jack', 'S'], ['Jack', 'H'], ['Jack', 'C'],
      ['Queen', 'D'], ['Queen', 'S'], ['Queen', 'H'], ['Queen', 'C'],
      ['King', 'D'], ['King', 'S'], ['King', 'H'], ['King', 'C'],
      ['Ace', 'D'], ['Ace', 'S'], ['Ace', 'H'], ['Ace', 'C']
    ];
    shuffle(currentDeck);
    let playerHand = [];
    let dealerHand = [];
    refill(playerHand, currentDeck, 2);
    refill(dealerHand, currentDeck, 2);

    let playerLost = playerTurn(playerHand, dealerHand, currentDeck);
    let dealerLost;
    if (playerLost === 0) {
      dealerLost = dealerTurn(dealerHand, currentDeck);
    }
    if (playerLost === 0 && dealerLost === 0) {
      determineWinner(playerHand, dealerHand);
    }

    console.log("-----Results-----");
    console.log(`Your total: ${calcHand(playerHand)}`);
    console.log(`Dealer total: ${calcHand(dealerHand)}\n`);
    console.log(`Your points so far: ${score.player}. Dealer's points so far: ${score.dealer}`);
    if (score.player === POINTS_TO_WIN) {
      console.log("Congratulations, you won the match!");
      break;
    } else if (score.dealer === POINTS_TO_WIN) {
      console.log("Sorry, you lost the match!");
      break;
    } else if (playAgain() !== 'y') {
      break;
    }
  }
  if (playAgain() !== 'y') break;
}