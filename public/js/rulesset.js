/*
 * @constructor
 * @this {RulesSet}
 */
function RulesSet() {
    this.width = 9;
    this.height = 8;
};
/*
 * @return {grid}
 */
RulesSet.prototype.newBoard = function() {
	var grid = new Array(this.width);
	for (var i = 0; i < this.width; i++) {
		grid[i] = new Array(this.height);
		for (var j = 0; j < this.height; j++) {
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
/*
 * @param {grid} grid
 * @param {list: players} players
 */
RulesSet.prototype.setInitialPositions = function(grid, players) {
	grid[3][3] = players[0].id;
	grid[5][4] = players[0].id;
	grid[4][2] = players[1].id;
	grid[4][4] = players[1].id;
	grid[3][4] = players[2].id;
	grid[5][3] = players[2].id;
}
/*
 * @param {Position} space
 * return {boolean}
 */
RulesSet.prototype.canJumpSpace = function(space) {
    if (space.i == 4 && space.j == 3) {
        return false;
    }

    return true;
}

if (typeof module === "undefined")
	module = {}
	
module.exports = RulesSet;

