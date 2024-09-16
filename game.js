// Select the canvas and get its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define the size of the grid and cells
const gridSize = 20; // 20x20 grid cells
const cellSize = 40; // Each cell is 40x40 pixels

// Define directions for edges
const directions = {
    TOP: 'top',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    LEFT: 'left'
};

// Initialize a 2D array to represent the grid as nodes
const grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => ({
        connections: { top: false, right: false, bottom: false, left: false },
        hasTrack: false // Indicates if the cell has a track
    }))
);

// Track the currently highlighted cell
let highlightedCell = { row: -1, col: -1 };

// Add train properties
let trainPosition = { row: 0, col: 0 };
let trainDirection = directions.RIGHT;
let isTrainMoving = false;
let trainInterval;

// Add a new 2D array to represent the train's path
const trainPath = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => false)
);

// Add new variables for start and destination
let trainStart = null;
let trainDestination = null;

// Function to draw the train
function drawTrain() {
    const x = trainPosition.col * cellSize;
    const y = trainPosition.row * cellSize;
    ctx.fillStyle = 'red';
    ctx.fillRect(x + 10, y + 10, cellSize - 20, cellSize - 20);
}

// Function to move the train
function moveTrain() {
    const currentCell = grid[trainPosition.row][trainPosition.col];
    const nextPosition = getNextPosition(trainPosition, trainDirection);

    if (isValidMove(nextPosition, currentCell)) {
        trainPath[trainPosition.row][trainPosition.col] = true; // Mark the current position
        trainPosition = nextPosition;
        trainDirection = getNextDirection(grid[nextPosition.row][nextPosition.col], trainDirection);
    } else {
        stopTrain();
    }
}

// Helper function to get the next position
function getNextPosition(position, direction) {
    switch (direction) {
        case directions.TOP: return { row: position.row - 1, col: position.col };
        case directions.RIGHT: return { row: position.row, col: position.col + 1 };
        case directions.BOTTOM: return { row: position.row + 1, col: position.col };
        case directions.LEFT: return { row: position.row, col: position.col - 1 };
    }
}

// Helper function to check if the move is valid
function isValidMove(position, currentCell) {
    if (position.row < 0 || position.row >= gridSize || position.col < 0 || position.col >= gridSize) {
        return false;
    }
    return currentCell.connections[trainDirection] && grid[position.row][position.col].hasTrack;
}

// Helper function to get the next direction
function getNextDirection(cell, currentDirection) {
    const oppositeDirection = {
        [directions.TOP]: directions.BOTTOM,
        [directions.RIGHT]: directions.LEFT,
        [directions.BOTTOM]: directions.TOP,
        [directions.LEFT]: directions.RIGHT
    };

    // Find all possible directions excluding the opposite of the current direction
    const possibleDirections = Object.keys(cell.connections).filter(direction => 
        cell.connections[direction] && direction !== oppositeDirection[currentDirection]
    );

    // If there are multiple possible directions, choose one randomly
    if (possibleDirections.length > 0) {
        return possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
    }

    // If no other direction is possible, continue in the current direction if it's valid
    return cell.connections[currentDirection] ? currentDirection : null;
}

// Function to start the train
function startTrain() {
    if (!isTrainMoving && trainStart) {
        // Reset the trainPath
        for (let row = 0; row < gridSize; row++) {
            for (let col = 0; col < gridSize; col++) {
                trainPath[row][col] = false;
            }
        }
        trainPosition = { ...trainStart };
        trainDirection = getInitialDirection(grid[trainStart.row][trainStart.col]);
        isTrainMoving = true;
        trainInterval = setInterval(() => {
            moveTrain();
            drawGrid();
            if (trainPosition.row === trainDestination.row && trainPosition.col === trainDestination.col) {
                stopTrain();
            }
        }, 500); // Move every 500ms
    } else if (!trainStart) {
        console.log("Please set a start position for the train.");
    }
}

// Function to stop the train
function stopTrain() {
    if (isTrainMoving) {
        isTrainMoving = false;
        clearInterval(trainInterval);
    }
}

// Function to find a valid starting position for the train
function findValidStartPosition() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (grid[row][col].hasTrack) {
                return { row, col };
            }
        }
    }
    return null; // No valid position found
}

// Helper function to get the initial direction
function getInitialDirection(cell) {
    const possibleDirections = Object.keys(cell.connections).filter(direction => cell.connections[direction]);
    return possibleDirections.length > 0 ? possibleDirections[0] : directions.RIGHT;
}

// Modify the drawGrid function to include drawing the train
function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            // Highlight the current cell
            if (highlightedCell.row === row && highlightedCell.col === col) {
                ctx.fillStyle = 'lightgrey';
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }

            // Draw each cell as a rectangle
            ctx.strokeStyle = 'gray';
            ctx.strokeRect(col * cellSize, row * cellSize, cellSize, cellSize);
        }
    }
    drawTrainPath(); // Draw the train's path
    drawTracks();
    drawStartAndDestination(); // New function to draw start and destination
    if (isTrainMoving) {
        drawTrain();
    }
    drawPositionDisplay(); // Add this line to draw the position display
}

// New function to draw start and destination
function drawStartAndDestination() {
    if (trainStart) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(trainStart.col * cellSize, trainStart.row * cellSize, cellSize, cellSize);
    }
    if (trainDestination) {
        ctx.fillStyle = 'green';
        ctx.fillRect(trainDestination.col * cellSize, trainDestination.row * cellSize, cellSize, cellSize);
    }
}

