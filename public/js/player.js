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
	this.removed = false;
}

module = module || {};
module.exports = Player;