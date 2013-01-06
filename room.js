var Game = require("./public/js/engine");
var Bot = require("./bots");
var util = require("./utils");
var settings = require("./settings");
/*
 * @constructor
 * @this {Room}
 */
function Room(gametype) {
	this.id = util.nextRoomId();
	//TODO: replace with uuid?
	this.players = [];
	//list of player objects
	this.openIds = [];
	//list of removed player ids, for grid replacement
	this.banned = [];
	this.board = this.getBoard(gametype);
	this.game = new Game(this);
	this.admin = undefined;
	//player
	this.turn = 0;
	//player index
	this.isPublic = true;
	//for private games, change to false
	this.started = false;
	//for new rooms, change on hit 3 players
	this.playing = false;
	//true if 3 players
}

/*
 * @param {id} id
 * @return {Player}
 */
Room.prototype.getPlayer = function(id) {
	for (var i in this.players) {
		var player = this.players[i];
		if (player.id === id) {
			return player;
		}
	}
}

Room.prototype.currentPlayerId = function() {
	return this.players[this.turn].id;
}
/*
 * TODO: do this more efficiently (perhaps using map/clone)
 * @return {list: {players}}
 * {players} = {id, score, bot, removed}
 */
Room.prototype.publicPlayerList = function() {//send only select information to clients
	var playerList = [];
	for (var i in this.players) {
		var p = this.players[i];
		var player = {
			id : p.id,
			//color : p.color,
			//color is now based on index in player list
			score : p.score,
			bot : p.bot,
			removed : p.removed
		}
		playerList.push(player);
	}
	return playerList;
}
/*
 * @param {string} target
 * @param {Object} data
 */
Room.prototype.update = function(target, data) {
	util.log(target, data)
	this.sendAll("update", {
		target : target,
		data : data
	});
}
/*
 * 2 cases, either a game has started and we need to replace a removed player, or were still adding players
 * @param {player} player
 * @param {callback} callback
 */
Room.prototype.add = function(player, callback) {
	if ((this.openIds.length >= 1 || this.players.length < 3) && this.banned.indexOf(player) === -1 && this.players.indexOf(player) === -1) {
		if (this.players.length < 3) {// add player
			this.players.push(player);
		} else {//this.openIds.length >= 1
			//replace previously removed player
			var openId = this.openIds.shift();
			//pop left
			var slot = undefined;
			for (var i = 0; i < this.players.length; i++) {
				if (this.players[i].removed) {//check if player has been removed from game
					slot = i;
					break;
				}
			}
			if ( typeof slot === "undefined") {
				util.log("no slot")
				return;
			}
			this.players[slot] = player;
			//replace open space with new player
			this.game.replacePlayer(openId, player.id);
			this.setScores();
			//replace previous player
			this.update("grid", this.game.grid);
			//TODO: make this more efficient
			sentBoard = true;
		}

		this.update("players", this.publicPlayerList());
		var playerSocket = player.socket;
		playerSocket.emit("update", {
			target : "me",
			data : player.id
		});
		playerSocket.emit("update", {
			target : "board",
			data : this.board
		});
		if (callback) {
			callback(this);
		}
		if (this.players.length === 3 && this.isPublic && !this.started) {
			//have enough people, public game, and havent started yet
			this.newGame();
		} else if (this.players.length === 3 && !this.playing) {
			//game has been started, filled last vacant seat
			this.playing = true;
			this.update("gameState", this.gameState());
		}
	}
}
/*
 * @param {player} player
 */
Room.prototype.remove = function(player) {
	var index = this.players.indexOf(player);
	if (index !== -1) {
		this.playing = false;
		if (this.players.length < 3) {//if game is not full yet
			this.players.splice(index, 1);
			//remove player from player list
		} else {//open up player slot for replacement
			this.openIds.push(this.players[index].id);
			//this.players[index] = this.removedPlayer();
			this.players[index].removed = true;
			//dont actually remove player
		}

		this.update("gameState", this.gameState());
		this.update("players", this.publicPlayerList());
	}
}
/*
 * @param {string} name
 * @param {Object} data
 */
Room.prototype.sendAll = function(name, data) {//send to all players
	for (var i in this.players) {
		this.players[i].socket.emit(name, data);
	}
}
/*
 * @param {move} data
 * @param {player} player
 * {move} = {start:{Position}, end:{Position}}
 */
Room.prototype.move = function(data, player) {
	if (player.id !== this.currentPlayerId()) {
		util.log("tried to move, but not your turn");
		return;
	}
	var valid = this.game.validateMove(data.start, data.end, player.id);
	if (!valid) {
		util.log("bad move");
		util.log(player.id)
		util.log(data);
		return;
	}
	var scoreDiff = this.game.move(data.start, data.end);
	this.mergeScores(scoreDiff);
	this.sendAll("move", data);
	this.turn = ++this.turn % 3;
	this.update("gameState", this.gameState());

	var curPlayer = this.players[this.turn];
	if (curPlayer.bot) {
		util.log("bot play")
		var move = curPlayer.nextMove(util.deepCopy(this.game.grid));
		this.move(move, curPlayer);
	}
}
/*
 * @param {dict} scores {id: scoreDiff}
 */
Room.prototype.mergeScores = function(scores) {
	var scoreDiff = scores
	for (var s in scoreDiff) {
		if (this.getPlayer(s)) {
			this.getPlayer(s).score += scoreDiff[s];
		}
	}
}
/*
 * re-sets score based on board values
 */
Room.prototype.setScores = function() {
	var scores = this.game.getScores();
	for (var s in scores) {
		if (this.getPlayer(s)) {
			this.getPlayer(s).score = scores[s];
		}
	}
}
Room.prototype.addBot = function() {
	util.log("adding bot");
	this.add(new Bot());
}
Room.prototype.kick = function(target) {
	this.remove(target);
}
Room.prototype.ban = function(target) {
	this.kick(target);
	this.banned.push(target);
}
Room.prototype.adminStart = function() {
	if (!this.isPublic) {
		this.isPublic = true;
		this.update("gameState", this.gameState())
	}
}

Room.prototype.getBoard = function(board){
	var boards = {
		"classic": './resources/boards/original.json'
	}
	return boards[board]?require(boards[board]):require(boards["classic"]);
}
//only call this with 3 players in players list
Room.prototype.newGame = function(board) {
	this.playing = true;
	this.started = true;
	this.game.newGame(this.board);
	this.setScores(this.game.getScores());
	this.turn = 0;
	this.update("gameState", this.gameState());
	this.update("players", this.publicPlayerList());
    this.update("board", this.board);
    this.update("grid", this.game.grid);
}
/*
 * TODO: make more efficient
 * @return {gameState}
 * {gameState} = {isPublic: boolean, playing: {boolean}, turn: {number}}
 */
Room.prototype.gameState = function() {
	var state = {
		isPublic : this.isPublic,
		playing : this.playing,
		turn : this.turn
	}
	return state;
}
Room.prototype.setAdmin = function(player) {
	this.admin = player;
}
Room.prototype.privatize = function() {
	this.isPublic = false;
}

module.exports = Room;
