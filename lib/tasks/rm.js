exports.summary = 'Remove files';

exports.usage = '<src>';

exports.run = function (options) {

    exports.files.forEach(function(srcFile){
        exports.file.delete(srcFile);
        exports.log(srcFile);
    });

};
