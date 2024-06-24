const gameBoard = document.getElementById('game-board');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const playerNameInput = document.getElementById('player-name');
const startGameButton = document.getElementById('start-game');
const showScoreboardButton = document.getElementById('show-scoreboard');
const scoreboardElement = document.getElementById('scoreboard');
const scoreListElement = document.getElementById('score-list');
const numRows = 8;
const numCols = 8;
const numColors = 6;
let tiles = [];
let selectedTile = null;
let score = 0;
let playerName = '';
let scores = [];
let timer;
let timeLeft = 120; // 2 minutes in seconds

function initBoard() {
    gameBoard.innerHTML = '';
    tiles = [];
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            const tile = createTile(row, col);
            gameBoard.appendChild(tile);
            tiles.push(tile);
        }
    }
    startTimer();
}

function createTile(row, col) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    const color = Math.floor(Math.random() * numColors) + 1;
    tile.dataset.color = color;
    tile.dataset.row = row;
    tile.dataset.col = col;
    tile.style.backgroundColor = getColor(color);
    tile.addEventListener('click', handleTileClick);
    return tile;
}

function handleTileClick(event) {
    const clickedTile = event.target;

    if (selectedTile === null) {
        selectedTile = clickedTile;
        selectedTile.classList.add('selected');
    } else {
        selectedTile.classList.remove('selected');
        if (areAdjacent(selectedTile, clickedTile)) {
            swapTiles(selectedTile, clickedTile);
            setTimeout(() => {
                if (!checkMatches()) {
                    swapTiles(selectedTile, clickedTile); // Revert swap if no match
                } else {
                    setTimeout(fillEmptySpaces, 300);
                }
                selectedTile = null;
            }, 300);
        } else {
            selectedTile = null;
        }
    }
}

function areAdjacent(tile1, tile2) {
    const row1 = parseInt(tile1.dataset.row);
    const col1 = parseInt(tile1.dataset.col);
    const row2 = parseInt(tile2.dataset.row);
    const col2 = parseInt(tile2.dataset.col);

    return (
        (row1 === row2 && Math.abs(col1 - col2) === 1) ||
        (col1 === col2 && Math.abs(row1 - row2) === 1)
    );
}

function swapTiles(tile1, tile2) {
    const tempColor = tile1.dataset.color;
    tile1.dataset.color = tile2.dataset.color;
    tile2.dataset.color = tempColor;
    tile1.style.backgroundColor = getColor(tile1.dataset.color);
    tile2.style.backgroundColor = getColor(tile2.dataset.color);
}

function getColor(colorId) {
    const colors = {
        1: '#FF5733',   // Red
        2: '#33A8FF',   // Blue
        3: '#33FF57',   // Green
        4: '#C433FF',   // Purple
        5: '#FFD633',   // Yellow
        6: '#FF3366'    // Pink
    };
    return colors[colorId];
}

function checkMatches() {
    let matchFound = false;

    // Verificar correspondências horizontais
    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols - 2; col++) {
            let horizontalMatch = getHorizontalMatch(row, col);
            if (horizontalMatch.length >= 3) {
                removeTiles(horizontalMatch);
                updateScore(horizontalMatch.length);
                matchFound = true;
            }
        }
    }

    // Verificar correspondências verticais
    for (let col = 0; col < numCols; col++) {
        for (let row = 0; row < numRows - 2; row++) {
            let verticalMatch = getVerticalMatch(row, col);
            if (verticalMatch.length >= 3) {
                removeTiles(verticalMatch);
                updateScore(verticalMatch.length);
                matchFound = true;
            }
        }
    }

    return matchFound;
}

function getHorizontalMatch(row, col) {
    const color = tiles[row * numCols + col].dataset.color;
    let match = [{ row, col }];

    let i = col + 1;
    while (i < numCols && tiles[row * numCols + i].dataset.color === color) {
        match.push({ row, col: i });
        i++;
    }

    return match;
}

function getVerticalMatch(row, col) {
    const color = tiles[row * numCols + col].dataset.color;
    let match = [{ row, col }];

    let i = row + 1;
    while (i < numRows && tiles[i * numCols + col].dataset.color === color) {
        match.push({ row: i, col });
        i++;
    }

    return match;
}

function removeTiles(match) {
    match.forEach(({ row, col }) => {
        tiles[row * numCols + col].dataset.color = 0;
        tiles[row * numCols + col].style.backgroundColor = 'transparent';
    });
}

function fillEmptySpaces() {
    for (let col = 0; col < numCols; col++) {
        for (let row = numRows - 1; row >= 0; row--) {
            if (tiles[row * numCols + col].dataset.color == 0) {
                for (let r = row - 1; r >= 0; r--) {
                    if (tiles[r * numCols + col].dataset.color != 0) {
                        swapTiles(tiles[row * numCols + col], tiles[r * numCols + col]);
                        break;
                    }
                }
                if (tiles[row * numCols + col].dataset.color == 0) {
                    tiles[row * numCols + col].dataset.color = Math.floor(Math.random() * numColors) + 1;
                    tiles[row * numCols + col].style.backgroundColor = getColor(tiles[row * numCols + col].dataset.color);
                }
            }
        }
    }

    if (checkMatches()) {
        setTimeout(fillEmptySpaces, 300);
    }
}

function updateScore(comboLength) {
    let points = 0;

    if (comboLength === 3) {
        points = 10;
    } else if (comboLength === 4) {
        points = 20;
    } else if (comboLength >= 5) {
        points = 50;
    }

    score += points;
    scoreElement.textContent = `Score: ${score}`;
}

function saveScore() {
    const existingScore = scores.find(s => s.name === playerName);

    if (existingScore) {
        if (score > existingScore.score) {
            existingScore.score = score;
        }
    } else {
        scores.push({ name: playerName, score: score });
    }

    scores.sort((a, b) => b.score - a.score);
    updateScoreboard();
}

function updateScoreboard() {
    scoreListElement.innerHTML = '';
    scores.forEach((scoreEntry, index) => {
        const scoreDiv = document.createElement('div');
        scoreDiv.textContent = `${scoreEntry.name}: ${scoreEntry.score}`;
        if (index === 0) {
            scoreDiv.classList.add('diamond');
        } else if (index === 1) {
            scoreDiv.classList.add('gold');
        } else if (index === 2) {
            scoreDiv.classList.add('silver');
        } else if (index === 3) {
            scoreDiv.classList.add('bronze');
        }
        scoreListElement.appendChild(scoreDiv);
    });
}

function startTimer() {
    clearInterval(timer);
    timeLeft = 120; // Reset timer to 2 minutes
    timerElement.textContent = formatTime(timeLeft);

    timer = setInterval(() => {
        timeLeft--;
        timerElement.textContent = formatTime(timeLeft);

        if (timeLeft <= 0) {
            clearInterval(timer);
            endGame();
        }
    }, 1000);
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function endGame() {
    saveScore();
    playerNameInput.value = '';
    gameBoard.innerHTML = '';
    alert(`Time's up! Your final score is ${score}.`);
}

startGameButton.addEventListener('click', () => {
    playerName = playerNameInput.value.trim();
    if (playerName) {
        score = 0;
        scoreElement.textContent = `Score: ${score}`;
        initBoard();
    } else {
        alert('Please enter your name to start the game.');
    }
});

showScoreboardButton.addEventListener('click', () => {
    scoreboardElement.classList.toggle('hidden');
});

window.addEventListener('beforeunload', saveScore);
