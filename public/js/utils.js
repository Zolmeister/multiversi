//returns euclidian distance squared
function distance2(x1, y1, x2, y2) {
    return Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2);
}

function isInt(n) {
    return typeof n === "number" && parseFloat(n) == parseInt(n, 10) && !isNaN(n);
}

/*
 * @param {list} players
 * @param {id} id
 * @return {number} index
 */
function getPlayerIndex(players, id) {
    for (var i = 0; i < players.length; i++) {
        if (players[i].id === id) {
            return i
        }
    }
    return -1;
}