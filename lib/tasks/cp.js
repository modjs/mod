var utils = require('../utils'),
    file = require('../utils/file'),
    path = require('path'),
    ncp = require('ncp').ncp;

exports.summary = 'Copy one or more files to another location';

exports.usage ='<source> [options]';

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
    },
    "filter": {
        alias : 'f'
        ,describe : 'a RegExp instance, against which each file name is tested to determine whether to copy it or not,' +
            ' or a function taking single parameter: copied file name, returning true or false, determining whether to copy file or not.'
    }
};


exports.run = function (options, callback) {

    var source = options.source,
        dest = options.dest,
        parent = options.parent;


    // TODO if include copy source parent directory?
    if(parent) {
        if(file.isDir(source)){
            var parentDir = path.basename(source);
            dest = path.join(dest, parentDir);
        }
    }


    var files = file.glob(source);

    files.forEach(function(source){

        var target = dest;

        // change to file copy to file
        if(file.isFile(source) && file.isDir(dest)){
            var filename = path.basename(source);
            target = path.join(dest, filename);
        }

        file.copy(source, target);
        exports.log(source + " > "+ target);


    });



    callback();

};

