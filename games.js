// Game State Variables
let userScore = 0;
let compScore = 0;
let currentRound = 1;
let totalGames = 0;
let userStreak = 0;
let compStreak = 0;
let soundEnabled = true;
let gameTimer = 0;
let timerInterval;
let autoPlayMode = false;
let gameStarted = false;

// DOM Elements
const choices = document.querySelectorAll(".image");
const message = document.querySelector("#result");
const userPoint = document.querySelector("#userPoint");
const compPoint = document.querySelector("#computerPoint");
const userStreakEl = document.querySelector("#userStreak");
const compStreakEl = document.querySelector("#computerStreak");
const roundNumberEl = document.querySelector("#roundNumber");
const totalGamesEl = document.querySelector("#totalGames");
const gameTimerEl = document.querySelector("#gameTimer");
const playerChoiceEl = document.querySelector("#playerChoice");
const computerChoiceEl = document.querySelector("#computerChoice");
const countdownEl = document.querySelector("#countdown");
const resetBtn = document.querySelector("#resetBtn");
const soundToggleBtn = document.querySelector("#soundToggle");
const autoPlayBtn = document.querySelector("#autoPlayBtn");
const particlesContainer = document.querySelector("#particles");

// Game Statistics
const gameStats = {
    totalWins: 0,
    totalLosses: 0,
    totalDraws: 0,
    longestWinStreak: 0,
    longestLossStreak: 0,
    choiceStats: { rock: 0, paper: 0, scissor: 0 }
};

// Choice Icons Mapping
const choiceIcons = {
    rock: { icon: '🗿', emoji: '🪨' },
    paper: { icon: '📄', emoji: '📜' },
    scissor: { icon: '✂️', emoji: '✂️' }
};

// Initialize Game
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    createParticles();
    startTimer();
});

function initializeGame() {
    updateDisplay();
    addEventListeners();
    showWelcomeMessage();
}

function addEventListeners() {
    // Choice buttons
    choices.forEach(choice => {
        choice.addEventListener("click", handleChoice);
        choice.addEventListener("mouseenter", addHoverEffect);
        choice.addEventListener("mouseleave", removeHoverEffect);
    });

    // Control buttons
    resetBtn.addEventListener("click", resetGame);
    soundToggleBtn.addEventListener("click", toggleSound);
    autoPlayBtn.addEventListener("click", toggleAutoPlay);

    // Keyboard support
    document.addEventListener("keydown", handleKeyboard);
}

function handleChoice(e) {
    if (autoPlayMode) return;
    
    const choice = e.currentTarget;
    const choiceId = choice.getAttribute("data-choice");
    
    if (!gameStarted) {
        gameStarted = true;
    }
    
    playGame(choiceId);
    addRippleEffect(choice, e);
    playSound('click');
}

function addRippleEffect(element, event) {
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    
    const ripple = element.querySelector('.ripple');
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    ripple.style.transform = 'scale(0)';
    ripple.style.opacity = '1';
    
    setTimeout(() => {
        ripple.style.transform = 'scale(4)';
        ripple.style.opacity = '0';
    }, 10);
}

function addHoverEffect(e) {
    const choice = e.currentTarget;
    choice.style.transform = 'translateY(-10px) scale(1.05)';
    playSound('hover');
}

function removeHoverEffect(e) {
    const choice = e.currentTarget;
    if (!choice.classList.contains('selected')) {
        choice.style.transform = '';
    }
}

// Game Logic
function playGame(choiceId) {
    totalGames++;
    gameStats.choiceStats[choiceId]++;
    
    // Update player choice display
    updatePlayerChoice(choiceId);
    
    // Show computer thinking
    showComputerThinking();
    
    // Disable choices temporarily
    disableChoices();
    
    // Generate computer choice after delay
    setTimeout(() => {
        const compChoice = getCompChoice();
        updateComputerChoice(compChoice);
        
        // Determine winner
        setTimeout(() => {
            determineWinner(choiceId, compChoice);
            enableChoices();
        }, 500);
    }, 1000);
}

