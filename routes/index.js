var settings = require('../settings')

exports.index = function(req, res) {
    res.render('index', {
        DEBUG : settings.DEBUG
    });
};

