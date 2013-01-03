//client side room object
var Room = function(connect) {
	this.players=[];
	this.turn=0;
	this.connect = connect;
	this.socket = this.connect.socket;
	var self = this;
	this.socket.on("update", function(data) {
		self.update(data);
	});
	this.socket.on("move", function(data) {
		self.move(data);
	});
	this.game = new Game(this);
	this.renderer = new Render("#mv-canvas", this);
	this.me=-1;
	//my player id
}

Room.prototype.currentPlayerId = function(){
	return this.players[this.turn].id;
}

Room.prototype.move = function(data) {
	console.log("move");
	console.log(data);
	this.game.move(data.start, data.end);
	this.renderer.draw();
}

Room.prototype.update = function(data) {
	var target = data.target;
	var data = data.data;

	if (target === "players") {
		this.players = data;
	} else if (target === "gameState") {
		if (data.playing) {
			this.turn=data.turn;
			console.log("turn")
			console.log(this.turn)
			this.renderer.draw();

            $("#p" + ((this.turn - 1) % 3 + 3) % 3).css('font-weight', 'normal');
            $("#p" + this.turn).css('font-weight', 'bold');

            for (var i = 0; i < 3; i++) {
                $("#p" + i + "-score").html(data.scores[i]);
            }
		}
	} else if (target === "me") {
		this.me = data;
		this.renderer.draw();
        $("#p" + this.renderer.index(this.me) + "-name").html("(you)");

	} else if (target === "board") {
		console.log("update grid")
		this.game.grid = data;
		this.renderer.draw();
	}
}
