var utils = require('../utils');
var file = require('../utils/file');
var path = require('path');
var fs = require('fs');
var exec = require('child_process').exec;
var spawn = require('child_process').spawn;
var urlParse = require('url').parse;

exports.summary = 'Start a static web server';

exports.usage ='[options]';

exports.options = {
    "target" : {
        alias : 't'
        ,default : '.'
        ,describe : 'target directory'
    },
    "port" : {
        alias : 'p'
        ,default : 3000
        ,describe : 'server port'
    }
    ,'log':{
        alias:'l'
        ,default: false
        ,describe: "log requests"
    }
    ,'delay': {
        alias: 'd'
        ,type : 'number'
        ,describe: 'bandwidth delay'
    }
    ,"reload" : {
        alias : 'r'
        ,default: false
        ,describe : 'enable live reload changed files'
    }
    ,"watch" : {
        alias : 'w'
        ,describe : 'files be watched and reloaded'
    }
    ,"console": {
        default: false
        ,describe : 'enable remote logging service'
    }
    ,"proxies": {
        type: "array",
        describe : 'enable request proxy'
    }
    ,'open':{
        alias: 'o'
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

exports.run = function (options, done) {

    var connect = require('connect');

    var target = path.resolve(options.target);
    var port = options.port;

    var watchOptions;
    if(options.watch){
        watchOptions = {
            src: options.watch,
            tasks: ""
        }
    }

    var middleware = [];

    if(options.proxies){
        var proxy  = require('../utils/proxy');
        proxy.config(options.proxies);
        middleware.push(proxy.proxyRequest);
    }

    if(options.console){
        exports.log("remote logging service enable");

        var consolePort = options.consolePort = Number(String(options.console)) || 9999;
        var consoleId = options.consoleId = utils.randomString();

        // start a standalone logging server
        connect.router =  require('../utils/router');
        var consoleServer = connect.createServer(
            connect.bodyParser(),
            connect.static(path.join(__dirname, '../../asset/jsconsole')),
            connect.router( require('../utils/remotelogging') )
        );

        consoleServer.listen(consolePort);
        exports.log('success start remote logging server on port ' + consolePort + '.');

        var url = 'http://127.0.0.1:'+ consolePort + '/?:listen ' + consoleId;
        exports.log('open browser:', url.green);
        utils.open(url);
    }

    // auto reload server
    if(options.reload) {
        middleware.push( connect.static(path.join(__dirname, '../../asset/livereload')) );
        exports.log("reload service enable");
    }

    if(options.reload || options.console) {
        middleware.push( injectScript(options, connect) );
    }

    // deploy server
    if(options.deploy){
        middleware.push( connect.multipart({defer: true}) );
        middleware.push( connect.static(path.join(__dirname, '../../asset/deploy')) );
        middleware.push( connect.query() );
        middleware.push( upload(options, connect) );
        middleware.push( execution(options, connect) );
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
       middleware.push( delay(options, connect));
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
            done(err);
        })
        .listen(port, function(err) {

            if(err){
                done(err);
            }

            var port = this.address().port;

            // if enable reload service
            if(options.reload){
                var Reactor = require('../utils/reactor');
                // create the reactor object
                // reload server
                var reactor = new Reactor( {
                    server: this,
                    apiVersion: '1.7',
                    host: 'localhost',
                    port: port
                } );

                var defaultWatchOptions = {
                    src: "./**/*.*",
                    tasks: ""
                };

                exports.runTask('watch', watchOptions || exports.config().tasks.watch || defaultWatchOptions, function(err, watcher){

                    watcher.on('changed', function(changedFiles){
                        // console.log(changedFiles)
                        reactor.reload(changedFiles);
                    });

                    exports.log("reload watch task start");
                });

            }

            exports.log('success start server on port ' + port + '.');
            if(options.open) {
                var url = 'http://127.0.0.1:'+port;
                exports.log('open browser:', url.green);
                utils.open(url);
            }
            done(null);
        });

};

// connect delay middleware
// Fiddler2 provides an option under Rules -> Performance Menu -> Simulate Modem speeds.
// By default the Internet Connection Speed available on selecting this option will be equivalent to 6.6 Kb/s.
function delay(options, connect){

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

        if ('GET' != req.method && 'HEAD' != req.method){
            return next(); 
        } 

        var timeout = 0;
        if (typeof options.delay === 'function'){
            timeout = options.delay();
        }else{
            timeout = Number(options.delay);
        }

        var pause = connect.utils.pause(req);
        setTimeout(function() {
            next();
            pause.resume();
        }, timeout);

    };
}

