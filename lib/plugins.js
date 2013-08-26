var _ = require('underscore');
var exec = require('child_process').exec;
var async = require("async");
var path = require("path");
var fs = require('fs');
var logger = require('./utils/logger');

exports.pluginsConfig = {};

exports.loadTask = function(taskName, cwd){
    var task;
    var taskPath;
    var pluginName = exports.pluginsConfig[taskName];
    // require global plugin task
    if(!task){
        try{
            taskPath = path.resolve(cwd || process.cwd(), './node_modules/' + pluginName); // try to require from ./node_modules
            taskPath = fs.existsSync(taskPath) ? 
              taskPath :
              path.resolve(__dirname, '../../' + pluginName); // if no ./node_modules, require from global
            task = require(taskPath);
            logger.debug('[plugin]', pluginName + ' installed at ' + taskPath);
        }catch(e){
            logger.debug(e);
        }
    }
    // hack for when plugin name without mod- prefix
    if(!task){
        try{
            taskPath = path.resolve(cwd || process.cwd(), './node_modules/' + pluginName.slice(4)); // the same as above;
            taskPath = fs.existsSync(taskPath) ?
              taskPath :
              path.resolve(__dirname, '../../'+ pluginName.slice(4));
            task = require(taskPath);
            logger.debug('[plugin]', pluginName + ' installed at ' + taskPath);
        }catch(e){
            logger.debug(e);
        }
    }
    // require custom task
    if(!task){
        try{
            taskPath = path.resolve(pluginName);
            task = require(taskPath);
            logger.debug('[plugin]', 'load custom task ' + pluginName + ' at ' + taskPath);
        }catch(e){
            logger.debug(e);
            return null;
        }
    }

    return task;
};

exports.install = function(pluginsConfig, callback){

    var uninstalledPlugins = [];

    exports.pluginsConfig = pluginsConfig;

    _.each(pluginsConfig, function(pluginName, taskName){

        if(!exports.loadTask(taskName)) {
            uninstalledPlugins.push(pluginName);
        }else{
            logger.info('[plugin]', pluginName.green + ' has been installed\n'.yellow);
        }

    });

    var installPluginsQueue = uninstalledPlugins.map(function(plugin){

        return function(cb){
            // process plugins name, eg. "mod-sprite@0.3.1 -g"
            plugin = " " + plugin + " ";
            var isGlobally = plugin.match(/\s+(-g|--global)\s+/);
            plugin = plugin.replace(/\s+(-g|--global)\s+/, "").trim();
            logger.info( '[plugin]', plugin.green + ' will be installed '.grey + (isGlobally? 'globally' : 'locally') );

            // default install the plugin package locally
            var cp = exec('npm install ' + plugin + (isGlobally? ' --global --link' : ''), function (err, stdout, stderr) {
                if(err){
                    return cb(err);
                }
                logger.info('[plugin]', plugin.green + ' install success\n'.magenta);
                cb();
            });

            cp.stdout.pipe(process.stdout);
            cp.stderr.pipe(process.stderr);

        }
    });

    async.series(installPluginsQueue, function (err, result) {
        // result now equals 'done'
        if(err){
            return logger.error(err);
        }

        callback();
    });

};
