var _ = require('underscore');
var exec = require('child_process').exec;
var async = require("async");
var path = require("path");
var fs = require('fs');
var logger = require('./utils/logger');
var loggerPrefix = logger.prefix;

exports.pluginsConfig = {};

// Inspired by https://github.com/joyent/node/blob/master/lib/module.js#L202
exports.npmModulePaths =  function(from, pluginName){

    // guarantee that 'from' is absolute.
    from = path.resolve(from);

    // note: this approach *only* works when the path is guaranteed
    // to be absolute.  Doing a fully-edge-case-correct path.split
    // that works on both Windows and Posix is non-trivial.
    var splitRe = process.platform === 'win32' ? /[\/\\]/ : /\//;
    var paths = [];
    var parts = from.split(splitRe);

    for (var tip = parts.length - 1; tip >= 0; tip--) {
        // don't search in .../node_modules/node_modules
        if (parts[tip] === 'node_modules') continue;
        var dir = parts.slice(0, tip + 1).concat('node_modules').concat(pluginName).join(path.sep);

        // hack for when plugin name without mod- prefix
        // var dir = parts.slice(0, tip + 1).concat('node_modules').concat(pluginName.slice(4)).join(path.sep);

        paths.push(dir);
    }

    // if no ./node_modules, require from global
    paths.push(path.resolve( __dirname, '../../' + pluginName) );

    return paths;
};

exports.npmModulePath = function(from, pluginName){
    var paths = exports.npmModulePaths(from, pluginName);
    var modulePath;
    paths.some(function(path){
        if(fs.existsSync(path)){
            return modulePath = path;
        }
    });
    return modulePath;
};

exports.isGruntPlugin = function(pluginName){
    return pluginName.indexOf("grunt-") != -1;
};

exports.loadTask = function(taskName, cwd){
    var task;
    var taskPath;
    var pluginPath = null;
    var pluginName = '';

    // check if inline plugin define, may define with run function or runner object
    var plugin = exports.pluginsConfig[taskName];

    if(_.isFunction(plugin)){
        // wrap run function as a runner object
        task = {run: plugin};
    }else if(_.isObject(plugin) && plugin.run){
        // direct apply
        task =  plugin;
    }else if(_.isString(plugin)) {
        // config by npm module name, could be with a version number like "foo@0.5"
        pluginName = plugin.split("@")[0].trim();
    }else{
        // plugin config is optional when config task name by npm module name
        pluginName = taskName;
    }

    // require locally plugin task
    if(!task){
        try{
            taskPath = path.resolve(pluginName);
            task = require(taskPath);
            logger.debug('plugin', 'load locally custom task ' + pluginName + ' at ' + taskPath);
        }catch(e){
            logger.debug(e);
        }
    }

    // require npm plugin task
    if(!task){
        try{
            pluginPath = exports.npmModulePath(cwd || process.cwd(), pluginName);
            if(pluginPath){
                logger.debug('plugin', taskName + ' installed at ' + pluginPath);
                // grunt plugin task not have a entry point
                if(exports.isGruntPlugin(pluginName)){
                    return task = {
                        gruntPluginName: pluginName,
                        gruntPluginPath: path.join(pluginPath, 'tasks')
                    }
                }else{
                    return task = require(pluginPath);
                }
            }
        }catch(e){
            logger.debug(e);
        }
    }

    return task;
};

exports.install = function(pluginsConfig, callback){

    var uninstalledPlugins = [];

    exports.pluginsConfig = pluginsConfig;

    if( _.isEmpty(pluginsConfig) ){
        return callback();    
    }

    _.each(pluginsConfig, function(pluginName, taskName){

        if(!exports.loadTask(taskName)) {
            uninstalledPlugins.push(pluginName);
        }else if(_.isString(pluginName)){
            console.log(loggerPrefix + 'Plugin', taskName.green + ' (' + pluginName + ') ' + 'has been installed');
        }else{
            console.log(loggerPrefix + 'Plugin', taskName.green + ' (inline plugin)' + 'has been installed')
        }

    });

    var installPluginsQueue = uninstalledPlugins.map(function(plugin) {

        return function(cb){
            // process plugins name, eg. "mod-sprite@0.3.1 -g"
            plugin = " " + plugin + " ";
            var isGlobally = plugin.match(/\s+(-g|--global)\s+/);
            plugin = plugin.replace(/\s+(-g|--global)\s+/, "").trim();
            console.log(loggerPrefix + 'Plugin', plugin.green + ' will be installed ' + (isGlobally? 'globally' : 'locally') );

            // default install the plugin package locally
            var cp = exec('npm install ' + plugin + (isGlobally? ' --global --link' : ''), function (err, stdout, stderr) {
                if(err){
                    return cb(err);
                }
                console.log(loggerPrefix + 'Plugin', plugin.green + ' success install'.magenta);
                cb();
            });

            cp.stdout.on('data', function (data) {
                process.stdout.write(data);
            });

            cp.stderr.on('data', function (data) {
                process.stderr.write(data);
            });

        }
    });

    async.series(installPluginsQueue, function (err) {
        if(err){
            throw err;
        }
        callback();
    });

};
