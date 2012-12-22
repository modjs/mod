var cache = require('../utils/cache');


exports.summary = 'Clear local module cache';

exports.usage = '[module[@version]]';

exports.options = {
    "m" : {
        alias : 'module'
        ,describe : 'if no module is specified, all modules are cleared from the cache'
    },
    "v" : {
        alias : 'version'
        ,describe : 'if a module is specified without a version, all versions of that module are cleared'
    }
};


exports.run = function (opt, callback) {

    var version = opt.version;
    var module = opt.module;


    if(!module){

        var args = exports.getArgs();
        module = args[0];

        if (module && module.indexOf('@') !== -1) {
            var parts = module.split('@');
            module = parts[0];
            version = parts.slice(1).join('@');
        }
    }


    cache.clear(module, version, callback);
};
