/*
 * @constructor
 * @this {RulesSet}
 */
//function RulesSet(game) {
function RulesSet() {
	this.controlPoints = [];
    this.movesMade = 0;
    this.totalMoves = 0;
};

/*
 * @return {grid}
 */
RulesSet.prototype.newBoard = function(board, players) {
    
    this.controlPoints = [];
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
            this.controlPoints.push({i : space[0], j : space[1]});
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
RulesSet.prototype.canJumpSpace = function(space) {
	return true;
}

/*
 * @param {grid} grid
 * @param {board} board
 */
RulesSet.prototype.gameEnded = function(grid, board) {

    if (this.movesMade >= this.totalMoves) {
        return true;
    }

    return false;
}

/*
 * @param {Position} space
 * return {boolean}
 */
RulesSet.prototype.isControlPoint = function(space) {
    for (var i in this.controlPoints) {
        var s = this.controlPoints[i];
        if (space.i === s.i && space.j === s.j) {
            return true;
        }
    }

    return false;
}

/*
 * @param {BoardDiff} boardDiff
 * return {ScoreDiff}
 */
RulesSet.prototype.getScoreDiff = function(boardDiff, gametype) {
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
            
            if (gametype === "classic") {
                if (scoreDiff[id]) {
                    scoreDiff[id]++;
                } else {
                    scoreDiff[id] = 1;
                }
            } else if (gametype === "pointcontrol") {
                if (this.isControlPoint(space)) {
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
            if (gametype === "classic") {
                if (scoreDiff[id]) {
                    scoreDiff[id]--;
                } else {
                    scoreDiff[id] = -1;
                }
            } else if (gametype === "pointcontrol") {
                if (this.isControlPoint(space)) {
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
                var s = {i: i, j: j};
                if (this.isControlPoint(s)) {
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

if (typeof module === "undefined")
	module = {}

module.exports = RulesSet;

