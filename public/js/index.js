$(function() {
    if (DEBUG) {
        localStorage.name = "Guest";
    }
    
    globalConnect = ko.observable(new Connect());
    lobby = new Lobby();

    ko.applyBindings(lobby, $("#homePageView")[0]);
    $("#screenNameOverlay").hide();
});

function clickJoinRoom() {
    lobby.joinRoom();
    
    if (lobby.name === "" || lobby.name === "Guest") {
       openScreenNameOverlay();
    }
}

function clickInviteFriends() {
    lobby.createRoomPrivate(lobby);
    
   if (lobby.name === "" || lobby.name === "Guest") {
       openScreenNameOverlay();
   }
}


function openScreenNameOverlay() {
    $("#screenNameOverlay").show();
}

function applyScreenName(form) {
    var name = $("#screenNameInput").val();
    if (name === "" || name === "Guest") {
        // TODO: Yell at user
    } else {
        globalConnect().setName($("#screenNameInput").val())
        $("#screenNameOverlay").hide()
    }
}