function getCompChoice() {
    const options = ["rock", "paper", "scissor"];
    const randIdx = Math.floor(Math.random() * 3);
    return options[randIdx];
}

function determineWinner(userChoice, compChoice) {
    if (userChoice === compChoice) {
        handleDraw(userChoice);
    } else {
        const userWins = 
            (userChoice === "rock" && compChoice === "scissor") ||
            (userChoice === "paper" && compChoice === "rock") ||
            (userChoice === "scissor" && compChoice === "paper");
        
        if (userWins) {
            handleUserWin(userChoice, compChoice);
        } else {
            handleUserLoss(userChoice, compChoice);
        }
    }
    
    currentRound++;
    updateDisplay();
    
    // Check for milestone
    checkMilestone();
}

function handleUserWin(userChoice, compChoice) {
    userScore++;
    userStreak++;
    compStreak = 0;
    gameStats.totalWins++;
    
    if (userStreak > gameStats.longestWinStreak) {
        gameStats.longestWinStreak = userStreak;
    }
    
    showResult(`🎉 You Won! 🎉`, `${choiceIcons[userChoice].emoji} beats ${choiceIcons[compChoice].emoji}`, 'win');
    playSound('win');
    
    // Add celebration animation
    document.querySelector('#user').classList.add('winner-celebration');
    setTimeout(() => {
        document.querySelector('#user').classList.remove('winner-celebration');
    }, 1000);
}

function handleUserLoss(userChoice, compChoice) {
    compScore++;
    compStreak++;
    userStreak = 0;
    gameStats.totalLosses++;
    
    if (compStreak > gameStats.longestLossStreak) {
        gameStats.longestLossStreak = compStreak;
    }
    
    showResult(`😔 You Lost! 😔`, `${choiceIcons[compChoice].emoji} beats ${choiceIcons[userChoice].emoji}`, 'loss');
    playSound('lose');
    
    // Add shake animation
    document.querySelector('#computer').classList.add('winner-celebration');
    document.querySelector('#user').classList.add('loser-animation');
    setTimeout(() => {
        document.querySelector('#computer').classList.remove('winner-celebration');
        document.querySelector('#user').classList.remove('loser-animation');
    }, 1000);
}

function handleDraw(choice) {
    gameStats.totalDraws++;
    showResult(`🤝 It's a Draw! 🤝`, `Both chose ${choiceIcons[choice].emoji}`, 'draw');
    playSound('draw');
}

function showResult(title, description, type) {
    const colors = {
        win: '#4CAF50',
        loss: '#f44336',
        draw: '#2196F3'
    };
    
    const icons = {
        win: 'GameImage/congratulations.png',
        loss: 'GameImage/lose.png',
        draw: 'GameImage/equality.png'
    };
    
    message.innerHTML = `
        <h1>${title}</h1>
        <p>${description}</p>
        <img src="${icons[type]}" alt="${type}">
    `;
    message.style.backgroundColor = colors[type];
    message.classList.add('zoom-in');
    
    setTimeout(() => {
        message.classList.remove('zoom-in');
    }, 500);
}

function updatePlayerChoice(choice) {
    playerChoiceEl.innerHTML = `
        <div class="choice-icon">${choiceIcons[choice].icon}</div>
        <span>${choice.charAt(0).toUpperCase() + choice.slice(1)}</span>
    `;
    playerChoiceEl.classList.add('selected');
}

function updateComputerChoice(choice) {
    computerChoiceEl.innerHTML = `
        <div class="choice-icon">${choiceIcons[choice].icon}</div>
        <span>${choice.charAt(0).toUpperCase() + choice.slice(1)}</span>
    `;
    computerChoiceEl.classList.remove('computer-thinking');
    computerChoiceEl.classList.add('selected');
    
    setTimeout(() => {
        playerChoiceEl.classList.remove('selected');
        computerChoiceEl.classList.remove('selected');
    }, 2000);
}

