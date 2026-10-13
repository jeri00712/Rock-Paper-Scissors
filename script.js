// ==========================================
// ROCK PAPER SCISSORS
// ==========================================

const STORAGE_KEY = "rpsGame";
const THINK_TIME = 700; // ms the hands shake before the reveal

const choices = ["rock", "paper", "scissors"];

const icons = {
    rock: "✊",
    paper: "✋",
    scissors: "✌️"
};

// What beats what: key beats value
const beats = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper"
};

// ------------------------------------------
// STATE
// ------------------------------------------

let playerScore = 0;
let computerScore = 0;
let roundCount = 0;
let streak = 0;
let isPlaying = false;

// ------------------------------------------
// ELEMENTS
// ------------------------------------------

const choiceButtons = document.querySelectorAll(".choice-btn");
const playerScoreEl = document.getElementById("player-score");
const computerScoreEl = document.getElementById("computer-score");
const roundCountEl = document.getElementById("round-count");
const streakEl = document.getElementById("streak-count");
const playerHandEl = document.getElementById("player-choice");
const computerHandEl = document.getElementById("computer-choice");
const resultBox = document.querySelector(".result");
const resultTitleEl = document.getElementById("result-title");
const resultDetailEl = document.getElementById("result-detail");
const resetButton = document.getElementById("reset-btn");

// ------------------------------------------
// STORAGE
// ------------------------------------------

function saveGame() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ playerScore, computerScore, roundCount, streak })
        );
    } catch (error) {
        console.error("Unable to save game:", error);
    }
}

function loadGame() {
    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));

        if (saved) {
            playerScore = Number(saved.playerScore) || 0;
            computerScore = Number(saved.computerScore) || 0;
            roundCount = Number(saved.roundCount) || 0;
            streak = Number(saved.streak) || 0;
        }
    } catch (error) {
        console.error("Unable to load game:", error);
    }

    updateDisplay();
}

// ------------------------------------------
// HELPERS
// ------------------------------------------

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function getComputerChoice() {
    return choices[Math.floor(Math.random() * choices.length)];
}

function determineWinner(player, computer) {
    if (player === computer) return "draw";
    return beats[player] === computer ? "player" : "computer";
}

// Replays a CSS animation class on an element
function animate(element, className) {
    element.classList.remove(className);
    void element.offsetWidth; // force reflow so the animation restarts
    element.classList.add(className);
}

function bump(element) {
    animate(element, "bump");
}

function setLocked(locked) {
    isPlaying = locked;
    choiceButtons.forEach((button) => {
        button.disabled = locked;
    });
}

function clearHandState() {
    [playerHandEl, computerHandEl].forEach((hand) => {
        hand.classList.remove("shake", "reveal", "winner", "loser");
    });
}

// ------------------------------------------
// DISPLAY
// ------------------------------------------

function updateDisplay() {
    playerScoreEl.textContent = playerScore;
    computerScoreEl.textContent = computerScore;
    roundCountEl.textContent = roundCount;
    streakEl.textContent = streak;
}

function showResult(winner, player, computer) {
    resultBox.classList.remove("win", "lose");

    if (winner === "player") {
        resultTitleEl.textContent = "You win";
        resultDetailEl.textContent =
            `${capitalize(player)} beats ${capitalize(computer)}.`;
        resultBox.classList.add("win");
    } else if (winner === "computer") {
        resultTitleEl.textContent = "Computer wins";
        resultDetailEl.textContent =
            `${capitalize(computer)} beats ${capitalize(player)}.`;
        resultBox.classList.add("lose");
    } else {
        resultTitleEl.textContent = "It's a draw";
        resultDetailEl.textContent = `Both chose ${capitalize(player)}.`;
    }

    animate(resultBox, "animate");
}

// ------------------------------------------
// PLAY A ROUND
// ------------------------------------------

function playGame(playerChoice) {
    if (isPlaying) return;

    setLocked(true);

    const computerChoice = getComputerChoice();
    const winner = determineWinner(playerChoice, computerChoice);

    // Highlight the chosen button
    choiceButtons.forEach((button) => {
        button.classList.toggle("selected", button.dataset.choice === playerChoice);
    });

    // Phase 1 — both hands shake as fists
    clearHandState();
    resultBox.classList.remove("win", "lose", "animate");
    resultTitleEl.textContent = "Rock… paper… scissors…";
    resultDetailEl.textContent = "";

    playerHandEl.textContent = icons.rock;
    computerHandEl.textContent = icons.rock;
    playerHandEl.classList.add("shake");
    computerHandEl.classList.add("shake");

    // Phase 2 — reveal and score
    setTimeout(() => {
        clearHandState();

        playerHandEl.textContent = icons[playerChoice];
        computerHandEl.textContent = icons[computerChoice];

        animate(playerHandEl, "reveal");
        animate(computerHandEl, "reveal");

        roundCount++;
        bump(roundCountEl);

        if (winner === "player") {
            playerScore++;
            streak++;
            bump(playerScoreEl);
            bump(streakEl);
            playerHandEl.classList.add("winner");
            computerHandEl.classList.add("loser");
        } else if (winner === "computer") {
            computerScore++;
            streak = 0;
            bump(computerScoreEl);
            computerHandEl.classList.add("winner");
            playerHandEl.classList.add("loser");
        } else {
            streak = 0;
        }

        showResult(winner, playerChoice, computerChoice);
        updateDisplay();
        saveGame();

        choiceButtons.forEach((button) => button.classList.remove("selected"));
        setLocked(false);
    }, THINK_TIME);
}

// ------------------------------------------
// RESET
// ------------------------------------------

function resetGame() {
    if (isPlaying) return;

    playerScore = 0;
    computerScore = 0;
    roundCount = 0;
    streak = 0;

    clearHandState();
    playerHandEl.textContent = "❔";
    computerHandEl.textContent = "❔";

    resultBox.classList.remove("win", "lose");
    resultTitleEl.textContent = "Make your move";
    resultDetailEl.textContent = "Choose rock, paper or scissors to start.";
    animate(resultBox, "animate");

    updateDisplay();
    saveGame();
}

// ------------------------------------------
// EVENTS
// ------------------------------------------

choiceButtons.forEach((button) => {
    button.addEventListener("click", () => playGame(button.dataset.choice));
});

resetButton.addEventListener("click", resetGame);

// Keyboard: R = Rock, P = Paper, S = Scissors
document.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.altKey || event.metaKey || event.repeat) return;

    const keyMap = { r: "rock", p: "paper", s: "scissors" };
    const choice = keyMap[event.key.toLowerCase()];

    if (choice) playGame(choice);
});

// ------------------------------------------
// START
// ------------------------------------------

loadGame();
