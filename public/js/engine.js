
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
	var grid = new Array(9);
	for (var i = 0; i < 9; i++) {
		grid[i] = new Array(8);
		for (var j = 0; j < 8; j++) {
			if (j == 0 && (i < 2 || i > 6)) {
				grid[i][j] = -2;

			} else if ((j == 1 || j == 5 || j == 6) && (i == 0 || i == 8)) {
				grid[i][j] = -2;

			} else if (j == 7 && !(i == 3 || i == 5)) {
				grid[i][j] = -2;

			} else {
				grid[i][j] = -1;
			}
		}
	}
	return grid;
}

Game.prototype.newGame = function() {
	this.grid = this.newBoard();
	this.grid[3][3] = this.room.players[0].id;
	this.grid[5][4] = this.room.players[0].id;
	this.grid[4][2] = this.room.players[1].id;
	this.grid[4][4] = this.room.players[1].id;
	this.grid[3][4] = this.room.players[2].id;
	this.grid[5][3] = this.room.players[2].id;
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

    if (space.i < 0 || space.i > 8 || space.j < 0 || space.j > 7) {
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

// returns possible move in direction
//TODO: check redundant code against Game.spacesFrom
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
    
    while (true) {
        nextSpace = this.spaceInDirection(nextSpace, direction);
        if (!nextSpace) {
            break;
        }
        nextValue = this.grid[nextSpace.i][nextSpace.j];
        if (nextValue === startId || nextValue === -2) {
            return undefined;
        } else if ((nextSpace.i == 4 && nextSpace.j == 2) || ((nextSpace.j == 3 || nextSpace.j == 4) && (nextSpace.i >=3 && nextSpace.i <= 5))) {
            return undefined;
        }
        
        spaces.push(nextSpace);

        if (nextValue == -1) {
            break;
        }
    }

    if (spaces.length === 0) {
        return undefined;
    }

    return spaces;
}

//returns list of possible moves
//Only called by client
Game.prototype.generateMoves = function(start) {
    var moves = {};
    for (var direction = 0; direction < 6; direction++) {
        var spaces = this.generateMoveInDirection(start, direction);
        if (spaces) {
            var space = spaces[spaces.length -1 ];
            moves[[space.i, space.j]] = spaces;
        }
    }
    return moves;
}

// returns array of spaces in straight line from start to end, if possible
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
            if (space && space.i === end.i && space.j === end.j) {
                return true;
            }
    }
    return false;
}

Game.prototype.move = function(start, end) {
	// Make grid changes
	var startId = this.grid[start.i][start.j];
    var spaces = this.spacesFrom(start, end);
    if(!spaces){
		console.log("no spaces");
		return;    	
    }
    for (var i = 0; i < spaces.length; i++) {
        var space = spaces[i];
        this.grid[space.i][space.j] = startId;
    }
}

//return array of player scores in turn order
//return [0, 0, 0] when not 3 players
Game.prototype.getScores = function() {

    if (this.room.players.length !== 3) {
        return [0, 0, 0];
    }

    var scores = {};
    for (var i = 0; i < 3; i++) {
        scores[this.room.players[i].id] = 0;
    }

    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 8; j++) {
            var id = this.grid[i][j];
            if (id === -1 || id === -2) {
                continue;
            }
            scores[id]++;
        }
    }
    return [scores[this.room.players[0].id],
            scores[this.room.players[1].id],
            scores[this.room.players[2].id]];
}

Game.prototype.getPlayerScore = function(playerId) {
	var score = 0;
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 8; j++) {
            var id = this.grid[i][j];
            if(id === playerId){
            	score++;
            }
        }
    }
    return score;
}

//replace grid instances of playerFrom, to playerTO
Game.prototype.replacePlayer = function(playerFromId, playerToId){
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 8; j++) {
            if (this.grid[i][j] === playerFromId) {
                this.grid[i][j] = playerToId;
            }
        }
    }
}
if(typeof module == "undefined")
	module={}
module.exports = Game;

