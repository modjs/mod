var packages = require('../packages'),
    project = require('../project'),
    utils = require('../utils'),
    file = require('../utils/file'),
    async = require('async'),
    path = require('path'),
    fs = require('fs');

exports.summary = 'List installed modules';

exports.usage = "[modulesDir]";


exports.run = function (opt, callback) {

    var rc = exports.getRuntimeConfig();

    var modules_dir = opt._[1];


    var modules;
    if (modules_dir) {
        modules = modules_dir;
    }else{
        modules = rc.directory;
    }

    var deps = project.getDependencies(rc);
    file.listDirs(modules, function (err, dirs) {
        if (err) {
            return callback(err);
        }
        async.forEachLimit(dirs, 5, function (dir, cb) {
            packages.loadPackageJSON(dir, function (err, pkg) {
                if (err) {
                    return cb(err);
                }
                var line = '';
                if (deps.hasOwnProperty(pkg.name)) {
                    // directly installed
                    line += '* ';
                }
                else {
                    line += '  '
                }
                line += pkg.name + ' ' + pkg.version.yellow;
                if (deps[pkg.name] === 'linked') {
                    var p = path.resolve(modules, pkg.name);
                    var realpath = fs.readlinkSync(p);
                    line += (' => ' + realpath).cyan;
                }
                else if (deps[pkg.name]) {
                    // locked to a specific version/range
                    line += (' [locked ' + deps[pkg.name] + ']').cyan;
                }
                console.log(line);
                cb();
            });
        },
        callback);
    });

};
