var utils = require('../utils'),
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

var httpRequest = require('request'),
    fs = require('fs'),
    path = require('path');

exports.summary = 'Request resource from URI';

exports.usage = '<source> [options]';

exports.options = {
    s : {
        alias: 'source',
        describe: 'the URI from which to request a resource'
    },
    d : {
        alias : 'dest'
        ,describe : 'the file or directory where to store the requested resource(s)'
    },
    v: {
        alias : 'verbose'
        ,describe : 'show verbose progress information'
    }
};


exports.run = function (options, callback) {

    var source = options.source,
        dest = options.dest,
        verbose = options.verbose;


    // request http://code.jquery.com/jquery-1.8.2.js
    if( /^https?:\/\/.*\.(js|css)/.test(source)){
        exports.log('installing from URL', source.green);
        return exports.installURL(source, callback);
    }
    // request https://github.com/jquery/jquery/tarball/1.8.2
    else if (/^https?:\/\//.test(source)) {
        exports.log('installing from Archive', source.green);
        return exports.installArchive(source, callback);
    }

    // request jquery/jquery
    else if (/^[^\.]\w*\/\w/.test(source)) {
        exports.log('installing from GitHub', source.green);
        return exports.installGitHub(source, callback);
        
    }else {


        fs.stat(source, function (err, stats) {

            if (stats.isFile()) {
                if (/.*\.tar\.gz$/.test(source) || /.*\.tgz$/.test(source)) {
                    exports.log('installing from local file', source.green);
                    return exports.installFile(cfg, source, opt, callback);
                }
            }
            // mod install ./jquery/jquery
            else if (stats.isDirectory()) {
                exports.log('installing from local directory', source.green);
                return exports.installName(cfg, source, opt, callback);
            }


            return callback('Unknown install target: ' + path.resolve(source));
        });



    }


    // TODO: only support http/https now, will support ftp/file/svn/git/ssh/telnet

    // http://www.iana.org/assignments/uri-schemes/prov/ssh
    // ssh://[<user>[;fingerprint=<host-key fingerprint>]@]<host>[:<port>]


    // http://ant.apache.org/manual/Tasks/ftp.html
    // http://ant.apache.org/manual/Tasks/rexec.html    Task to automate a remote rexec session
    // http://ant.apache.org/manual/Tasks/sshexec.html  Runs a command on a remote machine running SSH daemon.
    // http://ant.apache.org/manual/Tasks/scp.html      Copy file to a remote machine


};


exports.installURL = function (url, callback) {

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





