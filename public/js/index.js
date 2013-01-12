function isInt(n) {
	return typeof n === "number" && parseFloat(n) == parseInt(n, 10) && !isNaN(n);
}

function leaveRoom() {
	room.game(undefined);
	$("#mv-canvas").hide();
	room.connect().leaveRoom();
}

function leaveButton() {
	window.history.back();
}

/*
 * window history logic
 * if coming to '/', push state as lobby
 * 		on join room, push state as room
 * 		on back button, leave room
 * if coming to '/room/X', push state as lobby
 * 		on join room, push state as room
 * 		on back button, leave room
 */
$(function() {
	var inRoom = parseInt(window.location.href.split("/").pop());
	window.history.replaceState("lobby", "lobbly", "/");
	room = new Room();
	if (!isNaN(inRoom) && typeof inRoom === "number") {
		//connecting to room via url
		room.connect().join(inRoom);
	}

	window.addEventListener('popstate', function(e) {

		var inRoom = parseInt(window.location.href.split("/").pop());
		if (e.state === "lobby" && isNaN(inRoom)) {
			console.log("lobby, leaving room");
			leaveRoom();
		} else if(e.state === "room"){
			room.connect().join(inRoom);
		}
	})
	
	//TODO: see if this causes a race condition
	ko.applyBindings(room);
});
