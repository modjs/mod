var utils = require('../utils'),
    fs = require('fs'),
    rimraf = require('rimraf');

exports.summary = 'Move or rename files or directories';

exports.usage = '<source> <dest>';


exports.run = function (options, callback) {

    var source = options.source;
    var dest = options.dest;

    exports.file.copy(source, dest);
    exports.file.delete(source);
    callback();
};

