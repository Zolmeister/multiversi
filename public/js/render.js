/*
 * @constructor
 * @this {Render}
 * @param {string} canvasId
 * @param {Room} room
 */
var Render = function(canvasId) {
    this.canvasId = canvasId;
    this.canvas = $(canvasId)[0];
    this.context = this.canvas.getContext("2d");
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
// Draw
Render.prototype.draw = function(room, clickedSpace, possibleMoves) {
    if (!room) {
        return;
    }

    if (!room.game()) {
        console.log("no game")
        return;
    }

    // clear canvas
    var dim = this.getDimensions(room.game().board);
    $(this.canvasId).width(dim.width).height(dim.height).show();
    this.canvas.width = dim.width;
    this.canvas.height = dim.height;

    for (var i = 0; i < room.game().board.width; i++) {
        for (var j = 0; j < room.game().board.height; j++) {

            var space = this.hexSpaceCenter(i, j);
            var fill = "#fff";

            // Weed out non-spaces
            if (room.game().grid[i][j] == -2) {
                continue;
            }

            // Fill
            if (room.game().grid[i][j] === -3) {
                fill = "#444";
            } else if (room.game().grid[i][j] !== -1) {
                var index = room.getPlayerIndex(room.game().grid[i][j])
                var colors = COLORS[index];
                if (!colors) {
                    colors = {
                        color : "#333",
                        activeColor : "#333",
                        moveColor : "#333"
                    }
                }
                if (clickedSpace && i === clickedSpace.i && j === clickedSpace.j) {
                    fill = colors.activeColor;
                } else {
                    fill = colors.color;
                }
            } else if (possibleMoves && possibleMoves[[i, j]]) {
                var index = room.getPlayerIndex(room.me());
                var colors = COLORS[index];
                if (!colors) {
                    colors = {
                        color : "#333",
                        activeColor : "#333",
                        moveColor : "#333"
                    }
                }
                fill = colors.moveColor;
            }
            // Draw Hex Spaces
            this.drawHexSpace(space.x, space.y, RENDER.hexShape.radius, fill);

            var s = {
                i : i,
                j : j
            };
            if (room.game().board.gametype === "pointcontrol" && room.game().isControlPoint(s)) {
                this.context.beginPath();
                this.context.arc(space.x, space.y, 18, 0, 2 * Math.PI, false);
                this.context.fillStyle = "#FFB00F";
                this.context.fill();
            }

            if (DEBUG) {
                this.context.fillStyle = "#000";
                this.context.font = "12px sans-serif";
                this.context.fillText(i + " " + j, space.x - 7, space.y + 4);
            }
        }
    }
}

Render.prototype.drawHexSpace = function(x, y, radius, fill) {

    this.context.beginPath();
    this.context.translate(x, y);

    for (var i = 0; i < 6; i++) {
        this.context.rotate((2 * Math.PI) / 6);
        this.context.lineTo(radius, 0);
    }

    this.context.closePath();
    if (fill) {
        this.context.fillStyle = fill;
        this.context.fill();
    }
    this.context.stroke();

    this.context.setTransform(1, 0, 0, 1, 0, 0);
}

