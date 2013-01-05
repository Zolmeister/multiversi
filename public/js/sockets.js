/*
 * @constructor
 * @this {Connect}
 */
var Connect = function() {
	this.socket = io.connect();
	this.socket.on("error", function(data) {
		console.error(data);
	})
	this.join = function join(roomId) {
		this.socket.emit("join", {
			room : roomId
		});
	}

	this.getRooms = function getRooms(callback) {
		this.socket.emit("getRooms");
		this.socket.on("rooms", callback)
	}

	this.leaveRoom = function leaveRoom() {
		this.socket.emit("leaveRoom");
	}

	this.createGame = function createGame(isPrivate, bots) {
		isPrivate = isPrivate || false;
		bots = bots || false;
		this.socket.emit("createGame", {
			isPrivate : isPrivate,
			bots : bots
		});
	}

	this.roomAdmin = function roomAdmin(action, target) {
		this.socket.emit("roomAdmin", {
			action : action,
			target : target
		});
	}

	this.move = function move(data) {
		this.socket.emit("move", data);
	}
}
