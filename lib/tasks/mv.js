
exports.summary = 'Move or rename files or directories';

exports.usage = '<source> <dest>';

exports.run = function (options, callback) {
    // options
    var source = options.source;
    var dest = options.dest;

    var file = exports.file;
    file.copy(source, dest);
    file.delete(source);
    callback();
};

