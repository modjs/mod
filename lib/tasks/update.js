var path = require('path'),
    async = require('async'),
    semver = require('semver'),
    project = require('../project'),
    tree = require('../tree'),
    utils = require('../utils'),
    file = require('../utils/file'),
    _ = require('underscore')._;

var install = require('../core').loadTask('install');

exports.summary = 'Update module version';

exports.usage = '<module>@[version]';

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

    var deps = opt._.slice(1);
    var cwd = process.cwd();
    var rc = exports.getRuntimeConfig();

    opt.repositories = rc.repositories;
    if (opt.repository) {
        opt.repositories = [opt.repository];
    }

    exports.upgrade(rc, cwd, deps, opt, callback);

};


/**
 * Upgrade the current project directory's dependencies.
 *
 * @param {Array} deps - an optional sub-set of package names to upgrade
 * @param {Object} opt - the options object
 * @param {Function} callback
 */
exports.upgrade = function (rc, cwd, deps, opt, callback) {
    exports.getOutdated(deps, rc, opt, function (e, changed, local, updated) {
        if (e) {
            return callback(e);
        }
        exports.installChanges(changed, opt, function (err) {
            if (err) {
                return callback(err);
            }
            project.updateLoaderConfig(
                opt.packageDir,
                opt.baseUrl,
                function (err) {
                    if (err) {
                        return callback(err);
                    }
                    //install.checkUnused(updated, opt, callback);
                    callback();
                }
            );
        });
    });
};


/**
 * Builds a remote and a local copy of the version tree. This is used to compare
 * the installed packages against those that are available in the repositories.
 *
 * @param {Array|null} deps - an optional subset of packages to upgrade
 * @param {Object} cfg - values from kanso.json for the root package
 * @param {Object} opt - the options object
 * @param {Function} callback
 */
exports.buildTrees = function (deps, cfg, opt, callback) {
    var local_sources = [
        install.dirSource(opt.packageDir),
        install.repoSource(opt.repositories, cfg)
    ];
    var newcfg = utils.convertToRootCfg(cfg);

    file.listDirs(opt.packageDir, function (err, dirs) {
        if (err) {
            return callback(err);
        }
        // add packages not referenced by package.json, but still inside
        // package dir, to make sure they get upgraded too
        dirs.forEach(function (d) {
            var name = path.basename(d);
            if (!newcfg.webDependencies.hasOwnProperty(name)) {
                newcfg.webDependencies[name] = null;
            }
        });

        var pkg = {
            config: newcfg,
            source: 'root'
        };
        exports.log('building local version tree...');
        tree.build(pkg, local_sources, function (err, local) {
            if (err) {
                return callback(err);
            }
            var update_sources = [
                // check remote source first to make sure we get highest version
                install.repoSource(opt.repositories, cfg),
                install.dirSource(opt.packageDir)
            ];
            var dependency_sources = [
                // check local source first to keep local version if possible
                install.dirSource(opt.packageDir),
                install.repoSource(opt.repositories, cfg)
            ];
            if (!deps || !deps.length) {
                // update all packages if none specified
                deps = Object.keys(local);
            }

            var packages = {};
            // add root package
            packages[pkg.config.name] = tree.createPackage([]);
            deps.forEach(function (name) {
                // prep specified dependencies with the update_sources
                packages[name] = tree.createPackage(update_sources);
            });

            exports.log('building remote version tree...');
            tree.extend(
                pkg, dependency_sources, packages, function (err, updated) {
                    callback(err, local, updated);
                }
            );
        });
    });
};


/**
 * Gets the remote and local version trees, compares the version numbers for
 * each package, and returns a list of packages which have changed.
 *
 * Each objects in the returned list of changed packages have the following
 * properties:
 *
 * - name - the name of the package
 * - version - the new version to be installed
 * - old - the old version to be installed (null if it doesn't currently exist)
 *
 * @param {Object} cfg - the values from kanso.json for the root package
 * @param {Object} opt - the options object
 * @param {Function} callback
 */
exports.getOutdated = function (deps, cfg, opt, callback) {
    exports.buildTrees(deps, cfg, opt, function (err, local, updated) {
        if (err) {
            return callback(err);
        }
        var all_names = _.uniq(_.keys(local).concat(_.keys(updated)));

        var changed = all_names.map(function (name) {
            var lversion = local[name] ? local[name].current_version: null;
            var uversion = updated[name] ? updated[name].current_version: null;

            if (lversion) {
                var lpkg = local[name].versions[lversion];
                if (lpkg.source === 'repository') {
                    // cannot even satisfy requirements with current package,
                    // this needs re-installing from repositories
                    return {
                        name: name,
                        version: uversion,
                        old: 'not satisfiable'
                    };
                }
            }
            if (!local[name] && updated[name] || lversion !== uversion) {
                return {name: name, version: uversion, old: lversion};
            }
        });
        callback(null, _.compact(changed), local, updated);
    });
};


/**
 * Accepts an array of changed packages and reports the change to the console
 * then installs from the repositories.
 *
 * @param {Array} packages - array of changed packages
 * @param {Object} opt - the options object
 * @param {Function} callback
 */
exports.installChanges = function (packages, opt, callback) {
    async.forEachLimit(packages, 5, function (dep, cb) {
        if (dep.name === '_root') {
            return cb();
        }
        if (!dep.old) {
            exports.log('new package', dep.name + '@' + dep.version);
        }
        else if (semver.lt(dep.old, dep.version)) {
            exports.log(
                'upgrade package',
                dep.name + '@' + dep.old + ' => ' + dep.name + '@' + dep.version
            );
        }
        else if (semver.gt(dep.old, dep.version)) {
            exports.log(
                'downgrade package',
                dep.name + '@' + dep.old + ' => ' + dep.name + '@' + dep.version
            );
        }
        install.installRepo(dep.name, dep.version, opt, cb);
    }, callback);
};
