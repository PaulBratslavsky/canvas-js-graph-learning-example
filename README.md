# Building a Dynamic Track-Building Game with JavaScript and Canvas

In this tutorial, we'll create a dynamic track-building game using JavaScript and the HTML Canvas API. Our goal is to allow players to place tracks on a grid where each track piece automatically connects to adjacent pieces. This step-by-step guide will cover the essential concepts and code necessary to bring this project to life, ensuring you understand why and how it works.

**Prerequisites:**
To follow along with this tutorial, you should have basic knowledge of HTML, CSS, and JavaScript. Familiarity with the HTML Canvas API and JavaScript event handling will be beneficial but not strictly necessary, as we'll cover these concepts throughout.

**Project Overview**

The game will feature:

- A grid-based layout where each cell can hold a track piece.
- Automatic connections between adjacent track pieces, forming straights and turns as needed.
- Interactive features like placing and removing tracks with mouse clicks.

Here's what we'll build:

- A grid representing the game area.
- Functionality to add, remove, and connect tracks automatically based on adjacent cells.
- Visual feedback for placing tracks, including highlighting the current cell under the mouse.


**Step 1: Setting Up the Project**

First, set up the basic HTML structure with a canvas element. The canvas will be our drawing surface for the grid and tracks.

index.html:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Track Building Game</title>
    <style>
        canvas {
            border: 1px solid black;
            display: block;
            margin: 20px auto;
        }
    </style>
</head>
<body>
    <canvas id="gameCanvas" width="800" height="800"></canvas>
    <script src="game.js"></script>
</body>
</html>
```

**Step 2: Setting Up the Grid**

We'll create a 20x20 grid using JavaScript, each cell being 40x40 pixels. We'll represent each cell as an object with properties to track connections to adjacent cells and whether it has a track piece.

game.js:

```javascript
// Select the canvas and get its context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define the size of the grid and cells
const gridSize = 20; // 20x20 grid cells
const cellSize = 40; // Each cell is 40x40 pixels

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

// Initial call to draw the grid
drawGrid();
Step 3: Adding Tracks with Automatic Connections
To add tracks, we'll implement click event handling on the canvas. When you click on a cell, it will add a track and automatically connect it to adjacent tracks if they exist.

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

