var _ = require('underscore');
var exec = require('child_process').exec;
var async = require("async");
var path = require("path");
var logger = require('./utils/logger');

exports.pluginsConfig = {};

exports.loadTask = function(taskName){
    var task;
    var taskPath;
    var pluginName = exports.pluginsConfig[taskName];
    // require global plugin task
    if(!task){
        try{
            taskPath = path.resolve(__dirname, '../../' + pluginName);
            task = require(taskPath);
            logger.debug('[plugin]', pluginName + ' installed at ' + taskPath);
        }catch(e){
            logger.debug(e);
        }
    }
    // hack for when plugin name without mod- prefix
    if(!task){
        try{
            taskPath = path.resolve(__dirname, '../../'+ pluginName.slice(4));
            task = require(taskPath);
            logger.debug('[plugin]', pluginName + ' installed at ' + taskPath);
        }catch(e){
            logger.debug(e);
            return null;
        }
    }

    return task;
};

exports.install = function(pluginsConfig, callback){

    var options = {};
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
            logger.info('[plugin]', plugin.green + ' will be installed'.grey);

            var cp = exec("npm install -g " + plugin, options, function (err, stdout, stderr) {
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