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
		grid[3][3] = players[0].id;
		grid[5][4] = players[0].id;
		grid[4][2] = players[1].id;
		grid[4][4] = players[1].id;
		grid[3][4] = players[2].id;
		grid[5][3] = players[2].id;
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
if ( typeof module === "undefined")
	module = {}

module.exports = RulesSet;

