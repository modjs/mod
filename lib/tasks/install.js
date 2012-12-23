var semver = require('semver'),
    versions = require('../utils/versions'),
    utils = require('../utils'),
    mkdirp = require('mkdirp'),
    rimraf = require('rimraf'),
    ncp = require('ncp').ncp,
    packages = require('../packages'),
    repository = require('../repository'),
    github = require('../utils/github'),
    config = require('../config'),
    project = require('../project'),
    tar = require('../utils/tar'),
    tree = require('../tree'),
    clean = require('./clean'),
    async = require('async'),
    path = require('path'),
    fs = require('fs'),
    _ = require('underscore');


var pathExists = fs.exists || path.exists;

exports.summary = 'Install a module';

exports.usage = '[module][@version]';

exports.options = {
    "r" : {
        alias : 'repository'
        ,describe : 'source repository URL'
    },
    "p" : {
        alias : 'packageDir'
        ,describe : 'modules directory to use'
    },
    "b" : {
        alias : 'baseUrl'
        ,describe : 'all modules are located relative to this path'
    },
    "s" : {
        alias : "save"
        ,default: true
        ,type: "boolean"
        ,describe: "if update package.json"
    }
};

// TODO install by different ways
exports.run = function (options, callback) {

    var cwd = process.cwd();
    var rc = exports.getRuntimeConfig();

    var names = options._.slice(1);

    options.repositories = rc.repositories;

    if (options.repository) {
        options.repositories = [options.repository];
    }

    if (names.length < 1) {
        exports.reinstallPackages(rc, options, callback);
    }
    else {
        exports.installPackages(rc, names, options, callback);
    }

};


exports.reinstallPackages = function (cfg, opt, callback) {
    var sources = [
        exports.dirSource(opt.packageDir),
        exports.repoSource(opt.repositories, cfg)
    ];

    // clone cfg object from package.json and replace npm deps with mod deps
    var newcfg = utils.convertToRootCfg(cfg);

    var pkg = {
        config: newcfg,
        source: 'root'
    };
    exports.log('building version tree...');
    tree.build(pkg, sources, function (err, packages) {
        if (err) {
            return callback(err);
        }
        exports.installTree(packages, opt, function (err) {
            if (err) {
                return callback(err);
            }
            // TODO: write package.json if --save option provided
            project.updateLoaderConfig(opt.packageDir, opt.baseUrl, callback);
        });
    });
};


exports.installPackages = function (cfg, names, opt, callback) {
    // Run installation proceedure for each package on command line

    // TODO: build package tree for all packages *first*, then
    // do the actuall installation to avoid the case where a package
    // gets installed then downgraded during a later install

    async.reduce(names, null, function (acc, pkg, cb) {
        exports.install(cfg, pkg, opt, cb);
    },
    function (err, packages) {
        if (err) {
            return callback(err);
        }
        // TODO: write package.json if --save option provided
        project.updateLoaderConfig(opt.packageDir, opt.baseUrl, callback);
    });
};


// Install a package from repository, file, directory or URL.
exports.install = function (cfg, pkg, opt, callback) {
    debugger;
    // mod install http://code.jquery.com/jquery-1.8.2.js
    if( /^https?:\/\/.*\.(js|css)/.test(pkg)){
        exports.log('installing from URL', pkg.green);
        return exports.installURL(cfg, pkg, opt, callback);
    }
    // mod install https://github.com/jquery/jquery/tarball/1.8.2
    else if (/^https?:\/\//.test(pkg)) {
        exports.log('installing from Archive', pkg.green);
        return exports.installArchive(cfg, pkg, opt, callback);
    }
    // mod install jquery/jquery

    else if (/^[^\.]\w*\/\w/.test(pkg)) {
        exports.log('installing from GitHub', pkg.green);
        return exports.installGitHub(cfg, pkg, opt, callback);
    }

    fs.stat(pkg, function (err, stats) {
        if (err) {
            // may not be a file
            exports.log('installing from repositories', pkg.green);
            return exports.installName(cfg, pkg, opt, callback);
        }
        else if (stats.isFile()) {
            if (/.*\.tar\.gz$/.test(pkg) || /.*\.tgz$/.test(pkg)) {
                exports.log('installing from local file', pkg.green);
                return exports.installFile(cfg, pkg, opt, callback);
            }
        }
        // mod install ./jquery/jquery
        else if (stats.isDirectory()) {
            exports.log('installing from local directory', pkg.green);
            return exports.installName(cfg, pkg, opt, callback);
        }


        return callback('Unknown install target: ' + path.resolve(pkg));
    });
};


