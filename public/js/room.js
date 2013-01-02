//client side room object
var Room = function(connect){
	this.players;
	this.turn;
	this.connect=connect;
	this.socket = this.connect.socket;
	var self = this;
	this.socket.on("update", function(data){
		console.log("udpate")
		console.log(data)
		var target =data.target;
		var data = data.data;
		
		if(target==="players"){
			self.players=data;
			if(self.players.length===3)
				self.game.newGame();
			if(self.me){
				self.setMe();
			}
		}
		else if(target ==="gameState"){
			if(data.playing){
				self.turn = self.players[data.turn];
				console.log("turn")
				console.log(self.turn)
				self.renderer.draw();
			}
		}
		else if (target==="me"){
			self.me=data;
			self.setMe();
		}
	})
	this.socket.on("move", function(data){
		console.log("move")
		console.log(data);
		self.game.move(data.start, data.end);
		self.renderer.draw();
	})
	this.game = new Game(this);
	this.renderer = new Render("#mv-canvas", this);
	this.me;
}
Room.prototype.setMe = function(){
	for (var i=0;i<this.players.length;i++){
		if(this.players[i].id==this.me)
			this.me = this.players[i];
	}
}
Room.prototype.move = function(data){
	this.renderer.draw();
	move(data);
}
