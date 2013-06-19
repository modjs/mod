var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var async = require('async');
var mkdirp = require('mkdirp');
var request = require('request');
var logger = require('./logger');
var prompt = require('prompt');
var url = require('url');


var pathExists = fs.exists || path.exists;

exports.moduleName =function(module){
     var ext= path.extname(module.filename);
     return path.basename(module.filename, ext);
};

exports.usage = function(cmd){
    return "Usage:".green + " mod "+ cmd;
};


exports.isPlainObject = function(obj){
    return Object.prototype.toString.call(obj) === '[object Object]';
};

/**
 * Looks for a project's package.json file. Walks up the directory tree until
 * it finds a package.json file or hits the root. Does not throw when no
 * packages.json is found, just returns null.
 *
 * @param p - The starting path to search upwards from
 * @param callback - callback(err, path)
 */
exports.findPackageJSON = function (p, callback) {
    var filename = path.resolve(p, 'package.json');
    pathExists(filename, function (exists) {
        if (exists) {
            return callback(null, filename);
        }
        var newpath = path.dirname(p);
        if (newpath === p) { // root directory
            return callback(null, null);
        }
        else {
            return exports.findPackageJSON(newpath, callback);
        }
    });
};

/**
 * Reads the version property from modjs's package.json
 */
exports.getVersion = async.memoize(function (callback) {

    exports.findPackageJSON(__dirname, function (err, p) {
        if (err) {
            callback(err);
        }

        exports.readJSON(p, function (err, pkg) {
            callback(null, pkg.version);
        });
    });


});


/**
 * read a file from the filesystem and parse as JSON
 * @param {String} filepath
 * @param {function} callback
 */
exports.readJSON = function (filepath, callback) {

    if(callback){
        fs.readFile(filepath, 'utf-8', function (err, data) {
            if (err) {
                return callback(err);
            }

            try {
                var json = JSON.parse(data);
                callback(null, json);
            }
            catch (err) {
                return callback(err);
            }
        });
    }

    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
};


exports.getConfirmation = function (msg, callback) {
    function trim(str) {
        var trimmed = str.replace(/^\s*/, '');
        return trimmed.replace(/\s*$/, '');
    }

    if (!prompt.started) {
        prompt.start();
    }

    var val;
    async.until(
        function () {
            var valid = (val === '' || val === 'y' || val === 'n');
            if (!valid) {
                process.stdout.write(msg + ' [Y/n]: ');
            }
            return valid;
        },
        function (cb) {
            prompt.readLine(function (err, line) {
                if (err) {
                    return cb(err);
                }
                val = trim(line).toLowerCase();
                cb();
            });
        },
        function (err) {
            callback(err, val === '' || val === 'y');
        }
    );
};


exports.request = function(){
    // TODO autoproxy request
};


exports.getHttpProxy = function ( hostname ){

    hostname = url.parse(hostname).hostname || hostname;

    if( ["localhost","127.0.0.1"].indexOf( hostname ) === -1 ){
        return process.env[ "HTTP_PROXY" ] || process.env[ "http_proxy" ];
    }

};

exports.download = function (file, target, callback) {
    var urlinfo = url.parse(file);
    var proxy = exports.getHttpProxy( urlinfo.hostname );

    var _cb = callback;
    callback = function (err) {
        var that = this;
        var args = arguments;
        if (err) {
            rimraf(target, function (err) {
                if (err) {
                    // let the original error through, but still output this one
                    logger.error(err);
                }
                _cb.apply(that, args);
            });
            return;
        }
        _cb.apply(that, args);
    };

    mkdirp(path.dirname(target), function (err) {
        if (err) {
            return callback(err);
        }
        var headers = {};
        if (urlinfo.auth) {
            var enc = new Buffer(urlinfo.auth).toString('base64');
            headers.Authorization = "Basic " + enc;
        }
        var req = request({
            url: urlinfo,
            method: 'GET',
            headers: headers,
            proxy: proxy
        }, function() {
            callback(null, target);
        } );
        req.on('response', function (response) {
            if (response.statusCode >= 300) {
                this.abort();
                return callback(exports.getStatusCodeMsg(response.statusCode));
            }
        }).on('error', function (err) {
            callback(err);
        });
        req.pipe(fs.createWriteStream(target));
    });
};

