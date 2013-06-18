var utils = require('./utils'),
    path = require('path'),
    semver = require('semver'),
    logger = require('./utils/logger'),
    file = require('./utils/file'),
    config = require('./config'),
    async = require('async'),
    mkdirp = require('mkdirp'),
    fs = require('fs'),
    ncp = require('ncp').ncp;

// update loader config, default no laoder config
exports.updateLoaderConfig = function(packageDir, baseUrl, callback){

    config.load(function(err, meta){
        if(meta.loader == "seajs"){
            exports.updateSeaJSConfig(packageDir, baseUrl, callback)
        }else if(meta.loader == "requirejs"){
            exports.updateRequireConfig(packageDir, baseUrl, callback)
        }else{
            callback();
        }
    });

};

// add seajs to package dir
exports.makeSeaJS = function (packageDir, config, callback) {
    var source = path.resolve(__dirname,'../node_modules/seajs/dist/sea-debug.js');
    var dest = path.resolve(packageDir, 'sea.js');
    logger.info('updating', path.relative(process.cwd(), dest));
    fs.readFile(source, function (err, content) {
        var src = content.toString() + '\n' + config;
        fs.writeFile(dest, src, callback);
    });
};

// add requirejs to package dir
exports.makeRequireJS = function (modules, config, callback) {
    var source = path.resolve(__dirname,'../node_modules/requirejs/require.js');
    var dest = path.resolve(modules, 'require.js');
    logger.info('updating', path.relative(process.cwd(), dest));
    fs.readFile(source, function (err, content) {
        var src = content.toString() + '\n' + config;
        fs.writeFile(dest, src, callback);
    });
};


exports.getAllPackages = function (dir, callback) {
    file.listdir(dir, function (err, dirs) {
        if (err) {
            return callback(err);
        }
        async.map(dirs, function (d, cb) {
            var filename = path.resolve(d, 'package.json');
            utils.readJSON(filename, function (err, cfg, p) {
                cb(err, err ? null: {cfg: cfg, dir: path.relative(dir, d)});
            });
        }, callback);
    });
};

// update sea.config.js
exports.updateSeaJSConfig = function(modules, baseUrl, callback){
    var alias = {};

    exports.getAllPackages(modules, function (err, pkgs) {
        if (err) {
            return callback(err);
        }

        pkgs.forEach(function (pkg) {

            var cfg = pkg.cfg,
                name = cfg.name,
                location =  encodeURIComponent(pkg.dir);

            var main = cfg.main || "main.js";
            if (cfg.browser && cfg.browser.main) {
                main = cfg.browser.main;
            }
            if (cfg.cmd && cfg.cmd.main) {
                main = cfg.cmd.main;
            }

            // 如果 sea.js 的路径是：http://example.com/libs/seajs/1.0.0/sea.js
            // 则 base 路径是：http://example.com/libs/
            // 模块标识可以是 相对 或 顶级 标识。如果第一项是 . 或 ..，则该模块标识是相对标识。
            // 顶级标识根据模块系统的 base 路径 来解析。
            // 相对标识相对 require 所在模块的路径来解析, 如是 html 页面，则是 html路径
            // @see https://github.com/seajs/seajs/issues/258
            alias[name] = location + '/' + main;


        });

        utils.getVersion(function (err, version) {
            if (err) {
                return callback(err);
            }
            var data = {
                // TODO: useful option for cache-busting
                //urlArgs: '_t_build=' + (new Date().getTime()),
                alias: alias
            };
            var src = 'var __seajs_config = ' + JSON.stringify(data, null, 4) + ';\n' +
                '\n' +
                'if (typeof seajs !== "undefined" && seajs.config) {\n' +
                '    seajs.config(__seajs_config);\n' +
                '}\n' +
                'else {\n' +
                '    var seajs = { args: [0, [__seajs_config] ] };\n' +
                '}\n' +
                '\n' +
                'if (typeof exports !== "undefined" && ' +
                'typeof module !== "undefined") {\n' +
                '    module.exports = __seajs_config;\n' +
                '}';

            var filename = path.resolve(modules, 'seajs.config.js');

            mkdirp(modules, function (err) {
                if (err) {
                    return callback(err);
                }
                logger.info('updating', path.relative(process.cwd(), filename));
                async.parallel([
                    async.apply(fs.writeFile, filename, src),
                    async.apply(exports.makeSeaJS, modules, src)
                ], callback);
            });
        });
    });
};

