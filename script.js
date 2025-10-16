const gridSize = 8;
const mineCount = 10;
const totalCells = gridSize * gridSize;
const gameContainer = document.getElementById('game');
const statusLabel = document.getElementById('status');
let mines = new Set();
let cells = [];
let gameOver = false;

// Initialize the game
function init() {
    generateMines();
    createGrid();
}

// Generate unique mine positions
function generateMines() {
    while (mines.size < mineCount) {
        const index = Math.floor(Math.random() * totalCells);
        mines.add(index);
    }
}

// Create grid cells
function createGrid() {
    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.dataset.index = i;
        cell.addEventListener('click', onCellClick);
        gameContainer.appendChild(cell);
        cells.push({ element: cell, index });
    }
}

// Handle cell click
function onCellClick(e) {
    if (gameOver) return;
    const cell = e.currentTarget;
    const index = parseInt(cell.dataset.index);
    if (cell.classList.contains('revealed')) return;

    revealCell(cell, index);

    if (mines.has(index)) {
        // Mine clicked, game over
        endGame(true);
    } else {
        // Check for win condition
        const revealedCount = document.querySelectorAll('.cell.revealed').length;
        if (revealedCount === totalCells - mineCount) {
            endGame(false);
        }
    }
}

// Reveal cell
function revealCell(cell, index) {
    if (cell.classList.contains('revealed')) return;
    cell.classList.add('revealed');
    if (mines.has(index)) {
        cell.classList.add('mine');
        cell.textContent = '💣';
    } else {
        const neighboringMines = countAdjacentMines(index);
        if (neighboringMines > 0) {
            cell.textContent = neighboringMines;
        } else {
            // No neighboring mines, reveal neighbors recursively
            revealNeighbors(index);
        }
    }
}

// Count adjacent mines
function countAdjacentMines(index) {
    const neighbors = getNeighbors(index);
    return neighbors.filter(n => mines.has(n)).length;
}

// Get neighbor indices
function getNeighbors(index) {
    const neighbors = [];
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < gridSize && c >= 0 && c < gridSize) {
                neighbors.push(r * gridSize + c);
            }
        }
    }
    return neighbors;
}

// Reveal neighboring cells recursively if no adjacent mines
function revealNeighbors(index) {
    const neighbors = getNeighbors(index);
    neighbors.forEach(n => {
        const cell = document.querySelector(`.cell[data-index='${n}']`);
        if (cell && !cell.classList.contains('revealed')) {
            revealCell(cell, n);
        }
    });
}

// End game
function endGame(wasMineClicked) {
    gameOver = true;
    if (wasMineClicked) {
        statusLabel.textContent = 'BOOM! Game Over.';
        // Reveal all mines
        mines.forEach(mineIndex => {
            const mineCell = document.querySelector(`.cell[data-index='${mineIndex}']`);
            if (mineCell && !mineCell.classList.contains('revealed')) {
                revealCell(mineCell, mineIndex);
            }
        });
    } else {
        statusLabel.textContent = 'Congratulations! You won!';
    }
}

// Initialize the game on page load
window.onload = init;