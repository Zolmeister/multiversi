$(function() {
    if (DEBUG) {
        localStorage.name = "Guest";
    }
    
    globalConnect = ko.observable(new Connect());
    lobby = new Lobby();

    ko.applyBindings(lobby, $("#homePageView")[0]);
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
    var overlay = document.getElementById("screenNameOverlay");
    overlay.style.visibility = "visible";
}

function onScreenNameInputKeyPress(e) {
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13') {
        // Enter pressed
        applyScreenName();
    }
}

function applyScreenName() {

    var screenNameInput = document.getElementById("screenNameInput");
    if (screenNameInput) {
        var name = screenNameInput.value;

        if (name === "" || name === "Guest") {
            // Yell at user
        } else {
            localStorage.name = name;
            lobby.name = name;
            globalConnect().setName(name);
            
            var overlay = document.getElementById("screenNameOverlay");
            overlay.style.visibility = "hidden";
        }
    }
}

