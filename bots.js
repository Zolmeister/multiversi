//Given a grid and a player ID, bot returns its move
var Game = require("./public/js/engine");
var util = require("./utils");
var Bot = function() {
	this.engine = new Game({});
	this.id = util.newBotId();
	this.score = 0;
	this.socket = {
		emit : function() {
		}
	};
	this.bot = true;
}

Bot.prototype.nextMove = function(grid) {
	this.engine.grid = grid;
	var bestStart = {
		i : 0,
		j : 0
	};
	var bestEnd = {
		i : 0,
		j : 0
	};
	var bestScore = -1;
	var savedGrid = util.deepCopy(grid);
	for (var i = 0; i < 9; i++) {
		for (var j = 0; j < 8; j++) {
			if (this.engine.grid[i][j] === this.id) {
				var start = {
					i : i,
					j : j
				}
				var moves = this.engine.generateMoves(start);
				for (var m in moves) {
					var move = moves[m].move;
					if (!this.engine.validateMove(start, move, this.id))
						continue;
					this.engine.move(start, move);
					var score = this.engine.getPlayerScore(this.id);
					if (score > bestScore) {
						bestScore = score;
						bestStart = start;
						bestEnd = move;
					}
					this.engine.grid = util.deepCopy(savedGrid);
				}
			}
		}
	}
	return {
		start : bestStart,
		end : bestEnd
	};
}

module.exports = Bot;