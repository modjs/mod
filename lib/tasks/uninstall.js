var path = require('path'),
    async = require('async'),
    rimraf = require('rimraf'),
    tree = require('../tree'),
    utils = require('../utils'),
    project = require('../project'),
    clean = require('./clean');

var install = require('../core').loadTask('install');

exports.summary = 'Uninstall a module';

exports.usage = '<module>@[version]';

exports.options = {

    "p" : {
        alias : 'packageDir'
        ,describe : 'Modules directory to use'
    },

    "b" : {
        alias : 'baseUrl'
        ,describe : 'all modules are located relative to this path'
    }
};

exports.run = function (opt, callback) {

    var cwd = process.cwd();
    var rc = exports.getRuntimeConfig();

    var names = opt._.slice(1);

    exports.checkDependants(rc, opt, names, function (err) {
        if (err) {
            return callback(err);
        }
        async.series([
            async.apply(
                async.forEach, names, async.apply(exports.remove, rc, opt)
            ),
            async.apply(exports.buildLocalTree, rc, opt),
            async.apply(
                project.updateLoaderConfig, opt.packageDir, opt.baseUrl
            )
        ],
        callback);
    });

};


exports.checkDependants = function (rc, cfg, opt, names, callback) {
    exports.buildLocalTree(rc, cfg, opt, function (err, packages) {
        if (err) {
            return callback(err);
        }
        var has_dependants = false;
        for (var i = 0; i < names.length; i++) {
            var name = names[i];
            var pkg = packages[name];
            if (pkg) {
                var ranges = packages[name].ranges;
                var dependants = Object.keys(ranges).filter(function (d) {
                    return d !== '_root' && names.indexOf(d) === -1;
                });
                if (dependants.length) {
                    for (var j = 0; j < dependants.length; j++) {
                        var d = dependants[j];
                        exports.error(
                            d + ' depends on ' + name + ' ' + ranges[d]
                        );
                    }
                    has_dependants = true;
                }
            }
        }
        if (has_dependants) {
            return callback('Cannot remove package with dependants');
        }
        return callback();
    });
};


exports.remove = function (cfg, opt, name, callback) {
    exports.log('removing', name);
    delete cfg.webDependencies[name];
    rimraf(path.resolve(opt.packageDir, name), callback);
};


exports.buildLocalTree = function (rc, opt, callback) {
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
