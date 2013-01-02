var Game = require("./public/js/engine");

var roomCnt = 0;
function nextRoomId() {
	return roomCnt++;
}

//TODO: add color
function Room() {
	this.id = nextRoomId();
	//TODO: replace with uuid?
	this.players = [];
	//list of player objects
	this.banned = [];
	this.game = new Game(this);
	this.admin = undefined;
	//player
	this.turn = 0;
	//player index
	this.started = true;
	//for private games, change to false
	this.playing = false;
	//true if 3 players
}

//TODO: do this more efficiently (perhaps using map/clone)
Room.prototype.publicPlayerList = function() {//send only select information to clients
	var playerList = [];
	for (var i in this.players) {
		var p = this.players[i];
		var player = {
			id : p.id,
			color : p.color,
			bot : p.bot
		}
		playerList.push(player);
	}
	return playerList;
}
Room.prototype.update = function(target, data) {
	console.log(target)
	console.log(data)
	for (var i in this.players) {
		this.players[i].socket.emit("update", {
			target : target,
			data : data
		});
	}
}
Room.prototype.add = function(player, callback) {
	if (this.players.length < 3 && this.banned.indexOf(player) === -1 && this.players.indexOf(player) === -1) {
		this.players.push(player);
		this.update("players", this.publicPlayerList());
		this.players[this.players.length-1].socket.emit("update",{target : "me", data: player.id})
		if (callback) {
			callback(this);
		}
		if(this.players.length===3 && this.started){
			this.newGame();
		}
	}
}
Room.prototype.remove = function(player) {
	var index = this.players.indexOf(player)
	if (index !== -1) {
		this.players.splice(index, 1);
		this.update("players", this.publicPlayerList());
	}
}
Room.prototype.move = function(data, player) {
	//TODO: fill this in
	console.log("move")
	this.game.move(data.start, data.end);
	for (var i in this.players) {
		this.players[i].socket.emit("move", data);
	}
	this.turn = ++this.turn%3;
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
	if (this.admin === starter && !this.started) {
        this.started = true;
		this.update("gameState", this.gameState())
	}
}
//only call this with 3 players in players list
Room.prototype.newGame = function(){
	this.playing=true;
    this.game.newGame();
    this.turn=0;
    this.update("gameState", this.gameState())
}
//TODO: make more efficient
Room.prototype.gameState = function() {
	var state = {
		started : this.started,
		playing : this.playing,
		turn : this.turn
	}
	return state;
}
Room.prototype.setAdmin = function(player) {
	this.admin = player;
}
Room.prototype.privatize = function() {
	this.started = false;
}

module.exports = Room; 
