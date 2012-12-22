var path = require('path'),
    tree = require('../tree'),
    utils = require('../utils'),
    project = require('../project');

var install = require('../core').loadTask('install');


exports.summary = 'Rebuild project';

exports.usage = '[options]';

exports.options = {
    "p" : {
        alias : 'packageDir'
        ,describe : 'package directory'
    },
    "b" : {
        alias : 'baseUrl'
        ,describe : 'all modules are located relative to this path'
    }
};

exports.run = function (opt, callback) {

    var rc = exports.getRuntimeConfig();
    var cwd = process.cwd();


    exports.readPackages(rc, opt, function (err, packages) {
        if (err) {
            return callback(err);
        }

        project.updateLoaderConfig(opt.packageDir, opt.baseUrl, callback);

    });

};


exports.readPackages = function (rc, opt, callback) {
    var local_sources = [
        install.dirSource(opt.packageDir),
        install.repoSource(rc.repositories, rc)
    ];
    var newcfg = utils.convertToRootCfg(rc);
    var pkg = {
        config: newcfg,
        source: 'root'
    };
    exports.log('building local version tree...');
    tree.build(pkg, local_sources, callback);
};