exports.clone = function(obj){
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Takes values from package.json and returns an object modified for use as the
 * root of a mod package dependency tree.
 */
exports.convertToRootCfg = function (cfg) {
    // clone cfg object from package.json and replace npm deps with mod deps
    var newcfg = exports.clone(cfg);
    newcfg.name = '_root';
    //newcfg.webDependencies = newcfg.browser ? (newcfg.browser.dependencies || {}): newcfg.webDependencies || {};
    newcfg.webDependencies = null;
    return newcfg;
};



/**
 * Deep merge for JSON objects, overwrites conflicting properties
 *
 * @param {Object} a
 * @param {Object} b
 * @returns {Object}
 */
exports.merge = function (a, b) {
    if (!b) {
        return a;
    }
    for (var k in b) {
        if (Array.isArray(b[k])) {
            a[k] = b[k];
        }
        else if (typeof b[k] === 'object') {
            if (typeof a[k] === 'object') {
                exports.merge(a[k], b[k]);
            }
            else if (b.hasOwnProperty(k)) {
                a[k] = b[k];
            }
        }
        else if (b.hasOwnProperty(k)) {
            a[k] = b[k]
        }
    }
    return a;
};


/**
 * Tests if 'b' is a subpath of 'a', returns true/false.
 *
 * eg, 'foo', 'foo' => true
 *     'foo', 'bar' => false
 *     'foo', 'foo/bar' => true
 *     'foo', 'bar/foo' => false
 */

exports.isSubPath = function (a, b) {
    var ap = a.split('/');
    var bp = b.split('/');
    for (var i = 0; i < ap.length; i++) {
        if (bp[i] !== ap[i]) {
            return false;
        }
    }
    return true;
};

exports.open = function(target, appName, callback) {
    var opener;

    if (typeof(appName) === 'function') {
        callback = appName;
        appName = null;
    }

    function escape(s) {
        return s.replace(/"/, '\\\"');
    }

    // http://nodejs.org/api/process.html#process_process_platform
    // What platform you're running on: 'darwin', 'freebsd', 'linux', 'sunos' or 'win32'
    switch (process.platform) {
        case 'darwin':
            if (appName) {
                opener = 'open -a "' + escape(appName) + '"';
            } else {
                opener = 'open';
            }
            break;
        case 'win32':
            // if the first parameter to start is quoted, it uses that as the title
            // so we pass a blank title so we can quote the file we are opening
            if (appName) {
                opener = 'start "" "' + escape(appName) + '"';
            } else {
                opener = 'start ""';
            }
            break;
        default:
            if (appName) {
                opener = escape(appName);
            } else {
                opener ='xdg-open';
            }
            break;
    }

    return require('child_process').exec(opener + ' "' + escape(target) + '"', callback);
}



exports.argumentsStringify = function(args){

    return  _.toArray(args).map(function(arg){
        if(_.isObject(arg))
            return JSON.stringify(arg, null, "    ");
        else
            return arg;
    }).join(' ');

};

exports.arrayify = function(arg){

    if(!_.isString(arg)) return arg;

    return arg.split(",").map(function(x){
        return x.trim()
    }).filter(function(x){
        return x
    });
};


/**
 * Checks if a given piece of text (sctipt, stylesheet) is minified.
 *
 * The logic is: we strip consecutive spaces, tabs and new lines and
 * if this improves the size by more that 20%, this means there's room for improvement.
 *
 * @param {String} contents The text to be checked for minification
 * @return {Boolean} TRUE if minified, FALSE otherwise
 */
exports.isMinified= function (contents) {
    var len = contents.length,
        striplen;

    if (len === 0) { // blank is as minified as can be
        return true;
    }

    // TODO: enhance minifier logic by adding comment checking: \/\/[\w\d \t]*|\/\*[\s\S]*?\*\/
    // even better: add jsmin/cssmin
    striplen = contents.replace(/\n| {2}|\t|\r/g, '').length; // poor man's minifier
    if (((len - striplen) / len) > 0.1) { // we saved 10%, so this component can get some mifinication done
        return false;
    }

    return true;
};

var STATUS_MSGS = {
    400: '400: Bad Request',
    401: '401: Unauthorized',
    402: '402: Payment Required',
    403: '403: Forbidden',
    404: '404: Not Found',
    405: '405: Method Not Allowed',
    406: '406: Not Acceptable',
    407: '407: Proxy Authentication Required',
    408: '408: Request Timeout',
    409: '409: Conflict',
    410: '410: Gone',
    411: '411: Length Required',
    412: '412: Precondition Failed',
    413: '413: Request Entity Too Large',
    414: '414: Request-URI Too Long',
    415: '415: Unsupported Media Type',
    416: '416: Requested Range Not Satisfiable',
    417: '417: Expectation Failed',
    418: '418: I\'m a teapot',
    422: '422: Unprocessable Entity',
    423: '423: Locked',
    424: '424: Failed Dependency',
    425: '425: Unordered Collection',
    444: '444: No Response',
    426: '426: Upgrade Required',
    449: '449: Retry With',
    450: '450: Blocked by Windows Parental Controls',
    499: '499: Server Closed Request',
    500: '500: Internal Server Error',
    501: '501: Not Implemented',
    502: '502: Bad Gateway',
    503: '503: Service Unavailable',
    504: '504: Gateway Timeout',
    505: '505: HTTP Version Not Supported',
    506: '506: Variant Also Negotiates',
    507: '507: Insufficient Storage',
    509: '509: Bandwidth Limit Exceeded',
    510: '510: Not Extended'
};

/**
 * Creates an error object with a message depending on the HTTP status code
 * of a response.
 */

exports.getStatusCodeMsg = function (code) {
    if (code in STATUS_MSGS) {
        return new Error(STATUS_MSGS[code]);
    }
    return new Error('Status code: ' + code);
};



exports.loadPackageJSON = function (dir, callback) {
    var file = path.resolve(dir, 'package.json');
    exports.readJSON(file, function (err, json) {
        if (!err) {
            try {
                exports.validatePackageJSON(json, file);
            }
            catch (e) {
                logger.warn(e.toString());
            }
        }

        callback(null, json ||  {webDependencies:{}} );
    });
};


/**
 * validate if package.json have config name, version, description
 * @param json
 * @param filename
 */
exports.validatePackageJSON = function (json, filename) {
    if (!json.name) {
        throw new Error('Missing name property in ' + filename);
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_\-\.]*$/.test(json.name)) {
        throw new Error(
            'Invalid name property in ' + filename + ', ' +
                'package names can only contain numbers, upper or lowercase ' +
                'letters and "_", "-" or ".", and must start with a letter'
        );
    }
    if (!json.version) {
        throw new Error('Missing version property in ' + filename);
    }
    if (!json.description) {
        throw new Error('Missing description property in ' + filename);
    }

};

