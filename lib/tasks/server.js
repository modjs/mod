var utils = require('../utils'),
    file = require('../utils/file'),
    path = require('path'),
    fs = require('fs');

var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var connect = require('connect');
var Reactor = require('../utils/reactor');

exports.summary = 'Start a static web server';

exports.usage ='[options]';

exports.options = {
    "t" : {
        alias : 'target'
        ,default : '.'
        ,describe : 'target directory'
    },
    "p" : {
        alias : 'port'
        ,default : 80
        ,describe : 'server port'
    }
    ,'l':{
        alias:'log'
        ,default: false
        ,describe: "log requests"
    }
    ,'d': {
        alias: 'delay'
        ,type : 'number'
        ,describe: 'bandwidth delay'
    }
    ,"r" : {
        alias : 'reload'
        ,default: false
        ,describe : 'enable live reload changed files'
    }
    ,"w" : {
        alias : 'watch'
        ,describe : 'files be watched and reloaded'
    }
    ,'o':{
        alias: 'open'
        ,default: true
        ,describe: 'open the default browser after server starting'
    }
    ,'deploy': {
        describe: 'start as a deploy server'
    }
    ,'token': {
        describe: 'remote deploy token'
    }


};


exports.run = function (options, callback) {

    var target = path.resolve(options.target),
        port = options.port;

    var watchOptions;
    if(options.watch){
        watchOptions = {
            source: options.watch,
            tasks: ""
        }
    }

    var middleware = [];

    // auto reload server
    if(options.reload){
        middleware.push( connect.static(path.join(__dirname, '../../server/livereload')) );
        middleware.push( inject(options) );
        exports.log("reload service enable");
    }

    // deploy server
    if(options.deploy){

        middleware.push( connect.static(path.join(__dirname, '../../server/deploy')) );
        middleware.push( connect.query() );
        middleware.push( deploy(options) );
        exports.log("deploy service enable");
    }

    // log config
    if(options.log){
        // `default` ':remote-addr - - [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
        // `short` ':remote-addr - :method :url HTTP/:http-version :status :res[content-length] - :response-time ms'
        //` tiny`  ':method :url :status :res[content-length] - :response-time ms'
        // `dev` concise output colored by response status for development use
        middleware.push( connect.logger(options.log) );
    }

    // delay response config
    if(options.delay){
       middleware.push( delay(options.delay));
        exports.log("delay service enable");
    }



    // common middleware
    middleware = middleware.concat([
        // http://www.senchalabs.org/connect/middleware-errorHandler.html
        connect.errorHandler(),
        connect.favicon(),
        connect.static( target ),
        connect.directory( target )
    ]);


    // run server
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

            exports.log('success start server on port ' + port + '.');
            if(options.open) utils.open('http://127.0.0.1:'+port);
            callback(null);
        });

};

// connect delay middleware
// Fiddler2 provides an option under Rules -> Performance Menu -> Simulate Modem speeds.
// By default the Internet Connection Speed available on selecting this option will be equivalent to 6.6 Kb/s.
function delay(value){

    //From http://publik.tuwien.ac.at/files/pub-et_12521.pdf
    //
    //    Table 1. Measured ping times (32 bytes)
    //Technology Bandwidth (down/up) Mean   Std
    //  GPRS      80/40 kbit/s     488 ms   146 ms
    //  EDGE     240/120 kbit/s     504 ms   89 ms
    //  UMTS     384/128 kbit/s     142 ms   58 ms
    //  HSDPA   1800/384 kbit/s     91 ms    43 ms
    //  ADSL     1000/256 kbit/s    10.9 ms   0.8 ms
    return function delay(req, res, next) {
        if ('GET' != req.method && 'HEAD' != req.method) return next();
        debugger;
        var timeout = function() { return value; };
        if (typeof value === 'function')
            timeout = value;

        var pause = connect.utils.pause(req);
        setTimeout(function() {
            next();
            pause.resume();
        }, timeout());

    };
}

// connect inject middleware for liveload
function inject(options) {

    return function inject(req, res, next){

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
}


// deploy middleware
function deploy(options){
    var token = options.token || '';

    return function deploy(req, res, next) {

        if(req.url.indexOf('/deploy') === -1) return next();

        var query = req.query;
        var command = (query.command || '').trim();

        // console.log(query, req);

        if(query.init){
            return res.end(process.cwd());
        }

        if(!command) return res.end('command is null');

        if(query.token == token){
            var parts = command.split(/\s+/);

            var cwd = path.resolve(path.relative(process.cwd(), query.cwd? query.cwd: ''));

            try{
                // current working directory of the child process
                var cp = spawn(parts.shift(), parts, {cwd: cwd});
            }catch(e){
                res.end(e.toString());
            }

            exports.log( cwd +'> ' +command.grey);

            res.setHeader("Content-Type", "text/html; charset=UTF-8");
            cp.stdout.setEncoding('utf8');
            cp.stderr.setEncoding('utf8');

            function write(data){
                // var str = data.toString(), lines = str.split(/\n/).join('<br/>');
                // res.write(lines);
                res.write(data.toString());
            }

            cp.stdout.on("data", write);
            cp.stderr.on('data', write);

            cp.on('error', function error(err) {
                console.log('process error: ' + err);
                res.end(err.toString());
                // Send a signal to the child process. If no argument is given, the process will be sent 'SIGTERM'
                cp.kill();
            });

            cp.on('close', function exit(code){
                console.log('process close: ' + command.grey, 'exited with code ' + code);
                res.end();
            });

            // TODO: stdin is not work by http, maybe do it when use socket connection
            cp.stdin.end();

        }else{
            res.end('deploy token require');
        }


    };
}