DEBUG = !(process.env.NODE_ENV==='production');

// BOARD = "pointcontrol/swiss.json";
BOARD = undefined;

exports.DEBUG = DEBUG;
exports.BOARD = BOARD;
