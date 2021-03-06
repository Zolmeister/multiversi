/*
* @constructor
* @this {RulesSet}
*/
//function RulesSet(game) {
function RulesSet(game) {
    this.movesMade = 0;
    this.totalMoves = 0;

    // Zoli: this is needed to figure out when the game has ended. See RulesSet.controlPointCapturable
    this.game = game
};

/*
 * @return {grid}
 */
RulesSet.prototype.newBoard = function(board, players) {

    this.movesMade = 0;
    this.totalMoves = board.width * board.height;

    var grid = new Array(board.width);
    for (var i = 0; i < board.width; i++) {
        grid[i] = new Array(board.height);
        for (var j = 0; j < board.height; j++) {
            grid[i][j] = -1;
        }
    }

    for (var s in board.nonrendered) {
        var space = board.nonrendered[s];
        grid[space[0]][space[1]] = -2;
        this.totalMoves--;
    }

    for (var s in board.nonjumpable) {
        var space = board.nonjumpable[s];
        grid[space[0]][space[1]] = -3;
        this.totalMoves--;
    }

    if (board.gametype === "pointcontrol") {
        for (var s in board.controlpoints) {
            var space = board.controlpoints[s];
            grid[space[0]][space[1]] = -1;
        }
    }

    this.setInitialPositions(grid, board, players);

    return grid;
}
/*
 * @param {grid} grid
 * @param {list: players} players
 */
RulesSet.prototype.setInitialPositions = function(grid, board, players) {
    if (players && players.length === 3) {
        for (var i = 0; i < 3; i++) {
            var id = players[i].id;
            for (var s in board.starting[i]) {
                var space = board.starting[i][s];
                grid[space[0]][space[1]] = id;
                this.totalMoves--;
            }
        }
    }
}

/*
 * @param {Position} space
 * return {boolean}
 */
RulesSet.prototype.isControlPoint = function(pos, board) {
    if (board.gametype === "pointcontrol") {
        for (var s in board.controlpoints) {
            var point = board.controlpoints[s];
            // var space = {i:point[0], j:point[1]};
            if (point[0] === pos.i && point[1] === pos.j) {
                return true;
            }
        }
    }

    return false;
}
/*
 * @param {BoardDiff} boardDiff
 * return {ScoreDiff}
 */
RulesSet.prototype.getScoreDiff = function(boardDiff, board) {
    /*
     * BoardDiff = {
     *     gained: {
     *         id: [{Position}, ...],
     *         id: ...
     *     },
     *     lost: {
     *         id: [{Position}, ...],
     *         id: ...
     *     }
     * }
     */

    var scoreDiff = {};
    for (var id in boardDiff.gained) {
        var spaces = boardDiff.gained[id];

        for (var s in spaces) {
            var space = spaces[s];

            if (board.gametype === "classic") {
                if (scoreDiff[id]) {
                    scoreDiff[id]++;
                } else {
                    scoreDiff[id] = 1;
                }
            } else if (board.gametype === "pointcontrol") {
                if (this.isControlPoint(space, board)) {
                    if (scoreDiff[id]) {
                        scoreDiff[id]++;
                    } else {
                        scoreDiff[id] = 1;
                    }
                }
            }
        }
    }

    for (var id in boardDiff.lost) {
        var spaces = boardDiff.lost[id];

        for (var s in spaces) {
            var space = spaces[s];
            if (board.gametype === "classic") {
                if (scoreDiff[id]) {
                    scoreDiff[id]--;
                } else {
                    scoreDiff[id] = -1;
                }
            } else if (board.gametype === "pointcontrol") {
                if (this.isControlPoint(space, board)) {
                    if (scoreDiff[id]) {
                        scoreDiff[id]--;
                    } else {
                        scoreDiff[id] = -1;
                    }
                }
            }
        }
    }

    return scoreDiff;
}
/*
 * returns {} when not 3 players
 * @return {dict} scores {id: score}
 */
RulesSet.prototype.getScores = function(grid, board, forceClassic) {

    var scores = {};
    var gametype;

    if (forceClassic) {
        gametype = "classic";
    } else {
        gametype = board.gametype;
    }

    for (var i = 0; i < board.width; i++) {
        for (var j = 0; j < board.height; j++) {
            var id = grid[i][j];
            if (id < 0) {
                continue;
            }
            if (!scores[id]) {
                scores[id] = 0;
            }

            if (gametype === "classic") {
                scores[id]++;
            } else if (gametype === "pointcontrol") {
                var s = {
                    i : i,
                    j : j
                };
                if (this.isControlPoint(s, board)) {
                    scores[id]++;
                }
            }
        }
    }

    return scores;
}

RulesSet.prototype.getPlayerScore = function(grid, board, playerId) {

    var scores = this.getScores(grid, board);
    if (scores[playerId]) {
        return scores[playerId];
    }

    return 0;
}

/*
 * @param {grid} grid
 * @param {board} board
 */
RulesSet.prototype.gameEnded = function(grid, board) {

    if (this.movesMade >= this.totalMoves) {
        return true;
    }

    if (board.gametype === "pointcontrol") {
        for (var s in board.controlpoints) {
            var point = board.controlpoints[s];

            if (this.controlPointCapturable(grid, board, {i : point[0], j : point[1]})) {
                return false;
            }
        }

        return true;
    }

    return false;
}

RulesSet.prototype.controlPointCapturable = function(grid, board, controlPoint) {
    // Generate data
    var playersInDirection = {}
    var playersInDirectionCount = {}
    var endsEmpty = {}
    var captorId = grid[controlPoint.i][controlPoint.j] + "";

    if (captorId === -1) {
        return true;
    }

    for (var direction = 0; direction < 6; direction++) {
        playersInDirection[direction] = {};
        playersInDirectionCount[direction] = 0;
        
        var space = controlPoint;
        while (true) {
            space = this.game.spaceInDirection(space, direction);

            if (space === undefined) {
                endsEmpty[direction] = false;
                break;
            }

            var id = grid[space.i][space.j];

            if (id === -1) {
                endsEmpty[direction] = true;
                break;
            } else if (id === -2 || id === -3) {
                endsEmpty[direction] = false;
                break;
            }

            if (playersInDirection[direction][id] === undefined) {
                playersInDirection[direction][id] = true;
                playersInDirectionCount[direction]++;
            }
        }
    }

    // Check whether capturable
    var canBeCaptured = false;
    for (var direction = 0; direction < 6; direction++) {
        
        var oppositeDirection = (direction + 3) % 6;

        if (!endsEmpty[direction]) {
            continue;
        }
        
        if (endsEmpty[oppositeDirection]) {
            canBeCaptured = true;
        }

        for (var player in playersInDirection[oppositeDirection]) {
            if (playersInDirection[direction][player] === undefined) {

                if (playersInDirectionCount[oppositeDirection] === 1 && player === captorId) {
                    canBeCaptured = false;
                } else {
                    canBeCaptured = true;
                }
                break;
            }
            if (playersInDirectionCount[oppositeDirection] === 1) {
                canBeCaptured = false;
                break;
            }
        }
        
        if (canBeCaptured) {
            break;
        }
    }

    return canBeCaptured;
}


if ( typeof module === "undefined")
    module = {}

module.exports = RulesSet;

