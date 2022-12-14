// load questionSets into scope
// index 0 will be chosen as default on page load
const questionSetsJSON = [bap, som, ue, mr, iuk, im, ik, orga, ar, hgb, v];

// ask youser before leaving the page if they really want to
window.addEventListener("beforeunload", (e) => {
    e.preventDefault();
    e.returnValue = "";
});

// getting the DOM elements 
// Card Elements
let card = document.querySelector(".card")
let question = document.querySelector(".question");
let solution = document.querySelector(".solution");
let inputField = document.querySelector(".answer");
// Buttons
let checkAnswerBUTTON = document.querySelector(".check_answer");
let newWordBUTTON = document.querySelector(".new_word");
let correctBUTTON = document.querySelector(".correct");
let wrongBUTTON = document.querySelector(".wrong");
let reloadBUTTON = document.querySelector(".reload");
let returnBUTTON = document.querySelector(".return");
// card-deck-choice-fields
const cardDeckOptions = [
    "physics",
    "chem",
];

// Text below the Cards
let remainingCards = document.querySelector(".remaining");
let knownCards = document.querySelector("#known");
let knownCardsCounter = 0;
let nextCards = document.querySelector("#next");

// define question-set
// global questionSet
let questionSet = questionSetsJSON[0];
let nextRound = [];
// set a questionSet to start with
function defineQuestionSet(set) {
    questionSet = set;
}

// keep track of current deck-index (cardDeckOptions / questionSetsJSON)
let lastDeckIDX = 0;
// load the deck the user selects from the options-drop-down
let deckOptions = document.querySelector("#decks");
deckOptions.addEventListener("change", (e) => {
    let selectedDeck = deckOptions.value;
    let lastDeckIDX = cardDeckOptions.indexOf(selectedDeck);

    defineQuestionSet(questionSetsJSON[lastDeckIDX]);
    newCard();
    });

// flip Answer-Card back to Question
returnBUTTON.addEventListener("click", () => card.classList.remove("flipped"));


// gets a random pair (question/answer) from the a given array of objects
function getQuestionPair(dict) {
    let rand = Math.floor(Math.random() * dict.length);
    return Object.entries(dict)[rand][1];
}

// innitial randomPair on Page-Load
let randomPair = getQuestionPair(questionSet);

// display first question
displayQuestion(randomPair);

// write question on the front of card
function displayQuestion(rP) {
    // get curser into input-field
    if (inputField) inputField.focus(); 
    // remove input field from page if it is not needed (e.g. for rechtFragen)
    if (rP["input"]) {
        inputField.classList.remove("hidden");
        wrongBUTTON.classList.add("hidden");
        correctBUTTON.classList.add("hidden");
    } else {
        inputField.classList.add("hidden");
        wrongBUTTON.classList.remove("hidden");
        correctBUTTON.classList.remove("hidden");
    }
    // turn card to front-side
    card.classList.remove("flipped");
    // write question on front-side of the card
    question.innerHTML = rP["Question"];
    // add hidden to the last answer, so the card-size rescales down (to question-size)
    solution.classList.add("hidden");

    // display current stack of cards
    remainingCards.innerHTML = `There are still ${questionSet.length} cards in the deck`
    knownCards.innerHTML = `Known so far: ${knownCardsCounter}`; 
    nextCards.innerHTML = `Next round: ${nextRound.length}`; 
}

// used inside of "flipBackAndDisplayAnswer" to split multiple answers
function splitPhraseIfSeveralNumbers(phrase) {
    let re = /\d\.\s.+\;/;
    if (re.test(phrase)) {
        phrase = phrase.split(";");
    }
    return phrase;
}

// flip card to back-side and display/render answer(s)
function flipBackAndDisplayAnswer() {
    // display answer on the back of the card
    card.classList.add("flipped");
    // the solution-text is hidden (so the card-size isn't too big from the last answer)
    solution.classList.remove("hidden");

    // if no input no "next question"
    if (randomPair["input"]) newWordBUTTON.classList.remove("hidden");
    else newWordBUTTON.classList.add("hidden");

    // create backside of the card
    let answer = document.querySelector(".answer");
    if (randomPair["input"]) {
        answer = answer.value;
        if (answer == randomPair["Answer"]) solution.innerHTML = "Correct!";
        else solution.innerHTML = `Incorrect.<br>The correct answer would be <em>"${randomPair["Answer"]}"</em>.`;
    } else {
        // create List of possible multiple-answer
        let answerList = splitPhraseIfSeveralNumbers(randomPair["Answer"]);
        // if it is just one answer display it
        if (typeof answerList == "string") solution.innerHTML = randomPair["Answer"];
        // if mulitple answers display them as a list
        else {
            solution.innerHTML = "";
            let answerListDOM = document.createElement("ol");
            solution.appendChild(answerListDOM);
            answerList.forEach(a => {
                // check if a number is in front and delete it so the ordered list tag provides numbers;
                let numRegEx = /^\s*\d+\.\s/g;
                a = a.replace(numRegEx, "");
                let listElement = document.createElement("li");
                answerListDOM.appendChild(listElement);
                listElement.innerHTML = a;
            });
        }
    } 

    // clear the input field if there is one for next questions
    let answerInput = document.querySelector(".answer");
    if (answerInput) answerInput.value = "";
}

// get a new card
function newCard() {
    if (questionSet.length === 0 && nextRound.length > 0) {
        questionSet = nextRound;
        questionSetsJSON[lastDeckIDX] = nextRound;
        nextRound = [];
    }
    // create new randomPair in global scope
    randomPair = getQuestionPair(questionSet);
    displayQuestion(randomPair);
}

// removes current randomPair of question Answer from global questionSet-Array of objects
function removeCardFromSet(correct) {
    let idx = questionSet.findIndex(qa => qa["Question"] == randomPair["Question"]);
    let card = questionSet[idx];
    if (correct) {
        questionSet.splice(idx, 1);
        knownCardsCounter += 1;
    } else {
        nextRound.push(card);
        questionSet.splice(idx, 1);
    }
    if (questionSet.length > 0 || nextRound.length > 0) newCard();
}

// attach the show-result function to the button on frontside of card
checkAnswerBUTTON.addEventListener("click", flipBackAndDisplayAnswer);

// attach newWord-function to button on backside of card
newWordBUTTON.addEventListener("click", newCard);

// attache functionality "newCard" to wrong-button
wrongBUTTON.addEventListener("click", () => {
    removeCardFromSet(false);
});
correctBUTTON.addEventListener("click", () => {
    removeCardFromSet(true);
});

// reload the page / begin from the beginning
reloadBUTTON.addEventListener("click", () => location.reload());




