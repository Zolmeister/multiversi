/*
 * @constructor
 * @this {Input}
 * @param {string} canvasId
 * @param {Room} room
 */
var Input = function(canvasId, room) {
    this.canvasId = canvasId;
    this.canvas = $(canvasId)[0];
    
    var self = this;
    // $(this.canvas).on("mousedown", function(e) {
    //     self.onClick(e);
    // }, false);

    // $(this.canvas).on(("contextmenu"), function(e) {
    //     return false;
    // });

    this.clickCallback = this.defaultClickCallback;
    this.rightclickCallback = this.defaultRightclickCallback;

    this.room = room;

    this.clickedSpace = {
        i : -1,
        j : -1
    };

    this.possibleMoves = {};
}
/*
 * @param {Event} e
 * @return {Coordinate} {x,y}
 */
Input.prototype.getCursorPosition = function(e) {
    var x, y;
    if (e.pageX != undefined && e.pageY != undefined) {
        x = e.pageX;
        y = e.pageY;
    } else {
        x = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
    }

    x -= this.canvas.offsetLeft;
    y -= this.canvas.offsetTop;

    return {
        x : x,
        y : y
    };
}
/*
 * @param {Event} e
 */
Input.prototype.onClick = function(e) {
    var clicked = this.getCursorPosition(e);
    var space = this.room.renderer.spaceAt(clicked.x, clicked.y);
    try {
        if (this.room.game().grid[space.i][space.j] === -2) {
            return;
        }
    } catch(e) {
        return;
    }

    if (e.which === 1) {
        return this.clickCallback(space);
    } else if (e.which === 3) {
        return this.rightclickCallback(space);
    }
}

Input.prototype.defaultClickCallback = function(space) {
    if (this.room.currentPlayerId() !== this.room.me()) {
        console.log("not your turn")
        return;
    }

    //console.log(this.room.game().grid[space.i][space.j])
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
    } else {
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
        this.clickedSpace = {
            i : -1,
            j : -1
        }
    }

    this.room.drawSelf(this.clickedSpace, this.possibleMoves);
}

Input.prototype.defaultRightclickCallback = function(space) {

}

