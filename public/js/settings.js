DEBUG = false;

GAMETYPE = "pointcontrol";

COLORS = [{
    name : "red",
    color : "#FF0017",
    activeColor : "#E21800",
    possibleMoveColor : "#FFB3BA",
    strokeColor : "#000",
    strokeActiveColor : "#eee",
    strokePossibleMoveColor : "#FF0017"
}, {
    name : "green",
    color : "#6DCF00",
    activeColor : "#44BC00",
    possibleMoveColor : "#C2FF9F",
    strokeColor : "#000",
    strokeActiveColor : "#000",
    strokePossibleMoveColor : "#6DCF00"
}, {
    name : "blue",
    color : "#8F00FF",
    activeColor : "#7800E2",
    possibleMoveColor : "#E5C2FF",
    strokeColor : "#000",
    strokeActiveColor : "#eee",
    strokePossibleMoveColor : "#8F00FF"
}];

RENDER = {
    hexShape : {
        radius : 36,
        spacingRadius : 40,
    },

    // Space stroke widths
    stroke : "0",
    strokeActive : "0",
    strokePossibleMove : "2",

    // For uncaptured spaces
    strokeColor : "#000",
    fillColor : "#D4D4D4",

    nonJumpableStroke : "3px",
    nonJumpableColor : "#444",
    nonJumpableStrokeColor : "#eee",
};

RENDER.hexShape.apothem = Math.round(Math.sqrt(3) * (RENDER.hexShape.radius / 2));
RENDER.hexShape.spacingApothem = Math.round(Math.sqrt(3) * (RENDER.hexShape.spacingRadius / 2));

// This is the offset for each space. These are fickle, don't touch
RENDER.offset = {
    x : RENDER.hexShape.spacingRadius + 1,
    y : 2 * RENDER.hexShape.spacingApothem + 1
}

