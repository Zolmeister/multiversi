/*
 * @constructor
 * @this {Render}
 * @param {string} canvasId
 * @param {Room} room
 */
var Render = function(canvasId, room) {
	this.canvasId=canvasId;
	this.canvas = $(canvasId)[0];
	this.context = this.canvas.getContext("2d");
	var self = this;
	$(this.canvas).on("click", function(e) {
		self.onClick(e);
	}, false);

	this.room = room;

	this.hexShape = {
		radius : 36,
		apothem : 31,
		smallRadius : 36,
		smallApothem : 31
		//smallRadius : 33,
		//smallApothem : 28.6
	}

	this.xOffset = this.hexShape.radius + 1;
	this.yOffset = 2 * this.hexShape.apothem + 1;

	this.clickedSpace = {
		i : -1,
		j : -1
	};

	this.possibleMoves = {};

	this.centerSpace = this.hexSpaceCenter(4, 3);
}

/*
 * @param {i} i
 * @param {j} j
 * @return {Coordiante} {x,y}
 */
Render.prototype.hexSpaceCenter = function(i, j) {

	var x = i * (1.5 * this.hexShape.radius);
	var y = j * (2 * this.hexShape.apothem);
	if (i % 2 == 1) {
		y -= this.hexShape.apothem;
	}

	// Middle spaces have slightly different centers
	if (i == 4 && j == 2) {
		y = this.centerSpace.y - 2 * this.hexShape.smallApothem - this.yOffset;
	} else if (i == 3 && j == 3) {
		x = this.centerSpace.x - 1.5 * this.hexShape.smallRadius - this.xOffset;
		y = this.centerSpace.y - this.hexShape.smallApothem - this.yOffset;
	} else if (i == 5 && j == 3) {
		x = this.centerSpace.x + 1.5 * this.hexShape.smallRadius - this.xOffset;
		y = this.centerSpace.y - this.hexShape.smallApothem - this.yOffset;
	} else if (i == 3 && j == 4) {
		x = this.centerSpace.x - 1.5 * this.hexShape.smallRadius - this.xOffset;
		y = this.centerSpace.y + this.hexShape.smallApothem - this.yOffset;
	} else if (i == 4 && j == 4) {
		y = this.centerSpace.y + 2 * this.hexShape.smallApothem - this.yOffset;
	} else if (i == 5 && j == 4) {
		x = this.centerSpace.x + 1.5 * this.hexShape.smallRadius - this.xOffset;
		y = this.centerSpace.y + this.hexShape.smallApothem - this.yOffset;
	}

	return {
		x : x + this.xOffset,
		y : y + this.yOffset
	};
}

/*
 * @param {Event} e
 * @return {Coordinate} {x,y}
 */
