/*
 * @constructor
 * @this {Room}
 * @param {Id} id
 * @param {Board} board
 * @param {me} me
 * @param {Grid} grid *optional
 */
var Room = function(id, board, me, grid) {
    var self = this;
    this.shareUrl = window.location.host+"/"+id
    this.players = ko.observableArray(this.dummyPlayers());
    this.turn = ko.observable(-1);
    this.connect = globalConnect;
    this.socket = this.connect().socket;
    this.isPublic = ko.observable(true);
    this.me = ko.observable(me);
    this.game = ko.observable(new Game(this.players(), board));
    if(grid){
        this.game().setGrid(grid);
    }

    this.started = ko.observable(false);
    this.ended = ko.observable(false);
            
    //TODO: move these to lobby class
    this.iAmAdmin = ko.computed(function() {
        var me = self.getPlayer(self.me());
        return me ? me.isAdmin() : false;
    }, this)
    this.passMove = function() {
        this.move({
            start : "pass",
            end : "pass"
        });
        this.connect().move({
            start : "pass",
            end : "pass"
        });
    }
    this.currentPlayerId = ko.computed(function() {
        var player = self.players()[self.turn()];
        return player ? player.id : -1;
    }, this);

    this.nextGameTimer = ko.observable(0);
    this.nextGameStartTime = undefined;
    this.nextGameTimerInterval = undefined;

    this.nextGameTimerTick = function() {
        if (self.nextGameStartTime) {
            self.nextGameTimer(Math.round(Math.ceil(self.nextGameStartTime - Date.now()) / 1000));
        }
    }
}

Room.prototype.initRenderer = function() {
    this.input = new Input(this);
    this.renderer = new Render("#mv-canvas");
    this.renderer.playerSpacesClickHandler = this.input.playerOnClick;
    this.renderer.possibleMovesClickHandler = this.input.possibleMovesOnClick;

    this.renderer.setPlayers(this.players(), this.me());
    this.renderer.setBoard(this.game().board);
    this.renderer.setGrid(this.game().grid, this.game().board);
}

Room.prototype.selfDestruct = function(){
    if (this.renderer) {
        this.renderer.paper.remove();
    }
}

Room.prototype.indexToColor = function(index) {
    return COLORS[index];
}

Room.prototype.dummyPlayers = function() {
    var dummies = [];
    for (var i = 0; i < 3; i++) {
        // Server sets Dummy Ids to [1,3],
        // this much match
        var id = i + 1;
        var dummy = ko.observable(new ObservablePlayer(new Player(id, {
            emit : function() {
            }
        })));
        dummies[i] = dummy;
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

    if (data.start !== "pass") {
        var boardDiff = this.game().move(data.start, data.end);
        this.mergeScores(this.game().scoreDiff(boardDiff));

        this.renderer.setMove(boardDiff);
    }
}

Room.prototype.mergeScores = function(scoreDiff) {
    for (var s in scoreDiff) {
        if (this.getPlayer(s)) {
            this.getPlayer(s).score(this.getPlayer(s).score() + scoreDiff[s]);
        }
    }
    this.players.valueHasMutated();
}

Room.prototype.resetScores = function() {
    for (var i in this.players()) {
        this.players()[i].score(0);
    }
    this.players.valueHasMutated();
}
/*
 * @param {update} data
 * {update} = {target: {string}, data: {object}}
 */
Room.prototype.update = function(data) {
    for (var target in data) {
        if (target === "started" && data[target] === true) {
            if (!this.started()) {
                this.started(true);
                this.initRenderer();
            }

            if (this.nextGameTimerInterval) {
                window.clearInterval(this.nextGameTimerInterval);
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
                var player = new ObservablePlayer(data[target][i]);

                var playerFromId = this.players()[i].id;
                
                // If the player is a dummy player, you have to do this
                if (playerFromId === undefined) {
                    playerFromId = this.players()[i]().id;
                }
                
                if (playerFromId !== player.id) {
                    this.game().replacePlayer(playerFromId, player.id);
                    if (this.renderer) {
                        this.renderer.replacePlayer(playerFromId, player.id);
                    }
                }

                this.players()[i] = player
            }
            this.players.valueHasMutated();
        }

        if (target === "turn") {
            this.turn(data[target]);
        }

        if (target === "isPublic") {
            this.isPublic(data[target]);
        }
        
        if (target === "grid" && !this.ended()) {
            var grid = data[target];
            if (this.game()) { //if have recieved board
                this.game().setGrid(grid);
                if (this.renderer) {
                    this.renderer.setGrid(grid, this.game().board);
                }

            } else {
                console.error("haven't recieved board")
            }
        }

        if (target === "end") {
            this.ended(true);
            console.log("game ended");
        }

        if (target === "newGameBoard") {
            this.ended(false);
            this.started(false);
            this.selfDestruct();
            this.game = ko.observable(new Game(this.players(), data[target]));
        }

        if (target === "timer") {
            if (data[target] === false) {
                this.nextGameStartTime = undefined;
            } else {
                this.nextGameStartTime = Date.now() + 1000 * data[target];
                this.nextGameTimerInterval = window.setInterval(this.nextGameTimerTick, 1000);
                this.nextGameTimerTick();
            }
        }
    }
}

