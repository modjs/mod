var utils = require('../utils');
var mkdirp = require('mkdirp');
var rimraf = require('rimraf');
var config = require('../config');
var async = require('async');
var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var file = require('../utils/file');

exports.summary = 'Download resource from URI';

exports.usage = '<src> [options]';

exports.options = {
    src : {
        alias: 's',
        describe: 'the URI which to download a resource'
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

exports.run = function (options, done) {
    var src = [].concat(options.src);
    var dest = options.dest;
    var verbose = options.verbose;

    async.each(src, function(src, done){

        if( /^https?:\/\//.test(src)){
            // download through URL like http://code.jquery.com/jquery-1.8.2.js
            exports.log('Downloading from URL:', src.green);
            return exports.httpDownload(src, dest, done);
        } else if (/^[^\.]\w*\/\w/.test(src)) {
            // download through short github like jquery/jquery
            exports.log('Downloading from GitHub:', src.green);
            return exports.githubDownload(src, dest, done);  
        } else {
            exports.log('Unsupport uri format:', src.green);
            done()
        }

    }, done)
   
};

/**
 * download file
 * @param file
 * @param callback
 */
exports.download = function (file, callback) {
    var target = config.TMP_DIR + '/' + path.basename(file);
    var req = utils.download(file, target, callback);
    var receivedSize = 0;
    var totalSize = 0;
    req.on('reponse', function(response){
        totalSize = Number(response.headers['content-length']);
        exports.log('size:', totalSize)
        
    });
    req.on('data', function(data){
        receivedSize += data.length;
        // Update percentage
        // Note: that the totalSize might not be available
        var percent = totalSize ? Math.round(receivedSize / totalSize * 100) : null;

    });
};

/**
 *
 * @param source
 * @param dest should be a dir now
 * @param callback
 */
exports.httpDownload = function (source, dest, callback) {
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
 * download a .tar.gz file from a URL
 */
exports.downloadArchive = function (url, dest, callback) {

    exports.download(url, function (err, filename) {
        if (err) {
            return callback(err);
        }
        exports.unArchive(filename, dest, callback);
    });
};

/**
 * decompress archive
 */
exports.unArchive = function (filename, dest, callback) {

    exports.prepareArchive(filename, function (err, tdir, tfile) {

        // clean up tmp dir after attempted download, even if error
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
exports.prepareArchive = function (filename, callback) {

    exports.cpTmp(filename, function (err, tmp) {
        if (err) {
            return callback(err);
        }
        var tmpExtracted = config.TMP_DIR + '/download';

        exports.loadTask("tar").extract(tmp, tmpExtracted, function (err) {
            if (err) {
                return callback(err);
            }

            callback(err, tmpExtracted, tmp);

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
            // Downloading from a file in tmp already
            return callback(null, tmp);
        }

        file.copy(filename, tmp);
        callback(null, tmp);

    });
};

// download a package from GitHub
exports.githubDownload = function (ghref, dest, callback) {
    var github = require('../utils/github');
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
        exports.downloadArchive(url, dest, callback);
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
    // clean up tmp dir after attempted download, even if error
    return function (err) {
        var args = arguments;
        var that = this;
        async.map(tmp_paths, rimraf, function (err2) {
            if (err2) {
                // log this error even though it won't make it to the callback
                exports.error(err2);
            }
            fn.apply(that, args);
        });
    };
};
