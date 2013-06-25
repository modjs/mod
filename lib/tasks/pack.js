var tar = require('../utils/tar');
var path = require('path');


exports.summary = 'Create a tarball from a module';

exports.usage = '<source> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,describe : 'target pack file path'
    }
};

exports.run = function (options, callback) {

    var source = options.source;

    // TODO if not exist package.json
    var cfg = exports.file.readPackageJSON(source);
    var target = options.dest || cfg.name + '-' + cfg.version + '.tar.gz';
    tar.create(cfg, source, target, callback);
};
