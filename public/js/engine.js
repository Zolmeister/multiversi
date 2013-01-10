var RulesSet = RulesSet || require('./rulesset.js');

var directions = {
	upRight : 0,
	up : 1,
	upLeft : 2,
	downLeft : 3,
	down : 4,
	downRight : 5
}

/*
 * @constructor
 * @this {Game}
 * @param {Room} room
 * @param {Board} board
 * room: {players: [Players]}
 */
function Game(players, board) {
	this.board = board;
    //2d array of points
    this.rules = new RulesSet();
    this.grid = this.rules.newBoard(this.board, players);
};

/*
 * @param {Board} board
 */
Game.prototype.newGame = function(players) {
    this.grid = this.rules.newBoard(this.board, players);
}

Game.prototype.getScores = function(){
	return this.rules.getScores(this.grid, this.board);
}

Game.prototype.getPlayerScore = function(playerId){
	return this.rules.getPlayerScore(this.grid, this.board, playerId);
}

Game.prototype.isControlPoint = function(s){
	return this.rules.isControlPoint(s);
}

/*
 * @param {Position} start
 * @param {number} direction
 * @return {Position}
 */
Game.prototype.spaceInDirection = function(start, direction) {
	var space = {
		i : start.i,
		j : start.j
	};

	if (direction === directions.upRight) {
		if (space.i % 2 === 1) {
			space.j -= 1;
		}
		space.i += 1;
	} else if (direction === directions.up) {
		space.j -= 1;
	} else if (direction === directions.upLeft) {
		if (space.i % 2 === 1) {
			space.j -= 1;
		}
		space.i -= 1;
	} else if (direction === directions.downLeft) {
		if (space.i % 2 === 0) {
			space.j += 1;
		}
		space.i -= 1;
	} else if (direction === directions.down) {
		space.j += 1;
	} else if (direction === directions.downRight) {
		if (space.i % 2 === 0) {
			space.j += 1;
		}
		space.i += 1;
	} else {
		return undefined;
	}

	if (space.i < 0 || space.i >= this.board.width || space.j < 0 || space.j >= this.board.height) {
		return undefined;
	}

	return space;
}

/*
 * @param {Position} start
 * @param {Position} end
 * @return {number} direction
 */
Game.prototype.directionFrom = function(start, end) {

	var di = end.i - start.i;
	var dj = end.j - start.j;

	if (di === 0) {
		if (start.j < end.j) {
			return directions.down;
		} else if (start.j > end.j) {
			return directions.up;
		}
	} else if (di < 0) {
		if (di % 2 === 0) {
			if (dj === di / 2) {
				return directions.upLeft;
			} else if (dj == di / -2) {
				return directions.downLeft;
			}
		} else {
			if (start.i % 2 === 1) {
				if (dj === (di - 1) / 2) {
					return directions.upLeft;
				} else if (dj === (di + 1) / -2) {
					return directions.downLeft;
				}
			} else {
				if (dj === (di + 1) / 2) {
					return directions.upLeft;
				} else if (dj === (di - 1) / -2) {
					return directions.downLeft;
				}
			}
		}
	} else {
		if (di % 2 === 0) {
			if (dj == di / -2) {
				return directions.upRight;
			} else if (dj == di / 2) {
				return directions.downRight;
			}
		} else {
			if (start.i % 2 === 1) {
				if (dj === (di + 1) / -2) {
					return directions.upRight;
				} else if (dj == (di - 1) / 2) {
					return directions.downRight;
				}
			} else {
				if (dj === (di - 1) / -2) {
					return directions.upRight;
				} else if (dj == (di + 1) / 2) {
					return directions.downRight;
				}
			}
		}
	}

	return undefined;
}

/*
 * @param {Position} start
 * @param {number} direction
 * @return {list} spaces {i, j}
 */
