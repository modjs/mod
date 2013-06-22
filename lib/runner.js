var path = require('path');
var fs = require('fs');
var _ = require('underscore');
var async = require("async");
var utils = require('./utils');
var logger = require('./utils/logger');
var file = require("./utils/file");
var config = require('./config');
var project = require('./project');
var plugins = require('./plugins');
var options = require('./options');

var cwd = process.cwd();

/**
 * @module exports
 * @summary exports to task API
 */

exports.runTask = function(taskName, taskOptions, callback, rc){

    var task = exports.loadTask(taskName, rc);
    taskOptions = options.parse(task, taskOptions);
    
    /**
     * an array of all file paths that match the given wildcard patterns.
     * @propery exports.files
     * @return {array} files array
     */
    task.files = file.expand(taskOptions);
    return task.run(taskOptions, callback);

};

exports.loadTask = function(taskName, rc){
    var task;
    // require built-in task
    try{
        task = require("./tasks/"+taskName);
    }catch (e){
        // require plugin task
        task = plugins.loadTask(taskName);
        logger.debug(e);
    }

    if(!task){
        return null;
    }

    rc = rc || exports.rc;

    // normalize task info
    task.taskName = task.taskName || "";
    task.usage = task.usage || "";
    task.options = task.options || {};

    /**
     * current task's name
     * @property exports.taskName
     */
    task.taskName = taskName;

    /**
     * load a task
     * @method exports.loadTask(taskName)
     * @return {object}
     */   
    task.loadTask = function(taskName){
        return exports.loadTask(taskName, rc);
    };

    /**
     * run task
     * @method exports.runTask(name [, options] [, callback])
     */
    task.runTask = exports.runTask;

    /**
     * run targets
     * @method exports.runTargets(targets [, callback])
     */
    task.runTargets = exports.runTargets;

    /**
     * get peoject config
     * @method exports.config([name])
     * @param  {[type]} name
     * @return {*}
     */
    task.config = function getRuntimeConfig(name){
        if(name) 
            return rc[name];
        else
            return rc;
    };

    var taskSign = ["[", taskName, "]"].join("");

    /**
     * print log
     * @method exports.log(arg1 [,arg2...])
     */
    task.log = function(){
        var msg =  utils.stringify(arguments);
        logger.info(taskSign, msg);
    };

    /**
     * print debug
     * @method exports.debug(arg1 [,arg2...])
     */
    task.debug = function(){
       var msg =  utils.stringify(arguments);
        logger.debug(taskSign, msg);
    };

    /**
     * print error
     * @method exports.error(arg1 [,arg2...])
     */
    task.error = function(){
        var msg =  utils.stringify(arguments);
        logger.error(msg);
    };

    /**
     * print warning
     * @method exports.warn(arg1 [,arg2...])
     */
    task.warn = function(){
        var msg = utils.stringify(arguments);
        logger.warn(msg);
    };

    /**
     * print task help
     * @method exports.help()
     */
    task.help = function(){

        // get options info
        var taskArgs = require('optimist')
            .usage( utils.usage(task.taskName) +" "+ task.usage)
            .options(task.options);

        // console.log("Usage:".yellow);
        taskArgs.help();
        logger.clean_exit = true;
    };

    /**
     * file 
     * @property exports.file
     */
    task.file = require('./utils/file');
    /**
     * _ 
     * @property exports._
     */
    task._ = require('underscore');
    /**
     * async 
     * @property exports.async
     */
    task.async = require('async');
    /**
     * request 
     * @property exports.request
     */
    task.request = require('request');
    /**
     * prompt 
     * @property exports.prompt
     */
    task.prompt = require('prompt');

    return task;
};


exports.runTargets = function(target, callback){

    config.load(function(err, rc){

        if(err){
            callback(err);
        }

        var tasksConfig = rc['tasks'];
        var taskQueue = [];

        if(_.isString(target)){
            target = target.trim().split(/\s+/);
        }

        var allTarget = [];
        target.map(function(t){
            // expend top type task to top:sub type task
            var res = t.split(":");

            var topTask = res[0]
                ,subTask = res[1];

            if(!subTask){

                var taskConfig = tasksConfig[topTask];

                // if taskConfig is null
                if(!taskConfig){
                    logger.error("task '"+ topTask + "' hava no config");
                }

                var targets = Object.keys(taskConfig).filter(function(key) {
                    return utils.isPlainObject(taskConfig[key]);
                });


                targets = targets.map(function(subTask){

                    return topTask+":"+subTask;
                });


                if(_.isEmpty(targets)){
                    allTarget.push(t);
                }else{
                    allTarget = allTarget.concat(targets);
                }

            }else{

                allTarget.push(t);
            }
        });


        // taskQueue ready
        taskQueue = allTarget.map(function(t){
            return function(callback){
                // support top:sub type task
                var res = t.split(":");

                var topTask = res[0]
                    ,subTask = res[1];

                var taskConfig = tasksConfig[topTask];

                if(subTask){
                    taskConfig = taskConfig[subTask];
                }

                var task = exports.loadTask(topTask);
                var taskOptions = options.parse(task, taskConfig);

                if (!taskOptions.packageDir) {
                    var modulesDir = rc.directory || '';
                    taskOptions.packageDir = path.resolve(cwd, modulesDir);
                }

                if (!taskOptions.baseUrl) {
                    // http://nodejs.org/api/path.html#path_path_resolve_from_to
                    // Arguments must be strings. In v0.8, non-string arguments were silently ignored. In v0.10 and up, an exception is thrown.
                    var baseUrl = rc.baseUrl || '';
                    taskOptions.baseUrl = path.resolve(cwd, baseUrl);
                }


                logger.info("Runing task: ".yellow + t.green);
                // exports.files
                task.files = file.expand(taskOptions);
                task.run(taskOptions, callback);
            }
        });

        // start run queue
        async.series(taskQueue, callback || function (err, result) {
            // result now equals 'done'
            if(err){
                return logger.error(err);
            }
            //console.log(result);
            logger.end();

        });

    });

};


