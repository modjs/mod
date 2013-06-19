var utils = require('../utils'),
    mkdirp = require('mkdirp'),
    rimraf = require('rimraf'),
    config = require('../config'),
    async = require('async'),
    path = require('path'),
    fs = require('fs'),
    _ = require('underscore');

var tar = require('../utils/tar');
var github = require('../utils/github');
var file = require('../utils/file');

var pathExists = fs.exists || path.exists;

var httpRequest = require('request'),
    fs = require('fs'),
    path = require('path');

exports.summary = 'Request resource from URI';

exports.usage = '<source> [options]';

exports.options = {
    source : {
        alias: 's',
        describe: 'the URI from which to request a resource'
    },
    dest : {
        alias : 'd'
        ,describe : 'the file or directory where to store the requested resource(s)'
    },
    verbose: {
        alias : 'v'
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
        return exports.installURL(source, dest, callback);
    }
    // request https://github.com/jquery/jquery/tarball/1.8.2
    else if (/^https?:\/\//.test(source)) {
        exports.log('installing from Archive', source.green);
        return exports.installArchive(source, dest, callback);
    }

    // request jquery/jquery
    else if (/^[^\.]\w*\/\w/.test(source)) {
        exports.log('installing from GitHub', source.green);
        return exports.installGitHub(source, dest, callback);
        
    }

    // TODO: only support http/https now, will support ftp/file/svn/git/ssh/telnet

    // http://www.iana.org/assignments/uri-schemes/prov/ssh
    // ssh://[<user>[;fingerprint=<host-key fingerprint>]@]<host>[:<port>]


    // http://ant.apache.org/manual/Tasks/ftp.html
    // http://ant.apache.org/manual/Tasks/rexec.html    Task to automate a remote rexec session
    // http://ant.apache.org/manual/Tasks/sshexec.html  Runs a command on a remote machine running SSH daemon.
    // http://ant.apache.org/manual/Tasks/scp.html      Copy file to a remote machine


};

/**
 * download file
 * @param file
 * @param callback
 */
exports.download = function (file, callback) {
    var target = config.TMP_DIR + '/' + path.basename(file);
    utils.download(file, target, callback);
};


/**
 *
 * @param source
 * @param dest should be a dir now
 * @param callback
 */
exports.installURL = function (source, dest, callback) {
    // TODO： dest can be a file

    exports.download(source, function (err, filename) {
        if (err) {
            return callback(err);
        }

        var name = path.basename(filename);
        mkdirp(dest, function (err) {
            if (err) {
                return callback(err);
            }

            dest = path.join(dest, name);

            file.copy(filename, dest);
            callback(null, dest);
        });


    });
};



/**
 * Install a .tar.gz file from a URL
 */
exports.installArchive = function (url, dest, callback) {

    exports.download(url, function (err, filename) {
        if (err) {
            return callback(err);
        }
        exports.installFile(filename, dest, callback);
    });
};


/**
 * Install a package from a .tar.gz file.
 */
exports.installFile = function (filename, dest, callback) {

    exports.prepareFile(filename, function (err, tdir, tfile) {

        // clean up tmp dir after attempted install, even if error
        var cleanCallback = exports.cleanupTmp(callback, [tfile, tdir]);

        if (err) {
            cleanCallback();
            return callback(err);
        }

        // TODO



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

            callback(err, tmp_extracted, tmp);

        });
    });
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

        file.copy(filename, tmp);
        callback(null, tmp);

    });
};



// Install a package from GitHub
exports.installGitHub = function (ghref, dest, callback) {

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
        exports.installArchive(url, dest, callback);
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
            exports.log(name, ' already exists' );
            rimraf(p, callback);
        }
        else {
            callback();
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
