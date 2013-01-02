var Games = {};
//dict of rooms by id
var Room = require('./room');

function Player(id, socket) {
	this.id = id;
	this.socket = socket;
	//this.color
	//color is now based on index in player list
	this.bot = false;
}

function isInt(n) {
	return typeof n === "number" && parseFloat(n) == parseInt(n, 10) && !isNaN(n);
}

function getPlayer(room, id) {
	for (var i in room.players) {
		var player = room.players[i]
		if (player.id == id) {
			return player;
		}
	}
}

//TODO: proper error handling and input validation
//TODO: obscure room IDs to prevent joining private games
module.exports = function(socket) {
	var id = socket.id;
	var player = new Player(id, socket);
	var room;

	socket.on("join", function(data) {
		//data: {room: target room id}
		if (!data || !isInt(data.room)) {
			socket.emit("error", "joining room, bad data")
			return;
		}
		var roomNumber = data.room;
		var targetRoom = Games[roomNumber];
		if (targetRoom) {
			targetRoom.add(player, function(targetRoom) {
				room = targetRoom;
			});
		} else {
			socket.emit("error", "joining room");
		}
	})

	socket.on("getRooms", function(data) {
		//data: {}
		var open = [];
		for (var i in Games) {
			if (!Games[i].playing && Games[i].isPublic) {
				//private games that have started become public
				open.push({
					roomId : i,
					players : Games[i].players.length
				});
			}
		}
		//open: [{roomId: id, players: int}]
		socket.emit("rooms", open);
	})
	function leaveRoom() {
		if (room) {
			room.remove(player);
		}
	}


	socket.on("leaveRoom", function() {
		leaveRoom();
	})

	socket.on("disconnect", function() {
		leaveRoom();
	})

	socket.on("createGame", function(data) {
		//data: {isPrivate: boolean, bots: boolean}
		var newRoom = new Room();
		var isPrivate = data.isPrivate;
		var bots = data.bots;
		if (isPrivate) {
			if (bots) {
				newRoom.add(player, function(targetRoom) {
					room = targetRoom;
				});
				newRoom.setAdmin(player);
				for (var i = 0; i < 2; i++) {
					var bot = new Player("bot", {
						emit : function() {
						}
					});
					//faked socket
					bot.bot = true;
					newRoom.add(bot);
				}
			} else {
				newRoom.add(player, function(targetRoom) {
					room = targetRoom;
				});
				newRoom.setAdmin(player);
				newRoom.privatize();
			}
		} else {
			newRoom.add(player, function(targetRoom) {
				room = targetRoom;
			});
		}
		Games[newRoom.id] = newRoom;
	})

	socket.on("roomAdmin", function(data) {
		//data: {action: kick|ban|start, target: playerId}
		//TODO: bans by IP, instead of bans by player Id
		//TODO: data validation
		var action = data.action;
		var targetPlayer = getPlayer(room, data.target);
		if (action === "kick") {
			room.kick(targetPlayer, player);
		} else if (action === "ban") {
			room.ban(targetPlayer, player);
		} else if (action === "start") {
			room.adrminStart(player);
		} else {
			socket.emit("error", "bad call");
		}
	})

	socket.on("move", function(data) {
		//data: {start: {i: , j: }, end: {i: , j: }}
		if (room) {
			room.move(data, player);
		}
	})
}
