// ==========================================
// ROCK PAPER SCISSORS
// ==========================================


// ------------------------------------------
// GAME STATE
// ------------------------------------------

let playerScore = 0;
let computerScore = 0;
let roundCount = 0;
let currentStreak = 0;


// ------------------------------------------
// GAME CHOICES
// ------------------------------------------

const choices = ["rock", "paper", "scissors"];

const choiceIcons = {
    rock: "✊",
    paper: "✋",
    scissors: "✌️"
};


// ------------------------------------------
// LOCAL STORAGE
// ------------------------------------------

const STORAGE_KEY = "jeriRpsGame";


// ------------------------------------------
// GET HTML ELEMENTS
// ------------------------------------------

const choiceButtons = document.querySelectorAll(".choice-btn");

const playerScoreElement =
    document.getElementById("player-score");

const computerScoreElement =
    document.getElementById("computer-score");

const roundCountElement =
    document.getElementById("round-count");

const streakCountElement =
    document.getElementById("streak-count");

const playerChoiceElement =
    document.getElementById("player-choice");

const computerChoiceElement =
    document.getElementById("computer-choice");

const resultTitleElement =
    document.getElementById("result-title");

const resultDetailElement =
    document.getElementById("result-detail");

const resetButton =
    document.getElementById("reset-btn");


// ------------------------------------------
// CHECK ELEMENTS
// ------------------------------------------

console.log("RPS game loaded.");

console.log("Choice buttons:", choiceButtons.length);

console.log("Player score element:", playerScoreElement);

console.log("Computer score element:", computerScoreElement);

console.log("Round element:", roundCountElement);

console.log("Result title:", resultTitleElement);


// ------------------------------------------
// LOAD SAVED GAME
// ------------------------------------------

function loadGame() {

    const savedGame = localStorage.getItem(STORAGE_KEY);

    if (!savedGame) {
        updateDisplay();
        return;
    }

    try {

        const gameData = JSON.parse(savedGame);

        playerScore = Number(gameData.playerScore) || 0;

        computerScore = Number(gameData.computerScore) || 0;

        roundCount = Number(gameData.roundCount) || 0;

        currentStreak = Number(gameData.currentStreak) || 0;

        updateDisplay();

    } catch (error) {

        console.error(
            "Error loading saved game:",
            error
        );

        resetGame();

    }
}


// ------------------------------------------
// SAVE GAME
// ------------------------------------------

function saveGame() {

    const gameData = {

        playerScore: playerScore,

        computerScore: computerScore,

        roundCount: roundCount,

        currentStreak: currentStreak

    };

    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(gameData)
    );
}


// ------------------------------------------
// COMPUTER RANDOM CHOICE
// ------------------------------------------

function getComputerChoice() {

    const randomIndex =
        Math.floor(Math.random() * choices.length);

    return choices[randomIndex];
}


// ------------------------------------------
// DETERMINE WINNER
// ------------------------------------------

function determineWinner(
    playerChoice,
    computerChoice
) {

    // Draw
    if (playerChoice === computerChoice) {
        return "draw";
    }


    // Player wins
    if (
        (playerChoice === "rock" &&
            computerChoice === "scissors") ||

        (playerChoice === "paper" &&
            computerChoice === "rock") ||

        (playerChoice === "scissors" &&
            computerChoice === "paper")
    ) {

        return "player";

    }


    // Computer wins
    return "computer";
}


// ------------------------------------------
// CAPITALIZE
// ------------------------------------------

function capitalize(word) {

    return word.charAt(0).toUpperCase()
        + word.slice(1);

}


// ------------------------------------------
// PLAY GAME
// ------------------------------------------

function playGame(playerChoice) {

    console.log(
        "Player selected:",
        playerChoice
    );


    // Get computer choice
    const computerChoice =
        getComputerChoice();


    console.log(
        "Computer selected:",
        computerChoice
    );


    // Find winner
    const winner =
        determineWinner(
            playerChoice,
            computerChoice
        );


    console.log(
        "Winner:",
        winner
    );


    // Increase round
    roundCount++;


    // Show choices
    playerChoiceElement.textContent =
        choiceIcons[playerChoice];

    computerChoiceElement.textContent =
        choiceIcons[computerChoice];


    // --------------------------------------
    // PLAYER WINS
    // --------------------------------------

    if (winner === "player") {

        playerScore++;

        currentStreak++;


        resultTitleElement.textContent =
            "You Win!";


        resultDetailElement.textContent =
            `${capitalize(playerChoice)} beats ${capitalize(computerChoice)}.`;

    }


    // --------------------------------------
    // COMPUTER WINS
    // --------------------------------------

    else if (winner === "computer") {

        computerScore++;

        currentStreak = 0;


        resultTitleElement.textContent =
            "Computer Wins!";


        resultDetailElement.textContent =
            `${capitalize(computerChoice)} beats ${capitalize(playerChoice)}.`;

    }


    // --------------------------------------
    // DRAW
    // --------------------------------------

    else {

        currentStreak = 0;


        resultTitleElement.textContent =
            "It's a Draw!";


        resultDetailElement.textContent =
            `Both chose ${capitalize(playerChoice)}.`;

    }


    // Update screen
    updateDisplay();


    // Save state
    saveGame();

}


// ------------------------------------------
// UPDATE DISPLAY
// ------------------------------------------

function updateDisplay() {

    playerScoreElement.textContent =
        playerScore;

    computerScoreElement.textContent =
        computerScore;

    roundCountElement.textContent =
        roundCount;

    streakCountElement.textContent =
        currentStreak;

}


// ------------------------------------------
// RESET GAME
// ------------------------------------------

function resetGame() {

    playerScore = 0;

    computerScore = 0;

    roundCount = 0;

    currentStreak = 0;


    // Reset choices
    playerChoiceElement.textContent =
        "❔";

    computerChoiceElement.textContent =
        "❔";


    // Reset result
    resultTitleElement.textContent =
        "Make Your Move";

    resultDetailElement.textContent =
        "Choose Rock, Paper or Scissors to start the game.";


    // Update score
    updateDisplay();


    // Save reset state
    saveGame();

}


// ------------------------------------------
// BUTTON EVENTS
// ------------------------------------------

choiceButtons.forEach((button) => {

    button.addEventListener(
        "click",
        function () {

            const selectedChoice =
                button.dataset.choice;

            playGame(selectedChoice);

        }
    );

});


// ------------------------------------------
// KEYBOARD CONTROLS
// ------------------------------------------
//
// R = Rock
// P = Paper
// S = Scissors
//
// Browser shortcuts such as Ctrl + R
// are ignored by this game.
// ------------------------------------------

document.addEventListener(
    "keydown",
    function (event) {

        // Do NOT interfere with browser shortcuts
        if (
            event.ctrlKey ||
            event.altKey ||
            event.metaKey
        ) {
            return;
        }


        const key =
            event.key.toLowerCase();


        if (key === "r") {

            playGame("rock");

        }

        else if (key === "p") {

            playGame("paper");

        }

        else if (key === "s") {

            playGame("scissors");

        }

    }
);


// ------------------------------------------
// RESET BUTTON
// ------------------------------------------

resetButton.addEventListener(
    "click",
    resetGame
);


// ------------------------------------------
// START GAME
// ------------------------------------------

loadGame();

updateDisplay();