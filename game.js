// Select the canvas and get its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define the size of the grid and cells
const CONFIG = {
    GRID_SIZE: 20,
    CELL_SIZE: 40,
    TRAIN_SPEED: 500,
};

// Define directions for edges
const directions = {
    TOP: 'top',
    RIGHT: 'right',
    BOTTOM: 'bottom',
    LEFT: 'left'
};

// Initialize a 2D array to represent the grid as nodes
const grid = Array.from({ length: CONFIG.GRID_SIZE }, () =>
    Array.from({ length: CONFIG.GRID_SIZE }, () => ({
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
const trainPath = Array.from({ length: CONFIG.GRID_SIZE }, () =>
    Array.from({ length: CONFIG.GRID_SIZE }, () => false)
);

// Add new variables for start and destination
let trainStart = null;
let trainDestination = null;

// Function to draw the train
function drawTrain() {
    const x = trainPosition.col * CONFIG.CELL_SIZE;
    const y = trainPosition.row * CONFIG.CELL_SIZE;
    ctx.fillStyle = 'red';
    ctx.fillRect(x + 10, y + 10, CONFIG.CELL_SIZE - 20, CONFIG.CELL_SIZE - 20);
}

// Function to start the train
function startTrain() {
    if (!isTrainMoving && trainStart && trainDestination) {
        // Reset the trainPath
        for (let row = 0; row < CONFIG.GRID_SIZE; row++) {
            for (let col = 0; col < CONFIG.GRID_SIZE; col++) {
                trainPath[row][col] = false;
            }
        }

        const path = findPath(trainStart, trainDestination);
        if (path) {
            trainPosition = { ...trainStart };
            isTrainMoving = true;
            let pathIndex = 0;

            trainInterval = setInterval(() => {
                if (pathIndex < path.length) {
                    trainPath[trainPosition.row][trainPosition.col] = true;
                    trainPosition = path[pathIndex];
                    pathIndex++;
                    drawGrid();
                } else {
                    stopTrain();
                }
            }, CONFIG.TRAIN_SPEED); // Move every 500ms
        } else {
            console.log("No valid path found.");
        }
    } else if (!trainStart || !trainDestination) {
        console.log("Please set both start and destination positions for the train.");
    }
}

// Function to stop the train
function stopTrain() {
    if (isTrainMoving) {
        isTrainMoving = false;
        clearInterval(trainInterval);
    }
}

// Function to find path using BFS
function findPath(start, end) {
    const queue = [[start]];
    const visited = new Set();

    while (queue.length > 0) {
        const path = queue.shift();
        const { row, col } = path[path.length - 1];

        if (row === end.row && col === end.col) {
            return path;
        }

        const key = `${row},${col}`;
        if (!visited.has(key)) {
            visited.add(key);

            const neighbors = getValidNeighbors(row, col);
            for (const neighbor of neighbors) {
                const newPath = [...path, neighbor];
                queue.push(newPath);
            }
        }
    }

    return null; // No path found
}

// Function to get valid neighboring cells
function getValidNeighbors(row, col) {
    const neighbors = [];
    const cell = grid[row][col];

    if (cell.connections.top && row > 0) neighbors.push({ row: row - 1, col });
    if (cell.connections.right && col < CONFIG.GRID_SIZE - 1) neighbors.push({ row, col: col + 1 });
    if (cell.connections.bottom && row < CONFIG.GRID_SIZE - 1) neighbors.push({ row: row + 1, col });
    if (cell.connections.left && col > 0) neighbors.push({ row, col: col - 1 });

    return neighbors;
}

// Function to find a valid starting position for the train
function findValidStartPosition() {
    for (let row = 0; row < CONFIG.GRID_SIZE; row++) {
        for (let col = 0; col < CONFIG.GRID_SIZE; col++) {
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

    for (let row = 0; row < CONFIG.GRID_SIZE; row++) {
        for (let col = 0; col < CONFIG.GRID_SIZE; col++) {
            // Highlight the current cell
            if (highlightedCell.row === row && highlightedCell.col === col) {
                ctx.fillStyle = 'lightgrey';
                ctx.fillRect(col * CONFIG.CELL_SIZE, row * CONFIG.CELL_SIZE, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
            }

            // Draw each cell as a rectangle
            ctx.strokeStyle = 'gray';
            ctx.strokeRect(col * CONFIG.CELL_SIZE, row * CONFIG.CELL_SIZE, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
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
        ctx.fillRect(trainStart.col * CONFIG.CELL_SIZE, trainStart.row * CONFIG.CELL_SIZE, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
    }
    if (trainDestination) {
        ctx.fillStyle = 'green';
        ctx.fillRect(trainDestination.col * CONFIG.CELL_SIZE, trainDestination.row * CONFIG.CELL_SIZE, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
    }
}

// New function to draw the position display
function drawPositionDisplay() {
    const displayX = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE + 10; // 10 pixels padding from the grid
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
        row: Math.floor(y / CONFIG.CELL_SIZE),
        col: Math.floor(x / CONFIG.CELL_SIZE)
    };
}

// Function to add a track and update connections automatically
function addTrack(row, col) {
    // Check bounds
    if (row < 0 || row >= CONFIG.GRID_SIZE || col < 0 || col >= CONFIG.GRID_SIZE) return;

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
    if (col < CONFIG.GRID_SIZE - 1 && grid[row][col + 1].hasTrack) {
        node.connections.right = true;
        grid[row][col + 1].connections.left = true;
    }

    // Check and connect with bottom neighbor
    if (row < CONFIG.GRID_SIZE - 1 && grid[row + 1][col].hasTrack) {
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
    for (let row = 0; row < CONFIG.GRID_SIZE; row++) {
        for (let col = 0; col < CONFIG.GRID_SIZE; col++) {
            if (grid[row][col].hasTrack) {
                drawTrackForCell(row, col);
            }
        }
    }
}

function drawTrackForCell(row, col) {
    const { connections } = grid[row][col];
    const centerX = col * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;
    const centerY = row * CONFIG.CELL_SIZE + CONFIG.CELL_SIZE / 2;

    ctx.strokeStyle = 'black';
    ctx.lineWidth = 4;
    ctx.beginPath();

    if (connections.top) drawLine(centerX, centerY, centerX, row * CONFIG.CELL_SIZE);
    if (connections.right) drawLine(centerX, centerY, (col + 1) * CONFIG.CELL_SIZE, centerY);
    if (connections.bottom) drawLine(centerX, centerY, centerX, (row + 1) * CONFIG.CELL_SIZE);
    if (connections.left) drawLine(centerX, centerY, col * CONFIG.CELL_SIZE, centerY);

    ctx.stroke();
}

function drawLine(x1, y1, x2, y2) {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
}

// Add a new function to draw the train's path
function drawTrainPath() {
    ctx.fillStyle = 'rgba(0, 255, 0, 0.3)'; // Semi-transparent green
    for (let row = 0; row < CONFIG.GRID_SIZE; row++) {
        for (let col = 0; col < CONFIG.GRID_SIZE; col++) {
            if (trainPath[row][col]) {
                ctx.fillRect(col * CONFIG.CELL_SIZE, row * CONFIG.CELL_SIZE, CONFIG.CELL_SIZE, CONFIG.CELL_SIZE);
            }
        }
    }
}

// Handle mouse clicks on the canvas
canvas.addEventListener('click', handleCanvasClick);
canvas.addEventListener('mousemove', handleCanvasMouseMove);

function handleCanvasClick(event) {
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
}

function handleCanvasMouseMove(event) {
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
}

// Add event listeners for start and stop buttons
const eventListeners = {
    'startButton': { event: 'click', handler: startTrain },
    'stopButton': { event: 'click', handler: stopTrain },
    'randomTrackButton': { event: 'click', handler: generateComplexTrack },
    // ...
};

Object.entries(eventListeners).forEach(([id, { event, handler }]) => {
    document.getElementById(id).addEventListener(event, handler);
});

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
canvas.width = CONFIG.GRID_SIZE * CONFIG.CELL_SIZE + 100; // Add 100 pixels for the display area

// Add this new function to generate a complex random track
function generateComplexTrack() {
    // Clear existing track
    for (let row = 0; row < CONFIG.GRID_SIZE; row++) {
        for (let col = 0; col < CONFIG.GRID_SIZE; col++) {
            grid[row][col].hasTrack = false;
            grid[row][col].connections = { top: false, right: false, bottom: false, left: false };
        }
    }

    // Start from a random position
    let currentPosition = {
        row: Math.floor(Math.random() * CONFIG.GRID_SIZE),
        col: Math.floor(Math.random() * CONFIG.GRID_SIZE)
    };
    trainStart = { ...currentPosition };

    let visited = new Set();
    let stack = [currentPosition];
    let trackLength = 0;
    const maxTrackLength = Math.floor(CONFIG.GRID_SIZE * CONFIG.GRID_SIZE * 0.3); // 30% of grid size

    while (stack.length > 0 && trackLength < maxTrackLength) {
        currentPosition = stack.pop();
        const key = `${currentPosition.row},${currentPosition.col}`;

        if (!visited.has(key)) {
            visited.add(key);
            addTrack(currentPosition.row, currentPosition.col);
            trackLength++;

            // Get all possible directions
            let possibleMoves = [
                { row: -1, col: 0 }, // up
                { row: 1, col: 0 },  // down
                { row: 0, col: -1 }, // left
                { row: 0, col: 1 }   // right
            ];

            // Shuffle possibleMoves for randomness
            possibleMoves.sort(() => Math.random() - 0.5);

            for (const move of possibleMoves) {
                const newRow = currentPosition.row + move.row;
                const newCol = currentPosition.col + move.col;

                if (newRow >= 0 && newRow < CONFIG.GRID_SIZE && newCol >= 0 && newCol < CONFIG.GRID_SIZE && !grid[newRow][newCol].hasTrack) {
                    stack.push({ row: newRow, col: newCol });
                }
            }
        }
    }

    trainDestination = { ...currentPosition };
    drawGrid();
}

// Call drawGrid to render the initial grid
drawGrid();

function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

function update() {
    // Update game state
}

function render() {
    // Render game elements
}

requestAnimationFrame(gameLoop);

function handleError(error, context) {
    console.error(`Error in ${context}:`, error);
    // Potentially show user-friendly error message
}

// Usage
try {
    // Risky operation
} catch (error) {
    handleError(error, 'generateComplexTrack');
}
