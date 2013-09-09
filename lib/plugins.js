var _ = require('underscore');
var exec = require('child_process').exec;
var async = require("async");
var path = require("path");
var fs = require('fs');
var logger = require('./utils/logger');

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

exports.loadTask = function(taskName, cwd){
    var task;
    var taskPath;
    var pluginName = (exports.pluginsConfig[taskName] || '').split("@")[0].trim() || taskName;
    var pluginPath = null;

    // require npm plugin task
    if(!task){
        try{
            var paths = exports.npmModulePaths(cwd || process.cwd(), pluginName);
            paths.some(function(modulePath){
                if(fs.existsSync(modulePath)){
                    logger.debug('plugin', pluginName + ' installed at ' + modulePath);
                    pluginPath = modulePath;
                    return task = require(modulePath);
                }
            });
        }catch(e){
            logger.debug(e);
        }
    }

    // require locally plugin task
    if(!task){
        try{
            taskPath = path.resolve(pluginName);
            task = require(taskPath);
            logger.debug('plugin', 'load locally custom task ' + pluginName + ' at ' + taskPath);
        }catch(e){
            logger.debug(e);
            return null;
        }
    }

    // grunt plugin task
    if(task && pluginName.indexOf("grunt-") != -1){
        task.gruntPluginName = pluginName;
        task.gruntPluginPath = path.join(pluginPath, 'tasks');
    }

    return task;
};

exports.install = function(pluginsConfig, callback){

    var uninstalledPlugins = [];

    exports.pluginsConfig = pluginsConfig;

    if( _.isEmpty(pluginsConfig) ){
        return callback();    
    }else{
        console.log( ("+ Plugins configuration detected" ).bold.underline ); 
    }

    _.each(pluginsConfig, function(pluginName, taskName){

        if(!exports.loadTask(taskName)) {
            uninstalledPlugins.push(pluginName);
        }else{
            logger.info('plugin', pluginName.green + ' has been installed\n'.yellow);
        }

    });

    var installPluginsQueue = uninstalledPlugins.map(function(plugin) {

        return function(cb){
            // process plugins name, eg. "mod-sprite@0.3.1 -g"
            plugin = " " + plugin + " ";
            var isGlobally = plugin.match(/\s+(-g|--global)\s+/);
            plugin = plugin.replace(/\s+(-g|--global)\s+/, "").trim();
            logger.info( 'plugin', plugin.green + ' will be installed '.grey + (isGlobally? 'globally' : 'locally') );

            // default install the plugin package locally
            var cp = exec('npm install ' + plugin + (isGlobally? ' --global --link' : ''), function (err, stdout, stderr) {
                if(err){
                    return cb(err);
                }
                logger.info('plugin', plugin.green + ' install success\n'.magenta);
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
