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

//TODO: Brad
//instead of this, make it a form input and handle submission with jQuery/zepto
//see chat input for example
function onScreenNameInputKeyPress(e) {
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13') {
        // Enter pressed
        applyScreenName();
    }
}

function applyScreenName(form) {
    form = $(form);
    var name = form.serializeArray()[0].value;
    // form.find("input").val("");
    
    globalConnect().setName(name);
    // globalConnect().setName($("#screenNameInput").val())
    $("#screenNameOverlay").hide()
}

