const GAME_STATE = {
  firstCardAwaits: "firstCardAwaits ",
  secondCardAwaits: "secondCardAwaits",
  cardMatchFailed: "cardMatchFailed",
  cardMatched: "cardMatched",
  gameFinished: "gameFinished",
};

const Symbols = [
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png", // 黑桃
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png", // 愛心
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png", // 方塊
  "https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png", // 梅花
];
const view = {
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`;
  },

  getCardContent(index) {
    //  餘數 + 1會等於目前的數字
    const number = this.transformNumber((index % 13) + 1);
    // 取整數判斷目前的陣列是哪個花色
    const symbol = Symbols[Math.floor(index / 13)];
    return `
      <p>${number}</p>
      <img src="${symbol}" alt=""/>
      <p>${number}</p>
      `;
  },
  transformNumber(num) {
    switch (num) {
      case 1:
        return "A";
      case 11:
        return "J";
      case 12:
        return "Q";
      case 13:
        return "K";
      default:
        return num;
    }
  },
  displayCards(index) {
    const rootElement = document.querySelector("#cards");
    // Array(52)會產生0-51的空陣列
    // 用keys()產生迭代
    //Array.from => 從這個陣列中取出的意思
    rootElement.innerHTML = index
      .map((index) => this.getCardElement(index))
      .join("");
  },
  flipCards(...cards) {
    cards.map((card) => {
      //若是背面，回傳正面
      if (card.classList.contains("back")) {
        card.classList.remove("back");
        card.innerHTML = this.getCardContent(Number(card.dataset.index));
      } else {
        //若是正面，回傳背面
        card.classList.add("back");
        card.innerHTML = null;
      }
    });
  },
  pairedCards(...cards) {
    cards.map((card) => {
      card.classList.add("paired");
    });
  },
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },
  renderTriedTimes(times) {
    document.querySelector(
      ".tried"
    ).textContent = `You've tried: ${times} times`;
  },
  appendWrongAnimation(...cards) {
    cards.map((card) => {
      card.classList.add("wrong");
      card.addEventListener(
        "animationend",
        (e) => {
          card.classList.remove("wrong");
        },
        {
          once: true,
        }
      );
    });
  },
  showGameFinished() {
    const div = document.createElement("div");
    div.classList.add("completed");
    div.innerHTML = `
     <p>Complete!</p>
     <p>Score: ${model.score}</p>
     <p>You've tried: ${model.triedTimes} times</p>
   `;
    const header = document.querySelector("#header");
    header.before(div);
  },
  timerStart(number) {
    let timer = document.querySelector("#timer");
    setInterval(function () {
      number++;
      if (number <= 0) {
        number = 0;
      }
      timer.innerText = `Times: ${number} SEC`;
    }, 1000);
  },
};
const utility = {
  getRandomNumber(count) {
    const number = Array.from(Array(count).keys());
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1));
      [number[index], number[randomIndex]] = [
        number[randomIndex],
        number[index],
      ];
    }
    return number;
  },
};
const model = {
  cardRevealed: [],
  isRevealedCardsMatched() {
    return (
      this.cardRevealed[0].dataset.index % 13 ===
      this.cardRevealed[1].dataset.index % 13
    );
  },
  score: 0,
  triedTimes: 0,
  number: 0,
};
const controller = {
  currentState: GAME_STATE.firstCardAwaits,
  generateCards() {
    view.displayCards(utility.getRandomNumber(52));
    view.timerStart(model.number);
  },
  dispatchCardAction(card) {
    if (!card.classList.contains("back")) {
      return;
    }
    switch (this.currentState) {
      case GAME_STATE.firstCardAwaits:
        view.flipCards(card);
        model.cardRevealed.push(card);
        this.currentState = GAME_STATE.secondCardAwaits;
        break;
      case GAME_STATE.secondCardAwaits:
        view.renderTriedTimes(model.triedTimes++);
        view.flipCards(card);
        model.cardRevealed.push(card);
        // 判斷是否配對成功
        if (model.isRevealedCardsMatched()) {
          //配對成功
          view.renderScore((model.score += 10));
          this.currentState = GAME_STATE.cardMatched;
          view.pairedCards(...model.cardRevealed);
          model.cardRevealed = [];
          if (model.score === 260) {
            console.log("showGameFinished");
            this.currentState = GAME_STATE.GameFinished;
            view.showGameFinished();
            return;
          }
          this.currentState = GAME_STATE.firstCardAwaits;
        } else {
          //配對失敗
          this.currentState = GAME_STATE.cardMatchFailed;
          view.appendWrongAnimation(...model.cardRevealed);
          setTimeout(this.resetCards, 1000);
        }
        break;
    }
    console.log("current state:", this.currentState);
    console.log("reveal card: ", model.cardRevealed);
  },
  resetCards() {
    view.flipCards(...model.cardRevealed);
    model.cardRevealed = [];
    controller.currentState = GAME_STATE.firstCardAwaits;
  },
};
controller.generateCards();
document.querySelectorAll(".card").forEach((card) => {
  card.addEventListener("click", (event) =>
    controller.dispatchCardAction(card)
  );
});

// console.log(utility.getRandomNumber(5));
