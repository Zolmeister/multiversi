/*
 * @constructor
 * @this {Render}
 * @param {string} canvasId
 */
var Render = function(canvasId) {
    this.canvasId = canvasId;
    this.paper = undefined;

    this.board = undefined;
    this.spaces = {};
}

/*
 * @param {i} i
 * @param {j} j
 * @return {Coordiante} {x,y}
 */
Render.prototype.hexSpaceCenter = function(i, j) {

    var x = i * (1.5 * RENDER.hexShape.radius);
    var y = j * (2 * RENDER.hexShape.apothem);
    if (i % 2 == 1) {
        y -= RENDER.hexShape.apothem;
    }

    return {
        x : x + RENDER.offset.x,
        y : y + RENDER.offset.y
    };
}

/*
 * @param {Coordinate.X} canvas_x
 * @param {Coordinate.Y} canvas_y
 * @return {Position}
 */
Render.prototype.spaceAt = function(canvas_x, canvas_y) {
    var high_i = Math.floor(canvas_x / (1.5 * RENDER.hexShape.radius));
    var high_j = Math.floor(canvas_y / (2 * RENDER.hexShape.apothem));

    var min_i = -1, min_j = -1, min_d = 1600;
    var space, d;

    for (var i = high_i - 1; i < high_i + 1; i++) {
        for (var j = high_j - 1; j < high_j + 1; j++) {

            space = this.hexSpaceCenter(i, j);
            d = distance2(canvas_x, canvas_y, space.x, space.y);

            if (d < min_d) {
                min_i = i;
                min_j = j;
                min_d = d;
            }
        }
    }

    return {
        i : min_i,
        j : min_j
    };
}

Render.prototype.setBoard = function(board) {

    if (this.board) {
        return;
    }

    this.board = board;

    var dim = this.getDimensions(this.board);
    this.paper = Raphael($(this.canvasId)[0], dim.width, dim.height);

    this.spaces = new Array(this.board.width);
    for (var i = 0; i < this.board.width; i++) {
        this.spaces[i] = new Array(this.board.height);
        for (var j = 0; j < this.board.height; j++) {

            var c = this.hexSpaceCenter(i, j);
            this.spaces[i][j] = this.paper.circle(c.x, c.y, RENDER.hexShape.apothem);
        };
    };
}

Render.prototype.getDimensions = function(board) {
    var width = (2 * RENDER.hexShape.radius) * board.width + 2;
    if (board.width % 2 === 0) {
        width += .5 * RENDER.hexShape.radius;
    }
    var height = (2 * RENDER.hexShape.apothem) * board.height + 2;
    if (board.height % 2 === 0) {
        height += RENDER.hexShape.apothem;
    }
    return {
        width : width,
        height : height
    };
}

/*
 * @param {player} me
 * @param {list} players
 * @param {Board} board
 * @param {Grid} grid
 * @param {Position} clickedSpace
 * @param {list} possibleMoves
 */
// Render.prototype.draw = function(me, players, board, grid, clickedSpace, possibleMoves) {
//     if (!board || !grid || !players) {
//         return;
//     }
//     var rules = new RulesSet();
//     // clear canvas
//     //TODO: make more efficient
//     var dim = this.getDimensions(board);
//     this.paper.setSize(dim.width, dim.height)
//     // $(this.canvasId).width(dim.width).height(dim.height).show();
//     // this.canvas.width = dim.width;
//     // this.canvas.height = dim.height;
// 
//     for (var i = 0; i < board.width; i++) {
//         for (var j = 0; j < board.height; j++) {
// 
//             var space = this.hexSpaceCenter(i, j);
//             var fill = "#fff";
// 
//             // Weed out non-spaces
//             if (grid[i][j] == -2) {
//                 continue;
//             }
// 
//             // Fill
//             if (grid[i][j] === -3) {
//                 fill = "#444";
//             } else if (grid[i][j] !== -1) {
//                 var index = getPlayerIndex(players, grid[i][j])
//                 var colors = COLORS[index];
//                 if (!colors) {
//                     colors = {
//                         color : "#333",
//                         activeColor : "#333",
//                         moveColor : "#333"
//                     }
//                 }
//                 if (clickedSpace && i === clickedSpace.i && j === clickedSpace.j) {
//                     fill = colors.activeColor;
//                 } else {
//                     fill = colors.color;
//                 }
//             } else if (possibleMoves && possibleMoves[[i, j]]) {
//                 var index = getPlayerIndex(players, me);
//                 var colors = COLORS[index];
//                 if (!colors) {
//                     colors = {
//                         color : "#333",
//                         activeColor : "#333",
//                         moveColor : "#333"
//                     }
//                 }
//                 fill = colors.moveColor;
//             }
//             // Draw Hex Spaces
//             this.drawHexSpace(space.x, space.y, RENDER.hexShape.radius, fill);
// 
//             var s = {
//                 i : i,
//                 j : j
//             };
//             if (board.gametype === "pointcontrol" && rules.isControlPoint(s, board)) {
//                 // this.context.beginPath();
//                 // this.context.arc(space.x, space.y, 18, 0, 2 * Math.PI, false);
//                 // this.context.fillStyle = "#FFB00F";
//                 // this.context.fill();
//             }
// 
//             if (DEBUG) {
//                 // this.context.fillStyle = "#000";
//                 // this.context.font = "12px sans-serif";
//                 // this.context.fillText(i + " " + j, space.x - 7, space.y + 4);
//             }
//         }
//     }
//     this.rendered = true;
// }

// Render.prototype.drawHexSpace = function(x, y, radius, fill) {
// 
//     if (!this.rendered)
//         this.paper.circle(x, y, 31);
// 
// 
//     // this.context.beginPath();
//     // this.context.translate(x, y);
// 
//     // for (var i = 0; i < 6; i++) {
//     //     this.context.rotate((2 * Math.PI) / 6);
//     //     this.context.lineTo(radius, 0);
//     // }
// 
//     // this.context.closePath();
//     // if (fill) {
//     //     this.context.fillStyle = fill;
//     //     this.context.fill();
//     // }
//     // this.context.stroke();
// 
//     // this.context.setTransform(1, 0, 0, 1, 0, 0);
// }

