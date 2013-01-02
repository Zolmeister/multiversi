//TODO: use zepto
window.onload=function(){
	room = new Room();
	room.players=[{3:'c'},{2:'b'},{1:'a'}];
	room.game.newGame();
	room.me=room.players[0];
	this.room.turn = this.room.me;
	room.renderer.draw();
}