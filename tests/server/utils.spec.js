var util = require("../../utils");

describe("Utils", function() {
    it("deep copy", function() {
        var array = [[1, 2, 3], [1, 2, 3]]
        var copy = util.deepCopy(array);
        copy[0][0] = 2;
        expect(array[0][0]).toBe(1);
    })
    it("incrementing bot Id string", function() {
        var n = util.newBotId();
        var n2 = util.newBotId();
        expect(parseInt(n)).toBeLessThan(parseInt(n2));
    })
    it("is number integer", function() {
        expect(util.isInt(223)).toBe(true);
        expect(util.isInt("222")).toBe(false);
        expect(util.isInt(2.2)).toBe(false);
        expect(util.isInt(1e2)).toBe(true);
    })
    it("incrementing room Id string", function() {
        var n = util.nextRoomId();
        var n2 = util.nextRoomId();
        expect(parseInt(n)).toBeLessThan(parseInt(n2));
    })
    it("returns a board", function() {
        var board = util.getBoard("classic");
        expect( typeof board.name).toBe("string");
        expect( typeof board.gametype).toBe("string");
        expect( typeof board.width).toBe("number");
        expect( typeof board.height).toBe("number");
        expect(board.nonrendered instanceof Array).toBe(true);
        expect(board.nonjumpable instanceof Array).toBe(true);
        expect( typeof board.starting).toBe("object");
        for (var key in board.starting) {
            expect(board.starting[key] instanceof Array).toBe(true);
        }
    })
    it("generates dummy players", function() {
        var dummies = util.dummyPlayers();
        for (var i = 0; i < dummies.length; i++) {
            var dummy = dummies[i];
            expect( typeof dummy.id).toBe("number");
            expect(dummy.removed).toBe(true);
            expect( typeof dummy.socket.emit).toBe("function")
        }
    })
})
