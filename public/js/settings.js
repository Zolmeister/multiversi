DEBUG = false;

GAMETYPE = "pointcontrol";

COLORS = [{
    name : "red",
    color : "#caa",
    activeColor : "#d66",
    possibleMoveColor : "#edd",
    strokeColor : "#000",
    strokeActiveColor : "#000",
    strokePossibleMoveColor : "#000"
}, {
    name : "green",
    color : "#aca",
    activeColor : "#6d6",
    possibleMoveColor : "#ded",
    strokeColor : "#000",
    strokeActiveColor : "#000",
    strokePossibleMoveColor : "#000"
}, {
    name : "blue",
    color : "#aac",
    activeColor : "#66d",
    possibleMoveColor : "#dde",
    strokeColor : "#000",
    strokeActiveColor : "#000",
    strokePossibleMoveColor : "#000"
}];

RENDER = {
    hexShape : {
        radius : 36,
        spacingRadius : 40,
    },

    // Space stroke widths
    stroke : "1px",
    strokeActive : "2px",
    strokePossibleMove : "2px",

    // For uncaptured spaces
    strokeColor : "#000",
    fillColor : "#fff",

    nonJumpableStroke : "1px",
    nonJumpableColor : "#444",
    nonJumpableStrokeColor : "#000",
};

RENDER.hexShape.apothem = Math.round(Math.sqrt(3) * (RENDER.hexShape.radius / 2));
RENDER.hexShape.spacingApothem = Math.round(Math.sqrt(3) * (RENDER.hexShape.spacingRadius / 2));

// This is the offset for each space. These are fickle, don't touch
RENDER.offset = {
    x : RENDER.hexShape.spacingRadius + 1,
    y : 2 * RENDER.hexShape.spacingApothem + 1
}

