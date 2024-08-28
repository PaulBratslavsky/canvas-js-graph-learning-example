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

// Function to draw the grid on the canvas
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

// Call drawGrid to render the initial grid
drawGrid();
