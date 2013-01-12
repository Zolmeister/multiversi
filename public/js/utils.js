//returns euclidian distance squared
function distance2(x1, y1, x2, y2) {
	return Math.pow((x2 - x1), 2) + Math.pow((y2 - y1), 2);
}

//adds index properties to knockout array
function indexSubscribe(array) {
	array.subscribe(function() {
		for (var i = 0, j = array().length; i < j; i++) {
			var item = array()[i];
			if (!item.index) {
				item.index = ko.observable(i);
			} else {
				item.index(i);
			}
		}
	});
};