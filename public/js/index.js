
var viewTransitions = {
    homePageToRoom : 1,
    roomToHomePage : 2
}
var viewTransition = 0;

$(function() {
    if (DEBUG) {
        // localStorage.name = "Guest";
    }

    //$("#homePageView").hide();
    //$("#roomView").hide();
    
    var windowEvent = function(e) {
        console.log(e)
        if (e.state === "room") {
            //setStartCSSRoom();
            //$("#roomView").show();
            $("#roomView").stop().animate({
                top: "0%"
            }, 1000)
            $("#homePageView").stop().fadeOut();
        }
        else if(e.state === "lobby"){
            //setStartCSSHomePage();
            $("#roomView").stop().animate({
                top: "100%"
            }, 1000, function(){
                lobby.leaveRoom()
            })
            $("#homePageView").stop().fadeIn();
            //$("#roomView").stop().fadeOut();
        }
    }
    window.history.onpushstate = windowEvent;
    
    
    var pushState = window.history.pushState;
    
    window.history.pushState = function(state) {
        if (typeof window.history.onpushstate == "function") {
            window.history.onpushstate({state: state});
        }
        return pushState.apply(window.history, arguments);
    }
    
    
    globalConnect = ko.observable(new Connect());
    lobby = new Lobby();
    if(lobby.dynamicJoin){
        $("#homePageView").hide();
        $("#roomView").stop().css({
                top: "0%"
        })
    }
    ko.applyBindings(lobby, $("#homePageView")[0]);

    window.addEventListener('popstate', windowEvent);
    window.addEventListener('pushstate', windowEvent);

    // Position views depending on whether jumping straight into game or not
    //if (dynamicJoin === false) {
        // Start on Home Page
        //setStartCSSHomePage();
    //    $("#homePageView").fadeIn(1000);
    //} else {
        // Start in Waiting Room
        //setStartCSSRoom();
    //    $("#roomView").fadeIn(1000);
    //}
});

function inRoom() {
    var num = window.location.href.split("/").pop();
    if (typeof num === "string" && num.length>=3) {
        return num;
    }
    return false;
}
/*
function setStartCSSHomePage() {
    // Start on Home Page
    $("#roomView").show();
    $("#homePageView").show();
}

function setStartCSSRoom() {
    $("#roomView").show();
    $("#homePageView").hide();
}*/

function clickJoinRoom() {
    lobby.joinRoom();

    //viewTransition = viewTransitions.homePageToRoom;
    //animateTransition();
}

function clickInviteFriends() {
    lobby.createRoomPrivate(lobby);
    
    //viewTransition = viewTransitions.homePageToRoom;
    //animateTransition();
}

function clickLeaveRoom() {
    window.history.back()
    //lobby.leaveRoom();
    //viewTransition = viewTransitions.roomToHomePage;
    //animateTransition();
}

function joinRoomAnimationCallback() {
    //$("#homePageView").hide();
    //viewTransition = 0;
}

function leaveRoomAnimationCallback() {
    //lobby.leaveRoom();
    //$("#roomView").hide();
    //viewTransition = 0;
}
/*
function animateTransition() {
    if (viewTransition === viewTransitions.homePageToRoom) {
        $("#roomView").show();
        $("#roomView").animate({
            // Animation properties here
            top: 0,
        }, {duration : 400, complete : joinRoomAnimationCallback});
        $("#homePageView").animate({
            opacity: 0
        }, {duration : 400});

    } else if (viewTransition === viewTransitions.roomToHomePage) {
        $("#homePageView").show();
        $("#roomView").animate({
            // Animation properties here
            top: "100%"
        }, {duration : 400, complete : leaveRoomAnimationCallback});
        $("#homePageView").animate({
            opacity: 1,
        }, {duration : 400});
    }
}*/

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

