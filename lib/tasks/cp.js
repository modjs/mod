var path = require('path');

exports.summary = 'Copy one or more files to another location';

exports.usage ='<src> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,describe : 'destination directory or file'
    },
    "flatten": {
        alias : 'f'
        ,describe: "remove all path parts from generated dest paths"
    },
    "recursive": {
        default: true
        ,alias : 'r'
        ,describe: "copy directories recursively"
    },
    "verbose": {
        default: true
        ,alias : 'v'
        ,describe: "shows file/directory names after they are copied"
    },
    "force": {
        default: true
        ,alias : 'f'
        ,describe: "force overwriting the existing files"
    },
    "update": {
        default: false
        ,alias: "u"
        ,describe: "copy only when the SOURCE file is newer than the destination file or when the destination file is missing"
    },
    "backup": {
        default: true
        ,alias : 'b'
        ,describe: "make a backup of each existing destination file"
    },
    "parents": {
        default: false
        ,alias : 'p'
        ,describe: "full path to be copied to the destination directory"
    }
};

exports.run = function (options) {
    var dest = options.dest;
    var verbose = options.verbose;
    var parents = options.parents;
    var file = exports.file;

    if(!dest){
        return exports.error('cp task dest is null');
    }

    exports.files.forEach(function(source){
        // eg. source/path/file.js -> dest/path => dest/path/source/path/file.js
        if(parents){
            if(!file.isDirname(dest)) {
                throw new Error('With parents options, the copy destination "' + dest + '" must be a directory')
            }
            dest = path.join(dest, source);
        }

        var target = dest;

        if( file.isFile(source) && file.isDirname(dest) ){
            var filename = path.basename(source);
            target = path.join(dest, filename);
        }

        file.copy(source, target, options);
        verbose && exports.log(source + " > "+ target);
    });

};

