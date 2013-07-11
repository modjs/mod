var path = require('path');

exports.summary = 'Copy one or more files to another location';

exports.usage ='<src> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,describe : 'destination directory or file'
    },
    "parent" : {
        alias : 'p'
        ,default : false
        ,type : 'boolean'
        ,describe : 'include source parent directory'
    }
};


exports.run = function (options) {

    var source = options.src;
    var dest = options.dest;
    var parent = options.parent;

    var file = exports.file;

    // TODO if include copy source parent directory?
    if(parent) {
        if(file.isDir(source)){
            var parentDir = path.basename(source);
            dest = path.join(dest, parentDir);
        }
    }

    exports.files.forEach(function(source){

        var target = dest;

        // change to file copy to file
        if(file.isFile(source) && file.isDir(dest)){
            var filename = path.basename(source);
            target = path.join(dest, filename);
        }

        file.copy(source, target);
        exports.log(source + " > "+ target);

    });

};

