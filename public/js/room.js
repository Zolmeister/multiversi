//client side room object
var Room = function(){
	this.players;
	this.turn;
	this.game = new Game(this);
	this.renderer = new Render("#mv-canvas", this);
	this.me;
}
