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

    this.ended = ko.observable(false);
            
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

    this.renderer.setPlayers(this.players(), this.me());
    this.renderer.setBoard(this.game().board);
}

Room.prototype.selfDestruct = function(){
    this.renderer.paper.remove();
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
                
                console.log("Replace player: " + playerFromId + " to " + player.id);

                if (playerFromId !== player.id) {
                    this.game().replacePlayer(playerFromId, player.id);
                    this.renderer.replacePlayer(playerFromId, player.id);
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
        
        if (target === "grid") {
            console.log("update grid state");
            var grid = data[target];
            if (this.game()) { //if have recieved board
                this.game().setGrid(grid);
                this.renderer.setGrid(grid, this.game().board);

            } else {
                console.error("havent recieved board")
            }
        }

        if (target === "end") {
            // this.ended = ko.observable(true);
            this.ended(true);

            console.log("game ended");
        }
    }
}

