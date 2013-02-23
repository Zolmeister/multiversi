var sys = require('sys');
var fs = require('fs');
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

var roomCnt = Math.floor(Math.random()*10000)+10000;
var nums = []
var letters = []
for (var i = 0; i<62; i++){
    nums[i]=i
    var n = i+48//48 is number 0 in ascii
    if(n>57){
        n+=7//skip between numbers and capital letters
    }
    if(n>90){
        n+=6//skip between caps and lower case
    }
    letters[i] = String.fromCharCode(n);
}

function shuffle(array) {
    var tmp, current, top = array.length;

    if(top) while(--top) {
        current = Math.floor(Math.random() * (top + 1));
        tmp = array[current];
        array[current] = array[top];
        array[top] = tmp;
    }

    return array;
}
shuffle(letters)

function nextRoomId() {
    tmp = roomCnt
    digits=[]
    while(tmp>0){
        remainder = tmp%62
        digits.push(remainder)
        tmp/=62
        tmp=Math.floor(tmp)
    }
    
    roomCnt++
    digits = digits.map(function(x){
        return letters[nums.indexOf(x)]
    })
    return digits.join("");
}

function log(name, object) {
    if ( typeof object === "undefined") {
        console.log(name);
    } else {
        console.log(name);
        console.log(sys.inspect(object));
    }
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

function getTimeLeft(timeout) {
    return Math.ceil((timeout._idleStart.getTime() + timeout._idleTimeout - Date.now()) / 1000);
}

var boardPrefix = {
    "classic" : './resources/boards/classic/',
    "pointcontrol" : './resources/boards/pointcontrol/'
}
var boardFiles = {
    "classic" : fs.readdirSync('./resources/boards/classic/'),
    "pointcontrol" : fs.readdirSync('./resources/boards/pointcontrol/')
};
var boards = {};

function getBoard(gametype) {
    if (boardFiles[gametype]) {
        var filename = boardPrefix[gametype] + boardFiles[gametype][Math.floor(Math.random() * boardFiles[gametype].length)];

        if (boards[filename] === undefined) {
            boards[filename] = require(filename);
        }

        return boards[filename];
    }

    return undefined;
}

function getBoardFile(filename) {
    var filename = './resources/boards/' + filename; 

    if (!boards[filename]) {
        boards[filename] = require(filename); 
    }

    return boards[filename];
}

exports.deepCopy = deepCopy;
exports.newBotId = newBotId;
exports.isInt = isInt;
exports.nextRoomId = nextRoomId;
exports.log = log;
exports.dummyPlayers = dummyPlayers;
exports.getTimeLeft = getTimeLeft;
exports.getBoard = getBoard;
exports.getBoardFile = getBoardFile;
