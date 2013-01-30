var Room = require("../../room")
var types = ["classic", "capturepoint"];
for (var gametype in types) {
    var room = new Room(types[gametype])
    describe("Room", function() {
        it("has default properties", function(){
            expect(typeof room.id).toBe("string")
        })
        
    })
}