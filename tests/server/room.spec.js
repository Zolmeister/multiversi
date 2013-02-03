var Room = require("../../room");
var Game = require("../../public/js/engine");
var util = require("../../utils");
var Player = require("../../public/js/player")
var types = ["classic", "pointcontrol"];
for (var gametype in types) {
    describe("Room", function() {
        var room = new Room(types[gametype]);

        beforeEach(function() {
            room = new Room(types[gametype]);
        })
        it("has default properties", function() {
            expect( typeof room.id).toBe("string");
            expect(room.players instanceof Array).toBe(true);
            expect(room.banned instanceof Array).toBe(true);
            expect( typeof room.board).toBe("object");
            expect(room.game instanceof Game).toBe(true);
            expect( typeof room.isPublic).toBe("boolean");
            expect( typeof room.started).toBe("boolean");
        })
        it("returns player by id", function() {
            var player = room.players[0];
            expect(room.getPlayer(player.id)).toBe(player);
            expect(room.getPlayer(-1)).toBeUndefined();
        })
        it("returns index of player by id", function() {
            var player = room.players[0];
            expect(room.getPlayerIndex(player.id)).toBe(0);
            expect(room.getPlayerIndex(-1)).toBe(-1)
        })
        it("returns current player id", function() {
            expect(room.currentPlayerId()).toBe(room.players[room.turn].id);
            room.turn = 1;
            expect(room.currentPlayerId()).toBe(room.players[room.turn].id);
            room.turn = -1;
            expect(room.currentPlayerId()).toBeUndefined();
        })
        it("returns the list of players that gets sent to the clients", function() {
            var list = room.publicPlayerList();
            for (var i = 0; i < list.length; i++) {
                var player = list[i];
                expect( typeof player.id).toBe("number");
                expect( typeof player.score).toBe("number");
                expect( typeof player.bot).toBe("boolean");
                expect( typeof player.removed).toBe("boolean");
                expect( typeof player.isAdmin).toBe("boolean");
                //must be sure that we only send non-sensitive information
                expect(Object.keys(player).length).toBe(5)
            }
        })
        it("should send update data object to clients", function() {
            spyOn(room, "sendAll");
            room.update({});
            expect(room.sendAll).toHaveBeenCalled();
        })
        it("returns only non-bot non-removed player count", function() {
            expect(room.noBotPlayerCount()).toBe(0);
            room.players[0].bot = false;
            expect(room.noBotPlayerCount()).toBe(0);
            room.players[0].removed = false;
            expect(room.noBotPlayerCount()).toBe(1);
        })
        it("returns all non-removed players count", function() {
            expect(room.playerCount()).toBe(0);
            room.players[0].removed = false;
            expect(room.playerCount()).toBe(1);
        })
        it("adds a player to the player list and calls back", function(done) {
            //TODO: lots and lots and lots of edge case testing needs to be done here
            var player = new Player(9001, {
                emit : function() {
                }
            });
            spyOn(room,"sendAll");
            room.add(player, function() {
                expect(room.sendAll).toHaveBeenCalled();
                done();
            })
        })
        it("removes a player from the player list and tells other players", function(done) {
            //TODO: lots and lots and lots of edge case testing needs to be done here
            var player = new Player(9001, {
                emit : function() {
                }
            });
            room.add(player, function() {
                spyOn(room,"update");
                room.remove(player, function() {
                    expect(room.update).toHaveBeenCalled();
                    done();
                });
            })
        })
        it("sends a socket message to all non-removed non-bot clients", function() {
            room.players[0].removed = false;
            room.players[1].bot = true;
            room.players[1].removed = false;
            for (var i = 0; i < room.players.length; i++) {
                spyOn(room.players[i].socket, "emit");
            }
            room.sendAll("name", {})
            for (var i = 0; i < room.players.length; i++) {
                if (i == 0) {
                    expect(room.players[i].socket.emit).toHaveBeenCalled();
                } else {
                    expect(room.players[i].socket.emit).not.toHaveBeenCalled();
                }
            }
        })
        it("makes move if move is valid and is players turn, then send all", function(done) {
            //TODO: lots of edge case testing here too
            var player = new Player(9001, {
                emit : function() {
                }
            });
            room.add(player, function() {
                room.move({
                    start : {
                        i : 0,
                        j : 0
                    },
                    end : {
                        i : 0,
                        j : 1
                    }
                }, player, function(data){
                    expect(data).toBe("bad move");
                    done()
                })
            })
        })
        it("should merge scores with scoreDiff", function() {
            var scoreDiff = {};
            var oldScores = {}
            for (var i = 0; i < room.players.length; i++) {
                var player = room.players[i];
                var id = player.id;
                scoreDiff[id] = Math.floor(Math.random() * 20);
                oldScores[id] = player.score;
            }
            room.mergeScores(scoreDiff);
            for (var i = 0; i < room.players.length; i++) {
                var player = room.players[i];
                expect(player.score).toBe(oldScores[player.id] + scoreDiff[player.id]);
            }
        })
        it("should set scores to their real values based on board conditions", function() {
            room.setScores();
            var scores = room.game.getScores();
            for (var i = 0; i < room.players.length; i++) {
                var player = room.players[i];
                expect(player.score).toBe(scores[player.id]);
            }
        })
        it("should add a bot player, call botMove, and send update to players", function() {
            spyOn(room, "botMove");
            spyOn(room, "add");
            spyOn(room, "update");
            room.addBot();
            expect(room.botMove).toHaveBeenCalled();
            expect(room.add).toHaveBeenCalled();
            expect(room.update).toHaveBeenCalled();
        })
        it("should set isPublic to true and send information", function() {
            spyOn(room, "update")
            room.isPublic = false;
            room.adminStart();
            expect(room.isPublic).toBe(true);
            expect(room.update).toHaveBeenCalled();
        })
        it("should start a new game and send info", function() {
            spyOn(room, "setScores");
            spyOn(room, "update");
            room.newGame();
            expect(room.started).toBe(true);
            expect(room.setScores).toHaveBeenCalled();
            expect(room.update).toHaveBeenCalled();
        })
        it("should make the player an admin", function() {
            var p = {
                isAdmin : false
            };
            spyOn(room, "update");
            room.setAdmin(p);
            expect(p.isAdmin).toBe(true);
            expect(room.update).toHaveBeenCalled();
        })
    })
}