Game.prototype.generateMoveInDirection = function(start, direction) {

	if (direction >= 6 || direction < 0) {
		return undefined;
	}

	var nextSpace = {
		i : start.i,
		j : start.j
	}
	var nextValue, startId = this.grid[nextSpace.i][nextSpace.j];
	var spaces = [];

    var scores = this.rules.getScores(this.grid, this.board, true);
	while (true) {
		nextSpace = this.spaceInDirection(nextSpace, direction);
		if (!nextSpace) {
			break;
		}
		nextValue = this.grid[nextSpace.i][nextSpace.j];
		if (nextValue === startId || nextValue === -2 || nextValue === -3) {
			return undefined;
		} else if (!this.rules.canJumpSpace(nextSpace)) {
			return undefined;
		}

        scores[nextValue] -= 1;
        if (scores[nextValue] === 0) {
            return 0;
        }

		spaces.push(nextSpace);

		if (nextValue === -1) {
			break;
		}
	}
	if (nextValue !== -1 || spaces.length === 0) {
		return undefined;
	}
	return spaces;
}

/*
 * @param {Position} start
 * @return {dict} moves {'[i,j]': {list} spaces.move: {i, j}}
 */
Game.prototype.generateMoves = function(start) {
	var moves = {};
	for (var direction = 0; direction < 6; direction++) {
		var spaces = this.generateMoveInDirection(start, direction);
		if (spaces) {
			var space = spaces[spaces.length - 1];
			moves[[space.i, space.j]] = spaces;
			moves[[space.i, space.j]].move = {
				i : space.i,
				j : space.j
			};
		}
	}
	return moves;
}

/*
 * returns array of spaces in straight line from start to end, including end
 * @param {Postition} start
 * @param {Position} end
 * @return {list} spaces {i, j}
 */
Game.prototype.spacesFrom = function(start, end) {
	var direction = this.directionFrom(start, end);
	if (direction === undefined) {
		return undefined;
	}

	var spaces = this.generateMoveInDirection(start, direction);
	if (!spaces) {
		return undefined;
	}

	var space = spaces[spaces.length - 1];
	if (space.i !== end.i || space.j !== end.j) {
		return undefined;
	}

	return spaces;
}

/*
 * @param {Position} start
 * @param {Position} end
 * @param {id} playerId
 * @return {boolean}
 */
Game.prototype.validateMove = function(start, end, playerId) {
	if (this.grid[start.i][start.j] !== playerId) {
		return false;
	}
	if (this.grid[end.i][end.j] !== -1) {
		return false;
	}

	var direction = this.directionFrom(start, end);
	if (direction === undefined) {
		return false;
	}

	var spaces = this.generateMoveInDirection(start, direction);
	if (spaces && spaces.length > 0) {
		var space = spaces[spaces.length - 1];
		if (space.i === end.i && space.j === end.j) {
			return true;
		}
	}
	return false;
}

/*
 * @param {Position} start
 * @param {Position} end
 * @return {dict} scoreDiff {id: diffNumber}
 */
Game.prototype.move = function(start, end) {
	// Make grid changes
	var startId = this.grid[start.i][start.j];
	var spaces = this.spacesFrom(start, end);
	var boardDiff = {gained: {}, lost: {}};
	boardDiff.gained[startId] = [];

	if (!spaces) {
		console.log("no spaces");
		return;
	}

	for (var i = 0; i < spaces.length; i++) {
		var space = spaces[i];
		var gridSpace = this.grid[space.i][space.j];

		if (gridSpace !== startId && gridSpace !== -1) {
            if (!boardDiff.lost[gridSpace]) {
                boardDiff.lost[gridSpace] = [];
            }
            boardDiff.lost[gridSpace].push(space);
        }

        boardDiff.gained[startId].push(space);
		this.grid[space.i][space.j] = startId;
	}

    var scoreDiff = this.rules.getScoreDiff(boardDiff, this.board.gametype);
    this.rules.movesMade++;
	return scoreDiff;
}

Game.prototype.gameEnded = function() {
    return this.rules.gameEnded(this.grid, this.board);
}


/*
 * @param {id} playerFromId
 * @param {id} playerToId
 */
Game.prototype.replacePlayer = function(playerFromId, playerToId) {
	for (var i = 0; i < this.board.width; i++) {
		for (var j = 0; j < this.board.height; j++) {
			if (this.grid[i][j] === playerFromId) {
				this.grid[i][j] = playerToId;
			}
		}
	}
}

Game.prototype.setGrid = function(grid){
	this.grid = grid;
}

if (typeof module === "undefined")
	module = {}
module.exports = Game;

