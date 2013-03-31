var utils = require('../utils'),
    file = require('../utils/file'),
    path = require('path'),
    util = require('util'),
    events = require('events'),
    fs = require('fs'),
    http = require('http');

var connect = require('connect');
var WebSocket = require('faye-websocket');

exports.summary = 'Start a static web server';

exports.usage ='[options]';

exports.options = {
    "t" : {
        alias : 'target'
        ,default : '.'
        ,describe : 'include source parent directory'
    },
    "p" : {
        alias : 'port'
        ,default : 80
        ,describe : 'include source parent directory'
    }
    ,"r" : {
        alias : 'reload'
        ,describe : 'enable live reload changed files'
    }

    ,"w" : {
        alias : 'watch'
        ,describe : 'files be watched and reloaded'
    }

};


exports.run = function (options, callback) {

    var target = path.resolve(options.target),
        port = options.port;

    var watchOptions;

    //
    if(options.watch){
        watchOptions = {
            source: options.watch,
            tasks: ""
        }
    }

    var middleware = [];

    if(options.reload){

        middleware.push( connect.static(path.join(__dirname, '../../server/livereload')) );
        middleware.push( inject.bind(this, options) );
        middleware.push( connect.errorHandler() );

        exports.log("enable reload service");
    }

    middleware = middleware.concat([
        connect.favicon(),
        connect.static( target ),
        connect.directory( target )
    ]);

    if(options.log){
        middleware.push( connect.logger('dev') );
    }

    connect.apply(null, middleware)
        .on('error', function( err ) {
            if ( err.code === 'EADDRINUSE' ) {
                return this.listen(0); // 0 means random port
            }

            // not an EADDRINUSE error, buble up the error
            callback(err);
        })
        .listen(port, function(err) {

            if(err){
                callback(err);
            }

            var port = this.address().port;

            // if enable reload service
            if(options.reload){

                // create the reactor object
                // reload server
                var reactor = new Reactor( {
                    server: this,
                    apiVersion: '1.7',
                    host: 'localhost',
                    port: port
                } );

                var defaultWatchOptions = {
                    source: "./**/*.*",
                    tasks: ""
                };

                exports.runTask('watch', watchOptions || exports.getTaskConfig('watch') || defaultWatchOptions, function(err, watcher){

                    watcher.on('changed', function(changedFiles){
                        // console.log(changedFiles)
                        reactor.reload(changedFiles);
                    });

                    exports.log("reload watch task start");
                });

            }


            callback(null, 'Starting static web server on port ' + port + '.');
        });




};


// https://github.com/yeoman/yeoman/blob/master/cli/tasks/server.js
// Reactor object
// ==============

// Somewhat a port of guard-livereload's Reactor class
// https://github.com/guard/guard-livereload/blob/master/lib/guard/livereload/reactor.rb
//
// XXX may very well go into our lib/ directory (which needs a good cleanup)

function Reactor(options) {
    this.sockets = {};

    if ( !options.server ) {
        throw new Error('Missing server option');
    }

    this.server = options.server;

    if ( !( this.server instanceof http.Server ) ) {
        throw new Error('Is not a valid HTTP server');
    }

    this.options = options || {};
    this.uid = 0;

    this.start();
}

util.inherits(Reactor, events.EventEmitter);

// send a reload command on all stored web socket connection
Reactor.prototype.reload = function reload(changedFiles) {
    var sockets = this.sockets;
    var files = Object.keys(changedFiles);

    // go through all sockets, and emit a reload command
    Object.keys(sockets).forEach(function(id) {
        var ws = sockets[id],
            version = ws.livereloadVersion;

        // go throuh all the files that has been marked as changed by grunt
        // and trigger a reload command on each one, for each connection.
        files.forEach(this.reloadFile.bind(this, version));
    }, this);
};

Reactor.prototype.reloadFile = function reloadFile(version, filepath) {
    // > as full as possible/known, absolute path preferred, file name only is
    // > OK
    filepath = path.resolve(filepath);

    // support both "refresh" command for 1.6 and 1.7 protocol version
    var data = version === '1.6' ? ['refresh', {
        path: filepath,
        apply_js_live: true,
        apply_css_live: true
    }] : {
        command: 'reload',
        path: filepath,
        liveCSS: true,
        liveJS: true
    };

    this.send(data);
};

Reactor.prototype.start = function start() {
    // setup socket connection
    this.server.on('upgrade', this.connection.bind(this));
};

Reactor.prototype.connection = function connection(request, socket, head) {

    var ws = new WebSocket(request, socket, head),
        wsId = this.uid = this.uid + 1;

    // store the new connection
    this.sockets[wsId] = ws;

    ws.onmessage = function(event) {
        // message type
        if ( event.type !== 'message' ) {
            return console.warn('Unhandled ws message type');
        }

        // parse the JSON data object
        var data = this.parseData(event.data);

        // attach the guessed livereload protocol version to the sokect object
        ws.livereloadVersion = data.command ? '1.7' : '1.6';

        // data sent wasn't a valid JSON object, assume version 1.6
        if ( !data.command ) {
            return ws.send('!!ver:1.6');
        }

        // valid commands are: url, reload, alert and hello for 1.7

        // first handshake
        if ( data.command === 'hello' ) {
            return this.hello( data );
        }

        // livereload.js emits this
        if ( data.command === 'info' ) {
            return this.info( data );
        }
    }.bind(this);

    ws.onclose = function() {
        ws = null;
        delete this.sockets[wsId];

        this.ws = null;
    }.bind(this);


    this.ws = ws;

};

Reactor.prototype.parseData = function parseData(str) {
    var data = {};
    try {
        data = JSON.parse(str);
    } catch (e) {}
    return data;
};

Reactor.prototype.hello = function hello() {
    this.send({
        command: 'hello',
        protocols: [
            'http://livereload.com/protocols/official-7'
        ],
        serverName: 'mod-livereload'
    });

};

// noop
Reactor.prototype.info = function info() {};

Reactor.prototype.send = function send(data) {
    var ws = this.ws;

    ws.send(JSON.stringify(data));
};



// LiveReload
// ----------

function inject(options, req, res, next) {

    // build filepath from req.url and deal with index files for trailing `/`
    var filepath = req.url.slice(-1) === '/' ? req.url + 'index.html' : req.url;

    // if ext is anything but .html, let it go through usual connect static
    // middleware.
    if ( path.extname( filepath ) !== '.html' ) {
        return next();
    }

    var port = res.socket.server.address().port;

    // setup some basic headers, at this point it's always text/html anyway
    res.setHeader('Content-Type', connect.static.mime.lookup(filepath));

    // can't use the ideal stream / pipe case, we need to alter the html response
    // by injecting that little livereload snippet
    filepath = path.join(options.target, filepath.replace(/^\//, ''));
    fs.readFile(filepath, 'utf8', function(e, body) {
        if(e) {
            // go next and silently fail
            return next();
        }

//        body = body.replace(/<\/body>/, function(w) {
//            return [
//                "<!-- mod livereload snippet -->",
//                "<script>document.write('<script src=\"http://'",
//                " + (location.host || 'localhost').split(':')[0]",
//                " + ':" + port + "/livereload.js?snipver=1\"><\\/script>')",
//                "</script>",
//                "",
//                w
//            ].join('\n');
//        });

        body += ["<!-- mod livereload snippet -->",
                "<script>document.write('<script src=\"http://'",
                " + (location.host || 'localhost').split(':')[0]",
                " + ':" + port + "/livereload.js?snipver=1\"><\\/script>')",
                "</script>"
            ].join('\n');

        res.end(body);

        // exports.log("inject", filepath);

    });
}