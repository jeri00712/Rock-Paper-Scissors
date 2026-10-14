// ==========================================
// ROCK PAPER SCISSORS
// ==========================================

const STORAGE_KEY = "rpsGame";
const COUNTDOWN = ["Rock", "Paper", "Scissors", "Shoot!"];
const COUNTDOWN_STEP = 300; // ms per word

const choices = ["rock", "paper", "scissors"];

const icons = {
    rock: "✊",
    paper: "✋",
    scissors: "✌️"
};

// key beats value
const beats = {
    rock: "scissors",
    paper: "rock",
    scissors: "paper"
};

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

const card = document.getElementById("card");
const choiceButtons = document.querySelectorAll(".choice-btn");
const playerScoreEl = document.getElementById("player-score");
const computerScoreEl = document.getElementById("computer-score");
const roundCountEl = document.getElementById("round-count");
const streakEl = document.getElementById("streak-count");
const streakBox = document.getElementById("streak-box");
const playerHandEl = document.getElementById("player-choice");
const computerHandEl = document.getElementById("computer-choice");
const burstEl = document.querySelector(".burst");
const resultBox = document.getElementById("result");
const resultTitleEl = document.getElementById("result-title");
const resultDetailEl = document.getElementById("result-detail");
const winrateText = document.getElementById("winrate-text");
const winrateFill = document.getElementById("winrate-fill");
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

    updateDisplay(false);
}

// ------------------------------------------
// HELPERS
// ------------------------------------------

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

const getComputerChoice = () =>
    choices[Math.floor(Math.random() * choices.length)];

