/*
 * @constructor
 * @this {Render}
 * @param {string} canvasId
 */
var Render = function(canvasId) {
    this.canvasId = canvasId;
    this.paper = Raphael($(this.canvasId)[0], 0, 0);
    this.lastBoard = undefined;

    // Mirrors Grid, but keeps track on SVG elems
    // instead of player Ids
    this.spaces = {};

    // List of Ids to keep track of turn order
    this.turnOrder = [0, 0, 0];

    // Id of client's player
    this.me = undefined;

    // Raphael sets
    // For easy access to all spaces of a certain type
    this.spacesSet = undefined;
    this.playerSpaces = undefined;
    this.controlPointSet = undefined;
    this.possibleMovesSet = undefined;
    this.clickedSpace = undefined;
    
    // i,j custom attributes
    // This allows us to set the [i, j] coordinate
    // of the element internally so we can easily
    // access it from event callbacks.
    this.paper.customAttributes.i = function(i) {
        return {i : i};
    }
    
    this.paper.customAttributes.j = function(j) {
        return {j : j};
    }
    

    // Event handlers
    this.playerSpacesClickHandler = undefined;
    this.possibleMovesClickHandler = undefined;
}

function hexagonPathString(radius) {
    var a = Math.PI / 3;
    var x = radius;
    var y = 0;
    var s = "m" + x + "," + y;

    for (var i = 1; i < 6; i++) {
        x = radius * Math.cos(a * i);
        y = radius * Math.sin(a * i);
        s = s + "L" + x + "," + y;
    }

    return s + "z";
}

/*
 * @param {i} i
 * @param {j} j
 * @return {Coordiante} {x,y}
 */
Render.prototype.hexSpaceCenter = function(i, j) {

    var x = i * (1.5 * RENDER.hexShape.spacingRadius);
    var y = j * (2 * RENDER.hexShape.spacingApothem);
    if (i % 2 == 1) {
        y -= RENDER.hexShape.spacingApothem;
    }

    return {
        x : x + RENDER.offset.x,
        y : y + RENDER.offset.y
    };
}

Render.prototype.getDimensions = function(board) {
    var width = (1.5 * RENDER.hexShape.spacingRadius) * board.width + 2;
    width += .5 * RENDER.hexShape.spacingRadius;
    var height = (2 * RENDER.hexShape.spacingApothem) * board.height + 2;
    height += RENDER.hexShape.spacingApothem;
    return {
        width : width,
        height : height
    };
}

Render.prototype.setBoard = function(board) {

    if (this.playerSpaces == undefined) {
        return;
    }

    if (board == this.lastBoard) {
        return;
    }

    // Keep record of the current initialization
    this.lastBoard = board;

    var dim = this.getDimensions(board);
    this.paper.setSize(dim.width, dim.height);
    
    this.spacesSet = this.paper.set();
    this.controlPointSet = this.paper.set();
    if (DEBUG) {
        this.debugNumbers = this.paper.set();
    }

    // Create space SVG elements
    this.spaces = new Array(board.width);

    var hexPath = hexagonPathString(RENDER.hexShape.radius);
    console.log(hexPath);
    
    for (var i = 0; i < board.width; i++) {
        this.spaces[i] = new Array(board.height);
        for (var j = 0; j < board.height; j++) {

            var c = this.hexSpaceCenter(i, j);
            // Every space must have a "fill" or it won't accept onClick events
            // var space = this.paper.circle(c.x, c.y, RENDER.hexShape.apothem).attr({
            //     i : i,
            //     j : j,
            //     fill : "#fff"
            // });                  
            var space = this.paper.path(hexPath).attr({
                i : i,
                j : j,
                fill : "#fff"
            });                  

            space.translate(c.x, c.y);

            this.spacesSet.push(space);
            this.spaces[i][j] = space;

            if (DEBUG) {
                var txt = this.paper.text(c.x, c.y, i + " " + j).attr({
                    i : i,
                    j : j
                });
                this.debugNumbers.push(txt);
            }
        }
    }

    // Modify attributes of special spaces
    for (var s in board.nonrendered) {
        var space = board.nonrendered[s];
        this.spaces[space[0]][space[1]].attr({
            stroke: "#fff",
            fill: "",
            opacity: 0
        });
    }
    
    for (var s in board.nonjumpable) {
        var space = board.nonjumpable[s];
        this.spaces[space[0]][space[1]].attr({
            fill: "#444"
        });
    }
    
    for (var s in board.controlpoints) {
        var space = board.controlpoints[s];

        var c = this.hexSpaceCenter(space[0], space[1]);
        var point = this.paper.circle(c.x, c.y, 18).attr({
            stroke: "",
            fill: "#FFB00F"
        });

        this.controlPointSet.push(point);
    }
    
    // Set starting position colors
    for (var i = 0; i < 3; i++) {
        for (var s in board.starting[i]) {
            var space = board.starting[i][s];

            this.playerSpaces[this.turnOrder[i]].push(this.spaces[space[0]][space[1]]);
        }
    }


    if (DEBUG) {
        this.debugNumbers.toFront();
    }

    this.applyAttributes();
}

