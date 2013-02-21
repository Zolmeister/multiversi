
var viewTransitions = {
    homePageToRoom : 1,
    roomToHomePage : 2
}
var viewTransition = 0;

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
        // Start on Home Page
        $("#roomView").css({
            // CSS properties here
            top : "100%"
        });
        $("#homePageView").css({
            // CSS properties here
        });
        $("#homePageView").show();
    } else {
        // Start in Wating Room
        $("#roomView").css({
            // CSS properties here
            top : "0px"
        });
        $("#homePageView").css({
            // CSS properties here
        });
        $("#roomView").show();
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
        $("#roomView").show();
        $("#roomView").animate({
            // Animation properties here
            top: 0
        }, {duration : 400, complete : joinRoomAnimationCallback});
        $("#homePageView").animate({
            // Animation properties here
        }, {duration : 400});

    } else if (viewTransition === viewTransitions.roomToHomePage) {
        $("#homePageView").show();
        $("#roomView").animate({
            // Animation properties here
            top: "100%"
        }, {duration : 400, complete : leaveRoomAnimationCallback});
        $("#homePageView").animate({
            // Animation properties here
        }, {duration : 400});
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

