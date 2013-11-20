var rimraf = require('rimraf');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var mkdirp = require('mkdirp');
var request = require('request');
var logger = require('./logger');
var prompt = require('prompt');
var url = require('url');
var file = require('./file');

/**
 * @module utils
 * @summary miscellaneous utilities
 */

exports.moduleName =function(module){
     var ext= path.extname(module.filename);
     return path.basename(module.filename, ext);
};

exports.usage = function(cmd){
    return "Usage:".green + " mod "+ cmd;
};

/**
 * get the system's http proxy
 * @method utils.getHttpProxy( hostname )
 * @param hostname
 * @returns {*}
 */
exports.getHttpProxy = function ( hostname ){

    hostname = url.parse(hostname).hostname || hostname;

    if( ["localhost","127.0.0.1"].indexOf( hostname ) === -1 ){
        return process.env[ "HTTP_PROXY" ] || process.env[ "http_proxy" ];
    }

};

/**
 * Is a relative URI?
 * @method utils.isRelativeURI(uri)
 * @example
 *   utils.isRelativeURI("../path/to"); // => return true
 *   utils.isRelativeURI("path/to"); // => return true
 *   utils.isRelativeURI("#id"); // => return false
 *   utils.isRelativeURI("http://www.qq.com"); // => return false
 *   utils.isRelativeURI("/relative/to/root"); // => return false
 *   utils.isRelativeURI("//without/protocol"); // => return false
 *   utils.isRelativeURI("data:image/gif;base64,lGODlhEAA..."); // => return false
 */
exports.isRelativeURI = function(uri){
    return uri[0] !== '/' && uri[0] !== '#' && !url.parse(uri, false, true)['host'];
};

/**
 * download file
 * @method utils.download(url, local, callback)
 * @param uri
 * @param target
 * @param done
 */
exports.download = function (uri, target, done) {
    var urlinfo = url.parse(uri);
    var proxy = exports.getHttpProxy( urlinfo.hostname );

    var callback = function (err) {
        var that = this;
        var args = arguments;
        if (err) {
            rimraf(target, function (err) {
                if (err) {
                    // let the original error through, but still output this one
                    logger.error(err);
                }
                done.apply(that, args);
            });
            return;
        }
        done.apply(that, args);
    };

    file.mkdir(path.dirname(target));

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
    });

    req.on('response', function (response) {
        if (response.statusCode >= 300) {
            this.abort();
            return callback(new Error("StatusCode: " + response.statusCode));
        }
    }).on('error', function (err) {
        callback(err);
    });

    req.pipe(fs.createWriteStream(target));

    return req;
};

/**
 * Check to see if an object is a plain object (created using “{}” or “new Object”).
 * @method utils.isPlainObject(obj)
 * @param obj
 * @returns {boolean}
 */
exports.isPlainObject = function(obj){
    return Object.prototype.toString.call(obj) === '[object Object]';
};

/**
 * deep copy of the object
 * @method utils.clone(obj)
 * @param obj
 * @returns {*}
 */
exports.clone = function(obj){
    return JSON.parse(JSON.stringify(obj));
};

/**
 * Recurse through objects and arrays, executing fn for each non-object.
 * @method utils.walk(value, fn, fnContinue)
 * @param value
 * @param fn
 * @param fnContinue
 * @returns {*}
 */
exports.walk = function walk(value, fn, fnContinue) {
    var obj;
    if (fnContinue && fnContinue(value) === false) {
        // Skip value if necessary.
        return value;
    } else if (Array.isArray(value)) {
        // If value is an array, recurse.
        return value.map(function (value) {
            return walk(value, fn, fnContinue);
        });
    } else if (exports.isPlainObject(value)) {
        // If value is an object, recurse.
        obj = {};
        Object.keys(value).forEach(function (key) {
            obj[key] = walk(value[key], fn, fnContinue);
        });
        return obj;
    } else {
        // Otherwise pass value into fn and return.
        return fn(value);
    }
};

// Split strings on dot, but only if dot isn't preceded by a backslash. Since
// JavaScript doesn't support lookbehinds, use a placeholder for "\.", split
// on dot, then replace the placeholder character with a dot.
function getParts(str) {
    return str.replace(/\\\./g, '\uffff').split('.').map(function(s) {
        return s.replace(/\uffff/g, '.');
    });
}

/**
 * Get the value of a deeply-nested property exist in an object.
 * @method utils.namespace(obj, parts, create)
 * @param obj
 * @param parts
 * @param create
 * @returns {*}
 */
exports.namespace = function(obj, parts, create) {
    if (typeof parts === 'string') {
        parts = getParts(parts);
    }

    var part;
    while (typeof obj === 'object' && obj && parts.length) {
        part = parts.shift();
        if (!(part in obj) && create) {
            obj[part] = {};
        }
        obj = obj[part];
    }

    return obj;
};

/**
 * Deep merge for JSON objects, overwrites conflicting properties
 * @method utils.merge(a, b)
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
 * Multi-value JSON stringify
 * @private
 * @param args
 * @returns {*}
 */
exports.stringify = function(args){

    return  _.toArray(args).map(function(arg){
        if(exports.isPlainObject(arg))
            return JSON.stringify(arg, null, "    ");
        else
            return arg;
    }).join(' ');
};

/**
 * convert 'a,b,c' to [a,b,c]
 * @method utils.arrayify()
 * @param arg
 * @returns {*}
 */
exports.arrayify = function(val){
    if(arguments.length === 1){
        if(_.isString(val)){
            return val.trim().split(/\s*,\s*/);
        }else if(val && val.length){
            return _.toArray(val)
        }else{
            return [val]
        }
    }else{
        return _.toArray(arguments)
    }
};

/**
 * Reads the version property from modjs's package.json
 * @method utils.getVersion()
 */
exports.getVersion = function () {
    var p = file.findPackageJSON(__dirname);
    return file.readJSON(p).version;
};

/**
 * open application
 * @method utils.open(target, appName, callback)
 * @param target
 * @param appName
 * @param callback
 * @returns {*}
 */
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
};

exports.randomString = function(length) {
    length = length || 4;
    var dec2hex = [];
    for (var i= 0; i <= 15; i++) {
        dec2hex[i] = i.toString(16);
    }
    var str = '';
    for (var i= 1; i<= length; i++) {
        str += dec2hex[(Math.random()*15|0)];
    }
    return str;
};

/**
 * Escape strings that are going to be used in a regex.
 * Escapes punctuation that would be incorrect in a regex.
 * @param str
 * @returns {string}
 */
exports.escapeRegExp = function(str) {
    if (str == null) return '';
    return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};

exports.getFullDate = function(){
    var date = new Date;
    var y = date.getFullYear();
    var mo = date.getMonth() + 1;
    var d = date.getDate();
    var h = date.getHours();
    var mi = date.getMinutes();
    var ms = date.getMilliseconds();
    return '' + y  + (mo <= 9 ? '0' + mo : mo)  + (d <= 9 ? '0' + d : d) + (h <= 9 ? '0' + h : h) + (mi <= 9 ? '0' + mi : mi) + ("00" + ms).slice(-3);
};
