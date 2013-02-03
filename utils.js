var sys = require('sys');
var Player = require("./public/js/player");
/*
 * @param {2dArray} grid
 * @return {2dArray} s
 */
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
    return (botCount++) + "";
}

function isInt(n) {
    return typeof n === "number" && parseFloat(n) == parseInt(n, 10) && !isNaN(n);
}

var roomCnt = 0;
function nextRoomId() {
    return (roomCnt++) + "";
}

function log(name, object) {
    if ( typeof object === "undefined") {
        console.log(name);
    } else {
        console.log(name);
        console.log(sys.inspect(object));
    }
}

function getBoard(board) {
    //TODO: move to settings
    var boards = {
        "classic" : './resources/boards/original.json',
        "pointcontrol" : './resources/boards/pointcontrol.json',
    }
    return boards[board] ? require(boards[board]) : require(boards["classic"]);
}

function dummyPlayers() {
    //TODO: maybe this should go in player class?
    var dummies = [];
    for (var i = 1; i < 4; i++) {
        var id = i;
        var dummy = new Player(id, {
            emit : function() {
            }
        });
        dummy.removed = true;
        dummies.push(dummy);
    }
    return dummies;
}

exports.deepCopy = deepCopy;
exports.newBotId = newBotId;
exports.isInt = isInt;
exports.nextRoomId = nextRoomId;
exports.log = log;
exports.getBoard = getBoard;
exports.dummyPlayers = dummyPlayers;
