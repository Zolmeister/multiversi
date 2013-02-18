//Given a grid and a player ID, bot returns its move
var Game = require("./public/js/engine");
var util = require("./utils");
/*
 * @constructor
 * @this {Bot}
 */
var Bot = function(board) {
    this.engine = new Game(util.dummyPlayers(), board);
    this.id = util.newBotId();
    this.score = 0;
    this.socket = {
        emit : function() {
        }
    };
    this.bot = true;
    this.removed = false;
    this.isAdmin = false;
}
/*
 * @param {grid} grid
 * @return {move}
 * {move} = {start:{Position}, end: {Position}}
 */
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
    for (var i = 0; i < this.engine.board.width; i++) {
        for (var j = 0; j < this.engine.board.height; j++) {
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

    if (bestScore === -1) {
        bestStart = "pass";
        bestEnd = "pass";
    }

    return {
        start : bestStart,
        end : bestEnd
    };
}

module.exports = Bot;

