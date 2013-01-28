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

    this.joinRoomClick = function(room) {
        self.joinRoom(room.roomId);
    }

    window.addEventListener('popstate', this.windowEvent);
    ko.applyBindings(this.room, $("#roomView")[0]);

    globalConnect().socket.on('gameState', function(data) {
        if (!self.room()) {
            if (data.room && data.board && data.me) {
                self.setRoom(data.room, data.board, data.me, data.grid);
                self.room().update(data);
            }
        } else {
            self.room().update(data);
        }
    })
    globalConnect().socket.on("removed", function() {
        this.leaveRoom();
    });
}

Lobby.prototype.setRoom = function(roomId, board, me, grid) {
    if (window.history.state !== "room") {
        window.history.pushState("room", "room", "/room/" + roomId)
    }
    this.room(new Room(roomId, board, me, grid));
}
//TODO: move to lobby class
Lobby.prototype.createRoom = function(self, e, isPrivate, bots, type) {
    globalConnect().createGame(isPrivate, bots, type);
}

Lobby.prototype.createRoomBots = function(self) {
    self.createRoom(self, null, true, true, GAMETYPE);
}

Lobby.prototype.createRoomPrivate = function(self) {
    self.createRoom(self, null, true, false, GAMETYPE);
}

Lobby.prototype.leaveRoom = function() {
    if (this.room()) {
        this.room().selfDestruct();
        this.room(undefined);
        globalConnect().leaveRoom();
        if (window.history.state === "room") {
            window.history.back();
        }
    }
}

Lobby.prototype.joinRoom = function(roomId) {
    globalConnect().join(roomId);
}

Lobby.prototype.inRoom = function() {
    var num = parseInt(window.location.href.split("/").pop());
    if (!isNaN(num) && typeof num === "number") {
        return num
    }
}