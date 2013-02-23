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
io.set('log level', 1);

app.engine('dust', cons.dust);

app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'dust');
    //dust.js default
    app.set('view options', {
        layout : false
    });
    
    app.disable('x-powered-by');
    
    //disable layout default
    app.locals({
        layout : false
    });

    app.configure('development', function() {
        app.use(express.logger('dev'));
    });

    app.configure('production', function() {
        app.use(express.compress());
    });

    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

    app.configure('development', function() {
        app.use(express.errorHandler());
        launch()
    });

    app.configure('production', function() {
        console.log("compresing files");
        //TODO: use promises/make less pyramidy
        var compressor = require('node-minify');
        //compress javascript using google closure compiler
        var files = ['settings', 'utils', 'sockets', 'rulesset', 'engine', 'player', 'render', 'input', 'room', 'lobby', 'index'];
        new compressor.minify({
            type : 'yui-js',
            fileIn : files.map(function(f) {
                return 'public/js/' + f + '.js'
            }),
            fileOut : 'public/js/multiversi.js',
            callback : function(err) {
                if (err) {
                    console.log(err);
                } else {
                    // compress CSS using Sqwish
                    new compressor.minify({
                        type : 'sqwish',
                        fileIn : ['public/css/base.css', 'public/css/index.css'],
                        fileOut : 'public/css/multiversi.css',
                        callback : function(err) {
                            if (err) {
                                console.log(err);
                            } else {
                                console.log("done compressing")
                                launch()
                            }
                        }
                    });
                }
            }
        });

    });
});
function launch() {
    app.get('/', routes.index);
    app.get('/:id', routes.index);

    io.sockets.on('connection', socketConnect);

    server.listen(app.get('port'), function() {
        console.log("Express server listening on port " + app.get('port'));
    });

}
