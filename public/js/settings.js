DEBUG = true;

GAMETYPE = "pointcontrol";

COLORS = [{
    name : "red",
    color : "#caa",
    activeColor : "#d66",
    moveColor : "#edd"
}, {
    name : "green",
    color : "#aca",
    activeColor : "#6d6",
    moveColor : "#ded"
}, {
    name : "blue",
    color : "#aac",
    activeColor : "#66d",
    moveColor : "#dde"
}];

RENDER = {
    hexShape : {
        radius : 36,
        apothem : 31,
        spacingRadius : 40,
        spacingApothem : Math.sqrt(3) * (40 / 2)
    }
};

// This is the offset for each space. These are fickle, don't touch
RENDER.offset = {
    x : RENDER.hexShape.spacingRadius + 1,
    y : 2 * RENDER.hexShape.spacingApothem + 1
}

