/*
 * @constructor
 * @this {Input}
 * @param {string} canvasId
 * @param {Room} room
 */
var Input = function(room) {
    
    var self = this;
    this.room = room;

    this.clickedSpace = {
        i : -1,
        j : -1
    };
    this.possibleMoves = {};

    this.onClickHandler = this.defaultPlayerOnClick;
    this.possibleMoveOnClickHandler = this.defaultPossibleMoveOnClick;

    this.playerOnClick = function(e) {
        self.onClickHandler.call(self, {i : this.attr('i'), j : this.attr('j')});
    }

    this.possibleMovesOnClick = function(e) {
        self.possibleMoveOnClickHandler.call(self, {i : this.attr('i'), j : this.attr('j')});
    }
}

Input.prototype.defaultPlayerOnClick = function(space) {

    if (this.room.ended()) {
        return;
    }

    if (this.room.currentPlayerId() !== this.room.me()) {
        console.log("not your turn")
        return;
    }

    if (this.room.game().grid[space.i][space.j] === this.room.me()) {
        if (this.clickedSpace.i === space.i && this.clickedSpace.j === space.j) {
            this.clickedSpace.i = -1;
            this.clickedSpace.j = -1;
            this.possibleMoves = {};
        } else {
            this.clickedSpace.i = space.i;
            this.clickedSpace.j = space.j;
            this.possibleMoves = this.room.game().generateMoves(space);
        }
    }

    this.room.renderer.setClickedSpace(this.clickedSpace);
    this.room.renderer.setPossibleMoves(this.possibleMoves);
}

Input.prototype.defaultPossibleMoveOnClick = function(space) {

    // Validate locally
    if (!this.possibleMoves[[space.i, space.j]]) {
        return;
    }

    // Send move to server
    this.room.move({
        start : this.clickedSpace,
        end : space
    });
    this.room.connect().move({
        start : this.clickedSpace,
        end : space
    });

    this.possibleMoves = {};
    this.room.renderer.setPossibleMoves({});
    this.clickedSpace = {
        i : -1,
        j : -1
    }
}

Input.prototype.defaultRightclickCallback = function(space) {
}

