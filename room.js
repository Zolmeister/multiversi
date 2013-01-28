var Game = require("./public/js/engine");
var Bot = require("./bots");
var util = require("./utils");
var settings = require("./settings");
var Player = require("./public/js/player");
/*
 * @constructor
 * @this {Room}
 */
function Room(gametype) {
    this.id = util.nextRoomId();
    //TODO: replace with uuid?
    this.openIds = [];
    //list of removed player ids, for grid replacement
    this.players = this.dummyPlayers();
    //list of player objects
    this.banned = [];
    this.board = this.getBoard(gametype);
    this.game = new Game(this.players, this.board);
    this.turn = 0;
    //player index
    this.isPublic = true;
    //for private games, change to false
    this.started = false;
    //for new rooms, change on hit 3 players
}

Room.prototype.dummyPlayers = function() {
    var dummies = [];
    for (var i = 1; i < 4; i++) {
        var id = i;
        var dummy = new Player(id, {
            emit : function() {
            }
        });
        dummy.removed = true;
        dummies.push(dummy);
        this.openIds.push(id);
    }
    return dummies;
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

Room.prototype.getPlayerIndex = function(id) {
    return this.players.indexOf(this.getPlayer(id));
}

Room.prototype.currentPlayerId = function() {
    return this.players[this.turn].id;
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
            isAdmin : p.isAdmin
        }
        playerList.push(player);
    }
    return playerList;
}
/*
 * @param {string} target
 * @param {Object} data
 */
Room.prototype.update = function(target, data) {
    util.log(target, data);
    var pak = {};
    pak[target] = data;
    this.sendAll("gameState", pak);
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
            grid : this.game.grid,
            players : this.publicPlayerList()
        })
        this.sendAll("gameState", {
            players : this.publicPlayerList()
        });

        if (callback) {
            callback(this);
        }

        if (this.isPublic && !this.started) {
            //have enough people, public game, and havent started yet
            this.newGame();
        }
    }
}
/*
 * @param {player} player
 */
Room.prototype.remove = function(player) {
    var index = this.getPlayerIndex(player.id);
    if (index !== -1) {
        util.log("remvoed player")
        this.openIds.push(this.players[index].id);
        //this.players[index] = this.removedPlayer();
        this.players[index].removed = true;
        this.players[index].socket.emit("removed");
        //dont actually remove player
        this.update("turn", this.turn);
        this.update("isPublic", this.isPublic);
        this.update("players", this.publicPlayerList());
    }
}
/*
 * @param {string} name
 * @param {Object} data
 */
Room.prototype.sendAll = function(name, data) {//send to all players
    for (var i in this.players) {
        if (!this.players[i].bot && !this.players[i].removed) {
            this.players[i].socket.emit(name, data);
        }
    }
}
/*
 * @param {move} data
 * @param {player} player
 * {move} = {start:{Position}, end:{Position}}
 */
Room.prototype.move = function(data, player) {
    if (player.id !== this.currentPlayerId()) {
        util.log("tried to move, but not your turn");
        return;
    }
    var valid = this.game.validateMove(data.start, data.end, player.id);
    if (!valid) {
        var d = data;
        d.id = player.id;
        util.log("bad move", d);
        return;
    }

    var boardDiff = this.game.move(data.start, data.end);
    this.mergeScores(this.game.scoreDiff(boardDiff));
    this.update("move", data);

    if (this.game.gameEnded()) {
        // TODO: Game ends here
        util.log("game ended");
    }

    this.turn = ++this.turn % 3;
    this.update("turn", this.turn);

    this.botMove();
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
    util.log("adding bot");
    this.add(new Bot(this.board));
    this.botMove();
    this.update("players", this.publicPlayerList())
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
        this.update("turn", this.turn);
        this.update("isPublic", this.isPublic);
    }
}

Room.prototype.getBoard = function(board) {
    var boards = {
        "classic" : './resources/boards/original.json',
        "pointcontrol" : './resources/boards/pointcontrol.json',
    }
    return boards[board] ? require(boards[board]) : require(boards["classic"]);
}
//only call this with 3 players in players list
Room.prototype.newGame = function() {
    this.started = true;
    //this.game.newGame();
    this.setScores(this.game.getScores());
    this.turn = 0;
    this.update("turn", this.turn);
    //this.update("isPublic", this.isPublic);
    this.update("players", this.publicPlayerList());
    //this.update("board", this.board);
    this.update("grid", this.game.grid);
}

Room.prototype.setAdmin = function(player) {
    player.isAdmin = true;
    this.update("players", this.publicPlayerList());
}

Room.prototype.privatize = function() {
    this.isPublic = false;
    this.update("isPublic", this.isPublic);
}

module.exports = Room;

