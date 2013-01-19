function Lobby() {
    var self = this;
    this.room = ko.observable(undefined);
    var dynamicJoin = this.inRoom();
    window.history.replaceState("lobby", "lobbly", "/");

    //joining an active game
    if ( typeof dynamicJoin !== "undefined") {
        this.joinRoom(dynamicJoin);
    }
    this.windowEvent = function(e) {
        var inRoom = self.inRoom();

        if (e.state === "lobby" && isNaN(inRoom)) {
            console.log("lobby, leaving room");
            self.leaveRoom();
        } else if (e.state === "room") {
            self.joinRoom(inRoom);
        }

    }
    window.addEventListener('popstate', this.windowEvent);

    ko.applyBindings(this.room, $("#roomView")[0]);
}

//TODO: move to lobby class
Lobby.prototype.createRoom = function(self, e, isPrivate, bots, type) {
    this.room(new Room());
    globalConnect().createGame(isPrivate, bots, type);
}

Lobby.prototype.createRoomBots = function(self) {
    self.createRoom(self, null, true, true, GAMETYPE);
}

Lobby.prototype.createRoomPrivate = function(self) {
    self.createRoom(self, null, true, false, GAMETYPE);
}

Lobby.prototype.leaveRoom = function() {
    this.room(undefined);
    globalConnect().socket.removeAllListeners('gameState')
    globalConnect().socket.removeAllListeners('removed')
    globalConnect().leaveRoom();
}

Lobby.prototype.joinRoom = function(roomId) {
    this.room(new Room());
    globalConnect().join(roomId);
}

Lobby.prototype.inRoom = function() {
    var num = parseInt(window.location.href.split("/").pop());
    if (!isNaN(num) && typeof num === "number") {
        return num
    }
}