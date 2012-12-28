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
	this.grid = [[]];
	//empty grid
	this.admin = undefined;
	//player
	this.started = true;
	//for private games, change to false
	this.playing = false;
	//true if 3 players
	this.turn = undefined;
	//player
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
		if (callback) {
			callback(this);
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
Room.prototype.play = function(data, player) {
	//TODO: fill this in
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
Room.prototype.start = function(starter) {
	if (this.admin === starter && !this.started) {
		//start game
		this.started = true;
		this.update("gameState", this.gameState())
	}
}
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