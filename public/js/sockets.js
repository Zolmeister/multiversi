//TODO: make this a self contained library?
var socket = io.connect();

socket.on("update", function(data) {
	console.log("update:");
	console.log(data);
})

socket.on("rooms", function(data) {
	console.log("rooms:");
	console.log(data);
})

socket.on("error", function(data) {
	console.error(data);
})
function join(roomId) {
	socket.emit("join", {
		room : roomId
	});
}

function getRooms() {
	socket.emit("getRooms");
}

function leaveRoom() {
	socket.emit("leaveRoom");
}

function createGame(isPrivate, bots) {
	isPrivate = isPrivate || false;
	bots = bots || false;
	socket.emit("createGame", {
		isPrivate : isPrivate,
		bots : bots
	});
}

function roomAdmin(action, target) {
	socket.emit("roomAdmin", {
		action : action,
		target : target
	});
}

function move(data) {
	socket.emit("move", data);
}
