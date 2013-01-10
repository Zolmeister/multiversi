function isInt(n) {
	return typeof n === "number" && parseFloat(n) == parseInt(n, 10) && !isNaN(n);
}

//TODO: use zepto
//TODO: fix sockets class dependencies
window.onload = function() {
	room = new Room(new Connect());
	var inRoom = parseInt(window.location.href.split("/").pop());
	if (!isNaN(inRoom) && typeof inRoom === "number") {
		room.connect.join(inRoom);
	} else {
		room.connect.getRooms(function(rooms) {
			if (rooms.length < 1) {
				//create room
				console.log("no room, created one");
				room.connect.createGame(false, false, GAMETYPE);
			} else {
				a=rooms
				room.connect.join(rooms[0].roomId);
				//join first available room
			}
		});
	}

	//connect.join(0);
	/*room = new Room();
	 room.players=[{3:'c'},{2:'b'},{1:'a'}];
	 room.game.newGame();
	 room.me=room.players[0];
	 this.room.turn = this.room.me;
	 room.renderer.draw();*/
}

