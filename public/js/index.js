$(function() {

    var windowEvent = function(e) {
        console.log(e)
        if (e.state === "room") {
            $("#roomView").stop().animate({
                top : "0%"
            }, 1000)
            $("#homePageView").stop().fadeOut();
        } else if (e.state === "lobby") {
            $("#roomView").stop().animate({
                top : "100%"
            }, 1000, function() {
                lobby.leaveRoom()
            })
            $("#homePageView").stop().fadeIn();
        }
    }
    window.history.onpushstate = windowEvent;

    var pushState = window.history.pushState;

    window.history.pushState = function(state) {
        if ( typeof window.history.onpushstate == "function") {
            window.history.onpushstate({
                state : state
            });
        }
        return pushState.apply(window.history, arguments);
    }
    globalConnect = ko.observable(new Connect());
    lobby = new Lobby();
    if (lobby.dynamicJoin) {
        $("#homePageView").hide();
        $("#roomView").stop().css({
            top : "0%"
        })
    }
    ko.applyBindings(lobby, $("#homePageView")[0]);

    window.addEventListener('popstate', windowEvent);
    window.addEventListener('pushstate', windowEvent);

    FB.init({
        appId : '128568713986892',
        xfbml : true,
        cookie : true
    });

});

function inRoom() {
    var num = window.location.href.split("/").pop();
    if ( typeof num === "string" && num.length >= 3) {
        return num;
    }
    return false;
}

function clickJoinRoom() {
    lobby.joinRoom();
}

function clickInviteFriends() {
    lobby.createRoomPrivate(lobby);
}

function clickLeaveRoom() {
    window.history.back()
}

function openScreenNameOverlay() {
    $("#screenNameOverlay").show();
}

function applyScreenName(form) {
    var name = $("#screenNameInput").val();
    if (name === "") {
        // TODO: Yell at user
    } else {
        globalConnect().setName($("#screenNameInput").val())
        $("#screenNameOverlay").hide()
    }
}

function facebookSend() {
    FB.ui({
        method : 'send',
        name : 'Join me in a game of Multiversi',
        link : lobby.room().shareUrl,
    });
}