/**
 * Creates a source function to check packages already in local packageDir.
 * This can be used in conjunction with the tree module.
 *
 * @param {String} packageDir - the directory we're installing packages to
 * @returns {Function}
 */

// TODO: also check package_paths (not just packageDir) for available versions?
exports.dirSource = function (packageDir) {
    return function (name, callback) {
        packages.availableVersions([path.join(packageDir, name)], callback);
    };
};


/**
 * Creates a source function to check repostories for available package
 * versions. This can be used in conjunction with the tree module.
 *
 * @param {Array} repositories - URLs for repositories to check
 * @returns {Function}
 */
exports.repoSource = function (repositories, meta) {
    return function (name, callback) {
        if (meta && project.getDependencies(meta)[name] === 'linked') {
            exports.log(
                'repositories',
                'skipping linked package "' + name + '"'
            );
            callback(null, []);
        }
        else {
            exports.log('checking from repositories', name.green);
            repository.availableVersions(name, repositories, callback);
        }
    };
};


/**
 * Installs packages in a version tree that are from remote sources (tmp
 * directory, repositories). Uses the set current_version for each
 * package.
 *
 * @param {Object} packages - the version tree to install
 * @param {Object} opt - the options object
 * @param {Function} callback
 */

exports.installTree = function (packages, opt, callback) {
    var names = Object.keys(packages);
    async.forEachLimit(names, 5, function (name, cb) {
        var curr = packages[name].current_version;
        if (packages[name].versions[curr].source === 'repository') {
            exports.installRepo(name, curr, opt, cb);
        }
        else if (packages[name].versions[curr].source === 'tmp') {
            var v = packages[name].versions[curr];
            exports.log('copying files', v.basename);
            exports.cpDir(name, curr, false, v.path, opt, cb);
        }
        else {
            process.nextTick(cb);
        }
    }, function (err) {
        if (err) {
            return callback(err);
        }
        // report packages that are no-longer used
        //exports.checkUnused(packages, opt, callback);
        callback(null, packages);
    });
};


/**
 * Install a package by name. This is used on the command-line and can parse
 * 'package@version' etc. The package will be installed from the available
 * repositories with the range requirements of the current project
 * direcotry taken into account.
 *
 * @param {String} name - the name (with option @version) of the package
 * @param {Object} opt - the options object
 * @param {Function} callback
 */

exports.installName = function (cfg, name, opt, callback) {
    exports.checkExisting(name, opt, function (err) {
        if (err) {
            return callback(err);
        }
        var range = null;
        if (!range && name.indexOf('@') !== -1) {
            var parts = name.split('@');
            name = parts[0];
            range = parts.slice(1).join('@');
        }
        cfg = project.addDependency(cfg, name, range);
        var sources = [
            exports.dirSource(opt.packageDir),
            exports.repoSource(opt.repositories, cfg)
        ];
        var newcfg = utils.convertToRootCfg(cfg);
        var pkg1 = {
            config: newcfg,
            source: 'root'
        };
        exports.log('building version tree...');
        tree.build(pkg1, sources, function (err, packages) {
            if (err) {
                return callback(err);
            }
            tree.addDependency(
                cfg.name, name, range, sources, packages,
                function (err, packages) {
                    if (err) {
                        return callback(err);
                    }
                    exports.installTree(packages, opt, callback);
                }
            );
        });
    });
};


/**
 * Installs a package from a repository. No dependency checks are made.
 *
 * @param {String} name - the package name
 * @param {String} range - the version range or number
 * @param {Object} opt - the options object
 * @param {Function} callback
 */

