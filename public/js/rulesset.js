/*
 * @constructor
 * @this {RulesSet}
 */
function RulesSet(game) {
	this.width = 0;
	this.height = 0;
	this.game = game;
	this.board = this.game.board;
};

/*
 * @return {grid}
 */
RulesSet.prototype.newBoard = function() {

	this.width = this.board.width;
	this.height = this.board.height;

	var grid = new Array(this.width);
	for (var i = 0; i < this.width; i++) {
		grid[i] = new Array(this.height);
		for (var j = 0; j < this.height; j++) {
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

	return grid;
}

/*
 * @param {grid} grid
 * @param {list: players} players
 */
RulesSet.prototype.setInitialPositions = function(grid, players) {
	if (players.length === 3) {

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
	//if (space.i == 4 && space.j == 3) {
	//    return false;
	//}

	return true;
}

/*
 * @param {BoardDiff} boardDiff
 * return {ScoreDiff}
 */
RulesSet.prototype.getScoreDiff = function(boardDiff) {

    /*
     * BoardDiff = {
     *     gained: {
     *         id: [spaces],
     *         id: ...
     *     },
     *     lost: {
     *         id: [spaces],
     *         id: ...
     *     }
     * }
     */
	//var startId = this.grid[start.i][start.j];
	//var spaces = this.spacesFrom(start, end);
	//var scoreDiff = {};
	//scoreDiff[startId] = 0;

	//if (!spaces) {
	//	console.log("no spaces");
	//	return;
	//}

	//for (var i = 0; i < spaces.length; i++) {
	//	var space = spaces[i];
	//	var gridSpace = this.grid[space.i][space.j];

	//	if (gridSpace !== startId) {
	//		if (scoreDiff[gridSpace]) {
	//			scoreDiff[gridSpace]--;
    //        } else {
	//			scoreDiff[gridSpace] = -1;
    //        }
	//		scoreDiff[startId]++;
	//	}

	//	this.grid[space.i][space.j] = startId;
	//}
	//return scoreDiff;

    var scoreDiff = {};
    for (var id in boardDiff.gained) {
        var spaces = boardDiff.gained[id];

        for (var s in spaces) {
            var space = spaces[s];
            if (scoreDiff[id]) {
                scoreDiff[id]++;
            } else {
                scoreDiff[id] = 1;
            }
        }
    }
    
    for (var id in boardDiff.lost) {
        var spaces = boardDiff.lost[id];

        for (var s in spaces) {
            var space = spaces[s];
            if (scoreDiff[id]) {
                scoreDiff[id]--;
            } else {
                scoreDiff[id] = -1;
            }
        }
    }

    return scoreDiff;
}

if ( typeof module === "undefined")
	module = {}

module.exports = RulesSet;

