
var viewTransitions = {
    homePageToRoom : 1,
    roomToHomePage : 2
}
var viewTransition = 0;
var currentView = undefined;

$(function() {
    if (DEBUG) {
        // localStorage.name = "Guest";
    }

    $("#homePageView").hide();
    $("#roomView").hide();
    var dynamicJoin = inRoom();
    
    globalConnect = ko.observable(new Connect());
    lobby = new Lobby();
    
    ko.applyBindings(lobby, $("#homePageView")[0]);

    // Position views depending on whether jumping straight into game or not
    if (dynamicJoin === false) {
        currentView = "#homePageView";
        $("#roomView").css("top", "100%");
        $(currentView).show();
    } else {
        currentView = "#roomView";
        $(currentView).css("top", "0px");
        $(currentView).show();
    }
});

function inRoom() {
    var num = window.location.href.split("/").pop();
    if (typeof num === "string" && num.length>=3) {
        return num;
    }
    return false;
}

function clickJoinRoom() {
    lobby.joinRoom();

    viewTransition = viewTransitions.homePageToRoom;
    animateTransition();
}

function clickInviteFriends() {
    lobby.createRoomPrivate(lobby);
    
    viewTransition = viewTransitions.homePageToRoom;
    animateTransition();
}

function clickLeaveRoom() {
    viewTransition = viewTransitions.roomToHomePage;
    animateTransition();
}

function joinRoomAnimationCallback() {
    $("#homePageView").hide();
    viewTransition = 0;
}

function leaveRoomAnimationCallback() {
    lobby.leaveRoom();
    viewTransition = 0;
}

function animateTransition() {
    if (viewTransition === viewTransitions.homePageToRoom) {
        currentView = "#roomView";
        $(currentView).show();
        $("#roomView").animate({top: 0}, {complete : joinRoomAnimationCallback});
    } else if (viewTransition === viewTransitions.roomToHomePage) {
        currentView = "#homePageView";
        $(currentView).show();
        $("#roomView").animate({top: "100%"}, {complete : leaveRoomAnimationCallback});
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

