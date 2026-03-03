const cells = document.querySelectorAll('[data-cell]');
const winningMessageElement = document.getElementById('winningMessage');
const restartButton = document.getElementById('restartButton');
const xScoreElement = document.getElementById('xScore');
const oScoreElement = document.getElementById('oScore');
const overlay = document.getElementById('overlay');
const btnSim = document.getElementById('btn-sim');
const mainLayout = document.querySelector('.main-layout');
const closeButton = document.getElementById('close-button');
const resetScoreButton = document.getElementById('resetScoreButton');

let isCircleTurn = false;
let xScoreCount = 0;
let oScoreCount = 0;
let lastWinner = null;

const WINNING_COMBINATIONS = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
];

// sons do site
function playEightBitSound(type = 'click') {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    function createNote(freq, startTime, duration, vol) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = (type === 'click') ? 'triangle' : 'square';
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + startTime);
        gain.gain.setValueAtTime(vol, audioCtx.currentTime + startTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + startTime + duration);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + startTime); osc.stop(audioCtx.currentTime + startTime + duration);
    }

    if (type === 'click') createNote(350, 0, 0.1, 0.2);
    else if (type === 'victory') {
        createNote(392, 0, 0.2, 0.2); createNote(523, 0.15, 0.2, 0.2); createNote(659, 0.3, 0.4, 0.2);
    } else if (type === 'draw') {
        createNote(493, 0, 0.2, 0.2); createNote(440, 0.2, 0.2, 0.2); createNote(311, 0.4, 0.5, 0.2);
    }
}

// iniciar
btnSim.addEventListener('click', () => {
    playEightBitSound('click');
    overlay.style.display = 'none';
    mainLayout.classList.add('window-entry-anim');
    startGame();
});

closeButton.addEventListener('click', () => {
    playEightBitSound('click');
    mainLayout.classList.replace('window-entry-anim', 'window-exit-anim');
    setTimeout(() => {
        mainLayout.style.display = 'none';
        mainLayout.classList.remove('window-exit-anim');
        document.getElementById('notif-text').innerText = "SESSÃO ENCERRADA. REINICIAR?";
        overlay.style.display = 'flex';
    }, 400);
});

// fazer jogo funcionar
function startGame() {
    if (lastWinner === 'O') isCircleTurn = true;
    else isCircleTurn = false;
    
    winningMessageElement.innerText = `VEZ DE ${isCircleTurn ? 'MEGGIE' : 'LUNA'}`;
    
    cells.forEach(cell => {
        cell.innerHTML = '';
        cell.classList.remove('x', 'o', 'winner');
        cell.removeEventListener('click', handleClick);
        cell.addEventListener('click', handleClick, { once: true });
    });
}

function handleClick(e) {
    const cell = e.target;
    playEightBitSound('click');
    const currentClass = isCircleTurn ? 'O' : 'X';
    
    placeMark(cell, currentClass);
    const winCombo = getWinCombo(currentClass);

    if (winCombo) {
        endGame(false, winCombo);
    } else if (isDraw()) {
        endGame(true);
    } else {
        isCircleTurn = !isCircleTurn;
        winningMessageElement.innerText = `VEZ DE ${isCircleTurn ? 'MEGGIE' : 'LUNA'}`;
    }
}

function placeMark(cell, currentClass) {
    const img = document.createElement('img');
    img.src = currentClass === 'X' ? 'gatinho_x.png' : 'gatinho_o.png';
    img.classList.add('pixel-cat');
    cell.appendChild(img);
    cell.classList.add(currentClass.toLowerCase());
}

function getWinCombo(c) {
    const className = c.toLowerCase();
    return WINNING_COMBINATIONS.find(combo => combo.every(i => cells[i].classList.contains(className)));
}

function isDraw() {
    return [...cells].every(c => c.classList.contains('x') || c.classList.contains('o'));
}

function endGame(draw, winCombo) {
    // TRANCA O TABULEIRO
    cells.forEach(cell => cell.removeEventListener('click', handleClick));

    if (draw) {
        playEightBitSound('draw');
        winningMessageElement.innerText = "EMPATE!(╥﹏╥)";
        lastWinner = null;
    } else {
        playEightBitSound('victory');
        const vencedor = isCircleTurn ? 'MEGGIE' : 'LUNA';
        lastWinner = isCircleTurn ? 'O' : 'X';
        winningMessageElement.innerText = `${vencedor} VENCEU!(˶ˆᗜˆ˵)`;
        winCombo.forEach(i => cells[i].classList.add('winner'));
        
        if (isCircleTurn) {
            oScoreCount++; oScoreElement.innerText = oScoreCount;
            triggerJump(document.getElementById('scoreMeggie'));
        } else {
            xScoreCount++; xScoreElement.innerText = xScoreCount;
            triggerJump(document.getElementById('scoreLuna'));
        }
    }
}

// outras coisas
function triggerJump(el) {
    el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
    setTimeout(() => el.classList.remove('bump'), 500);
}

function updateClock() {
    const now = new Date();
    document.getElementById('clock').innerText = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
}

resetScoreButton.addEventListener('click', () => {
    playEightBitSound('click');
    xScoreCount = 0; oScoreCount = 0;
    xScoreElement.innerText = '0'; oScoreElement.innerText = '0';
    triggerJump(document.getElementById('scoreLuna'));
    triggerJump(document.getElementById('scoreMeggie'));
});

restartButton.addEventListener('click', () => { playEightBitSound('click'); startGame(); });
setInterval(updateClock, 1000); updateClock();