// @formatter:off
var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , cons = require('consolidate')
  , socketConnect = require('./sockets');
// @formatter:on

var app = express();
var server = http.createServer(app);
io = require('socket.io').listen(server);
io.configure('development', function() {
    io.set('log level', 1);
});

app.engine('dust', cons.dust);

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'dust');
    //dust.js default
    app.set('view options', {
        layout : false
    });
    //disable layout default
    app.locals({
        layout : false
    });
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
})

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/:id', routes.index);

io.sockets.on('connection', socketConnect);

server.listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});