// New function to draw the position display
function drawPositionDisplay() {
    const displayX = gridSize * cellSize + 10; // 10 pixels padding from the grid
    const displayY = 10; // 10 pixels from the top
    const displayWidth = 80; // Width of the display area
    const displayHeight = 60; // Height of the display area

    // Draw background for the display
    ctx.fillStyle = 'lightgray';
    ctx.fillRect(displayX, displayY, displayWidth, displayHeight);

    // Draw border
    ctx.strokeStyle = 'black';
    ctx.strokeRect(displayX, displayY, displayWidth, displayHeight);

    // Display train position
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.fillText(`Train Position:`, displayX + 5, displayY + 20);
    ctx.fillText(`Row: ${trainPosition.row}`, displayX + 5, displayY + 40);
    ctx.fillText(`Col: ${trainPosition.col}`, displayX + 5, displayY + 60);
}

// Function to convert canvas coordinates to grid coordinates
function getGridPosition(x, y) {
    return {
        row: Math.floor(y / cellSize),
        col: Math.floor(x / cellSize)
    };
}

// Function to add a track and update connections automatically
function addTrack(row, col) {
    // Check bounds
    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) return;

    const node = grid[row][col];

    // Place a track and update the node
    node.hasTrack = true;

    // Update connections with adjacent cells
    updateConnections(row, col);

    // Redraw the grid and tracks
    drawGrid();
    drawTracks();
}

// Update connections with adjacent cells
function updateConnections(row, col) {
    const node = grid[row][col];

    // Check and connect with top neighbor
    if (row > 0 && grid[row - 1][col].hasTrack) {
        node.connections.top = true;
        grid[row - 1][col].connections.bottom = true;
    }

    // Check and connect with right neighbor
    if (col < gridSize - 1 && grid[row][col + 1].hasTrack) {
        node.connections.right = true;
        grid[row][col + 1].connections.left = true;
    }

    // Check and connect with bottom neighbor
    if (row < gridSize - 1 && grid[row + 1][col].hasTrack) {
        node.connections.bottom = true;
        grid[row + 1][col].connections.top = true;
    }

    // Check and connect with left neighbor
    if (col > 0 && grid[row][col - 1].hasTrack) {
        node.connections.left = true;
        grid[row][col - 1].connections.right = true;
    }
}

// Function to draw tracks on the grid based on connections
function drawTracks() {
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const { connections, hasTrack } = grid[row][col];
            if (hasTrack) {
                ctx.strokeStyle = 'black';
                ctx.lineWidth = 4;
                ctx.beginPath();

                // Draw based on connections
                if (connections.top) {
                    ctx.moveTo(col * cellSize + cellSize / 2, row * cellSize);
                    ctx.lineTo(col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
                }
                if (connections.right) {
                    ctx.moveTo(col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
                    ctx.lineTo(col * cellSize + cellSize, row * cellSize + cellSize / 2);
                }
                if (connections.bottom) {
                    ctx.moveTo(col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
                    ctx.lineTo(col * cellSize + cellSize / 2, row * cellSize + cellSize);
                }
                if (connections.left) {
                    ctx.moveTo(col * cellSize, row * cellSize + cellSize / 2);
                    ctx.lineTo(col * cellSize + cellSize / 2, row * cellSize + cellSize / 2);
                }

                ctx.stroke();
            }
        }
    }
}

// Add a new function to draw the train's path
function drawTrainPath() {
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'; // Semi-transparent green
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            if (trainPath[row][col]) {
                ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
            }
        }
    }
}

// Handle mouse clicks on the canvas
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const { row, col } = getGridPosition(x, y);

    // Toggle track placement
    if (grid[row][col].hasTrack) {
        // Remove track if it exists
        grid[row][col].hasTrack = false;
        grid[row][col].connections = { top: false, right: false, bottom: false, left: false }; // Reset connections
        
        // Remove start or destination if it was on this cell
        if (trainStart && trainStart.row === row && trainStart.col === col) trainStart = null;
        if (trainDestination && trainDestination.row === row && trainDestination.col === col) trainDestination = null;
        
        drawGrid();
        drawTracks();
    } else {
        // Add track
        addTrack(row, col);
    }
});

// Handle mouse movement over the canvas
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const { row, col } = getGridPosition(x, y);

    // Update highlighted cell if it has changed
    if (highlightedCell.row !== row || highlightedCell.col !== col) {
        highlightedCell = { row, col };
        drawGrid(); // Redraw the grid to update the highlight
        drawTracks(); // Redraw the tracks on top
    }
});

// Add event listeners for start and stop buttons
document.getElementById('startButton').addEventListener('click', startTrain);
document.getElementById('stopButton').addEventListener('click', stopTrain);

// Add a new keydown event listener
document.addEventListener('keydown', (event) => {
    if (event.key === 's' || event.key === 'S') {
        if (highlightedCell.row !== -1 && highlightedCell.col !== -1 && grid[highlightedCell.row][highlightedCell.col].hasTrack) {
            trainStart = { ...highlightedCell };
            drawGrid();
        }
    } else if (event.key === 'e' || event.key === 'E') {
        if (highlightedCell.row !== -1 && highlightedCell.col !== -1 && grid[highlightedCell.row][highlightedCell.col].hasTrack) {
            trainDestination = { ...highlightedCell };
            drawGrid();
        }
    }
});

// Adjust canvas size to accommodate the position display
canvas.width = gridSize * cellSize + 100; // Add 100 pixels for the display area

// Call drawGrid to render the initial grid
drawGrid();
