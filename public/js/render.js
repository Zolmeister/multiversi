
var Render = function(canvasId, room) {
    this.canvas = $(canvasId)[0];
    this.context = this.canvas.getContext("2d");
    this.canvas.renderer=this;
    $(this.canvas).on("click", this.onClick, false);

	this.room = room;
    this.game = room.game;
    
    this.hexShape = {
        radius : 36,
        apothem : 31,
        smallRadius : 33,
        smallApothem : 28.6
    }
	
	
    this.xOffset = this.hexShape.radius + 1;
    this.yOffset = 2 * this.hexShape.apothem + 1;

    this.clickedSpace = {
        i : -1,
        j : -1
    };

    this.possibleMoves = {};
    this.colors = [{
        color : "#caa",
        activeColor : "#d66",
        moveColor : "#edd"
    }, {
        color : "#aca",
        activeColor : "#6d6",
        moveColor : "#ded"
    }, {
        color : "#aac",
        activeColor : "#66d",
        moveColor : "#dde"
    }];
    
    this.centerSpace = this.hexSpaceCenter(4, 3);
}

// Util
function distance2(x1, y1, x2, y2) {
    return Math.pow((x2 - x1), 2)  + Math.pow((y2 - y1),2);
}

Render.prototype.hexSpaceCenter = function(i, j) {

    var x = i*(1.5*this.hexShape.radius);
    var y = j*(2*this.hexShape.apothem);
    if (i % 2 == 1) {
        y -= this.hexShape.apothem;
    }

    // Middle spaces have slightly different centers
    if (i == 4 && j == 2) {
        y = this.centerSpace.y - 2*this.hexShape.smallApothem - this.yOffset;
    } else if (i == 3 && j == 3) {
        x = this.centerSpace.x - 1.5*this.hexShape.smallRadius - this.xOffset;
        y = this.centerSpace.y - this.hexShape.smallApothem - this.yOffset;
    } else if (i == 5 && j == 3) {
        x = this.centerSpace.x + 1.5*this.hexShape.smallRadius - this.xOffset;
        y = this.centerSpace.y - this.hexShape.smallApothem - this.yOffset;
    } else if (i == 3 && j == 4) {
        x = this.centerSpace.x - 1.5*this.hexShape.smallRadius - this.xOffset;
        y = this.centerSpace.y + this.hexShape.smallApothem - this.yOffset;
    } else if (i == 4 && j == 4) {
        y = this.centerSpace.y + 2*this.hexShape.smallApothem - this.yOffset;
    } else if (i == 5 && j == 4) {
        x = this.centerSpace.x + 1.5*this.hexShape.smallRadius - this.xOffset;
        y = this.centerSpace.y + this.hexShape.smallApothem - this.yOffset;
    }

    return {x : x + this.xOffset, y : y + this.yOffset};
}

Render.prototype.getCursorPosition = function(e) {
    var x, y;
    if (e.pageX != undefined && e.pageY != undefined) {
        x = e.pageX;
        y = e.pageY;
    }
    else {
        x = e.clientX + document.body.scrollLeft +
            document.documentElement.scrollLeft;
        y = e.clientY + document.body.scrollTop +
            document.documentElement.scrollTop;
    }
    
    x -= this.canvas.offsetLeft;
    y -= this.canvas.offsetTop;

    return {x : x, y : y};
}

Render.prototype.spaceAt = function(canvas_x, canvas_y) {
    var high_i = Math.floor(canvas_x / (1.5*this.hexShape.radius));
    var high_j = Math.floor(canvas_y / (2*this.hexShape.apothem));

    var min_i = -1, min_j = -1, min_d = 1600;
    var space, d;

    for (var i = high_i - 1; i < high_i + 1; i++) {
        for (var j = high_j - 1; j < high_j + 1; j++) {

            space = this.hexSpaceCenter(i, j);
            d = distance2(canvas_x, canvas_y, space.x, space.y);

            if (d < min_d) {
                min_i = i;
                min_j = j;
                min_d = d;
            }
        }
    }

    return {i : min_i, j : min_j};
}

Render.prototype.onClick = function(e) {
	console.log("clicked")
	var self = this.renderer;
    var clicked = self.getCursorPosition(e);
    var space = self.spaceAt(clicked.x, clicked.y);
    try {
        if (self.game.grid[space.i][space.j] == -2) {
        	console.log("1")
            return;
        }
    } catch(e) {
    	console.log("2")
        return; 
    }

    // Zoli: fix this
    if (self.room.turn !== self.room.me) {
        return;
    }

	console.log(self.game.grid[space.i][space.j])
    if (self.game.grid[space.i][space.j].id === self.room.me.id && self.clickedSpace.i === -1 && self.clickedSpace.j === -1) {
        self.clickedSpace.i = space.i;
        self.clickedSpace.j = space.j;

        self.possibleMoves = self.game.generateMoves(space);
        
        if (!self.possibleMoves) {
            // means it's not client's turn, do nothing
            self.possibleMoves = {};
            return;
        }
    
    } else if (self.clickedSpace.i == space.i && self.clickedSpace.j == space.j) {
        self.clickedSpace.i = -1;
        self.clickedSpace.j = -1;
        self.possibleMoves = {};
    } else {
        // Validate locally
        if (!self.possibleMoves[[space.i, space.j]]) {
            return;
        }
	
        // Send move to server
		self.game.move(self.clickedSpace, space);
        self.room.connect.move({start: self.clickedSpace, end: space});
        
        self.possibleMoves = {};
        self.clickedSpace = {
            i : -1, 
            j : -1
        }
    }
    
    self.draw();
}
//TODO: move this to room, and fix all code that compares objects
Render.prototype.index= function(id){
	for(var i=0;i<this.room.players.length;i++){
		if(this.room.players[i].id===id){
			return i
		}
	}
	return -1;
}
// Draw
Render.prototype.draw = function () {
    // clear canvas
    this.canvas.width = this.canvas.width;
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 8; j++) {

            var space = this.hexSpaceCenter(i, j);
            var fill = "#fff";

            // Weed out non-spaces
            if (this.game.grid[i][j] == -2) {
                continue;
            }
            
            // Fill
            if (this.game.grid[i][j] !== -1) {
            	var index = this.index(this.game.grid[i][j].id)
                var colors = this.colors[index];
                if (i === this.clickedSpace.i && j === this.clickedSpace.j) {
                    fill = colors.activeColor;
                } else {
                    fill = colors.color;
                }
            }
            
            if (this.possibleMoves[[i, j]]) {
            	var index = this.index(this.room.me.id)
                fill = this.colors[index].moveColor;
            }

            if (i == 4 && j == 3) {
                fill = "#444";
            }
            
            // Draw Hex Spaces
            if ((i == 4 && j == 2) || ((j == 3 || j == 4) && (i >=3 && i <= 5))) {
                this.drawHexSpace(space.x, space.y, this.hexShape.smallRadius, fill);
            } else {
                this.drawHexSpace(space.x, space.y, this.hexShape.radius, fill);
            }
        }
    }
}

Render.prototype.drawHexSpace = function(x, y, radius, fill) {

    this.context.beginPath();
    this.context.translate(x, y);

    for (var i = 0; i < 6; i++) {
        this.context.rotate((2 * Math.PI) / 6);
        this.context.lineTo(radius,0);
    }

    this.context.closePath();
    if (fill) {
        this.context.fillStyle = fill;
        this.context.fill();
    }
    this.context.stroke();

    this.context.setTransform(1, 0, 0, 1, 0, 0);
}

