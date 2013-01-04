function deepCopy(grid) {
	var s = [];
	if (!grid[0] || !grid[0][0])
		return [];
	for (var i = 0; i < grid.length; i++) {
		var t = []
		for (var j = 0; j < grid[0].length; j++) {
			t.push(grid[i][j]);
		}
		s.push(t);
	}
	return s;
}

var botCount = 100;
//TODO: use uuid
function newBotId() {
	return botCount++;
}

function isInt(n) {
	return typeof n === "number" && parseFloat(n) == parseInt(n, 10) && !isNaN(n);
}
var roomCnt = 0;
function nextRoomId() {
	return roomCnt++;
}

exports.deepCopy = deepCopy;
exports.newBotId = newBotId;
exports.isInt = isInt;
exports.nextRoomId = nextRoomId;