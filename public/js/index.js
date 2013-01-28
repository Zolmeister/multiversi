$(function() {
    globalConnect = ko.observable(new Connect());
    lobby = new Lobby();

    ko.applyBindings(lobby, $("#lobbyView")[0]);
});
