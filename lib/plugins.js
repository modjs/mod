var _ = require('underscore');
var exec = require('child_process').exec;
var async = require("async");
var path = require("path");
var logger = require('./utils/logger');

exports.pluginsConfig = {};

exports.loadTask = function(taskName){
    var task;
    var pluginName = exports.pluginsConfig[taskName];
    // require global plugin task
    if(!task){
        try{
            task = require(path.resolve(__dirname, '../../' + pluginName));
        }catch(e){
            logger.debug(e);
        }
    }
    // hack for when plugin name without mod- prefix
    if(!task){
        try{
            task = require(path.resolve(__dirname, '../../'+ pluginName.slice(4)));
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
        if(!exports.loadTask(taskName)) uninstalledPlugins.push(pluginName);
    });

    var installPluginsQueue = uninstalledPlugins.map(function(plugin){

        return function(cb){
            logger.info('install plugin', plugin);

            var cp = exec("npm install -g " + plugin, options, function (err, stdout, stderr) {
                if(err){
                    return cb(err);
                }
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
        console.log();
        callback();

    });

};