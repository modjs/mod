var _ = require('underscore'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    glob = require("./glob");

var rimraf = require('rimraf');

// In Nodejs 0.8.0, existsSync moved from path -> fs.
var pathExists = fs.exists || path.exists;
var existsSync = fs.existsSync || path.existsSync;


var isWindows = process.platform === 'win32',
    windowsDriveRegExp = /^[a-zA-Z]\:\/$/;

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



exports.isDir = function (path, callback) {

    if(callback){

        fs.stat(path, function (err, info) {
            if (err) {
                return callback(err);
            }
            return callback(null, {
                path: path,
                dir: info.isDirectory()
            });
        });

    }else{

        try{
            return fs.statSync(path).isDirectory();
        }catch(e){
            return false;
        }

    }


};

exports.isDirFormat = function(format){
    return path.extname(format) === '';
};

exports.pathJoin = function(dest, src){

    if(exports.isDirFormat(dest)){
        dest = path.dirname(dest);
        return path.join(dest, src);

    }else{
        return dest;
    }

};


exports.isFile = function (path, callback) {

    if(callback){
        fs.stat(path, function (err, info) {
            if (err) {
                return callback(err);
            }
            return callback(null, {
                path: path,
                file: info.isFile()
            });
        });
    }

    else{

        try{
            return fs.statSync(path).isFile();
        }catch(e){
            return false;
        }

    }
};


exports.isPlaintextFile= function (p) {

    var ext = path.extname(p);

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
 * file suffix append, like jquery.js => jquery.min.js
 * @param p
 * @param suffix .min
 * @return {*}
 */
exports.suffix = function( p, suffix ){

    var dn = path.dirname(p);
    var en = path.extname(p);
    var bn = path.basename(p, en);

    return path.join(dn , bn + suffix + en);
};



/**
 * List directories within a directory. Filters out regular files and
 * subversion .svn directory (if any).
 *
 * @param {String} dir
 * @param {Function} callback
 */

exports.listDirs = function (dir, callback) {
    pathExists(dir, function (exists) {
        if (!exists) {
            return callback(null, []);
        }
        fs.readdir(dir, function (err, files) {
            if (err) {
                return callback(err);
            }
            var paths = files.map(function (f) {
                return path.resolve(dir, f);
            });


            async.map(paths, exports.isDir, function (err, results) {
                if (err) {
                    return callback(err);
                }
                var dirs = _.compact(results.map(function (d) {
                    if (d.dir && path.basename(d.path) !== '.svn') {
                        return d.path;
                    }
                    return null;
                }));
                return callback(null, dirs);
            });
        });
    });
};

// Search for a filename in the given directory or all parent directories.
exports.findup = function (dirpath, filename) {
    var filepath = path.join(dirpath, filename);
    // Return file if found.
    if (existsSync(filepath)) { return filepath; }
    // If parentpath is the same as dirpath, we can't go any higher.
    var parentpath = path.resolve(dirpath, '..');
    return parentpath === dirpath ? null : findup(parentpath, filename);
};

// @see https://github.com/isaacs/node-glob
// pattern {String} Pattern to be matched
// options {Object}
// cb {Function}
//   err {Error | null}
//   matches {Array} filenames found matching the pattern
exports.globSync = exports.glob = function(pattern, base){
    if (Array.isArray(pattern)) {
        var files = [];
        pattern.forEach(function(p) {
            var res = exports.globSync.call(exports, p, base);
            if (!res || res.length === 0) {
                res = [p];
            }
            [].splice.apply(files, [files.length, 0].concat(res));
        });
        return files;
    } else {
        return glob.glob(pattern, {cwd: base || process.cwd()});
    }
};


function frontSlash(path) {
    return path.replace(/\\/g, '/');
}


function mkDir(dir) {
    if (!exists(dir) && (!isWindows || !windowsDriveRegExp.test(dir))) {
        fs.mkdirSync(dir, 511);
    }
}

function mkFullDir(dir) {
    var parts = dir.split('/'),
        currDir = '',
        first = true;

    parts.forEach(function (part) {
        //First part may be empty string if path starts with a slash.
        currDir += part + '/';
        first = false;

        if (part) {
            mkDir(currDir);
        }
    });
}

exports.delete = function(filepath){
    return rimraf.sync(filepath);
}

exports.read = function (/*String*/path, /*String?*/encoding) {
    if (encoding === 'utf-8') {
        encoding = 'utf8';
    }
    if (!encoding) {
        encoding = 'utf8';
    }

    var text = fs.readFileSync(path, encoding);

    //Hmm, would not expect to get A BOM, but it seems to happen,
    //remove it just in case.
    if (text.indexOf('\uFEFF') === 0) {
        text = text.substring(1, text.length);
    }

    return text;
};

exports.write = function (/*String*/fileName, /*String*/fileContents, /*String?*/encoding) {
    //summary: saves a *text* file.
    var parentDir;

    if (encoding === 'utf-8') {
        encoding = 'utf8';
    }
    if (!encoding) {
        encoding = 'utf8';
    }

    //Make sure destination directories exist.
    parentDir = path.dirname(fileName);
    if (!exists(parentDir)) {
        mkFullDir(parentDir);
    }

    fs.writeFileSync(fileName, fileContents, encoding);
};


exports.getFilteredFileList= function (/*String*/startDir, /*RegExp*/regExpFilters, /*boolean?*/makeUnixPaths) {
    //summary: Recurses startDir and finds matches to the files that match regExpFilters.include
    //and do not match regExpFilters.exclude. Or just one regexp can be passed in for regExpFilters,
    //and it will be treated as the "include" case.
    //Ignores files/directories that start with a period (.) unless exclusionRegExp
    //is set to another value.
    var files = [], topDir, regExpInclude, regExpExclude, dirFileArray,
        i, stat, filePath, ok, dirFiles, fileName;

    var exclusionRegExp= /^\./;

    topDir = startDir;


    regExpInclude = regExpFilters.include || regExpFilters;
    regExpExclude = regExpFilters.exclude || null;

    if (exports.exists( topDir )) {

        dirFileArray = fs.readdirSync(topDir);
        for (i = 0; i < dirFileArray.length; i++) {
            fileName = dirFileArray[i];
            filePath = path.join(topDir, fileName);
            stat = fs.statSync(filePath);
            if (stat.isFile()) {
                if (makeUnixPaths) {
                    //Make sure we have a JS string.
                    if (filePath.indexOf("/") === -1) {
                        filePath = frontSlash(filePath);
                    }
                }

                ok = true;
                if (regExpInclude) {
                    ok = filePath.match(regExpInclude);
                }
                if (ok && regExpExclude) {
                    ok = !filePath.match(regExpExclude);
                }

                if (ok && (!exclusionRegExp ||
                    !exclusionRegExp.test(fileName))) {
                    files.push(filePath);
                }
            } else if (stat.isDirectory() &&
                (!exclusionRegExp || !exclusionRegExp.test(fileName))) {
                dirFiles = this.getFilteredFileList(filePath, regExpFilters, makeUnixPaths);
                files.push.apply(files, dirFiles);
            }
        }
    }

    return files; //Array
};


exports.copyDir= function (/*String*/srcDir, /*String*/destDir, /*RegExp?*/regExpFilter, /*boolean?*/onlyCopyNew) {
    //summary: copies files from srcDir to destDir using the regExpFilter to determine if the
    //file should be copied. Returns a list file name strings of the destinations that were copied.
    regExpFilter = regExpFilter || /\w/;

    //Normalize th directory names, but keep front slashes.
    //path module on windows now returns backslashed paths.
    var cwd = process.cwd();

    // append "/" for replace
    srcDir = frontSlash(path.normalize(srcDir + "/"));
    destDir = frontSlash(path.normalize(destDir+ "/"));

    srcDir = frontSlash(path.join(cwd, srcDir));
    destDir = frontSlash(path.join(cwd, destDir));

    var fileNames = exports.getFilteredFileList(srcDir, regExpFilter, true),
        copiedFiles = [], i, srcFileName, destFileName;

    for (i = 0; i < fileNames.length; i++) {
        srcFileName = fileNames[i];
        destFileName = srcFileName.replace(srcDir, destDir);

        // console.log(srcDir, destDir, srcFileName,destFileName);

        if (exports.copyFile(srcFileName, destFileName, onlyCopyNew)) {
            copiedFiles.push(destFileName);
        }
    }

    return copiedFiles.length ? copiedFiles : null; //Array or null
};


exports.copyFile= function (/*String*/srcFileName, /*String*/destFileName, /*boolean?*/onlyCopyNew) {
    //summary: copies srcFileName to destFileName. If onlyCopyNew is set, it only copies the file if
    //srcFileName is newer than destFileName. Returns a boolean indicating if the copy occurred.
    var parentDir;

    //logger.trace("Src filename: " + srcFileName);
    //logger.trace("Dest filename: " + destFileName);

    //If onlyCopyNew is true, then compare dates and only copy if the src is newer
    //than dest.
    if (onlyCopyNew) {
        if (exports.exists(destFileName) && fs.statSync(destFileName).mtime.getTime() >= fs.statSync(srcFileName).mtime.getTime()) {
            return false; //Boolean
        }
    }

    //Make sure destination dir exists.
    parentDir = path.dirname(destFileName);
    if (!exports.exists(parentDir)) {
        mkFullDir(parentDir);
    }

    fs.writeFileSync(destFileName, fs.readFileSync(srcFileName, 'binary'), 'binary');

    return true; //Boolean
};

exports.copy = function(src, dest){

    if(exports.isFile(src)){
        return exports.copyFile(src, dest);

    }else if(exports.isDir(src)){
        return exports.copyDir(src, dest);
    }
};



// file.mkdirs
//
// Given a path to a directory, create it, and all the intermediate directories
// as well
//
// @path: the path to create
// @mode: the file mode to create the directory with:
//    ex: file.mkdirs("/tmp/dir", 755, function () {})
// @callback: called when finished.
exports.mkdirs = function (_path, mode, callback) {
    _path = exports.path.abspath(_path);

    var dirs = _path.split("/");
    var walker = [dirs.shift()];

    // walk
    // @ds:  A list of directory names
    // @acc: An accumulator of walked dirs
    // @m:   The mode
    // @cb:  The callback
    var walk = function (ds, acc, m, cb) {
        if (ds.length > 0) {
            var d = ds.shift();

            acc.push(d);
            var dir = acc.join("/");
            // look for dir on the fs, if it doesn't exist then create it, and
            // continue our walk, otherwise if it's a file, we have a name
            // collision, so exit.
            fs.stat(dir, function (err, stat) {
                // if the directory doesn't exist then create it
                if (err) {
                    // 2 means it's wasn't there
                    if (err.errno == 2 || err.errno == 34) {
                        fs.mkdir(dir, m, function (erro) {
                            if (erro && erro.errno != 17 && erro.errno != 34) {
                                return cb(erro);
                            } else {
                                return walk(ds, acc, m, cb);
                            }
                        });
                    } else {
                        return cb(err);
                    }
                } else {
                    if (stat.isDirectory()) {
                        return walk(ds, acc, m, cb);
                    } else {
                        return cb(new Error("Failed to mkdir " + dir + ": File exists\n"));
                    }
                }
            });
        } else {
            return cb();
        }
    };
    return walk(dirs, walker, mode, callback);
};

// file.mkdirsSync
//
// Synchronus version of file.mkdirs
//
// Given a path to a directory, create it, and all the intermediate directories
// as well
//
// @path: the path to create
// @mode: the file mode to create the directory with:
//    ex: file.mkdirs("/tmp/dir", 755, function () {})
exports.mkdirsSync = function (_path, mode) {
    if (_path[0] !== "/") {
        _path = path.join(process.cwd(), _path)
    }

    var dirs = _path.split("/");
    var walker = [dirs.shift()];

    dirs.reduce(function (acc, d) {
        acc.push(d);
        var dir = acc.join("/");

        try {
            var stat = fs.statSync(dir);
            if (!stat.isDirectory()) {
                throw "Failed to mkdir " + dir + ": File exists";
            }
        } catch (err) {
            fs.mkdirSync(dir, mode);
        }
        return acc;
    }, walker);
};

// file.walk
//
// Given a path to a directory, walk the fs below that directory
//
// @start: the path to startat
// @callback: called for each new directory we enter
//    ex: file.walk("/tmp", function(error, path, dirs, name) {})
//
//    path is the current directory we're in
//    dirs is the list of directories below it
//    names is the list of files in it
//
exports.walk = function (start, callback) {
    fs.lstat(start, function (err, stat) {
        if (err) { return callback(err) }
        if (stat.isDirectory()) {

            fs.readdir(start, function (err, files) {
                var coll = files.reduce(function (acc, i) {
                    var abspath = path.join(start, i);

                    if (fs.statSync(abspath).isDirectory()) {
                        exports.walk(abspath, callback);
                        acc.dirs.push(abspath);
                    } else {
                        acc.names.push(abspath);
                    }

                    return acc;
                }, {"names": [], "dirs": []});

                return callback(null, start, coll.dirs, coll.names);
            });
        } else {
            return callback(new Error("path: " + start + " is not a directory"));
        }
    });
};

// file.walkSync
//
// Synchronus version of file.walk
//
// Given a path to a directory, walk the fs below that directory
//
// @start: the path to startat
// @callback: called for each new directory we enter
//    ex: file.walk("/tmp", function(error, path, dirs, name) {})
//
//    path is the current directory we're in
//    dirs is the list of directories below it
//    names is the list of files in it
//
exports.walkSync = function (start, callback) {
    var stat = fs.statSync(start);

    if (stat.isDirectory()) {
        var filenames = fs.readdirSync(start);

        var coll = filenames.reduce(function (acc, name) {
            var abspath = path.join(start, name);

            if (fs.statSync(abspath).isDirectory()) {
                acc.dirs.push(name);
            } else {
                acc.names.push(name);
            }

            return acc;
        }, {"names": [], "dirs": []});

        callback(start, coll.dirs, coll.names);

        coll.dirs.forEach(function (d) {
            var abspath = path.join(start, d);
            exports.walkSync(abspath, callback);
        });

    } else {
        throw new Error("path: " + start + " is not a directory");
    }
};

exports.path = {};

exports.path.abspath = function (to) {
    var from;
    switch (to.charAt(0)) {
        case "~": from = process.env.HOME; to = to.substr(1); break
        case "/": from = ""; break
        default : from = process.cwd(); break
    }
    return path.join(from, to);
}

exports.path.relativePath = function (base, compare) {
    base = base.split("/");
    compare = compare.split("/");

    if (base[0] == "") {
        base.shift();
    }

    if (compare[0] == "") {
        compare.shift();
    }

    var l = compare.length;

    for (var i = 0; i < l; i++) {
        if (!base[i] || (base[i] != compare[i])) {
            return compare.slice(i).join("/");
        }
    }

    return ""
};

exports.path.join = function (head, tail) {
    if (head == "") {
        return tail;
    } else {
        return path.join(head, tail);
    }
};