// Call this when the player list updates
// Resets internal mapping between player Ids and turn numbers
Render.prototype.setPlayers = function(players, me) {
    for (var set in this.playerSpaces) {
        this.playerSpaces[set].clear();
    }

    this.playerSpaces = {};

    for (var i = 0; i < players.length; i++) {
        var id = players[i].id;

        // Dummy player
        if (id == undefined) {
            id = players[i]().id;
        }

        this.playerSpaces[id] = this.paper.set();
        this.turnOrder[i] = id;
    }

    if (me !== undefined && me !== -1) {
        this.me = me;
        this.applyAttributes();
    }
}

Render.prototype.replacePlayer = function(playerIdFrom, playerIdTo) {

    if (!this.playerSpaces) {
        return;
    }

    if (playerIdFrom === this.me) {
        this.me = playerIdTo;
    }
    this.playerSpaces[playerIdTo] = this.playerSpaces[playerIdFrom];
    delete this.playerSpaces[playerIdFrom];

    var i = this.turnOrder.lastIndexOf(playerIdFrom);

    // turnOrder Ids must be strings for comparisons/searching
    this.turnOrder[i] = playerIdTo + "";
}

Render.prototype.applyAttributes = function() {

    if (this.playerSpaces !== undefined) {
        
        for (var i = 0; i < 3; i++) {
            this.playerSpaces[this.turnOrder[i]].attr({
                fill : COLORS[i].color
            });
        }

        // You must "unclick" the elements first, otherwise the handler
        // is called thousands of times
        if (this.playerSpaces[this.me] && this.playerSpacesClickHandler) {
            this.playerSpaces[this.me].unclick(this.playerSpacesClickHandler);
            this.playerSpaces[this.me].click(this.playerSpacesClickHandler);
        }
    }

    if (this.possibleMovesSet !== undefined){

        var turn = this.turnOrder.lastIndexOf(this.me);
        if (turn >= 0) {
            this.possibleMovesSet.attr({
                fill : COLORS[turn].moveColor
            });
        }

        if (this.possibleMovesSet && this.possibleMovesClickHandler) {
            this.possibleMovesSet.unclick(this.possibleMovesClickHandler);
            this.possibleMovesSet.click(this.possibleMovesClickHandler);
        }
    }
}

// Apply the current grid to the Renderer.
// Resets the playerSpaces sets to reflect
// the spaces that each player currently has.
//
// I'm not a fan of the way this is implemented,
// so it might change in the future. I would
// prefer the one argument to be:
//
//      {
//          0 : [spaces that player 0 has, ...],
//          1 : [...],
//          2 : [...]
//      }
//
// That way the Renderer can be ignorant of
// player Ids.
Render.prototype.setGrid = function(grid, board) {

    if (this.playerSpaces === undefined || this.me === undefined) {
        return;
    }

    if (this.playerSpaces.hasOwnProperty(this.me)) {
        this.playerSpaces[this.me].unclick(this.playerSpacesClickHandler);
    }
    
    for (var i = 0; i < 3; i++) {
        this.playerSpaces[this.turnOrder[i]].clear();
    };

    for (var i = 0; i < board.width; i++) {
        for (var j = 0; j < board.height; j++) {
            
            var id = grid[i][j];

            if (!this.playerSpaces.hasOwnProperty(id)) {
                continue;
            }

            var space = this.spaces[i][j];
            this.playerSpaces[id].push(space);
        }
    }
    
    this.applyAttributes();
}

Render.prototype.setMove = function(boardDiff) {

    if (this.playerSpaces === undefined || this.me === undefined) {
        return;
    }

    for (var id in boardDiff.lost) {
        var spaces = boardDiff.lost[id];

        for (var s in spaces) {
            var space = spaces[s];

            this.playerSpaces[id].exclude(this.spaces[space.i][space.j]);

            if (id === this.me) {
                this.spaces[space.i][space.j].unclick(this.playerSpacesClickHandler);
            }
        }
    }
    
    for (var id in boardDiff.gained) {
        var spaces = boardDiff.gained[id];

        for (var s in spaces) {
            var space = spaces[s];

            this.playerSpaces[id].push(this.spaces[space.i][space.j]);
        }
    }

    this.applyAttributes();
}

// setPossibleMoves({}) to clear possibleMoves
Render.prototype.setPossibleMoves = function(possibleMoves) {
    
    // Clear previous possibleMovesSet
    if (this.possibleMovesSet) {
        this.possibleMovesSet.attr({
            fill : "#fff"
        });

        this.possibleMovesSet.unclick(this.possibleMovesClickHandler);
        this.possibleMovesSet.clear();
    } else {
        this.possibleMovesSet = this.paper.set();
    }

    // Create new possibleMovesSet
    for (var s in possibleMoves) {
        var space = possibleMoves[s][possibleMoves[s].length - 1];
        this.possibleMovesSet.push(this.spaces[space.i][space.j]);
    }


    this.applyAttributes();
}

Render.prototype.setClickedSpace = function(space) {
    this.clickedSpace = this.spaces[space.i][space.j];
}

