/*
 * @constructor
 * @this {Room}
 * @param {Connect} connect
 */
var Room = function() {
    this.players = ko.observableArray(this.dummyPlayers());
    this.turn = ko.observable(0);
    this.connect = globalConnect;

    this.socket = this.connect().socket;
    this.isPublic = ko.observable(true);
    var self = this;
    this.socket.on("gameState", function(data) {
        self.update(data);
    });
    this.socket.on("removed", function() {
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

    this.input = new Input(this);
    this.renderer = new Render("#mv-canvas");
    this.renderer.playerSpacesClickHandler = this.input.playerOnClick;
    this.renderer.possibleMovesClickHandler = this.input.possibleMovesOnClick;
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
    //from util.js
    return getPlayerIndex(this.players(), id);
}
/*
 * @param {move} data
 * {move} = {start: {Position}, end: {Position}}
 */
Room.prototype.move = function(data) {
    var boardDiff = this.game().move(data.start, data.end);
    this.mergeScores(this.game().scoreDiff(boardDiff));

    this.renderer.setMove(boardDiff);
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
    for (var target in data) {
        console.log(target + ": ");
        console.log(data[target]);
        if (target === "room") {
            this.id = data[target];
            if (window.history.state !== "room") {
                window.history.pushState("room", "room", "/room/" + data[target])
            }
        }

        if (target === "move") {
            if (this.currentPlayerId() !== this.me()) {
                this.move(data[target]);
            } else {
                // Already know about this move, thanks!
            }
        }

        if (target === "players") {
            for (var i = 0; i < data[target].length; i++) {
                this.players()[i] = new ObservablePlayer(data[target][i]);
            }
            this.players.valueHasMutated();

            if (this.players().length === 3) {
                this.renderer.setPlayers(this.players(), this.me());
            }
        }

        if (target === "turn") {
            this.turn(data[target]);
        }

        if (target === "isPublic") {
            this.isPublic(data[target]);
        }

        if (target === "me") {
            this.me(data[target]);
        }

        if (target === "board") {
            console.log("update board object")
            this.game(new Game(this.players(), data[target]));
            if (this.tmpGrid) { //have previously recieved a grid
                this.game().setGrid(this.tmpGrid);
                this.tmpGrid = undefined;
            }

            this.renderer.setBoard(data[target]);
        }

        if (target === "grid") {
            console.log("update grid state");
            var grid = data[target];
            if (this.game()) { //if have recieved board
                this.game().setGrid(grid);
                this.renderer.setGrid(grid);

            } else {
                this.tmpGrid = grid;
            }
        }
    }
}

