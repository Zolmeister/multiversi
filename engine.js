//room: {players: [list of player Objects], turn: player object}
function Game(room) {
	this.room = room;
	this.grid = this.newBoard();
};

var directions = {
	upRight : 0,
	up : 1,
	upLeft : 2,
	downLeft : 3,
	down : 4,
	downRight : 5
}
// Util
Game.prototype.newBoard = function() {
	this.grid = new Array(9);
	for (var i = 0; i < 9; i++) {
		this.grid[i] = new Array(8);
		for (var j = 0; j < 8; j++) {
			if (j == 0 && (i < 2 || i > 6)) {
				this.grid[i][j] = -2;

			} else if ((j == 1 || j == 5 || j == 6) && (i == 0 || i == 8)) {
				this.grid[i][j] = -2;

			} else if (j == 7 && !(i == 3 || i == 5)) {
				this.grid[i][j] = -2;

			} else {
				this.grid[i][j] = -1;
			}
		}
	}
}
//players: list of 3 player objects
Game.prototype.newGame = function(players) {
	this.grid = this.newBoard();
	this.grid[3][3] = this.room.players[1];
	this.grid[5][4] = this.room.players[0];
	this.grid[4][2] = this.room.players[1];
	this.grid[4][4] = this.room.players[1];
	this.grid[3][4] = this.room.players[2];
	this.grid[5][3] = this.room.players[2];
}

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

	return space;
}

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
		// up-left
		if (dj < 0) {
			if (di % 2 === 0) {
				if (dj === di / 2) {
					return directions.upLeft;
				}
			} else {
				if (start.i % 2 === 1) {
					if (dj === (di - 1) / 2) {
						return directions.upLeft;
					}
				} else {
					if (dj === (di + 1) / 2) {
						return directions.upLeft;
					}
				}
			}
			// down-left
		} else if (dj > 0) {
			if (di % 2 === 0) {
				if (dj == di / -2) {
					return directions.downLeft;
				}
			} else {
				if (start.i % 2 === 1) {
					if (dj === (di + 1) / -2) {
						return directions.downLeft;
					}
				} else {
					if (dj === (di - 1) / -2) {
						return directions.downLeft;
					}
				}
			}
		}
	} else {
		// up-right
		if (dj < 0) {
			if (di % 2 === 0) {
				if (dj == di / -2) {
					return directions.upRight;
				}
			} else {
				if (start.i % 2 === 1) {
					if (dj === (di + 1) / -2) {
						return directions.upRight;
					}
				} else {
					if (dj === (di - 1) / -2) {
						return directions.upRight;
					}
				}
			}
			// down-right
		} else if (dj > 0) {
			if (di % 2 === 0) {
				if (dj == di / 2) {
					return directions.downRight;
				}
			} else {
				if (start.i % 2 === 1) {
					if (dj == (di - 1) / 2) {
						return directions.downRight;
					}
				} else {
					if (dj == (di + 1) / 2) {
						return directions.downRight;
					}
				}
			}
		}
	}

	return undefined;
}
//returns list of moves
Game.prototype.generateMoves = function(start) {

}

Game.prototype.validateMove = function(start, end) {
	if (this.grid[end.i][end.j] !== -2) {
		return false;
	}
	var moves = this.generateMoves(start);
	for (var i = 0; i < moves.length; i++) {
		if (moves[i] === end) {
			return true;
		}
	}
	return false;
	//Brad: check above code
	//var direction = this.directionFrom(start, end);
	// From start, check each space to end
}

Game.prototype.move = function(start, end) {
	// Make grid changes
	//tell room move
	// if game end, tell room
}
Game.prototype.getScore = function(player) {
	//return player score (go through grid and calc, dont keep track)
}
Game.prototype.replacePlayer = function(playerFrom, playerTO){
	//replace grid instances of playerFrom, to playerTO
}
module.exports = Game;

