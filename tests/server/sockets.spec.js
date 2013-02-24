var io = require('socket.io-client');
//TODO: move this to settings?
var socketURL = 'http://localhost:3000'
socketOptions = {
    transports : ['websocket'],
    'force new connection' : true
}

describe("sockets", function() {
    //TODO: test multiple players
    var socket;
    beforeEach(function(done) {
        socket = io.connect(socketURL, socketOptions);
        socket.on("connect", function() {
            done();
        })
    })
    afterEach(function(){
        socket.removeAllListeners();
    })
    it("should be able to create a public game", function(done) {
        var roomSettings = {
            isPrivate : false,
            bots : false,
            gametype : "classic"
        }
        socket.emit("createGame", roomSettings);
        socket.on("gameState", function(data) {
            if (data.room)
                expect( typeof data.room).toBe("string");
            if (data.me)
                expect( typeof data.me).toBe("string");
            if (data.board)
                expect( typeof data.board).toBe("object");
            if (data.isPublic)
                expect( typeof data.isPublic).toBe("boolean");
            if (data.turn)
                expect( typeof data.turn).toBe("number");
            if (data.grid)
                expect(data.grid instanceof Array).toBe(true);
            if (data.players)
                expect(data.players instanceof Array).toBe(true);
            done();
        })
    })
    it("should join a game", function(done) {
        socket.emit("join", {
            room : undefined
        });
        socket.on("gameState", function(){
            done();
        })
    })
    it("should be able to leave a room", function(){
        socket.emit("join", {});
        socket.on("gameState", function(){
            socket.emit("leaveRoom");
            socket.on("removed", function(){
                done();
            })
        })
    })
    it("should handle sparse settings", function() {
        var roomSettings = {};
        socket.emit("createGame", roomSettings);
    })
});
