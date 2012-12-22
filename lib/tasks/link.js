var utils = require('../utils'),
    packages = require('../packages'),
    project = require('../project'),
    mkdirp = require('mkdirp'),
    rimraf = require('rimraf'),
    path = require('path'),
    fs = require('fs');

var install = require('../core').loadTask('install');
var pathExists = fs.exists || path.exists;


exports.summary = 'Symlink a module folder';

exports.usage = '<target> [options]';

exports.options = {
    "r" : {
        alias : 'repository'
        ,describe : 'source repository URL'
    },
    "p" : {
        alias : 'packageDir'
        ,describe : 'Modules directory to use'
    },

    "b" : {
        alias : 'baseUrl'
        ,describe : 'all modules are located relative to this path'
    }
};

exports.run = function (opt, callback) {

    var cwd = process.cwd();
    var rc = exports.getRuntimeConfig();


    opt.repositories = rc.repositories;
    if (opt.repository) {
        opt.repositories = [opt.repository];
    }

    var target = opt.target;



    // load info on package about to be linked
    packages.loadPackageJSON(target, function (err, newpkg) {
        if (err) {
            return callback(err);
        }

        project.addDependency(rc, newpkg.name, 'linked');
        var newpath = path.resolve(opt.packageDir, newpkg.name);

        mkdirp(path.dirname(newpath), function (err) {
            if (err) {
                return callback(err);
            }
            exports.createLink(path.resolve(target), newpath, function (err) {
                if (err) {
                    return callback(err);
                }
                install.reinstallPackages(rc, opt, function (err) {
                    if (err) {
                        return callback(err);
                    }
                    project.updateLoaderConfig( opt.packageDir, opt.baseUrl, callback );
                });
            });
        });

    });



};


exports.createLink = function (source, target, callback) {
    pathExists(target, function (exists) {
        if (exists) {
            /*
            utils.getConfirmation(
                'Delete existing package at ' +
                path.relative(process.cwd(), target),
                function (err, yes) {
                    if (err) {
                        return callback(err);
                    }
                    if (yes) {
                    */
                        rimraf(target, function (err) {
                            if (err) {
                                return callback(err);
                            }
                            exports.createLink(source, target, callback);
                        });
                        /*
                    }
                    else {
                        return;
                    }
                }
            );
            */
            return;
        }
        else {
            fs.symlink(source, target, 'dir', callback);
        }
    });
};
