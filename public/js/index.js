//TODO: use zepto
//TODO: fix sockets class dependencies
window.onload=function(){
	room = new Room(new Connect());
	room.connect.getRooms(function(rooms){
		if(rooms.length<1){
			//create room
			console.log("no room, created one");
			room.connect.createGame();
		}
		else{
			room.connect.join(0);
			//join room
		}
	});
	
	//connect.join(0);
	/*room = new Room();
	room.players=[{3:'c'},{2:'b'},{1:'a'}];
	room.game.newGame();
	room.me=room.players[0];
	this.room.turn = this.room.me;
	room.renderer.draw();*/
}
