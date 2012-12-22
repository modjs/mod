var path = require('path'),
    fs = require('fs'),
    async = require('async'),
    utils = require('../utils'),
    file = require('../utils/file'),
    rimraf = require('rimraf'),
    project = require('../project'),
    tree = require('../tree'),
    _ = require('underscore');

var install = require('../core').loadTask('install');

exports.summary = 'Removes previously generated files and directories';

exports.usage = '[options]';

exports.options = {
    "p" : {
        alias : 'packageDir'
        ,describe : 'package directory'
    },
    "b" : {
        alias : 'baseUrl'
        ,describe : 'all modules are located relative to this path'
    },
    "f" : {
        alias : 'force'
        ,default : false
        ,type : 'boolean'
        ,describe : 'do not confirm package removal'
    }
};


exports.run = function (opt, callback) {

    var cwd = process.cwd();
    exports.clean(cwd, opt, callback);

};



// Clean the project directory's dependencies.
exports.clean = function (cwd, opt, callback) {
    exports.unusedDirs(cwd, opt, function (err, dirs) {
        if (err) {
            return callback(err);
        }
        if (!dirs.length) {
            // nothing to remove
            return callback();
        }
        var reldirs = dirs.map(function (d) {
            return path.relative(opt.packageDir, d);
        });

        if (opt.force) {
            exports.deleteDirs(dirs, callback);
        }
        else {
            console.log(
                '\n' +
                'The following directories are not required by packages in\n' +
                'package.json and will be REMOVED:\n\n' +
                '    ' + reldirs.join('\n    ') +
                '\n'
            );
            utils.getConfirmation('Continue', function (err, ok) {
                if (err) {
                    return callback(err);
                }
                if (ok) {
                    exports.deleteDirs(dirs, function (err) {
                        if (err) {
                            return callback(err);
                        }
                        project.updateLoaderConfig(
                            opt.packageDir,
                            opt.baseUrl,
                            callback
                        );
                    });
                }
                else {
                    callback();
                }
            });
        }
    });
};


// Delete multiple directory paths.
exports.deleteDirs = function (dirs, callback) {
    async.forEach(dirs, function (d, cb) {
        exports.log('removing', path.basename(d));
        rimraf(d, cb);
    },
    callback);
};


// Discover package directories that do not form part of the current
exports.unusedDirs = function (cwd, opt, callback) {
    project.loadPackageJSON(function (err, json) {
        if (err) {
            return callback(err);
        }
        var sources = [
            install.dirSource(opt.packageDir)
        ];
        var newcfg = utils.convertToRootCfg(json);
        var pkg = {
            config: newcfg,
            source: 'root'
        };
        exports.log('building version tree...');
        tree.build(pkg, sources, function (err, packages) {
            if (err) {
                return callback(err);
            }
            return exports.unusedDirsTree(packages, opt, callback);
        });
    });
};


/**
 * Lists packages in the package dir and compares against the provided
 * version tree, returning the packages not in the tree.
 *
 * @param {Object} packages - version tree
 * @param {Object} opt - options object
 * @param {Function} callback
 */
exports.unusedDirsTree = function (packages, opt, callback) {
    file.listDirs(opt.packageDir, function (err, dirs) {
        if (err) {
            return callback(err);
        }
        //var unused = _.difference(dirs, Object.keys(packages));
        var unused = [];
        var names = Object.keys(packages);
        dirs.forEach(function (d) {
            if (!_.contains(names, path.basename(d))) {
                unused.push(d);
            }
        });
        return callback(null, unused);
    });
};
