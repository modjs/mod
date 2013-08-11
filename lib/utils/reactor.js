var util = require('util');
var http = require('http');
var path = require('path');
var events = require('events');
var WebSocket = require('faye-websocket');

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

module.exports  = Reactor;

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
