/*
 * @constructor
 * @this {Room}
 * @param {Connect} connect
 */
var Room = function() {
    this.players = ko.observableArray(this.dummyPlayers());
    indexSubscribe(this.players);
    this.turn = ko.observable(0);
    this.connect = ko.observable(new Connect());
    this.socket = this.connect().socket;
    var self = this;
    this.socket.on("update", function(data) {
        self.update(data);
    });
    this.socket.on("move", function(data) {
        self.move(data);
    });
    this.game = ko.observable(undefined);
    this.me = ko.observable(-1);
    //my player id

    this.createRoom = function() {
        console.log("creating room");
        self.connect().createGame(false, false, GAMETYPE);
    }
    this.joinRoom = function(r) {
        self.connect().join(r.roomId);
    }
    this.indexToColor = function(index) {
        return COLORS[index];
    }
    this.currentPlayerId = ko.computed(function() {
        var player = self.players()[self.turn()];
        return player ? player.id : -1;
    }, this);

    this.input = new Input("#mv-canvas", this);
    this.renderer = new Render("#mv-canvas");
}

Room.prototype.dummyPlayers = function() {
    var dummies = [];
    for (var i = 0; i < 3; i++) {
        var id = i;
        var dummy = new Player(id, {
            emit : function() {
            }
        });
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
    console.log("move");
    console.log(data);
    var scoreDiff = this.game().move(data.start, data.end);
    this.mergeScores(scoreDiff);
    this.renderer.draw(this);
    for (var i = 0; i < this.players().length; i++) {
        $("#p" + i + "-score").html(this.players()[i].score);
    }
}

Room.prototype.mergeScores = function(scores) {
    var scoreDiff = scores
    for (var s in scoreDiff) {
        if (this.getPlayer(s)) {
            this.getPlayer(s).score += scoreDiff[s];
        }
    }
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
        this.players(data);
        /*for (var i = 0; i < this.players().length; i++) {
         $("#p" + i + "-score").html(this.players()[i].score);
         }*/

    } else if (target === "gameState") {
        this.turn(data.turn);
        //$("#p" + ((this.turn() - 1) % 3 + 3) % 3).css('font-weight', 'normal');
        //$("#p" + this.turn()).css('font-weight', 'bold');

    } else if (target === "me") {
        this.me(data);
        //$("#p" + this.renderer.index(this.me()) + "-name").html("(you)");

    } else if (target === "board") {
        console.log("update board object")
        console.log(data);
        this.game(new Game(this.players, data));
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

