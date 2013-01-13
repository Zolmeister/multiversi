/*
 * @constructor
 * @this {Connect}
 */
var Connect = function() {
    var self = this;
    this.rooms = ko.observableArray([]);
    this.socket = io.connect();

    this.socket.on("error", function(data) {
        console.error(data);
    })

    this.socket.on("rooms", function(data) {
        console.log("got rooms")
        console.log(data)
        self.rooms(data)
    })

    this.join = function join(roomId) {
        console.log("joining: " + roomId)
        this.socket.emit("join", {
            room : roomId
        });
    }

    this.leaveRoom = function leaveRoom() {
        this.socket.emit("leaveRoom");
    }

    this.createGame = function createGame(isPrivate, bots, type) {
        isPrivate = isPrivate || false;
        bots = bots || false;
        type = type || GAMETYPE;
        this.socket.emit("createGame", {
            isPrivate : isPrivate,
            bots : bots,
            gametype : type
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
