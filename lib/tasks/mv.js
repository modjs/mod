exports.summary = 'Move or rename files or directories';

exports.usage = '<src> <dest>';

exports.run = function (options) {
    var dest = options.dest;
    var file = exports.file;

    exports.files.forEach(function(srcFile){

        var destFile = dest;

        if(file.isDirname(dest)){
            dest = path.dirname(dest);
            destFile =  path.join(dest, srcFile);
        }

        file.copy(srcFile, destFile);
        file.delete(srcFile);
    })

};

