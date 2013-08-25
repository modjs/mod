var path = require('path');

exports.summary = 'Copy one or more files to another location';

exports.usage ='<src> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,describe : 'destination directory or file'
    }
};


exports.run = function (options) {

    var source = options.src;
    var dest = options.dest;
    var parent = options.parent;

    var file = exports.file;

    if(!dest){
        return exports.error('cp task dest is null');
    }

    exports.files.forEach(function(source){

        var target = dest;
        if( file.isDirFormat(dest) ){
            var filename = path.basename(source);
            target = path.join(dest, filename);
        }

        file.copy(source, target);
        exports.log(source + " > "+ target);

    });

};