exports.installRepo = function (name, range, opt, callback) {
    repository.fetch(name, range, opt.repositories,
        function (err, tfile, cdir, v, cfg, from_cache) {
            if (err) {
                return callback(err);
            }
            exports.cpDir(name, v, from_cache, cdir, opt, callback);
        }
    );
};


/**
 * Copies a directory into the local target directory. Writes log messages
 * during this process.
 *
 * @param {String} name - the name of the package being copied
 * @param {String} v - the version of the package
 * @param {Boolean} from_cache - whether we're installing a cached package
 * @param {Object} opt - the options object
 * @param {Function} callback
 */

exports.cpDir = function (name, v, from_cache, cdir, opt, callback) {
    var p = opt.packageDir + '/' + name;
    function cp() {
        exports.log(
            'success install',
            (name + '@' + v).green + (from_cache ? ' (cached)': '').grey
        );
        mkdirp(opt.packageDir, function (err) {
            if (err) {
                return callback(err);
            }
            ncp(cdir, p, {stopOnError: true}, callback);
        });
    }
    pathExists(p, function (exists) {
        if (exists) {
            exports.log('removing', name);
            rimraf(p, function (err) {
                if (err) {
                    return callback(err);
                }
                process.nextTick(function () {
                    cp();
                });
            });
        }
        else {
            cp();
        }
    });
};


/**
 * Wraps a callback to make sure temporary files are deleted even if an
 * error occurred.
 *
 * @param {Function} fn - the callback function to wrap
 * @param {Array} tmp_paths - the files/directories to remove
 * @returns {Function}
 */

exports.cleanupTmp = function (fn, tmp_paths) {
    // clean up tmp dir after attempted install, even if error
    var _fn = fn;
    return function (err) {
        var args = arguments;
        var that = this;
        async.map(tmp_paths, rimraf, function (err2) {
            if (err2) {
                // log this error even though it won't make it to the callback
                exports.error(err2);
            }
            _fn.apply(that, args);
        });
    };
};


/**
 * Copies a file into the mod temporary directory.
 *
 * @param {String} filename - the file to copy
 * @param {Function} callback
 */

exports.cpTmp = function (filename, callback) {
    var tmp = config.TMP_DIR + '/' + path.basename(filename);
    mkdirp(config.TMP_DIR, function (err) {
        if (err) {
            return callback(err);
        }
        if (filename === tmp) {
            // installing from a file in tmp already
            return callback(null, tmp);
        }
        ncp(filename, tmp, {stopOnError: true}, function (err) {
            if (err) {
                return callback(err);
            }
            callback(null, tmp);
        });
    });
};


/**
 * Prepares a .tar.gz file before installation. Copies it to the tmp directory,
 * extracts it, then reads the contents of it's package.json file.
 *
 * @param {String} filename - the .tar.gz file to prepare
 * @param {Function} callback - returns the values from package.json and
 *     the path of the extracted package directory
 */

exports.prepareFile = function (filename, callback) {
    exports.cpTmp(filename, function (err, tmp) {
        if (err) {
            return callback(err);
        }
        var tmp_extracted = config.TMP_DIR + '/package';
        tar.extract(tmp, tmp_extracted, function (err) {
            if (err) {
                return callback(err);
            }
            packages.loadPackageJSON(tmp_extracted, function (err, cfg) {
                callback(err, cfg, tmp_extracted, tmp);
            });
        });
    });
};


/**
 * Inserts a possible future dependency into the tree manually that may not
 * be available from the source functions. Using this we can 'prep' a version
 * tree with a package we know will be available later. This happens when
 * building a version tree before adding a package from a file.
 *
 * @param {Object} cfg - the package.json values for the package
 * @param {String} filename - the filename the package will be installed from
 * @param {String} tmpdir - the extracted package in the tmp directory
 * @param {Object} packages - the version tree to update (optional)
 * @return {Object} - returns the updated version tree
 */

exports.prepareTree = function (cfg, filename, tmpdir, /*optional*/packages) {
    packages = packages || {};
    packages[cfg.name] = tree.createPackage([]);
    packages[cfg.name].versions[cfg.version] = {
        source: 'tmp',
        path: tmpdir,
        basename: path.basename(filename),
        config: cfg
    };
    return packages;
};


