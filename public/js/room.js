/*
 * @constructor
 * @this {Room}
 * @param {Connect} connect
 */
var Room = function() {
    this.players = ko.observableArray(this.dummyPlayers());
    this.turn = ko.observable(0);
    this.connect = ko.observable(new Connect());
    this.socket = this.connect().socket;
    this.isPublic = ko.observable(true);
    var self = this;
    this.socket.on("update", function(data) {
        self.update(data);
    });
    this.socket.on("move", function(data) {
        self.move(data);
    });
    this.socket.on("removed", function(){
        leaveButton();
    });
    this.game = ko.observable(undefined);
    this.me = ko.observable(-1);

    //TODO: move these to lobby class
    this.joinRoom = function(r) {
        self.connect().join(r.roomId);
    }
    this.iAmAdmin = ko.computed(function() {
        var me = self.getPlayer(self.me());
        return me ? me.isAdmin() : false;
    }, this)
    this.kick = function(target) {
        self.connect().roomAdmin("kick", target.id);
    }
    this.ban = function(target) {
        self.connect().roomAdmin("ban", target.id);
    }
    this.currentPlayerId = ko.computed(function() {
        var player = self.players()[self.turn()];
        return player ? player.id : -1;
    }, this);

    this.input = new Input("#mv-canvas", this);
    this.renderer = new Render("#mv-canvas");
}
//TODO: move to lobby class
Room.prototype.createRoom = function(self, e, isPrivate, bots, type) {
    self.connect().createGame(isPrivate, bots, type);
}

Room.prototype.createRoomBots = function(self) {
    self.createRoom(self, null, true, true, GAMETYPE);
}

Room.prototype.createRoomPrivate = function(self) {
    self.createRoom(self, null, true, false, GAMETYPE);
}

Room.prototype.indexToColor = function(index) {
    return COLORS[index];
}

Room.prototype.dummyPlayers = function() {
    var dummies = [];
    for (var i = 0; i < 3; i++) {
        var id = i;
        var dummy = ko.observable(new ObservablePlayer(new Player(id, {
            emit : function() {
            }
        })));
    }
    return dummies;
}

Room.prototype.getPlayer = function(id) {
    for (var i in this.players()) {
        var player = this.players()[i];
        if (player.id === id) {
            return player;
        }
    }
}

Room.prototype.getPlayerIndex = function(id) {
    for (var i = 0; i < this.players().length; i++) {
        if (this.players()[i].id === id) {
            return i
        }
    }
    return -1;
}
/*
 * @param {move} data
 * {move} = {start: {Position}, end: {Position}}
 */
Room.prototype.move = function(data) {
    var scoreDiff = this.game().move(data.start, data.end);
    this.mergeScores(scoreDiff);
    this.renderer.draw(this);
}

Room.prototype.mergeScores = function(scores) {
    var scoreDiff = scores
    for (var s in scoreDiff) {
        if (this.getPlayer(s)) {
            this.getPlayer(s).score(this.getPlayer(s).score() + scoreDiff[s]);
        }
    }
    this.players.valueHasMutated();
}
/*
 * @param {update} data
 * {update} = {target: {string}, data: {object}}
 */
Room.prototype.update = function(data) {
    var target = data.target;
    var data = data.data;
    if (target === "room") {
        this.id = data;
        if (window.history.state !== "room") {
            window.history.pushState("room", "room", "/room/" + data)
        }
    } else if (target === "players") {
        console.log("players")
        console.log(data)
        //this.players(data);
        for (var i = 0; i < data.length; i++) {
            this.players()[i] = new ObservablePlayer(data[i]);
        }
        this.players.valueHasMutated();

    } else if (target === "gameState") {
        this.turn(data.turn);
        this.isPublic(data.isPublic);

    } else if (target === "me") {
        this.me(data);

    } else if (target === "board") {
        console.log("update board object")
        console.log(data);
        this.game(new Game(this.players(), data));
        if (this.tmpGrid) {//have previously recieved a grid
            this.game().setGrid(this.tmpGrid);
            this.tmpGrid = undefined;
        }

    } else if (target === "grid") {
        console.log("update grid state");
        var grid = data;
        if (this.game()) {//if have recieved board
            this.game().setGrid(grid);
        } else {
            this.tmpGrid = grid;
        }
    }
    this.renderer.draw(this);
}