function showComputerThinking() {
    computerChoiceEl.innerHTML = `
        <i class="fas fa-robot"></i>
        <span>Thinking...</span>
    `;
    computerChoiceEl.classList.add('computer-thinking');
    
    // Countdown effect
    let count = 3;
    countdownEl.textContent = count;
    
    const countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownEl.textContent = count;
        } else {
            countdownEl.textContent = '';
            clearInterval(countdownInterval);
        }
    }, 333);
}

function disableChoices() {
    choices.forEach(choice => {
        choice.style.pointerEvents = 'none';
        choice.style.opacity = '0.7';
    });
}

function enableChoices() {
    choices.forEach(choice => {
        choice.style.pointerEvents = 'auto';
        choice.style.opacity = '1';
    });
}

function updateDisplay() {
    userPoint.textContent = userScore;
    compPoint.textContent = compScore;
    userStreakEl.textContent = userStreak;
    compStreakEl.textContent = compStreak;
    roundNumberEl.textContent = currentRound;
    totalGamesEl.textContent = totalGames;
}

function checkMilestone() {
    if (userScore === 5 || compScore === 5) {
        showMilestone();
    }
    
    if (userStreak === 3) {
        showStreakMessage("🔥 You're on fire! 3 wins in a row! 🔥");
    }
    
    if (compStreak === 3) {
        showStreakMessage("🤖 Computer is dominating! 3 wins in a row! 🤖");
    }
}

function showMilestone() {
    const winner = userScore > compScore ? 'You' : 'Computer';
    const celebration = document.createElement('div');
    celebration.innerHTML = `
        <div style="position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); 
                    background: rgba(0,0,0,0.9); color: white; padding: 30px; 
                    border-radius: 20px; text-align: center; z-index: 1000;
                    animation: zoomIn 0.5s ease-out;">
            <h2>🏆 ${winner} reached 5 points! 🏆</h2>
            <p>Game Over! Play again?</p>
            <button onclick="this.parentElement.parentElement.remove(); resetGame();" 
                    style="margin-top: 15px; padding: 10px 20px; background: #4CAF50; 
                           color: white; border: none; border-radius: 10px; cursor: pointer;">
                Play Again
            </button>
        </div>
    `;
    document.body.appendChild(celebration);
}

function showStreakMessage(message) {
    const streak = document.createElement('div');
    streak.innerHTML = `
        <div style="position: fixed; top: 20px; right: 20px; background: rgba(255,193,7,0.9); 
                    color: black; padding: 15px; border-radius: 10px; z-index: 1000;
                    animation: slideInRight 0.5s ease-out;">
            ${message}
        </div>
    `;
    document.body.appendChild(streak);
    
    setTimeout(() => {
        streak.remove();
    }, 3000);
}

function showWelcomeMessage() {
    message.innerHTML = `
        <h1>🎯 Choose your move to start playing! 🎯</h1>
        <img src="GameImage/play-button.png" alt="Play Button">
    `;
}

// Control Functions
function resetGame() {
    userScore = 0;
    compScore = 0;
    currentRound = 1;
    totalGames = 0;
    userStreak = 0;
    compStreak = 0;
    gameStarted = false;
    
    // Reset timer
    gameTimer = 0;
    
    // Reset displays
    updateDisplay();
    showWelcomeMessage();
    
    playerChoiceEl.innerHTML = `
        <i class="fas fa-question"></i>
        <span>Choose your weapon!</span>
    `;
    
    computerChoiceEl.innerHTML = `
        <i class="fas fa-robot"></i>
        <span>Thinking...</span>
    `;
    
    playSound('reset');
}

