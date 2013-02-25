$(function() {
    $("#roomView").hide()
    var windowEvent = function(e) {
        if (e.state === "room") {
            console.log("room state, animating")
            $("body").css({overflow: "hidden"})
            $("#roomView").show()
            $("#roomView").stop().animate({
                top : "0%"
            }, 500, function(){
                $("body").css({overflow: "auto"})
            })
            $("#homePageView").stop().fadeOut();
        } else if (e.state === "lobby") {
            $("body").css({overflow: "hidden"})
            $("#roomView").stop().animate({
                top : "100%"
            }, 300, function() {
                lobby.leaveRoom()
                $("#roomView").hide()
                $("body").css({overflow: "auto"})
            })
            
            $("#homePageView").stop().fadeIn();
        }
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
    $(document).on('pushstate', function(e) {
        windowEvent(e.message)
    });

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
    window.history.back();
}

function addBot() {
    globalConnect().roomAdmin("addBot", "");
}

function startGame(){
    globalConnect().roomAdmin("start", "")
}

function openScreenNameOverlay() {
    $("#screenNameInput").val(localStorage.name);
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
        name : 'Multiversi',
        description: 'Join me in a game of Multiversi: '+lobby.room().shareUrl,
        link : lobby.room().shareUrl
    });
}

function twitterSend(){
    var width  = 575,
        height = 400,
        left   = (window.innerWidth  - width)  / 2,
        top    = (window.innerHeight - height) / 2,
        url    = "https://twitter.com/share?text=Join me in a game of Multiversi&url="+lobby.room().shareUrl,
        opts   = 'status=1' +
                 ',width='  + width  +
                 ',height=' + height +
                 ',top='    + top    +
                 ',left='   + left;

    window.open(url, 'twitter', opts);

    return false;
}

