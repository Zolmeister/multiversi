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
        if (!targetRoom || !player) {
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

    function firstAvailableRoomNumber() {
        for (var i in Games) {
            var room = Games[i];
            if (room.isPublic && room.playerCount() < 3 && room.banned.indexOf(player)===-1) {
                return i;
            }
        }
        return -1;
    }

    socket.on("join", function(data) {
        //data: {room: target room id}
        if (!data) {
            socket.emit("error", "joining room, bad data")
            return;
        }
        //join first available
        if (!data.room) {
            var roomNumber = firstAvailableRoomNumber();
        } else {
            var roomNumber = data.room;
        }
        var targetRoom = Games[roomNumber];
        if (!targetRoom) {
            return createGame({
                isPrivate : false,
                bots : false,
                gametype : "pointcontrol"
            });
        }
        addPlayer(targetRoom, player);
    })
    function removeRoom(room) {
        delete Games[room.id];
    }

    function leaveRoom() {
        if (room) {
            util.log("player left room");
            room.remove(player);
            if (room.noBotPlayerCount() === 0) {
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
        if (index !== -1) {
            playersNotInGames.splice(index, 1);
        }
        leaveRoom();
    })

    socket.on("createGame", createGame);

    function createGame(data) {
        //data: {isPrivate: boolean, bots: boolean, gametype: gametype}
        var newRoom = new Room(data.gametype);
        var isPrivate = data.isPrivate;
        var bots = data.bots;
        addPlayer(newRoom, player, function(targetRoom) {
            if (isPrivate) {
                newRoom.setAdmin(player);
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
    }


    socket.on("roomAdmin", function(data) {
        //data: {action: kick|ban|start|addBot, target: playerId}
        //TODO: bans by IP, instead of bans by player Id
        //TODO: data validation
        var action = data.action;
        var targetPlayer = room.getPlayer(data.target);
        if (player.isAdmin || settings.DEBUG) {
            if (action === "kick") {
                if (targetPlayer) {
                    room.kick(targetPlayer);
                }
            } else if (action === "ban") {
                if (targetPlayer) {
                    room.ban(targetPlayer);
                }
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
        if (!player.removed && room) {
            room.move(data, player);
        }
    })
}
