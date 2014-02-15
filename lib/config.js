var utils = require('./utils');
var file = require('./utils/file');
var path = require('path');
var _ = require('lodash');
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
exports.BUILDFILE = [
    "Modfile", "Modfile.js"
];
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

exports.getBuildFilePath = function(cwd){
    for (var i = 0, len = exports.BUILDFILE.length; i < len; i++) {
        var filepath = path.resolve(cwd || process.cwd(), exports.BUILDFILE[i]);
        if (file.exists(filepath)) {
            return filepath;
        }
    }
};

// Config template Regexp.
var propStringTmplRe = /{{\s*([a-z0-9_$]+(?:\.[a-z0-9_$]+)*)\s*}}/i;

// TODO: could change template by setting

// Get config data, recursively processing templates.
function getProperty(value, data) {
    // process string value
    if (_.isString(value)) {

        var matches = value.match(propStringTmplRe);
        if (matches) {
            var propName = matches[1];
            var template = matches[0];
            // Get raw, unprocessed config data.
            var rawValue = utils.namespace(data, propName);
            var result = getProperty(rawValue, data);

            if(_.isString(result))
                return value.replace(template, result);
            else
                return result;
        }
    // process array value
    } else if (_.isArray(value)) {
        return value.map(function(val){
            return getProperty(val, data)
        });
    }

    return value;
}

exports.processTemplate = function (raw){
    return utils.walk(raw, function(value) {
        // TODO: if processed vlaue is null or undefined, print warn
        return getProperty(value, raw);
    });
};

exports.load = function (options, done) {
    exports.loadBuildFile(options, function (runner) {
        var cwd = options.cwd;
        var config = [
            exports.loadRC(cwd),
            runner
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

exports.loadBuildFile = function (options, done) {
    var modfilePath = exports.getBuildFilePath(options.cwd);
    var runner;
    if(modfilePath){
        runner = require(modfilePath);
    }

    // asynchronous init config
    if (_.isFunction(runner)) {
        runner(options, done);
    }else{
        done(runner || {});
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
