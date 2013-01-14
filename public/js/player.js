/*
 * @constructor
 * @this {Player}
 * @param {id} id
 * @param {socket} socket
 */
function Player(id, socket) {
    this.id = id;
    this.socket = socket;
    this.score = 0;
    this.bot = false;
    this.removed = true;
    this.isAdmin = false;
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
