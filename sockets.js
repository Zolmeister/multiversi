var Games = {};
//dict of rooms by id
var Room = require("./room");
var util = require("./utils");
var settings = require("./settings");
/*
 * @constructor
 * @this {Player}
 * @param {id} id
 * @param {socket} socket
 */
function Player(id, socket) {
	this.id = id;
	this.socket = socket;
	this.score = 0;
	this.bot = false;
}

//TODO: proper error handling and input validation
//TODO: obscure room IDs to prevent joining private games
module.exports = function(socket) {
	var id = socket.id;
	var player = new Player(id, socket);
	var room;

	socket.on("join", function(data) {
		//data: {room: target room id}
		if (!data || !util.isInt(data.room)) {
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
		var newRoom = new Room(data.gametype);
		var isPrivate = data.isPrivate;
		var bots = data.bots;
		if (isPrivate) {
			if (bots) {
				newRoom.add(player, function(targetRoom) {
					room = targetRoom;
				});
				newRoom.setAdmin(player);
				for (var i = 0; i < 2; i++) {
					newRoom.addBot(player);
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
		//data: {action: kick|ban|start|addBot, target: playerId}
		//TODO: bans by IP, instead of bans by player Id
		//TODO: data validation
		var action = data.action;
		var targetPlayer = room.getPlayer(data.target);
		if (room.admin === player || settings.DEBUG) {
			if (action === "kick") {
				room.kick(targetPlayer);
			} else if (action === "ban") {
				room.ban(targetPlayer);
			} else if (action === "start") {
				room.adrminStart();
			} else if (action === "addBot") {
				room.addBot();
			} else {
				socket.emit("error", "bad call");
			}
		}
	})

	socket.on("move", function(data) {
		//data: {start: {i: , j: }, end: {i: , j: }}
		if (room) {
			room.move(data, player);
		}
	})
}
