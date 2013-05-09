var utils = require('./utils'),
    path = require('path'),
    project = require('./project'),
    async = require('async'),
    _ = require('underscore'),
    fs = require('fs'),
    env = require('./utils/env');

var pathExists = fs.exists || path.exists;
var cwd = process.cwd();

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



exports.load =  async.memoize(function(callback){
    async.parallel([
        exports.loadModfile,
        exports.loadRC,
        project.loadPackageJSON
    ],function(err, results){
        // the results array will equal ['one','two'] even though
        // the second function had a shorter timeout.
        if (err) {
            return callback(err);
        }
        var rc = results.reduce(function (merged, r) {
            return utils.merge(merged, r);
        });

        callback(null, rc);

    });
});

exports.loadModfile = function(callback){

    var p = path.resolve( process.cwd() , exports.MODFILE);

    pathExists(p, function (exists) {
        if (exists) {
            try {

                var rc = require(p);
            }
            catch (e) {
                return callback(e);
            }
            callback(null, rc);
        }
        else {
            callback(null, {});
        }
    });

};

/**
 * load config file
 * @param callback
 */
exports.loadRC = function(callback){
    async.parallel([
        exports.loadGlobalRC,
        exports.loadProjectRC
    ],function(err, results){
        // the results array will equal ['one','two'] even though
        // the second function had a shorter timeout.
        if (err) {
            return callback(err);
        }
        var rc = results.reduce(function (merged, r) {

            return utils.merge(merged, r);
        });

        callback(null, rc);

    });

};

/**
 * load global config file
 * @param callback
 */
exports.loadGlobalRC = function (callback) {
    async.map(exports.PATHS, exports.loadRCFile, function (err, results) {
        if (err) {
            return callback(err);
        }
        var defaults = _.clone(exports.DEFAULTS);
        var rc = results.reduce(function (merged, r) {
            return utils.merge(merged, r);
        }, defaults);

        callback(null, rc);

    });

};


/**
 * find rc file until root
 * @param p
 * @param callback
 */
exports.findProjectRC = function (p, callback) {
    if(_.isFunction(p)){
        callback = p;
        p = process.cwd();
    }

    var filename = path.resolve(p, exports.RC_NAME);
    pathExists(filename, function (exists) {
        if (exists) {
            return callback(null, filename);
        }
        var newpath = path.dirname(p);

        if (newpath === p) { // root directory
            return callback(null);
        }else {
            return exports.findProjectRC(newpath, callback);
        }
    });
};



/**
 * find rc file, return default config if no one find
 * @param cwd
 * @param callback
 */
exports.loadProjectRC = function (callback) {

    exports.findProjectRC(cwd, function (err, p) {
        if (err) {
            return callback(err);
        }
        if (!p) {
            // find project-level rc file，else return default
            return callback(null, exports.DEFAULTS);
        }
        else {

            exports.loadRCFile(p, function (err, rc) {
                if (err) {
                    return callback(err);
                }

                callback(null, rc);
            });

        }
    });
};


/**
 * load rc file, return empty object if error occurs
 * @param p
 * @param callback
 */
exports.loadRCFile = function (p, callback) {
    pathExists(p, function (exists) {
        if (exists) {

            utils.readJSON(path.resolve(p), function(err, rc){
                if(err){
                    return callback(err);
                }

                callback(null, rc);
            });

        }
        else {
            callback(null, {});
        }
    });
};

