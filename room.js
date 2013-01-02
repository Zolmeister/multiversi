var Game = require("./public/js/engine");

var roomCnt = 0;
function nextRoomId() {
	return roomCnt++;
}

function Room() {
	this.id = nextRoomId();
	//TODO: replace with uuid?
	this.players = [];
	//list of player objects
	this.openIds = [];
	//list of removed player ids, for grid replacement
	this.banned = [];
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

Room.prototype.currentPlayerId = function() {
	return this.players[this.turn].id;
}
//TODO: do this more efficiently (perhaps using map/clone)
Room.prototype.publicPlayerList = function() {//send only select information to clients
	var playerList = [];
	for (var i in this.players) {
		var p = this.players[i];
		if (!p) {
			playerList.push(undefined);
			continue;
		}

		var player = {
			id : p.id,
			//color : p.color,
			//color is now based on index in player list
			bot : p.bot
		}
		playerList.push(player);
	}
	return playerList;
}
Room.prototype.update = function(target, data) {
	console.log(target)
	console.log(data)
	this.sendAll("update", {
		target : target,
		data : data
	});
}
//2 cases, either a game has started and we need to replace a removed player, or were still adding players
Room.prototype.add = function(player, callback) {
	if ((this.openIds.length >= 1 || this.players.length < 3) && this.banned.indexOf(player) === -1 && this.players.indexOf(player) === -1) {
		var sentBoard = false;
		if (this.players.length < 3) {// add player
			this.players.push(player);
		} else {//this.openIds.length >= 1
			//replace previously removed player
			var openId = this.openIds.shift();
			//pop left
			var slot = undefined;
			for (var i = 0; i < this.players.length; i++) {
				if (!this.players[i]) {//check if player has been removed from game
					slot = i;
					break;
				}
			}
			if (typeof slot ==="undefined") {
				console.log("no slot")
				return;
			}
			this.players[slot] = player;
			//replace open space with new player
			this.game.replacePlayer(openId, player.id);
			//replace previous player
			this.update("board", this.game.grid);
			//TODO: make this more efficient
			sentBoard = true;
		}

		this.update("players", this.publicPlayerList());
		var playerSocket = player.socket;
		playerSocket.emit("update", {
			target : "me",
			data : player.id
		});
		if (!sentBoard) {
			playerSocket.emit("update", {
				target : "board",
				data : this.game.grid
			});
		}
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
Room.prototype.remove = function(player) {
	var index = this.players.indexOf(player)
	if (index !== -1) {
		this.playing = false;
		if (this.players.length < 3) {//if game is not full yet
			this.players.splice(index, 1);
			//remove player from player list
		} else {//open up player slot for replacement
			this.openIds.push(this.players[index].id);
			this.players[index] = undefined;
			//relaced with undefined
		}

		this.update("gameState", this.gameState());
		this.update("players", this.publicPlayerList());
	}
}
Room.prototype.sendAll = function(name, data) {//send to all players
	for (var i in this.players) {
		if (!this.players[i])
			continue;
		this.players[i].socket.emit(name, data);
	}
}
Room.prototype.move = function(data, player) {
	console.log("move")
	var valid = this.game.validateMove(data.start, data.end);
	if (!valid) {
		console.log("bad move");
		return;
	}

	this.game.move(data.start, data.end);
	this.sendAll("move", data)
	this.turn = ++this.turn % 3;
	this.update("gameState", this.gameState())
}
Room.prototype.kick = function(target, kicker) {
	if (this.admin === kicker) {
		//kick target
		this.remove(target);
	}
}
Room.prototype.ban = function(target, banner) {
	if (this.admin === banner) {
		//ban target
		this.kick(target, banner);
		this.banned.push(target);
	}
}
Room.prototype.adminStart = function(starter) {
	if (this.admin === starter && !this.isPublic) {
		this.isPublic = true;
		this.update("gameState", this.gameState())
	}
}
//only call this with 3 players in players list
Room.prototype.newGame = function() {
	this.playing = true;
	this.game.newGame();
	this.turn = 0;
	this.update("gameState", this.gameState());
	this.update("board", this.game.grid);
}
//TODO: make more efficient
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
