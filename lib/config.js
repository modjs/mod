var utils = require('./utils');
var file = require('./utils/file');
var path = require('path');
var _ = require('underscore');
var fs = require('fs');
var os = require('os');

var isWindows = process.platform === 'win32';
var cwd = process.cwd();

var env = {};
env.temp = 'tmpdir' in os && os.tmpdir() || 'tmpDir' in os && os.tmpDir() || process.env.TMPDIR || process.env.TMP || process.env.TEMP || ( isWindows ? "c:\\windows\\temp" : "/tmp" );
env.home = ( isWindows ? process.env.USERPROFILE : process.env.HOME );
env.home? process.env.HOME = env.home: env.home = env.temp;

exports.RC_NAME = ".modrc";
// build file, like Makefile
exports.MODFILE = "Modfile";
// default modules directory
exports.MODULES_DIR = "components";
// default tmp directory save downloaded package
exports.TMP_DIR = env.home + '/.mod/tmp';
// default cache directory save unpack downloaded package
exports.CACHE_DIR = env.home + '/.mod/cache';

exports.PATHS = [
    //'/etc/modrc',
    //'/usr/local/etc/modrc',
    env.home + '/' +  exports.RC_NAME
];

/**
 * The defaults runtime config
 */
exports.DEFAULTS = {
    directory: exports.MODULES_DIR
};


// Get raw, unprocessed config data.
function getRawValue(prop, data) {
    // Prop was passed, get that specific property's value. 
    if (_.isString(prop)) {
        // Escape any . in name with \. so dot-based namespacing works properly.
        prop = prop.replace(/\./g, '\\.');
        return utils.namespace(data, prop);
    }
}

var propStringTmplRe = /{{\s*([a-z0-9_$]+(?:\.[a-z0-9_$]+)*)\s*}}/i;
// Get config data, recursively processing templates.
function getProperty(value, data) {
    // only process string value
    if (typeof value == 'string') {

        var matches = value.match(propStringTmplRe);
        if (matches) {
            var propName = matches[1];
            var template = matches[0];
            var rawValue = getRawValue(propName, data);

            // return value;
            var result = getProperty(rawValue, data);

            if(_.isString(result))
                return value.replace(template, result);
            else 
                return result;
        }
    }

    return value;
}


exports.processTemplate = function (raw){
    return utils.walk(raw, function(value) {
        // TODO: if processed vlaue is null or undefined, print warn
        return getProperty(value, raw);
    });
};


exports.loadPackageJSON = function () {
    var p = file.find(process.cwd(), "package.json");
    if(p){
        return file.readJSON(p) || {};
    }
    return {};
};


exports.load =  function(){

    return [
        exports.loadModfile(),
        exports.loadRC(),
        exports.loadPackageJSON()
    ].reduce(function (merged, r) {
        return utils.merge(merged, r);
    });

};

exports.loadModfile = function(){
    var filepath = path.resolve( process.cwd() , exports.MODFILE);

    if(file.exists(filepath)){
        return require(filepath);
    }
    return {};
};

/**
 * load config file
 */
exports.loadRC = function(){

    var rc = [
        exports.DEFAULTS,
        exports.loadGlobalRC(),
        exports.loadProjectRC()
    ].reduce(function (merged, r) {
        return utils.merge(merged, r);
    });

    return rc;
};

/**
 * load global config file
 */
exports.loadGlobalRC = function () {

    var results = exports.PATHS.map(function(p){
        return exports.loadRCFile(p);
    });

    var defaults = _.clone(exports.DEFAULTS);
    var rc = results.reduce(function (merged, r) {
        return utils.merge(merged, r);
    }, defaults);

    return rc;

};


/**
 * find rc file, return default config if no one find
 */
exports.loadProjectRC = function () {

    var p = file.find(cwd, exports.RC_NAME); 
    if (p) {
        // find project-level rc file，else return default
        return exports.loadRCFile(p);
    }
    return {};
};


/**
 * load rc file, return empty object if error occurs
 */
exports.loadRCFile = function (p) {

    if(file.exists(p)){
        return file.readJSON(path.resolve(p)) || {};
    }
    return {};
};