// connect inject middleware for liveload and jsconsole
function injectScript(options, connect) {

    return function (req, res, next){

        // build filepath from req.url and deal with index files for trailing `/`
        var filepath = req.url.slice(-1) === '/' ? req.url + 'index.html' : req.url;
        // strip querystring
        filepath =  urlParse(filepath).pathname;
        // if ext is anything but .html, let it go through usual connect static middleware.
        if ( path.extname(filepath) !== '.html' ) {
            return next();
        }

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

            if(options.console)

                body = ["<!-- jsconsole snippet -->",
                    "<script>document.write('<script src=\"http://'",
                    " + (location.host || 'localhost').split(':')[0]",
                    " + ':" + options.consolePort  + "/remote.js?"+ options.consoleId  +"\"><\\/script>')",
                    "</script>"
                ].join('\n') + body;

            if(options.reload){
                var port = res.socket.server.address().port;
                body += ["<!-- livereload snippet -->",
                    "<script>document.write('<script src=\"http://'",
                    " + (location.host || 'localhost').split(':')[0]",
                    " + ':" + port + "/livereload.js?snipver=1\"><\\/script>')",
                    "</script>"
                ].join('\n');
            }

            res.end(body);

            // exports.log("inject", filepath);

        });

    }
}

function upload(options, connect){
    var token = options.token || '';

    return function upload(req, res, next) {

        if(req.url.indexOf('/upload') === -1) return next();

        var query = req.query;
        var form = req.form;
        // File save path
        var destfile = query.dest;
        var existed = file.exists(destfile);
        // Overwrite existed file default
        var overwrite = query.overwrite !== 'false';

        if(query.token == token) {

            function part(part){
                // part.name - the field name for this part
                // part.filename - only if the part is an incoming file

                if(overwrite || !existed){
                    // Assume parent dirs created
                    file.mkdir(path.dirname(destfile));
                    var out = fs.createWriteStream(destfile);
                    part.pipe(out);
                }
            }

            var bodyRawBufferList = [];
            function data(data){
                if(overwrite || !existed){
                    // Assume parent dirs created
                    bodyRawBufferList.push(data);
                }
            }

            function close(){

                if(bodyRawBufferList[0]){
                    var bodyRawBuffer = Buffer.concat(bodyRawBufferList);
                    file.mkdir(path.dirname(destfile));
                    fs.writeFileSync(destfile, bodyRawBuffer);
                    bodyRawBufferList = [];
                }

                var result = '';
                if(overwrite || !existed){
                    result = 'uploaded';
                }else {
                    result = 'existed';
                }

                res.end(result);
                exports.log('uploaded', destfile);
            }

            if(form) {
                form.on('part', part);
                form.on('close', close);
            }else {
                req.on('data', data);
                req.on('end', close);
            }

        }else{
            res.end('deploy token require');
        }

    };
}

// execution middleware
function execution (options, connect){
    var token = options.token || '';


    // TODO: stdin is not work by http, maybe do it when use socket connection
    return function execution(req, res, next) {

        if(req.url.indexOf('/exec') === -1) return next();

        var query = req.query;
        var command = (query.command || '').trim();

        // console.log(query, req);

        if(query.init){
            return res.end(process.cwd());
        }

        if(!command) return res.end('command is null');

        if(query.token == token) {

            res.setHeader("Content-Type", "text/html; charset=UTF-8");

            var args = command.split(/\s+/);
            var bin = args.shift();

            // command blacklist
            if(['ssh'].indexOf(bin) > -1) return res.end(bin + ' not support');

            if(bin === 'svn'){
                args = args.concat(['--non-interactive', '--trust-server-cert', '--force']);
            }

            var cwd = path.resolve(path.relative(process.cwd(), query.cwd? query.cwd: ''));

            try{
                exports.log( cwd +' > ' +command.grey);
                // current working directory of the child process
                var cp = spawn(bin, args, {cwd: cwd, timeout: 60000, stdio: [ 'pipe', 'pipe', 'pipe', 'ipc']});

                // By default, the parent will wait for the detached child to exit.
                // To prevent the parent from waiting for a given child, use the child.unref() method,
                // and the parent's event loop will not include the child in its reference count.
                cp.unref();
            }catch(e){
                return res.end(e.toString());
            }

            function write(data){
                // var str = data.toString(), lines = str.split(/\n/).join('<br/>');
                // res.write(lines);
                res.write(data.toString());
            }

            // cp.stdin.resume();
            // cp.stdin.setEncoding('utf8');
            // cp.stdin.write('\n');
            // cp.stdin.on('data', function(data){
            //    console.log('process input:' + data)
            // });

            cp.stdout.on("data", write);
            cp.stderr.on('data', write);

            cp.on('error', function error(err) {
                exports.log('process error: ' + err);
                res.end(err.toString());
                // Send a signal to the child process. If no argument is given, the process will be sent 'SIGTERM'
                cp.kill();
            });

            cp.on('close', function exit(code){
                exports.log('process close: ' + command.grey, 'exited with code ' + code);
                res.end();
            });

            function end(signal){
                exports.log('process signal: '+ signal );
            }

            // TODO: above signal events do not work now
            // Hangup detected on controlling terminal or death of controlling process
            cp.on('SIGHUP', end.bind(this, 'SIGHUP'));

            // Interrupt from keyboard
            cp.on('SIGINT', end.bind(this, 'SIGINT'));

            // Termination signal
            cp.on('SIGTERM', end.bind(this, 'SIGTERM'));

            // tty input for background process
            cp.on('SIGTTIN', end.bind(this, 'SIGTTIN'));

            // Stop typed at tty
            cp.on('SIGTSTP', end.bind(this, 'SIGTSTP'))

        }else{
            res.end('deploy token require');
        }

    };
}
