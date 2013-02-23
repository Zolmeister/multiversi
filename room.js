var Game = require("./public/js/engine");
var Bot = require("./bots");
var util = require("./utils");
var settings = require("./settings");
var Player = require("./public/js/player");
/*
 * @constructor
 * @this {Room}
 */
var Room = function(gametype) {
    var self = this;
    this.id = util.nextRoomId();
    //TODO: replace with uuid?
    this.openIds = [];
    //list of removed player ids, for grid replacement
    this.players = util.dummyPlayers();
    for (var player in this.players) {
        this.openIds.push(this.players[player].id);
    }
    //list of player objects
    this.banned = [];
    if (settings.DEBUG && settings.BOARD) {
        this.board = util.getBoardFile(settings.BOARD);
    } else {
        this.board = util.getBoard(gametype);
    }
    this.game = new Game(this.players, this.board);
    this.turn = 0;
    //player index
    this.isPublic = true;
    //for private games, change to false
    this.started = false;
    this.ended = false;
    //for new rooms, change on hit 3 players
    
    this.newGameTimeoutId = undefined;
}

/*
 * @param {id} id
 * @return {Player}
 */
Room.prototype.getPlayer = function(id) {
    for (var i in this.players) {
        var player = this.players[i];
        if (player.id === id) {
            return player;
        }
    }
}

Room.prototype.sendChat = function(msg, playerId) {
    this.sendAll("chat", {
        msg : msg,
        user : this.getPlayer(playerId).name
    });
}

Room.prototype.getPlayerIndex = function(id) {
    return this.players.indexOf(this.getPlayer(id));
}

Room.prototype.currentPlayerId = function() {
    if (this.players[this.turn]) {
        return this.players[this.turn].id;
    }
    return undefined;
}
/*
 * TODO: do this more efficiently (perhaps using map/clone)
 * @return {list: {players}}
 * {players} = {id, score, bot, removed}
 */
Room.prototype.publicPlayerList = function() {//send only select information to clients
    var playerList = [];
    for (var i in this.players) {
        var p = this.players[i];
        var player = {
            id : p.id,
            //color : p.color,
            //color is now based on index in player list
            score : p.score,
            bot : p.bot,
            removed : p.removed,
            isAdmin : p.isAdmin,
            name : p.name
        }
        playerList.push(player);
    }
    return playerList;
}
/*
 * @param {string} target
 * @param {Object} data
 */
Room.prototype.update = function(data) {
    this.sendAll("gameState", data);
}
Room.prototype.updatePlayers = function(){
    this.update({
        players : this.publicPlayerList()
    })
}
Room.prototype.noBotPlayerCount = function() {
    var cnt = 0;
    for (var i = 0; i < this.players.length; i++) {
        if (!this.players[i].removed && !this.players[i].bot) {//check if player has been removed from game
            cnt++;
        }
    }
    return cnt;
}

Room.prototype.playerCount = function() {
    var cnt = 0;
    for (var i = 0; i < this.players.length; i++) {
        if (!this.players[i].removed) {//check if player has been removed from game
            cnt++;
        }
    }
    return cnt;
}
/*
 * 2 cases, either a game has started and we need to replace a removed player, or were still adding players
 * @param {player} player
 * @param {callback} callback
 */
Room.prototype.add = function(player, callback) {
    if (this.openIds.length >= 1 && this.banned.indexOf(player) === -1) {
        //detect if player is trying to join more than once
        if (this.getPlayer(player.id) && !this.getPlayer(player.id).removed) {
            return;
        }

        //user left the game, and is now returning
        if (this.openIds.indexOf(player.id) !== -1) {
            var openId = this.openIds.splice(this.openIds.indexOf(player.id),1)[0];
        } else {
            var openId = this.openIds.shift();
        }
        var slot = this.getPlayerIndex(openId);
        if (slot === -1) {
            util.log("no slot")
            return;
        }
        player.removed = false;
        //replace open space with new player
        console.log("previous: " + openId + ", new: " + player.id);
        this.game.replacePlayer(openId, player.id);

        this.players[slot] = player;
        this.setScores();

        player.socket.emit("gameState", {
            room : this.id,
            me : player.id,
            board : this.board,
            isPublic : this.isPublic,
            turn : this.turn,
            players : this.publicPlayerList(),
            grid : this.game.grid,
            ended : this.ended,
            timer : this.newGameTimeoutId !== undefined ? util.getTimeLeft(this.newGameTimeoutId) : false
        });
        if (this.playerCount() === 3 || this.started) {
            this.started = true;
            this.isPublic = true;
            this.sendAll("gameState", {
                started : this.started,
                isPublic : this.isPublic
            });
        }
        this.sendAll("gameState", {
            players : this.publicPlayerList()
        }, [player]);

        if (callback) {
            callback(this);
        }
    }
}
/*
 * @param {player} player
 */