function determineWinner(player, computer) {
    if (player === computer) return "draw";
    return beats[player] === computer ? "player" : "computer";
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Restart a CSS animation class
function replay(element, className) {
    element.classList.remove(className);
    void element.offsetWidth; // force reflow
    element.classList.add(className);
}

function setLocked(locked) {
    isPlaying = locked;
    choiceButtons.forEach((button) => {
        button.disabled = locked;
    });
}

function clearHands() {
    [playerHandEl, computerHandEl].forEach((hand) => {
        hand.classList.remove("shake", "reveal", "winner", "loser", "tie");
    });
}

function playCardEffect(name) {
    card.classList.remove("is-win", "is-lose", "is-draw");
    void card.offsetWidth;
    card.classList.add(name);
}

// ------------------------------------------
// DISPLAY
// ------------------------------------------

// Sets a number and plays a "tick" animation if it changed
function setNumber(element, value, animated) {
    const text = String(value);
    if (element.textContent === text) return;

    element.textContent = text;
    if (animated) replay(element, "tick");
}

function updateDisplay(animated = true) {
    setNumber(playerScoreEl, playerScore, animated);
    setNumber(computerScoreEl, computerScore, animated);
    setNumber(roundCountEl, roundCount, animated);
    setNumber(streakEl, streak, animated);

    const rate = roundCount === 0 ? 0 : Math.round((playerScore / roundCount) * 100);
    winrateText.textContent = `${rate}%`;
    winrateFill.style.width = `${rate}%`;

    streakBox.classList.toggle("hot", streak >= 3);
}

function setResult(type, title, detail) {
    resultBox.classList.remove("win", "lose", "draw", "counting", "animate");
    if (type) resultBox.classList.add(type);

    resultTitleEl.textContent = title;
    resultDetailEl.textContent = detail;

    void resultBox.offsetWidth;
    resultBox.classList.add("animate");
}

// ------------------------------------------
// CONFETTI
// ------------------------------------------

const canvas = document.getElementById("confetti");
const ctx = canvas.getContext("2d");
const confettiColors = ["#7c5cff", "#22d3ee", "#f472b6", "#34d399", "#fbbf24", "#ffffff"];

let particles = [];
let confettiFrame = null;

function resizeCanvas() {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function launchConfetti(count) {
    if (reduceMotion) return;

    const originX = window.innerWidth / 2;
    const originY = window.innerHeight * 0.45;

    for (let i = 0; i < count; i++) {
        const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95;
        const speed = 6 + Math.random() * 10;

        particles.push({
            x: originX,
            y: originY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 5 + Math.random() * 6,
            rotation: Math.random() * Math.PI,
            spin: (Math.random() - 0.5) * 0.35,
            color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
            alpha: 1
        });
    }

    if (!confettiFrame) confettiFrame = requestAnimationFrame(drawConfetti);
}

function drawConfetti() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    particles = particles.filter((p) => p.alpha > 0 && p.y < window.innerHeight + 30);

    particles.forEach((p) => {
        p.vy += 0.3;      // gravity
        p.vx *= 0.99;     // air drag
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;
        p.alpha -= 0.007;

        ctx.save();
        ctx.globalAlpha = Math.max(p.alpha, 0);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
    });

    if (particles.length > 0) {
        confettiFrame = requestAnimationFrame(drawConfetti);
    } else {
        confettiFrame = null;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    }
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ------------------------------------------
// PLAY A ROUND
// ------------------------------------------

async function playGame(playerChoice) {
    if (isPlaying) return;
    setLocked(true);

    const computerChoice = getComputerChoice();
    const winner = determineWinner(playerChoice, computerChoice);

    choiceButtons.forEach((button) => {
        button.classList.toggle("selected", button.dataset.choice === playerChoice);
    });

    // Phase 1 — both fists shake while the words count down
    clearHands();
    playerHandEl.textContent = icons.rock;
    computerHandEl.textContent = icons.rock;
    playerHandEl.classList.add("shake");
    computerHandEl.classList.add("shake");

    resultBox.classList.remove("win", "lose", "draw", "animate");
    resultDetailEl.textContent = "";

    for (const word of COUNTDOWN) {
        resultTitleEl.textContent = word;
        replay(resultBox, "counting");
        await wait(reduceMotion ? 80 : COUNTDOWN_STEP);
    }

    // Phase 2 — reveal
    clearHands();
    playerHandEl.textContent = icons[playerChoice];
    computerHandEl.textContent = icons[computerChoice];
    replay(playerHandEl, "reveal");
    replay(computerHandEl, "reveal");
    replay(burstEl, "go");

    roundCount++;

    if (winner === "player") {
        playerScore++;
        streak++;

        playerHandEl.classList.add("winner");
        computerHandEl.classList.add("loser");
        setResult("win", "You win!", `${capitalize(playerChoice)} beats ${capitalize(computerChoice)}.`);

        playCardEffect("is-win");
        launchConfetti(streak >= 3 ? 170 : 90);

    } else if (winner === "computer") {
        computerScore++;
        streak = 0;

        computerHandEl.classList.add("winner");
        playerHandEl.classList.add("loser");
        setResult("lose", "Computer wins", `${capitalize(computerChoice)} beats ${capitalize(playerChoice)}.`);

        playCardEffect("is-lose");

    } else {
        streak = 0;

        playerHandEl.classList.add("tie");
        computerHandEl.classList.add("tie");
        setResult("draw", "It's a draw", `Both chose ${capitalize(playerChoice)}.`);

        playCardEffect("is-draw");
    }

    updateDisplay(true);
    saveGame();

    choiceButtons.forEach((button) => button.classList.remove("selected"));
    setLocked(false);
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

    clearHands();
    playerHandEl.textContent = "❔";
    computerHandEl.textContent = "❔";
    replay(playerHandEl, "reveal");
    replay(computerHandEl, "reveal");

    setResult("", "Make your move", "Choose rock, paper or scissors to begin.");

    updateDisplay(true);
    saveGame();
}

// ------------------------------------------
// EVENTS
// ------------------------------------------

choiceButtons.forEach((button) => {
    button.addEventListener("click", () => playGame(button.dataset.choice));

    // Cursor-following glow
    button.addEventListener("pointermove", (event) => {
        const rect = button.getBoundingClientRect();
        button.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        button.style.setProperty("--my", `${event.clientY - rect.top}px`);
    });
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
