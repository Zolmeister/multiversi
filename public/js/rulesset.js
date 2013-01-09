/*
 * @constructor
 * @this {RulesSet}
 */
//function RulesSet(game) {
function RulesSet(game, board) {
	this.game = game;
    this.board = board;
};

/*
 * @return {grid}
 */
RulesSet.prototype.newBoard = function() {

    if (!this.board) {
        return undefined;
    }

    this.controlPoints = [];

	var grid = new Array(this.board.width);
	for (var i = 0; i < this.board.width; i++) {
		grid[i] = new Array(this.board.height);
		for (var j = 0; j < this.board.height; j++) {
			grid[i][j] = -1;
		}
	}

	for (var s in this.board.nonrendered) {
		var space = this.board.nonrendered[s];
		grid[space[0]][space[1]] = -2;
	}

	for (var s in this.board.nonjumpable) {
		var space = this.board.nonjumpable[s];
		grid[space[0]][space[1]] = -3;
	}

    if (this.board.gametype === "pointcontrol") {
        for (var s in this.board.controlpoints) {
            var space = this.board.controlpoints[s];
            grid[space[0]][space[1]] = -1;
            this.controlPoints.push({i : space[0], j : space[1]});
        }
    }

	return grid;
}

/*
 * @param {grid} grid
 * @param {list: players} players
 */
RulesSet.prototype.setInitialPositions = function(grid, players) {
	if (players && players.length === 3) {

        for (var i = 0; i < 3; i++) {
            var id = players[i].id;
            for (var s in this.board.starting[i]) {
                var space = this.board.starting[i][s];
                grid[space[0]][space[1]] = id;
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
RulesSet.prototype.getScoreDiff = function(boardDiff) {
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
            
            if (this.board.gametype === "classic") {
                if (scoreDiff[id]) {
                    scoreDiff[id]++;
                } else {
                    scoreDiff[id] = 1;
                }
            } else if (this.board.gametype === "pointcontrol") {
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
            if (this.board.gametype === "classic") {
                if (scoreDiff[id]) {
                    scoreDiff[id]--;
                } else {
                    scoreDiff[id] = -1;
                }
            } else if (this.board.gametype === "pointcontrol") {
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
RulesSet.prototype.getScores = function(gametype) {

	var scores = {};
    if (!gametype) {
        gametype = this.board.gametype;
    }

	for (var i = 0; i < this.board.width; i++) {
		for (var j = 0; j < this.board.height; j++) {
			var id = this.game.grid[i][j];
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

RulesSet.prototype.getPlayerScore = function(playerId, gametype) {
    
    var scores = this.getScores(gametype);
    if (scores[playerId]) {
        return scores[playerId];
    }

    return 0;
}

if ( typeof module === "undefined")
	module = {}

module.exports = RulesSet;

