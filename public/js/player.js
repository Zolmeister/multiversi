/*
 * @constructor
 * @this {Player}
 * @param {id} id
 * @param {socket} socket
 */
function Player(id, socket, bot, removed, isAdmin, score) {
    this.id = id;
    this.socket = socket;
    this.score = score || 0;
    this.bot = bot || false;
    this.removed = removed || true;
    this.isAdmin = isAdmin || false;
}

Player.prototype.clone = function(){
    return new Player(this.id,this.socket, this.bot, this.removed, this.isAdmin, this.score);
}

//Uses knockout.js, only for client side
function ObservablePlayer(player) {
	this.id = player.id;
	this.score = ko.observable(player.score);
	this.bot = ko.observable(player.bot);
	this.removed = ko.observable(player.removed);
	this.isAdmin = ko.observable(player.isAdmin);
}

module = module || {};
module.exports = Player; 
