var Bot = require("../../bots");
var util = require("../../utils");

describe("Bot", function() {
    var bot = new Bot(util.getBoard("classic"))
    it("returns a move based on current grid state", function() {
        bot.engine.replacePlayer(1,bot.id);
        var move = bot.nextMove(bot.engine.grid);
        expect(typeof move.start.i).toBe("number");
        expect(typeof move.start.j).toBe("number");
        expect(typeof move.end.i).toBe("number");
        expect(typeof move.end.j).toBe("number");
        expect(bot.engine.validateMove(move.start, move.end, bot.id)).toBe(true);
    })
})