exports.run = function(cmd){

    config.load(function(err, rc){
        // debugger;
        // console.log(rc);
        exports.rc = rc;
        var pluginsConfig = rc['plugins'] || {},
            tasksConfig = rc['tasks'] || {},
            targetsConfig = rc['targets'] || {};

        // if cmd is undefined, try run the default
        if ( _.isUndefined(cmd) ){
            var targets = Object.keys(targetsConfig);
            var tasks = Object.keys(tasksConfig);
            if(targets.length === 1){
                cmd = targets[0];
            }else if(tasks.length === 1){
                cmd = tasks[0];
            }
        }

        // process task:target format from cli mode
        var taskTarget = cmd.split(":")[1]
        if(taskTarget){
            targetsConfig[cmd] = cmd;
        }

        // process template for each config section
        rc['plugins'] = pluginsConfig = config.processTemplate(pluginsConfig);
        rc['tasks'] = tasksConfig = config.processTemplate(tasksConfig);
        rc['targets'] = targetsConfig = config.processTemplate(targetsConfig);

        plugins.install(pluginsConfig, function(){

            var task,
                target;

            if (cmd && (task = exports.loadTask(cmd, rc))) {

                var taskOptions = options.parse(task, tasksConfig[cmd]);

                if (!taskOptions.packageDir) {
                    var modulesDir = rc.directory || '';
                    taskOptions.packageDir = path.resolve(cwd, modulesDir);
                }

                if (!taskOptions.baseUrl) {
                    var baseUrl = rc.baseUrl || '';
                    taskOptions.baseUrl = path.resolve(cwd, baseUrl);
                }

                // run single task
                if(!logger.clean_exit){
                    // exports.files
                    task.files = file.expand(taskOptions);
                    task.run(taskOptions, function callback(err, str){
                        if (err) {
                            return logger.error(err);
                        }

                        // print string return only
                        if(!_.isString(str)){
                            str = "";
                        }

                        logger.end(str);
                    });
                }

            } else if (cmd && (target = targetsConfig[cmd]) ){

                logger.info("Runing target: ".yellow.bold + cmd.green.bold + "\n...................".grey) ;
                exports.runTargets(target);

            } else if (!cmd){

                var banner = ""+
                    "\n                          __   _      " +
                    "\n   ____ ___   ____   ____/ /  (_)_____" +
                    "\n  / __ `__ \\ / __ \\ / __  /  / // ___/" +
                    "\n / / / / / // /_/ // /_/ /  / /(__  ) " +
                    "\n/_/ /_/ /_/ \\____/ \\__,_/__/ //____/  " +
                    "\n                        /___/         \n";

                console.log(banner);

                console.log("Usage:");
                var usage = [' ','mod'.cyan, '<target>'.green , 'or'.grey , 'mod'.cyan, '<command>'.green,'[options]'.magenta];
                console.log( usage.join(" ") + "\n");

                var runnerOptions = {
                    "help" : {
                        alias : 'h'
                        ,describe : 'print more help information, e.g., "mod -h"'
                    },
                    "version" : {
                        alias : 'v'
                        ,describe : 'print the mod version, e.g., "mod -v"'
                    },
                    "debug" : {
                        describe : 'print with the debugging information, e.g., "mod <commond> --debug"'
                    },
                    "no-color" : {
                        describe : 'print without color, e.g., "mod <commond> --no-color"'
                    }

                };

                // get options info
                require('optimist')
                    .options( runnerOptions )
                    .help();

                logger.clean_exit = true;

            } else {
                logger.error("'" + cmd + "' is not a mod command or target.");
                console.log();

                var taskDictionary = require('./tasks').getTaskList();
                var suggested = require('./utils/suggestions').suggest(cmd, taskDictionary);

                if(suggested){
                    console.log("Did you mean one of these? ".yellow);
                    console.log("  " + suggested.grey)
                }

                console.log("\nTry the following command for more help:".green);
                console.log("  mod -h".grey);
                console.log("  mod help".grey);
                console.log("  mod help [command]".grey);
            }

        });

    });

};


