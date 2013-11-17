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
        ,default: "./"
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

    exports.download(source, function (err, filename) {
        if (err) {
            return callback(err);
        }

        var destDir = '';
        var destFilename = '';

        if(file.isDirname(dest)){
            destDir = dest;
            destFilename = path.basename(filename);
        }else {
            destDir = path.dirname(dest);
            destFilename = path.basename(dest);
        }

        mkdirp(destDir, function (err) {
            if (err) {
                return callback(err);
            }

            dest = path.join(destDir, destFilename);

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

        file.copy(tdir, dest);
        cleanCallback();
    });
};

/**
 * Prepares a .tar.gz file before installation. Copies it to the tmp directory, then extracts it.
 *
 * @param {String} filename - the .tar.gz file to prepare
 * @param {Function} callback - returns the path of the extracted directory
 */
exports.prepareArchive = function (filename, callback) {

    exports.cpTmp(filename, function (err, tmp) {
        if (err) {
            return callback(err);
        }
        var tmpExtracted = config.TMP_DIR + '/download' + (new Date).getTime() + "/";

        var tarTask = exports.loadTask("mod-tar");
        if(tarTask){
            tarTask.extract(tmp, tmpExtracted, function (err) {
                if (err) {
                    return callback(err);
                }

                callback(err, tmpExtracted, tmp);

            });
        }else{
            throw Error('Plugin for extract tarball not installed, install by "npm install mod-tar" first')
        }

    });
};

/**
 * Copies a file into the temporary directory.
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
exports.cleanupTmp = function (fn, tmpPaths) {
    // clean up tmp dir after attempted download, even if error
    return function (err) {
        var args = arguments;
        var that = this;
        async.map(tmpPaths, rimraf, function (err2) {
            if (err2) {
                // log this error even though it won't make it to the callback
                exports.error(err2);
            }
            fn.apply(that, args);
        });
    };
};