Render.prototype.getCursorPosition = function(e) {
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
 * @param {Coordinate.X} canvas_x
 * @param {Coordinate.Y} canvas_y
 * @return {Position}
 */
Render.prototype.spaceAt = function(canvas_x, canvas_y) {
	var high_i = Math.floor(canvas_x / (1.5 * this.hexShape.radius));
	var high_j = Math.floor(canvas_y / (2 * this.hexShape.apothem));

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

	return {
		i : min_i,
		j : min_j
	};
}

Render.prototype.getDimensions = function() {
    var width = (2 * this.hexShape.radius) * this.room.game().board.width + 2;
    if (this.room.game().board.width % 2 === 0) {
        width += .5 * this.hexShape.radius;
    }
    var height = (2 * this.hexShape.apothem) * this.room.game().board.height + 2;
    if (this.room.game().board.height % 2 === 0) {
        height += this.hexShape.apothem;
    }
    return {width : width, height : height};
}

/*
 * @param {Event} e
 */
Render.prototype.onClick = function(e) {
	var clicked = this.getCursorPosition(e);
	var space = this.spaceAt(clicked.x, clicked.y);
	try {
		if (this.room.game().grid[space.i][space.j] === -2) {
			return;
		}
	} catch(e) {
		return;
	}

	if (this.room.currentPlayerId() !== this.room.me()) {
		console.log("not your turn")
		return;
	}

	console.log(this.room.game().grid[space.i][space.j])
	if ((this.clickedSpace.i === -1 && this.clickedSpace.i === -1) && this.room.game().grid[space.i][space.j] === this.room.me()) {
		this.clickedSpace.i = space.i;
		this.clickedSpace.j = space.j;

		this.possibleMoves = this.room.game().generateMoves(space);
	} else if (this.clickedSpace.i == space.i && this.clickedSpace.j == space.j) {
		this.clickedSpace.i = -1;
		this.clickedSpace.j = -1;
		this.possibleMoves = {};
	} else {
		// Validate locally
		if (!this.possibleMoves[[space.i, space.j]]) {
			return;
		}

		// Send move to server
		this.room.move({start: this.clickedSpace, end: space});
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

	this.draw();
}

//TODO: move this to room
Render.prototype.index = function(id) {
	for (var i = 0; i < this.room.players().length; i++) {
		if (this.room.players()[i].id === id) {
			return i
		}
	}
	return -1;
}

// Draw
Render.prototype.draw = function() {

    if (!this.room.game()) {
    	console.log("no game")
        return;
    }

	// clear canvas
    var dim = this.getDimensions();
    $(this.canvasId).width(dim.width).height(dim.height).show();
    this.canvas.width = dim.width;
    this.canvas.height = dim.height;
	
    for (var i = 0; i < this.room.game().board.width; i++) {
		for (var j = 0; j < this.room.game().board.height; j++) {

			var space = this.hexSpaceCenter(i, j);
			var fill = "#fff";

			// Weed out non-spaces
			if (this.room.game().grid[i][j] == -2) {
				continue;
			}

			// Fill
            if (this.room.game().grid[i][j] === -3) {
				fill = "#444";
            } else if (this.room.game().grid[i][j] <= -4) {
            
            } else if (this.room.game().grid[i][j] !== -1) {
				var index = this.index(this.room.game().grid[i][j])
				var colors = COLORS[index];
				if (!colors) {
					colors = {
						color : "#333",
						activeColor : "#333",
						moveColor : "#333"
					}
				}
				if (i === this.clickedSpace.i && j === this.clickedSpace.j) {
					fill = colors.activeColor;
				} else {
					fill = colors.color;
				}
			} else if (this.possibleMoves[[i, j]]) {
				var index = this.index(this.room.me());
				var colors = COLORS[index];
				if (!colors) {
					colors = {
						color : "#333",
						activeColor : "#333",
						moveColor : "#333"
					}
				}
				fill = colors.moveColor;
			}
			// Draw Hex Spaces
            this.drawHexSpace(space.x, space.y, this.hexShape.radius, fill);

            var s = {i: i, j: j};
            if (this.room.game().board.gametype === "pointcontrol" && this.room.game().isControlPoint(s)) {
                this.context.beginPath();
                this.context.arc(space.x, space.y, 18, 0, 2 * Math.PI, false);
                this.context.fillStyle = "#FFB00F";
                this.context.fill();
            }
            
            if (DEBUG) {
                this.context.fillStyle = "#000";
                this.context.font = "12px sans-serif";
                this.context.fillText(i + " " + j, space.x - 7, space.y + 4);
            }
        }
    }
}

Render.prototype.drawHexSpace = function(x, y, radius, fill) {

	this.context.beginPath();
	this.context.translate(x, y);

	for (var i = 0; i < 6; i++) {
		this.context.rotate((2 * Math.PI) / 6);
		this.context.lineTo(radius, 0);
	}

	this.context.closePath();
	if (fill) {
		this.context.fillStyle = fill;
		this.context.fill();
	}
	this.context.stroke();

	this.context.setTransform(1, 0, 0, 1, 0, 0);
}

