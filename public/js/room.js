/*
 * @constructor
 * @this {Room}
 * @param {Connect} connect
 */
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

Room.prototype.getPlayer = function(id) {
	for (var i in this.players) {
		var player = this.players[i];
		if (player.id === id) {
			return player;
		}
	}
}

/*
 * @param {move} data
 * {move} = {start: {Position}, end: {Position}}
 */
Room.prototype.move = function(data) {
	console.log("move");
	console.log(data);
	var scoreDiff = this.game.move(data.start, data.end);
	this.mergeScores(scoreDiff);
	this.renderer.draw();
	for (var i = 0; i < this.players.length; i++) {
            $("#p" + i + "-score").html(this.players[i].score);
        }
}

Room.prototype.mergeScores = function(scores) {
	var scoreDiff = scores
	for (var s in scoreDiff) {
		if (this.getPlayer(s)){
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

	if (target === "players") {
		this.players = data;
		for (var i = 0; i < this.players.length; i++) {
            $("#p" + i + "-score").html(this.players[i].score);
        }
        
	} else if (target === "gameState") {
		this.turn=data.turn;
        $("#p" + ((this.turn - 1) % 3 + 3) % 3).css('font-weight', 'normal');
        $("#p" + this.turn).css('font-weight', 'bold');
        
	} else if (target === "me") {
		this.me = data;
        $("#p" + this.renderer.index(this.me) + "-name").html("(you)");
        
	} else if (target === "board") {
		console.log("update board object")
		console.log(data);
        this.game.newGame(data);
	} else if (target === "grid"){
		console.log("update grid state");
		this.game.grid = data;
	}
	this.renderer.draw();
}