```

**Step 4: Drawing Tracks Based on Connections**

Now, we’ll write the function to draw tracks according to their connections. Straight and curved tracks will be drawn dynamically, based on which sides are connected.

game.js (continued):

```javascript

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
```

**Step 5: Adding Interaction**

To complete our game, we’ll add interaction to handle mouse clicks for adding and removing tracks, and mouse movements for highlighting cells.


```javascript
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
```

**Step 6: Final Touches and Testing**

With all the code in place, test your game to ensure tracks connect and disconnect correctly based on user interactions. Adjust the drawing functions or event handlers as needed to fine-tune the game experience.

**Key Concepts Explained**
- Canvas Drawing: We use the Canvas API to draw the grid and tracks. By clearing and redrawing the canvas on every interaction, we maintain an accurate visual representation of the grid state.

- Grid Representation: Each cell in the grid is represented as an object with properties to manage connections to adjacent cells, allowing dynamic updates and drawing based on connections.

- Event Handling: We handle mouse clicks to add or remove tracks and use mouse movements to highlight the cell currently under the cursor, providing intuitive feedback to the player.


## Representing Connections Using a Graph Structure in a Grid-Based Track Game

In our track-building game, each cell in the grid is represented as a node in a graph-like structure. This approach allows us to dynamically manage connections between track pieces, ensuring they connect correctly based on their relative positions. Understanding how we represent these connections is key to making the game function intuitively and correctly.

## What Is a Graph Representation?

A graph consists of nodes (or vertices) and edges connecting those nodes. In our game, each grid cell acts as a node, and edges represent connections between track pieces. This graph structure enables us to model the relationships between adjacent tracks, allowing for automatic connections whenever tracks meet.

Step-by-Step Guide to Graph Representation

**Step 1: Define the Node Structure**

Each node (or cell) in our grid is represented by an object with the following properties:

- connections: An object that keeps track of connections in four directions: top, right, bottom, and left.
- hasTrack: A boolean indicating whether the cell contains a track piece.

Here's the structure of each node:
```javascript
// Example node structure
{
    connections: { 
        top: false, 
        right: false, 
        bottom: false, 
        left: false 
    },
    hasTrack: false // Indicates if the cell has a track
}
```

**Step 2: Initialize the Grid**

We initialize the grid as a 2D array of nodes using JavaScript's Array.from() method. Each node starts with no connections and no track.

```javascript
// Initialize a 2D array to represent the grid as nodes
const grid = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () => ({
        connections: { top: false, right: false, bottom: false, left: false },
        hasTrack: false // Indicates if the cell has a track
    }))
);
```

**Step 3: Adding a Track and Updating Connections**

When a track is added to a cell, we update its connections based on the presence of adjacent tracks. This process involves checking the nodes (cells) around the current cell and establishing bidirectional connections where appropriate.

```javascript
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
```

**Update Connections Function:**

This function establishes connections between the current node and its neighbors:

**Top Connection:** If the cell above has a track, connect the current node’s top to the above node’s bottom.

**Right Connection:** If the cell to the right has a track, connect the current node’s right to the right node’s left.

**Bottom Connection:** If the cell below has a track, connect the current node’s bottom to the below node’s top.

**Left Connection:** If the cell to the left has a track, connect the current node’s left to the left node’s right.

```javascript
// Update connections with adjacent cells
function updateConnections(row, col) {
    const node = grid[row][col];

    // Check and connect with top neighbor
    if (row > 0 && grid[row - 1][col].hasTrack) {
        node.connections.top = true;
        grid[row - 1][col].connections.bottom = true; // Bidirectional connection
    }

    // Check and connect with right neighbor
    if (col < gridSize - 1 && grid[row][col + 1].hasTrack) {
        node.connections.right = true;
        grid[row][col + 1].connections.left = true; // Bidirectional connection
    }

    // Check and connect with bottom neighbor
    if (row < gridSize - 1 && grid[row + 1][col].hasTrack) {
        node.connections.bottom = true;
        grid[row + 1][col].connections.top = true; // Bidirectional connection
    }

    // Check and connect with left neighbor
    if (col > 0 && grid[row][col - 1].hasTrack) {
        node.connections.left = true;
        grid[row][col - 1].connections.right = true; // Bidirectional connection
    }
}
```

**Step 4: Drawing Tracks Based on Connections**

To visualize the tracks, we draw lines on the canvas corresponding to the connections between nodes. The lines represent tracks, and we draw them according to the established connections.

Drawing Tracks:

Check Connections: For each node with a track, check its connections.
Draw Lines: Draw lines between connected sides of adjacent nodes using the canvas lineTo() function.


```javascript
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
```

**Why This Works**

**Graph-Based Representation:** By treating each grid cell as a node and connections as edges, we effectively model the grid as a graph. This structure makes it easy to manage and update connections dynamically.

**Bidirectional Connections:** The connections are bidirectional, meaning if one node connects to another, the reverse is also true. This ensures that connections are consistent and correctly represented visually.

**Automatic Updates:** Each time a track is added, the connections update automatically based on adjacent nodes. This eliminates the need for manual adjustments, making the game intuitive and easy to interact with.

## Conclusion
Using a graph-based approach to represent tracks and connections in a grid simplifies the logic required to manage track placement and drawing. Each cell's connections are dynamically updated based on adjacent cells, ensuring that tracks automatically connect where appropriate. This approach not only makes the implementation more robust but also provides a flexible foundation for adding more complex features in the future, such as moving trains or additional track types.

By following this guide, you should now have a solid understanding of how to use a graph-like structure to manage grid-based connections in a JavaScript game, leveraging the power of the Canvas API for dynamic visual feedback.# canvas-js-graph-learning-example