function toggleSound() {
    soundEnabled = !soundEnabled;
    const icon = soundToggleBtn.querySelector('i');
    const text = soundToggleBtn.querySelector('span') || soundToggleBtn.childNodes[2];
    
    if (soundEnabled) {
        icon.className = 'fas fa-volume-up';
        text.textContent = ' Sound ON';
        soundToggleBtn.style.background = 'rgba(76, 175, 80, 0.3)';
    } else {
        icon.className = 'fas fa-volume-mute';
        text.textContent = ' Sound OFF';
        soundToggleBtn.style.background = 'rgba(244, 67, 54, 0.3)';
    }
}

function toggleAutoPlay() {
    autoPlayMode = !autoPlayMode;
    const icon = autoPlayBtn.querySelector('i');
    const text = autoPlayBtn.querySelector('span') || autoPlayBtn.childNodes[2];
    
    if (autoPlayMode) {
        icon.className = 'fas fa-pause';
        text.textContent = ' Auto Play ON';
        autoPlayBtn.style.background = 'rgba(255, 152, 0, 0.3)';
        startAutoPlay();
    } else {
        icon.className = 'fas fa-play';
        text.textContent = ' Auto Play';
        autoPlayBtn.style.background = '';
        stopAutoPlay();
    }
}

let autoPlayInterval;

function startAutoPlay() {
    autoPlayInterval = setInterval(() => {
        const choices = ['rock', 'paper', 'scissor'];
        const randomChoice = choices[Math.floor(Math.random() * 3)];
        playGame(randomChoice);
    }, 3000);
}

function stopAutoPlay() {
    if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
    }
}

// Timer Functions
function startTimer() {
    timerInterval = setInterval(() => {
        if (gameStarted) {
            gameTimer++;
            updateTimerDisplay();
        }
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(gameTimer / 60);
    const seconds = gameTimer % 60;
    gameTimerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

// Sound Effects
function playSound(type) {
    if (!soundEnabled) return;
    
    // Create audio context for sound effects
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        const sounds = {
            click: { frequency: 800, duration: 100 },
            hover: { frequency: 600, duration: 50 },
            win: { frequency: 523, duration: 300 },
            lose: { frequency: 200, duration: 300 },
            draw: { frequency: 400, duration: 200 },
            reset: { frequency: 300, duration: 150 }
        };
        
        const sound = sounds[type];
        if (!sound) return;
        
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(sound.frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + sound.duration / 1000);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + sound.duration / 1000);
    } catch (error) {
        console.log('Audio not supported');
    }
}

// Keyboard Support
function handleKeyboard(e) {
    const keyMappings = {
        '1': 'rock',
        'r': 'rock',
        '2': 'paper',
        'p': 'paper',
        '3': 'scissor',
        's': 'scissor'
    };
    
    const choice = keyMappings[e.key.toLowerCase()];
    if (choice && !autoPlayMode) {
        playGame(choice);
        playSound('click');
    }
    
    if (e.key === ' ') {
        e.preventDefault();
        resetGame();
    }
}

// Particle Effects
function createParticles() {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            createParticle();
        }, i * 300);
    }
    
    setInterval(createParticle, 1000);
}

function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.left = Math.random() * 100 + '%';
    particle.style.animationDuration = (Math.random() * 3 + 3) + 's';
    particle.style.opacity = Math.random() * 0.5 + 0.3;
    
    particlesContainer.appendChild(particle);
    
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 6000);
}

// Enhanced Visual Effects
function createConfetti() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.top = '-10px';
            confetti.style.width = '10px';
            confetti.style.height = '10px';
            confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 70%)`;
            confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
            confetti.style.animation = 'fall 3s linear forwards';
            confetti.style.zIndex = '1000';
            
            document.body.appendChild(confetti);
            
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 3000);
        }, i * 20);
    }
}

// Add CSS for confetti animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fall {
        to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
        }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    .choice-icon {
        font-size: 3rem;
        margin-bottom: 10px;
    }
`;
document.head.appendChild(style);

