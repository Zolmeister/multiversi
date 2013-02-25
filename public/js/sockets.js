/*
 * @constructor
 * @this {Connect}
 */
var Connect = function() {
    var self = this;
    this.socket = io.connect();

    this.socket.on("error", function(data) {
        console.error(data);
    })

    this.socket.on("chat", function(data){
        var chat = $("#chat")
        var msg = $("<span class='msg'>").text(data.user+": "+data.msg)
        chat.html(chat.html()+msg.html()+"<br>")
        chat.scrollTop(chat.height());
    })

    this.join = function join(roomId) {
        console.log("request to join: " + roomId)
        this.socket.emit("join", {
            room : roomId
        });
    }
    
    this.setName = function(name){
        localStorage.name = name
        this.socket.emit("screenName", name);
    }

    this.leaveRoom = function leaveRoom() {
        this.socket.emit("leaveRoom");
    }

    this.createGame = function createGame(isPrivate, bots, type) {
        isPrivate = isPrivate || false;
        bots = bots || false;
        type = type || GAMETYPE;
        this.socket.emit("createGame", {
            isPrivate : isPrivate,
            bots : bots,
            gametype : type
        });
    }
    
    this.sendChat = function(form){
        form = $(form);
        var msg = form.serializeArray()[0].value;
        form.find("input").val("");
        this.socket.emit("chat",msg);
    }

    this.roomAdmin = function roomAdmin(action, target) {
        this.socket.emit("roomAdmin", {
            action : action,
            target : target
        });
    }

    this.move = function move(data) {
        this.socket.emit("move", data);
    }
}
