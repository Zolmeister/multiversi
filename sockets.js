var Games = {};
//dict of rooms by id
var Room = require("./room");
var util = require("./utils");
var settings = require("./settings");
var Player = require("./public/js/player");
var playersNotInGames = [];
var openGames = [];

function calcOpenGames() {
	openGames = [];
	for (var i in Games) {
		if (Games[i].openIds.length >= 1 && Games[i].isPublic) {
			//private games that have started become public
			openGames.push({
				roomId : parseInt(i),
				players : Games[i].playerCount()
			});
		}
	}
	for (var i in playersNotInGames) {
		playersNotInGames[i].socket.emit("rooms", openGames);
	}
	util.log("open games", openGames)
	//util.log("sent to", playersNotInGames)
}

//TODO: proper error handling and input validation
//TODO: obscure room IDs to prevent joining private games
module.exports = function(socket) {
	var id = socket.id;
	var player = new Player(id, socket);
	var room;
	playersNotInGames.push(player);
	socket.emit("rooms", openGames);
	function addPlayer(targetRoom, player, callback) {
		if(!targetRoom || !player){
			return;
		}
		targetRoom.add(player, function(targetRoom) {
			util.log("player added")
			room = targetRoom;
			playersNotInGames.splice(playersNotInGames.indexOf(player), 1);
			calcOpenGames();
			if (callback) {
				callback(targetRoom);
			}
		})
	}

	socket.on("join", function(data) {
		//data: {room: target room id}
		if (!data || !util.isInt(data.room)) {
			socket.emit("error", "joining room, bad data")
			return;
		}
		var roomNumber = data.room;
		var targetRoom = Games[roomNumber];
		addPlayer(targetRoom, player);
	})
	
	function removeRoom(room){
		delete Games[room.id];
	}
	
	function leaveRoom() {
		if (room) {
			util.log("player left room");
			room.remove(player);
			if(room.playerCount() === 0 ){
				removeRoom(room);
			}
			calcOpenGames();
			room = undefined;
		}
		
	}


	socket.on("leaveRoom", function() {
		playersNotInGames.push(player);
		leaveRoom();
	})

	socket.on("disconnect", function() {
		//to prevent memory leaks
		var index = playersNotInGames.indexOf(player);
		if(index !== -1){
			playersNotInGames.splice(index, 1);
		}
		leaveRoom();
	})

	socket.on("createGame", function(data) {
		//data: {isPrivate: boolean, bots: boolean}
		var newRoom = new Room(data.gametype);
		var isPrivate = data.isPrivate;
		var bots = data.bots;
		addPlayer(newRoom, player, function(targetRoom) {
			if (isPrivate) {
				newRoom.setAdmin(player.id);
				if (bots) {
					for (var i = 0; i < 2; i++) {
						newRoom.addBot();
					}
				} else {
					newRoom.privatize();
				}
			}
			Games[newRoom.id] = newRoom;
			calcOpenGames();
		});
	})

	socket.on("roomAdmin", function(data) {
		//data: {action: kick|ban|start|addBot, target: playerId}
		//TODO: bans by IP, instead of bans by player Id
		//TODO: data validation
		var action = data.action;
		var targetPlayer = room.getPlayer(data.target);
		if (room.admin === player.id || settings.DEBUG) {
			if (action === "kick") {
				room.kick(targetPlayer);
			} else if (action === "ban") {
				room.ban(targetPlayer);
			} else if (action === "start") {
				room.adrminStart();
			} else if (action === "addBot") {
				room.addBot();
				calcOpenGames();
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
