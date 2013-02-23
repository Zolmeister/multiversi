var Games = {};
//dict of rooms by id
var Room = require("./room");
var util = require("./utils");
var settings = require("./settings");
var Player = require("./public/js/player");

function removeRoom(room) {
    delete Games[room.id];
}

//TODO: proper error handling and input validation
//TODO: obscure room IDs to prevent joining private games
module.exports = function(socket) {
    var id = socket.id;
    var player = new Player(id, socket);
    var room;

    function addPlayer(targetRoom, player, callback) {
        if (!targetRoom || !player) {
            return;
        }
        console.log("adding player to "+targetRoom.id)
        targetRoom.add(player, function(targetRoom) {
            util.log("player added")
            room = targetRoom;
            if (callback) {
                callback(targetRoom);
            }
        })
    }
    
    function canJoinRoom(room, joinDirect){
        if ((room.isPublic || joinDirect) && room.playerCount() < 3) {
            return true;
        }
        return false;
    }
    
    function firstAvailableRoomId() {
        for (var i in Games) {
            var room = Games[i];
            if(canJoinRoom(room, false)){
               return i;
            }
        }
        return -1;
    }

    function leaveRoom() {
        if (room) {
            util.log("player left room");
            room.remove(player);
            if (room.noBotPlayerCount() === 0) {
                removeRoom(room);
            }
            room = undefined;
            player.isAdmin = false;
        }
    }

    function createGame(data) {
        //data: {isPrivate: boolean, bots: boolean, gametype: gametype}
        var gametype = data.gametype ? String(data.gametype) : "classic";
        var newRoom = new Room(data.gametype);
        var isPrivate = data.isPrivate ? Boolean(data.isPrivate) : false;
        var bots = data.bots ? Boolean(data.bots) : false;
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
        });
    }


    socket.on("join", function(data) {
        console.log("user requested to join "+data.room)
        //data: {room: target room id}
        if (!data) {
            socket.emit("error", "joining room, bad data")
            return;
        }
        //join first available
        var reqRoom = Games[data.room]
        if(!reqRoom || !canJoinRoom(reqRoom, true)){
            reqRoom = Games[firstAvailableRoomId()];
        }
        if (!reqRoom) {
            return createGame({
                isPrivate : false,
                bots : false,
                gametype : "pointcontrol"
            });
        }
        addPlayer(reqRoom, player);
    })

    socket.on("leaveRoom", function() {
        leaveRoom();
    })

    socket.on("disconnect", function() {
        leaveRoom();
    })

    socket.on("createGame", createGame);

    socket.on("roomAdmin", function(data) {
        //data: {action: start|addBot, target: playerId}
        var action = data.action;
        var targetPlayer = room.getPlayer(data.target);
        //TODO: remove DEBUG flag for this
        if (player.isAdmin || settings.DEBUG) {
            if (action === "start") {
                room.adminStart();
            } else if (action === "addBot") {
                room.addBot();
            } else {
                socket.emit("error", "bad call");
            }
        }
    })

    socket.on("move", function(data) {
        //data: {start: {i: , j: }, end: {i: , j: }}
        if (!player.removed && room && data.start && data.end) {
            var start = data.start;
            var end = data.end;
            if ((util.isInt(start.i) && util.isInt(start.j) && util.isInt(end.i) && util.isInt(end.j)) || data.start === "pass"){
                room.move(data, player);
            }
        }
    })
    
    socket.on("chat", function(msg){
        if(room){
            room.sendChat(msg, player.id);
        }
    })
    
    socket.on("screenName", function(name){
        
        //max user name length is 30 characters
        name = name.substring(0,30) || "Guest"
        if(name.length<2){
            return
        }
        player.name = name
        if(room){
            room.updatePlayers();
        }
    })
}
