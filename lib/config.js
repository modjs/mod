var utils = require('./utils');
var file = require('./utils/file');
var path = require('path');
var _ = require('underscore');
var fs = require('fs');
var os = require('os');

var isWindows = process.platform === 'win32';
// env tmp path
exports.ENV_TMP = 'tmpdir' in os && os.tmpdir() || 'tmpDir' in os && os.tmpDir() || process.env.TMPDIR || process.env.TMP || process.env.TEMP || ( isWindows ? "c:\\windows\\temp" : "/tmp" );
// env home path
exports.ENV_HOME = isWindows? process.env.USERPROFILE: process.env.HOME;
// rc filename
exports.RC_NAME = ".modrc";
// build file, like Makefile
exports.MODFILE = ["Modfile", "Modfile.js", "modfile", "modfile.js"];
// default modules directory
exports.MODULES_DIR = "components";
// default tmp directory save downloaded package
exports.TMP_DIR = exports.ENV_TMP + '/.mod/tmp';
// default cache directory save unpack downloaded package
exports.CACHE_DIR = exports.ENV_TMP + '/.mod/cache';

exports.PATHS = [
    //'/etc/' + exports.RC_NAME,
    //'/usr/local/etc/' + exports.RC_NAME',
    exports.ENV_HOME + '/' + exports.RC_NAME
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

exports.loadPackageJSON = function (cwd) {
    var p = file.find(cwd || process.cwd(), "package.json");
    if(p){
        return file.readJSON(p) || {};
    }
    return {};
};

exports.load = function (options, done) {
    exports.loadModfile(options, function (runner) {
        var cwd = options.cwd;
        var config = [
            runner,
            exports.loadRC(cwd),
            exports.loadPackageJSON(cwd)
        ].reduce(function (previousValue, currentValue) {
            return utils.merge(previousValue, currentValue);
        });

        // process template for each config section
        ['plugins', 'tasks', 'targets'].forEach(function (section) {
            config[section] = exports.processTemplate(config[section] || {});
        });

        done(config);
    })
};

exports.loadModfile = function (options, done) {
    var runner = {};
    for (var i = 0, len = exports.MODFILE.length; i < len; i++) {
        var filepath = path.resolve(options.cwd || process.cwd(), exports.MODFILE[i]);
        if (file.exists(filepath)) {
            runner = require(filepath);
            // asynchronous init config
            if (_.isFunction(runner)) {
                runner(options, done);
            } else {
                done(runner)
            }
            break;
        }
    }
};

/**
 * load config file
 */
exports.loadRC = function(cwd){

    return [
        exports.loadGlobalRC(),
        exports.loadProjectRC(cwd)
    ].reduce(function (previousValue, currentValue) {
        return utils.merge(previousValue, currentValue);
    });
};

/**
 * load global config file
 */
exports.loadGlobalRC = function () {

    var results = exports.PATHS.map(function(p){
        return exports.loadRCFile(p);
    });

    var defaults = _.clone(exports.DEFAULTS);
    var rc = results.reduce(function (previousValue, currentValue) {
        return utils.merge(previousValue, currentValue);
    }, defaults);

    return rc;
};

/**
 * find rc file, return default config if no one find
 */
exports.loadProjectRC = function (cwd) {

    var p = file.find(cwd || process.cwd(), exports.RC_NAME);
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
