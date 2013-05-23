var packages = require('../utils/packages'),
    tar = require('../utils/tar'),
    path = require('path');


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

    packages.loadPackageJSON(source, function (err, cfg) {
        if (err) {
            return callback(err);
        }

        var target = options.dest || cfg.name + '-' + cfg.version + '.tar.gz';
        tar.create(cfg, source, target, callback);

    });
};