// update require.config.js
exports.updateRequireConfig = function (modules, baseUrl, callback) {
    // exports.updateSeaJSConfig(modules, baseUrl, callback); return;
    var packages = [];
    var shims = {};

    var basedir = baseUrl ? path.relative(baseUrl, modules): modules;
    var dir = basedir.split('/').map(encodeURIComponent).join('/');

    exports.getAllPackages(modules, function (err, pkgs) {
        if (err) {
            return callback(err);
        }

        pkgs.forEach(function (pkg) {
            // http://requirejs.org/docs/api.html#packages
            var cfg = pkg.cfg;
            var val = {
                name: cfg.name,
                location: dir + '/' + encodeURIComponent(pkg.dir)
            };
            // main
            var main = cfg.main;
            if (cfg.browser && cfg.browser.main) {
                main = cfg.browser.main;
            }
            if (cfg.amd && cfg.amd.main) {
                main = cfg.amd.main;
            }
            if (main) {
                val.main = main;
            }

            packages.push(val);
            // shim
            if (cfg.shim) {
                shims[cfg.name] = cfg.shim;
            }
            if (cfg.browser && cfg.browser.shim) {
                shims[cfg.name] = cfg.browser.shim;
            }
            if (cfg.amd && cfg.amd.shim) {
                shims[cfg.name] = cfg.amd.shim;
            }
        });

        utils.getVersion(function (err, version) {
            if (err) {
                return callback(err);
            }
            var data = {
                // TODO: useful option for cache-busting
                //urlArgs: '_t_build=' + (new Date().getTime()),
                packages: packages,
                version: version,
                shim: shims
            };
            var src = 'var __require_config = ' + JSON.stringify(data, null, 4) + ';\n' +
                '\n' +
                'if (typeof require !== "undefined" && require.config) {\n' +
                '    require.config(__require_config);\n' +
                '}\n' +
                'else {\n' +
                '    var require = __require_config;\n' +
                '}\n' +
                '\n' +
                'if (typeof exports !== "undefined" && ' +
                    'typeof module !== "undefined") {\n' +
                '    module.exports = __require_config;\n' +
                '}';

            var filename = path.resolve(modules, 'require.config.js');

            mkdirp(modules, function (err) {
                if (err) {
                    return callback(err);
                }
                logger.info('updating', path.relative(process.cwd(), filename));
                async.parallel([
                    async.apply(fs.writeFile, filename, src),
                    async.apply(exports.makeRequireJS, modules, src)
                ], callback);
            });
        });
    });
};

exports.getDependencies = function (cfg) {

    if (cfg.webDependencies) {
        return cfg.webDependencies;
    }

    if (cfg.browser && cfg.browser.dependencies) {
        return cfg.browser.dependencies;
    }

    return {};
};

exports.setDependencies = function (cfg, deps) {

    if (cfg.browser) {
        cfg.browser.dependencies = deps;
    }else{
        cfg.webDependencies = deps;
    }

    return cfg;
};

exports.addDependency = function (cfg, name, range) {
    var deps = exports.getDependencies(cfg);
    deps[name] = range;
    return exports.setDependencies(cfg, deps);
};



// 加载项目 package.json 文件配置 ,从当前目录向上遍历父目录直到找到 package.json 文件 或 到达根目录，
// 如果未找到返回 默认对象  {webDependencies: {}}
exports.loadPackageJSON = async.memoize(function (callback) {
    var cwd = process.cwd();
    utils.findPackageJSON(cwd, function (err, p) {
        if (err) {
            return callback(err, null, p);
        }
        if (!p) {
            // no package.json found, return default object
            // TODO: change the default to use mod.dependnecies
            return callback(null, {webDependencies: {}});
        }

        utils.readJSON(p, function (err, json) {
            if (err) {
                return callback(err);
            }

            // move mod to top-level
            if(json.mod){
                utils.merge(json, json.mod);
            }

            return callback(null, json);
        });

    });

});