Room.prototype.remove = function(player, callback) {
    var index = this.getPlayerIndex(player.id);
    if (index !== -1) {
        util.log("removed player")
        console.log(this.players)
        this.openIds.push(this.players[index].id);
        //this.players[index] = this.removedPlayer();
        this.players[index].socket.emit("removed");
        this.players[index] = this.players[index].clone()
        this.players[index].removed = true;
        //dont actually remove player
        this.update({
            turn : this.turn,
            isPublic : this.isPublic,
            players : this.publicPlayerList()
        })
        if (callback) {
            callback();
        }
    }
}
/*
 * @param {string} name
 * @param {Object} data
 * @param {List} {Player} exclude *optional
 */
Room.prototype.sendAll = function(name, data, exclude) {//send to all players
    exclude = exclude || [];
    for (var i in this.players) {
        if (!this.players[i].bot && !this.players[i].removed && exclude.indexOf(this.players[i]) === -1) {
            this.players[i].socket.emit(name, data);
        }
    }
}
/*
 * @param {move} data
 * @param {player} player
 * {move} = {start:{Position}, end:{Position}}
 */
Room.prototype.move = function(data, player, callback) {
    if (player.id !== this.currentPlayerId()) {
        if (callback) {
            callback("tried to move, but not your turn");
        }
        return;
    }

    if (data.start !== "pass") {
        var valid = this.game.validateMove(data.start, data.end, player.id);
        if (!valid) {
            var d = data;
            d.id = player.id;
            if (callback) {
                callback("bad move");
            }
            return;
        }

        var boardDiff = this.game.move(data.start, data.end);
        this.mergeScores(this.game.scoreDiff(boardDiff));
    }

    // Next turn
    this.turn = ++this.turn % 3;
    this.update({
        move : data,
        turn : this.turn
    });
    if (callback) {
        callback();
    }

    if (this.game.gameEnded()) {
        util.log("game ended");
        this.started = false;
        this.ended = true;

        // start new game in 10 seconds
        var self = this;
        this.newGameTimeoutId = setTimeout(function() { self.newGame(self); }, 15000);
        
        this.update({
            end : this.ended,
            timer : this.newGameTimeoutId !== undefined ? util.getTimeLeft(this.newGameTimeoutId) : false
        });
    } else {

        // Next turn
        this.botMove();
    }
}
/*
 * @param {dict} scores {id: scoreDiff}
 */
Room.prototype.mergeScores = function(scoreDiff) {
    var scoreDiff = scoreDiff
    for (var s in scoreDiff) {
        if (this.getPlayer(s)) {
            this.getPlayer(s).score += scoreDiff[s];
        }
    }
}
/*
 * re-sets score based on board values
 */
Room.prototype.setScores = function() {
    var scores = this.game.getScores();
    for (var s in scores) {
        if (this.getPlayer(s)) {
            this.getPlayer(s).score = scores[s];
        }
    }
}

Room.prototype.addBot = function() {
    this.add(new Bot(this.board));
    this.botMove();
    this.update({
        players : this.publicPlayerList()
    });
}

Room.prototype.botMove = function() {
    var curPlayer = this.players[this.turn];
    if (curPlayer.bot && !curPlayer.removed) {
        var move = curPlayer.nextMove(util.deepCopy(this.game.grid));
        this.move(move, curPlayer);
    }
}

Room.prototype.kick = function(target) {
    this.remove(target);
}

Room.prototype.ban = function(target) {
    this.banned.push(target);
    this.kick(target);
}

Room.prototype.adminStart = function() {
    if (!this.isPublic) {
        this.isPublic = true;
        this.update({
            turn : this.turn,
            isPublic : this.isPublic
        });
    }
}

Room.prototype.newGame = function(self) {
    if (settings.DEBUG && settings.BOARD) {
        self.board = util.getBoardFile(settings.BOARD);
    } else {
        self.board = util.getBoard("pointcontrol");
    }
    self.game = new Game(self.players, self.board);

    for (var i in self.players) {
        if (self.players[i].bot) {
            self.players[i].engine = new Game(util.dummyPlayers(), self.board);
        }
    }
    self.setScores();

    self.turn = 0;
    
    self.started = true;
    self.isPublic = true;

    self.sendAll("gameState", {
        newGameBoard : self.game.board,
        turn : self.turn,
        players : self.publicPlayerList(),
        grid : self.game.grid,
        started : self.started,
        isPublic : self.isPublic
    });
}

Room.prototype.setAdmin = function(player) {
    player.isAdmin = true;
    this.update({
        players : this.publicPlayerList()
    });
}

Room.prototype.privatize = function() {
    this.isPublic = false;
    this.update({
        isPublic : this.isPublic
    });
}

module.exports = Room;

