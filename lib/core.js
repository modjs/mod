var path = require('path'),
    _ = require('underscore'),
    utils = require('./utils'),
    config = require('./config'),
    format = require('./utils/format'),
    project = require('./project'),
    logger = require('./utils/logger'),
    async = require("async");

var cwd = process.cwd();

exports.runTask = function(taskName, taskOptions, callback){
    config.load(function(err, rc){
        if(err){
            callback(err);
        }
        var task = exports.loadTask(taskName, rc);
        return task.run(taskOptions, callback);
    })
};

exports.loadTask = function(taskName, rc){
    var task;
    // require built-in task
    try{
        task = require("./tasks/"+taskName);
    }catch (e){
        logger.debug(e);
    }
    // require global plugin task
    if(!task){
        try{
            task = require(path.resolve(__dirname, '../../mod-'+taskName));
        }catch(e){
            logger.debug(e);
        }
    }
    // hack for when plugin name without mod- prefix
    if(!task){
        try{
            task = require(path.resolve(__dirname, '../../'+taskName));
        }catch(e){
            logger.debug(e);
            return null;
        }
    }

    rc = rc || exports.rc;

    // normalize task info
    task.taskName = task.taskName || "";
    task.usage = task.usage || "";
    task.options = task.options || {};

    task.taskName = taskName;
    task.loadTask = function(taskName){
        return exports.loadTask(taskName, rc);
    };

    // exports.runTask
    task.runTask = exports.runTask;

    task.runTasks = exports.runTasks;

    // exports.getArgs
    task.getArgs = function(){
        return process.argv.slice(2);
    };

    // exports.getGlobalRC
    task.getConfig =  task.getRuntimeConfig = function(){
        return rc;
    };

    task.getTaskConfig = function(taskName){
        if(rc['tasks']){
            return rc['tasks'][taskName] || {};
        }
        return {};
    };

    var taskSign = ["[", taskName, "]"].join("");

    task.log = function(){
        var string =  utils.argumentsStringify(arguments);
        logger.info(taskSign, string);
    };

    task.debug = function(){
       var string =  utils.argumentsStringify(arguments);
        logger.debug(taskSign, string);
    };

    task.error = function(){
        var string =  utils.argumentsStringify(arguments);
        logger.error(string);
    };

    task.warn = function(){
        var string =  utils.argumentsStringify(arguments);
        logger.warning(string);
    };

    // exports.showHelp
    task.showHelp = function(){

        // get options info
        var taskArgs = require('optimist')
            .usage( utils.usage(task.taskName) +" "+ task.usage)
            .options(task.options);

        // console.log("Usage:".yellow);
        taskArgs.showHelp();
        logger.clean_exit = true;
    };

    task.file = require('./utils/file');
    task._ = require('underscore');
    task.async = require('async');
    task.request = require('request');
    task.prompt = require('prompt');

    return task;
};

// mode: command , target
exports.parseOptions = function(task, taskConfig){

    taskConfig = taskConfig || {};

    //  get options info
    var taskArgs = require('optimist')
        .usage( utils.usage(task.taskName) +" "+ task.usage)
        .options(task.options);

    // process args
    var taskOptions = taskArgs.argv;

    taskOptions =  utils.merge(taskOptions, taskConfig);

    // exports.usage
    (task.usage.match(/<[^>]+>/g)||[]).forEach(function(val, key){
        var optionKey = val.replace(/[<>]/g,""), // remove "<" ">" char
            optionValue = taskOptions._[key+1] || taskOptions[optionKey];

        // the must required parameter is "<>" symbol
        if(!optionValue){
            logger.error("missing "+ optionKey);
            console.log();
            task.showHelp();
        }

        // "<source>" : "./path/to"
        taskOptions[val] = optionValue;
        // "source" : "./path/to"
        taskOptions[optionKey] = optionValue;
    });

    _.each(taskOptions, function(val, key){
        if(val = taskOptions[val]){
            taskOptions[key] = val;
        }
    });

    return taskOptions;

};

exports.build = function(){

};

exports.runTasks = function(target, callback){


    config.load(function(err, rc){

        if(err){
            callback(err);
        }

        var tasksConfig = rc['tasks'];
        var taskQueue = [];

        if(_.isString(target)){
            target = target.trim().split(" ");
        }

        var allTarget = [];
        target.filter(function(t){
            // filter space
            return t;
        }).map(function(t){
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
                    var taskOptions = exports.parseOptions(task, taskConfig);

                    if (!taskOptions.packageDir) {
                        var modulesDir = rc.directory;
                        taskOptions.packageDir = path.resolve(cwd, modulesDir);
                    }

                    if (!taskOptions.baseUrl) {
                        var baseUrl = rc.baseUrl;
                        taskOptions.baseUrl = path.resolve(cwd, baseUrl);
                    }

                    logger.info("Runing task: ".yellow + t.green);
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

        debugger;

        // console.log(rc);
        exports.rc = rc;


        var tasksConfig = rc['tasks'] || {},
            targetsConfig = rc['targets'] || {},
            task,
            target;

        if (cmd && (task = exports.loadTask(cmd, rc))) {

            var taskOptions = exports.parseOptions(task, tasksConfig[cmd]);

            if (!taskOptions.packageDir) {
                var modulesDir = rc.directory;
                taskOptions.packageDir = path.resolve(cwd, modulesDir);
            }

            if (!taskOptions.baseUrl) {
                var baseUrl = rc.baseUrl;
                taskOptions.baseUrl = path.resolve(cwd, baseUrl);
            }

            // run single task
            if(!logger.clean_exit){

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

        }
        else if(cmd && (target = targetsConfig[cmd]) ){

            logger.info("Runing target: ".yellow.bold + cmd.green.bold + "\n...................".grey) ;
            exports.runTasks(target);

        }
        else if(!cmd){

            var banner = ""+
                "\n                          __   _      " +
                "\n   ____ ___   ____   ____/ /  (_)_____" +
                "\n  / __ `__ \\ / __ \\ / __  /  / // ___/" +
                "\n / / / / / // /_/ // /_/ /  / /(__  ) " +
                "\n/_/ /_/ /_/ \\____/ \\__,_/__/ //____/  " +
                "\n                        /___/         \n";


            console.log(banner.yellow);
            //console.log('--------------------------------------'.grey);

            console.log("Usage:");
            var usage = [' ','mod'.cyan, '<target>'.green , 'or'.grey , 'mod'.cyan, '<command>'.green,'[options]'.magenta];
            console.log( usage.join(" ") + "\n");

            var options = {
                "h" : {
                    alias : 'help'
                    ,describe : 'print more help information, for example "mod -h"'
                },

                "v" : {
                    alias : 'version'
                    ,describe : 'print the mod version, for example "mod -v"'
                },
                "debug" : {
                    describe : 'print with the debugging information, for example "mod <commond> --debug"'
                }

            };

            // get options info
            require('optimist')
                .options( options)
                .showHelp();

            logger.clean_exit = true;

        }
        else {
            logger.error("'" + cmd + "' is not a mod command or target.");
            console.log();

            var taskDictionary = require('./tasks').getTaskList();
            var suggested = require('./utils/suggestions').suggest(cmd, taskDictionary);

            if(suggested){
                console.log("Did you mean one of these? ".yellow);
                console.log("  " + suggested.grey)
            }
            console.log();

            console.log("Try the following command for more help:".green);
            console.log("  mod -h".grey);
            console.log("  mod help".grey);
            console.log("  mod help [command]".grey);
            // TODO
        }
    });

};


