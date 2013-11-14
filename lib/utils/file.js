var fs = require('fs');
var url = require('url');
var path = require('path');
var glob = require("glob");
var config = require('../config');
var rimraf = require('rimraf');
var _ = require('underscore');
var mkdirp = require('mkdirp');
var utils = require('./index');

var isWindows = process.platform === 'win32';

function unixifyPath(filepath) {
    if (isWindows) {
        filepath = filepath.replace(/\\/g, '/');
    }
    return filepath;
}

/**
 * @module file
 * @summary There are many provided methods for reading and writing files, traversing the filesystem and finding files by matching globbing patterns. Many of these methods are wrappers around built-in Node.js file functionality, but with additional error handling, logging and character encoding normalization.
 */

/**
 * file exists
 * @method file.exists(filepath)
 * @param path
 * @returns {boolean}
 */
var exists = exports.exists = function(path) {
    if (isWindows && path.charAt(path.length - 1) === '/' &&
        path.charAt(path.length - 2) !== ':') {
        path = path.substring(0, path.length - 1);
    }

    try {
        fs.statSync(path);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * Is the given path a file? Returns a boolean.
 * @method file.isFile(filepath)
 * @param filepath
 * @returns {*}
 */
exports.isFile = function (filepath) {

    try{
        return fs.statSync(filepath).isFile();
    }catch(e){
        return false;
    }

};

exports.normalize = function(filepath){
    return unixifyPath( path.join(path.dirname(filepath), exports.basename(filepath) + exports.extname(filepath)) );
};

exports.extname = function (filepath){
    return filepath && path.extname(url.parse(filepath).pathname);
};

exports.basename = function(filepath){
    return path.basename(filepath, path.extname(filepath));
};

/**
 * Is the given path a plaintext file? Returns a boolean.
 * @method file.isPlaintextFile(filepath)
 * @param filepath
 * @returns {boolean}
 */
exports.isPlaintextFile= function (filepath) {

    var ext = path.extname(filepath).toLowerCase();

    var binary = {
        ".png" : 1,
        ".jpg": 1,
        ".gif": 1,
        ".jpeg": 1,
        ".ico": 1,
        ".exe": 1
    };

    return !binary[ext];

};

/**
 * Is the given path a UTF8 encoding file? Returns a boolean.
 * @method file.isUTF8EncodingFile(filepath)
 * @param filepath
 * @see https://github.com/zhuth/CsSC/blob/00ba5aaacd54030d68cedb6f2297945f2e2ec94d/Host.cs
 * @returns {boolean}
 */
exports.isUTF8EncodingFile = function(filepath) {

    var data = fs.readFileSync(filepath);
    // BOM header
    if (data[0] === 0xEF && data[1] === 0xBB && data[2] === 0xBF) return true;

    var charByteCounter = 1;

    var curByte;
    for (var i = 0, c = data.length; i < c; i++) {
        curByte = data[i];
        if (charByteCounter == 1) {
            if (curByte >= 0x80) {

                while (((curByte <<= 1) & 0x80) != 0) {
                    charByteCounter++;
                }

                if (charByteCounter == 1 || charByteCounter > 6) return false;
            }
        } else {

            if ((curByte & 0xC0) != 0x80) return false;
            charByteCounter--;
        }
    }

    if (charByteCounter > 1) return false;

    return true;
}

/**
 * file suffix append
 * @method file.suffix(filename, suffix)
 * @param filename
 * @param suffix .min
 * @return {*}
 * @example
 *   file.suffiex("jquery.js", "min") // => jquery.min.js
 */
exports.suffix = function( filename, suffix ){
    if(suffix == null) return filename
    var dn = path.dirname(filename);
    var en = path.extname(filename);
    var bn = path.basename(filename, en);
    suffix = suffix[0] == '.' ? suffix : '.' + suffix;
    return path.join(dn , bn +suffix + en);
};

exports.outputFile = function(inputFile, dest, suffix, defaultSuffix){
    var outputFile;
    if( !dest ) {
        outputFile = inputFile;
        suffix = suffix || defaultSuffix;
    }else if( exports.isDirname(dest)){
        var filename = path.basename(inputFile);
        outputFile = path.join(dest, filename);
    }else {
        outputFile = dest;
    }
    return exports.suffix(outputFile, suffix);
}

/**
 * Is the given path a directory? Returns a boolean.
 * @method file.isDir(filepath)
 * @param filepath
 * @returns {*}
 */
exports.isDir = function (filepath) {

    try{
        return fs.statSync(filepath).isDirectory();
    }catch(e){
        return false;
    }
};

/**
 * is dir format name
 * @method file.isDirname(filepath)
 * @param filepath
 * @returns {boolean}
 */
exports.isDirFormat = exports.isDirname = function(filepath){
    return exports.isDir(filepath) || filepath.slice(-1) === '/' || path.extname(filepath) === '';
};

/**
 * read a file from the filesystem and parse as JSON
 * @method file.readJSON(filepath)
 * @param {String} filepath
 */
exports.readJSON = function (filepath) {
    return JSON.parse(fs.readFileSync(filepath, 'utf-8'));
};

/**
 * Looks for a project's package.json file. Walks up the directory tree until
 * it finds a package.json file or hits the root. Does not throw when no
 * packages.json is found, just returns null.
 * @method file.findPackageJSON
 * @param dir - The starting path to search upwards from
 */
exports.findPackageJSON = function ( dir ) {
    return exports.find(dir, 'package.json');
};

/**
 * Read a package.json file's contents, parsing the data as JSON and returning the result
 * @method file.readPackageJSON( [dir] )
 * @param dir
 * @returns {*}
 */
exports.readPackageJSON = function (dir) {
    var filepath = path.resolve(dir || process.cwd(), 'package.json');
    return exports.readJSON(filepath);
};

/**
 * list directories within a directory.
 * @method file.listdir(dir, callback)
 * @param {String} rootdir
 * @returns {Array} dirs
 */
exports.listdir = function (rootdir) {

    if(exports.exists(rootdir)){
        var files = fs.readdirSync(rootdir);
        var dirs = [];
        files.forEach(function (f) {
            var filepath = path.resolve(rootdir, f);
            if( exports.isDir(filepath) )
                dirs.push(filepath);
        });
        return dirs;
    }else{
        throw new Error("path: " + rootdir + " is not a directory");
    }

};

/**
 * get the pattern matched files, default root dir is cwd
 * @method file.glob(pattern [, rootdir])
 * @param pattern
 * @param rootdir
 * @returns {Array} filenames found matching the pattern
 * @see https://github.com/isaacs/node-glob
 */
exports.glob = function(pattern, rootdir){
    if (Array.isArray(pattern)) {
        var files = [];
        pattern.forEach(function(p) {
            var res = exports.glob.call(exports, p, rootdir);
            if (!res || res.length === 0) {
                res = [p];
            }
            [].splice.apply(files, [files.length, 0].concat(res));
        });
        return files;
    } else {
        return glob.sync(pattern, {cwd: rootdir || process.cwd()});
    }
};

/**
 * Return a unique array of all file or directory paths that match the given globbing pattern(s).
 * @method file.expand(patterns [, options])
 * @param  {array} patterns
 * @param  {object} options  [description]
 * @return {array} matche files
 * @example
 *     file.expand(['!./foo/*.css', './foo/*'])
 */
exports.expand = function (patterns, options){
    // patterns is optional
    if(_.isObject(patterns)){
        options = patterns;
        patterns = options.src || options.source;
    }
    // wrap stirng as a array
    if(_.isString(patterns)){
        patterns = [patterns];
    }

    // make options param not undefined
    options = options || {};

    // all matching filepaths.
    var matches = [];

    if(!Array.isArray(patterns)){
        return matches;
    }
    // Iterate over flattened patterns array.
    _.flatten(patterns).forEach(function(pattern) {
        // If the first character is ! it should be omitted
        var exclusion = pattern.indexOf('!') === 0;
        // If the pattern is an exclusion, remove the !
        if (exclusion) { pattern = pattern.slice(1); }
        // Find all matching files for this pattern.
        var files = exports.glob(pattern);
        // console.log(pattern, files)
        if (exclusion) {
            // If an exclusion, remove matching files.
            matches = _.difference(matches, files);
        } else {
            // Otherwise add matching files.
            matches = _.union(matches, files);
        }
    });

    // Filter result set?
    if (options.filter) {
        matches = matches.filter(function(filepath) {
            filepath = path.join(options.cwd || '', filepath);
            try {
                if (_.isFunction(options.filter)) {
                    return options.filter(filepath);
                } else if(_.isRegExp(options.filter)){
                    return options.filter.test(filepath);
                }else {
                    // If the file is of the right type and exists, this should work.
                    return fs.statSync(filepath)[options.filter]();
                }
            } catch(e) {
                // Otherwise, it's probably not the right type.
                return false;
            }
        });
    }
    return matches;
};

/**
 * Delete the specified filepath. Will delete files and folders recursively.
 * @method file.delete(filepath)
 * @param filepath
 * @returns {*}
 */
exports.delete = function(filepath){
    return rimraf.sync(filepath);
};

/**
 * Synchronous rename
 * @mothod file.rename(oldpath, newpath)
 */
exports.rename = function(){
    return fs.renameSync.apply(this, arguments);
};

/**
 * Read and return a file's contents.
 * @method file.read(filepath [, encoding])
 * @param filepath
 * @param encoding
 * @returns {strign}
 */
exports.read = function (filepath, encoding) {
    if (encoding === 'utf-8') {
        encoding = 'utf8';
    }
    if (!encoding) {
        encoding = 'utf8';
    }

    filepath = exports.normalize(filepath);
    var data = fs.readFileSync(filepath, encoding);

    // Hmm, would not expect to get A BOM, but it seems to happen,
    // remove it just in case.
    if (data.indexOf('\uFEFF') === 0) {
        data = data.substring(1, data.length);
    }

    return data;
};

/**
 * write the specified contents to a file, creating intermediate directories if necessary
 * @method file.write(filepath, contents [, encoding])
 * @param filepath
 * @param contents
 * @param encoding
 * @returns {string} filepath
 */
exports.write = function (filepath, contents, encoding) {
    // summary: saves a *text* file.
    var parentDir;

    if (encoding === 'utf-8') {
        encoding = 'utf8';
    }
    if (!encoding) {
        encoding = 'utf8';
    }

    // Make sure destination directories exist.
    parentDir = path.dirname(filepath);
    if (!exists(parentDir)) {
        exports.mkdir(parentDir);
    }
    // filter query string
    filepath = exports.normalize(filepath);
    fs.writeFileSync(filepath, contents, encoding);
    return filepath;
};

/**
 * write the specified contents to a temp file
 * @method file.writeTemp(filepath, contents [, encoding])
 * @param filepath
 * @param contents
 * @param encoding
 * @returns {string} filepath
 */
exports.writeTemp  = function(filepath, contents, encoding){
    var tempfilepath = path.join(config.TMP_DIR , path.basename(filepath));
    return exports.write(tempfilepath, contents, encoding);
};

/**
 * copy a source file or directory to a destination path, creating intermediate directories if necessary
 * @method file.copy(src, dest)
 * @param src
 * @param dest
 * @param opts
 * @returns {boolean|array}
 */
exports.copy = function(src, dest, opts){
    opts = opts || {};
    if(exports.isFile(src)){
        return copyFile(src, dest, opts);
    }else if(exports.isDir(src)){
        return copydir(src, dest, opts);
    }
};

/**
 * copy dir
 * @param srcDir
 * @param destDir
 * @param opts
 * @returns {Array}
 */
function copydir(srcDir, destDir, opts, copiedFiles) {
    // Normalize the directory names, but keep front slashes.
    srcDir = unixifyPath(path.normalize(srcDir + "/"));
    destDir = unixifyPath(path.normalize(destDir+ "/"));
    copiedFiles = copiedFiles || [];

    var files = fs.readdirSync(srcDir),
        i,
        srcFileName,
        destFileName;

    for (i = 0; i < files.length; i++) {

        srcFileName = path.join(srcDir, files[i]);

        if(exports.isFile(srcFileName)){
            srcFileName = unixifyPath(srcFileName);
            // The filename at root dir not contains './', so append './' prefix for filename replace,
            // otherwise that will be wrong when copy file from root dir to one other dir
            if(srcDir == './') srcFileName = srcDir + srcFileName;
            destFileName = srcFileName.replace(srcDir, destDir);

            if (copyFile(srcFileName, destFileName, opts)) {
                copiedFiles.push(destFileName);
            }

        }else if(opts.recursive || opts.recursive === undefined){
             // if dir and allow copy recursively
            var subDirDest = destDir;
            if(!opts.flatten){
                subDirDest = unixifyPath( path.join(destDir, path.basename(srcFileName)) );
            }
            copydir(srcFileName, subDirDest, opts, copiedFiles);
        }
    }

    return copiedFiles;
}

/**
 * copy file
 * @param srcFile
 * @param destFile
 * @param opts
 * @returns {boolean}
 */
function copyFile(srcFile, destFile, opts) {
    srcFile = exports.normalize(srcFile);
    destFile = exports.normalize(destFile);

    // If force is new, then compare dates and only copy if the src is newer than dest.
    if ( opts.update
        && exports.exists(destFile)
        && fs.statSync(destFile).mtime.getTime() >= fs.statSync(srcFile).mtime.getTime() ) {
        return false;
    }

    if (opts.force && exports.exists(destFile)) {
        if(opts.backup){
            var backupBasePath = destFile + ".~";
            var backupPath = backupBasePath;
            for(var i=1; ;i++){
                backupPath = backupBasePath + i;
                if(!exports.exists(backupPath)){
                    break;
                }
            }

            copyFile(destFile, backupPath, opts);
        }
    }

    //Make sure destination dir exists.
    var parentDir = path.dirname(destFile);
    if (!exports.exists(parentDir)) {
        exports.mkdir(parentDir);
    }

    fs.writeFileSync(destFile, fs.readFileSync(srcFile, 'binary'), 'binary');

    return true;
}


/**
 * search for a filename in the given directory or all parent directories.
 * @method file.find(dirpath, filename);
 * @param dirpath
 * @param filename
 * @return {string}
 */
exports.find = function (dirpath, filename) {
    var existsSync = fs.existsSync || path.existsSync;
    var filepath = path.join(dirpath, filename);
    // Return file if found.
    if (existsSync(filepath)) { return filepath; }
    // If parentpath is the same as dirpath, we can't go any higher.
    var parentpath = path.resolve(dirpath, '..');
    return parentpath === dirpath ? null : exports.find(parentpath, filename);
};

/**
 * given a path to a directory, create it, and all the intermediate directories as well
 * @method file.mkdir(dirpath [, mode])
 * @param dirpath the path to create
 * @param mode
 * @example
 *  file.mkdir("/tmp/dir", 755)
 */
exports.mkdir  = function (dirpath, mode) {
    mkdirp.sync(dirpath, mode);
    return dirpath;
};

/**
 * create temp dir
 * @method file.mkdirTemp([dirname] [, mode])
 * @return {string}
 */
exports.mkdirTemp = function(dirname, mode){
    var temp = path.join(config.TMP_DIR ,  'mod_temp_dir', (dirname || +new Date).toString() );
    return exports.mkdir(temp, mode);
};

/**
 * recurse into a directory, executing callback for each file.
 * @method file.walkdir(rootdir, callback)
 * @param rootdir the path to startat
 * @param callback called for each new directory we enter
 * @example
 *      file.walkdir("/tmp", function(error, path, dirs, name) {
 *          // path is the current directory we're in
 *          // dirs is the list of directories below it
 *          // names is the list of files in it
 *      })
 */
exports.walkdir = function (rootdir, callback) {
    if (exports.isDir(rootdir)) {
        var filenames = fs.readdirSync(rootdir);

        var coll = filenames.reduce(function (acc, name) {
            var abspath = path.join(rootdir, name);

            if (fs.statSync(abspath).isDirectory()) {
                acc.dirs.push(name);
            } else {
                acc.names.push(name);
            }

            return acc;
        }, {"names": [], "dirs": []});

        callback(rootdir, coll.dirs, coll.names);

        coll.dirs.forEach(function (d) {
            var abspath = path.join(rootdir, d);
            exports.walkdir(abspath, callback);
        });

    } else {
        throw new Error("path: " + rootdir + " is not a directory");
    }
};
