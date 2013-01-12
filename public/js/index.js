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
        } else if (e.state === "room") {
            room.connect().join(inRoom);
        }
    })
    //TODO: see if this causes a race condition
    ko.applyBindings(room);
});