/**
 * Install a package from a .tar.gz file.
 *
 * @param {Object} cfg - the package.json values for the project
 * @param {String} filename - the .tar.gz file to install
 * @param {Object} opt - the options object
 * @param {String} range - range requirements to record in package.json (optional)
 * @param {Function} callback
 */

exports.installFile = function (cfg, filename, opt, /*opt*/range, callback) {
    debugger;
    if (!callback) {
        callback = range;
        range = null;
    }
    exports.prepareFile(filename, function (err, filecfg, tdir, tfile) {

        filecfg = utils.clone(filecfg);
        filecfg.name = filecfg.name || range.split('/')[1];
        filecfg.version = filecfg.version || '0.0.0';

        // clean up tmp dir after attempted install, even if error
        callback = exports.cleanupTmp(callback, [tfile, tdir]);

        if (err) {
            return callback(err);
        }

        exports.checkExisting(filecfg.name, opt, function (err) {
            if (err) {
                return callback(err);
            }

            cfg = project.addDependency(cfg, filecfg.name, range);

            var sources = [
                exports.dirSource(opt.packageDir),
                exports.repoSource(opt.repositories, cfg)
            ];
            var packages = exports.prepareTree(filecfg, filename, tdir);
            var newcfg = utils.convertToRootCfg(cfg);
            var root = {
                config: newcfg,
                source: 'root'
            };
            exports.log('building version tree...');
            tree.extend(root, sources, packages, function (err, packages) {
                if (err) {
                    return callback(err);
                }
                tree.addDependency(
                    cfg.name, filecfg.name, filecfg.version, sources, packages,
                    function (err, packages) {
                        if (err) {
                            return callback(err);
                        }
                        exports.installTree(packages, opt, callback);
                    }
                );
            });
        });

    });
};



exports.installURL = function (cfg, url, opt, callback) {

    exports.log('downloading', url);
    repository.download(url, function (err, filename) {
        if (err) {
            return callback(err);
        }

        var name = path.basename(filename);
        mkdirp(opt.packageDir, function (err) {
            if (err) {
                return callback(err);
            }

            var dest = path.join(opt.packageDir,name);

            exports.log("installing", dest);

            ncp(filename, dest , {stopOnError: true}, callback);
        });


    });
};


/**
 * Install a .tar.gz file from a URL.
 *
 * @param {Object} cfg - package.json values
 * @param {String} url - the URL of the .tar.gz file
 * @param {Object} opt - the options object
 * @param {String} range - the range to record in package.json (optional)
 * @param {Function} callback
 */

exports.installArchive = function (cfg, url, opt, /*opt*/range, callback) {
    if (!callback) {
        callback = range;
        range = null;
    }
    exports.log('downloading', url);
    repository.download(url, function (err, filename) {
        if (err) {
            return callback(err);
        }
        exports.installFile(cfg, filename, opt, range || url, callback);
    });
};



// Install a package from GitHub
exports.installGitHub = function (cfg, ghref, opt, callback) {

    var parts = ghref.split('/');
    if (parts.length < 2) {
        return callback(
            'Invalid GitHub reference, should be in the format user/repo/tag'
        );
    }
    var user = parts[0],
        repo = parts[1],
        ref = parts[2] || 'master';

    github.repos.getArchiveLink(user, repo, 'tarball', ref, function (err, url) {
        if (err) {
            return callback(err);
        }
        exports.installArchive(cfg, url, opt, ghref, callback);
    });
};


/**
 * Checks to see if a directly installed package already exists and removes
 * it in order to do a clean reinstall. For example, when doing "install foo"
 * this check would *only* be performed on foo, not on its dependencies.
 */

exports.checkExisting = function (name, opt, callback) {
    var p = path.resolve(opt.packageDir, name);
    pathExists(p, function (exists) {
        if (exists) {
            exports.log(name, 'already installed, reinstalling...' );
            rimraf(p, callback);
        }
        else {
            callback();
        }
    });
};
