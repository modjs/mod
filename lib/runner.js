var _ = require('underscore');
var async = require("async");
var utils = require('./utils');
var logger = require('./utils/logger');
var notifier = require('./utils/notifier');
var file = require("./utils/file");
var config = require('./config');
var plugins = require('./plugins');
var options = require('./options');
var loggerPrefix = logger.prefix;

/**
 * @module exports
 * @summary The exports API
 */

// runner config
exports.rc = {};

exports.loadTask = function(taskName){

    var task;
    var plugin = exports.rc.plugins[taskName];

    if(plugin){
        // require plugin task
        task = plugins.loadTask(taskName);
    }

    if(!task){
        try{
            // require built-in task
            task = require("./tasks/" + taskName);
        }catch (e){
            logger.debug(e);
            task = plugins.loadTask(taskName);
        }
    }

    if(!task){
        return null;
    }

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
    task.loadTask = exports.loadTask;

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
            return utils.namespace(exports.rc, name);
        else
            return exports.rc;
    };

    var taskLable = taskName;

    /**
     * print log
     * @method exports.log(arg1 [,arg2...])
     */
    task.log = function(){
        var msg =  utils.stringify(arguments);
        logger.info(taskLable, msg);
    };

    /**
     * print debug
     * @method exports.debug(arg1 [,arg2...])
     */
    task.debug = function(){
       var msg =  utils.stringify(arguments);
        logger.debug(taskLable, msg);
    };

    /**
     * print error
     * @method exports.error(arg1 [,arg2...])
     */
    task.error = function(){
        var msg =  utils.stringify(arguments);
        logger.error(taskLable, msg);
    };

    /**
     * print warning
     * @method exports.warn(arg1 [,arg2...])
     */
    task.warn = function(){
        var msg = utils.stringify(arguments);
        logger.warn(taskLable, msg);
    };

    /**
     * Push message to OSX notification system
     * @method exports.notify
     * @example
     *  exports.notify({
     *      title: 'Hi',
     *      message: 'I am ok'
     *  });
     */
    task.notify = notifier.notify;

    /**
     * print task help
     * @method exports.help()
     */
    task.help = function(){
        // delete module cache avoid goes pollute the optimist args when run multi-task
        delete require.cache[require.resolve('optimist')];
        // get options info
        var taskArgs = require('optimist')
            .usage( utils.usage(task.taskName) +" "+ task.usage)
            .options(task.options);

        var help = taskArgs.help();
        console.log(help);
    };

    /**
     * Compiles templates into strings
     * @property exports.template
     */
    task.template = require('./utils/template');

    /**
     * Miscellaneous utilities
     * @property exports.utils
     */
    task.utils = utils;

    /**
     * Provided many methods for reading and writing files, traversing the filesystem and finding files by matching globbing patterns. Many of these methods are wrappers around built-in Node.js file functionality, but with additional error handling, logging and character encoding normalization.
     * @property exports.file
     */
    task.file = require('./utils/file');

    /**
     * Tons of super-useful array, function and object utility methods.
     * @property exports._
     */
    task._ = require('underscore');

    /**
     * Async utilities for node and the browser
     * @property exports.async
     */
    task.async = require('async');

    /**
     * Simplified HTTP request method
     * @method exports.request
     * @example
     *  request('http://www.google.com', function (error, response, body) {
     *    if (!error && response.statusCode == 200) {
     *      console.log(body) // Print the google web page.
     *    }
     *  })
     */
    task.request = require('request');

    /**
     * Using prompt is relatively straight forward. There are two core methods you should be aware of: prompt.get() and prompt.addProperties(). There methods take strings representing property names in addition to objects for complex property validation (and more).
     * @method exports.prompt
     * @example
     *  // Start the prompt
     *  prompt.start();
     *  // Get two properties from the user: username and email
     *  prompt.get(['username', 'email'], function (err, result) {
     *    // Log the results.
     *    console.log('Command-line input received:');
     *    console.log('  username: ' + result.username);
     *    console.log('  email: ' + result.email);
     *  });
     */
    task.prompt = require('prompt');

    return task;
};

exports.runTask = function(taskName, taskOptions, done){
    var task = exports.loadTask(taskName);
    taskOptions = options.parse(taskName, taskOptions);
    return exports.taskRun(task, taskOptions, done);
};

exports.taskRun = function(task, options, done){
    done = done || function(){};
    var res;

    // mod task
    if(task.run){

        /**
         * an array of all file paths that match the given wildcard patterns.
         * @property exports.files
         * @return {array} files array
         */
        task.files = file.expand(options);

        try{
            // sync task?
            if(task.run.length < 2){
                res = task.run(options);
                done();
            }else{
                res = task.run(options, done);
            }
        }catch(e){
            logger.error(e)
        }
    }else if(task.gruntPluginName){
        // grunt task
        var gruntPath = plugins.npmModulePath(process.cwd(), 'grunt');
        var grunt = require(gruntPath);
        var taskName = task.taskName;
        grunt.task.loadTasks(task.gruntPluginPath);
        // TODO: disable colors if --no-color was passed
        grunt.log.initColors();
        grunt.config.data[taskName] = exports.rc.tasks[taskName];
        grunt.task.options({
            error: function(e) {
                done(e);
            },
            done: function() {
                done();
            }
        });
        grunt.task.run(taskName);
        res = grunt.task.start();

    }else{
        throw Error('Not support task type');
    }

    return res;
};


exports.runGroupTarget = function(taskName, targetName, done){

    var targetConfig = utils.namespace(exports.rc, ["tasks", taskName, targetName]);
    if(targetConfig && Array.isArray(targetConfig.group)){

        var runnerQueue = [];

        targetConfig.group.forEach(function(itemOptions, index){

            runnerQueue.push(function(done){
                console.log( loggerPrefix + "Running task " + [taskName, targetName, index].join(":").green );
                var taskOptions = options.parse(taskName, targetName, itemOptions);
                var task = exports.loadTask(taskName);
                exports.taskRun(task, taskOptions, done);
            })

        });

        // start run queue
        async.series(runnerQueue, done);

    }else{
        done && done();
    }

};

exports.runTargets = function(targets, done){

    var tasksConfig = exports.rc['tasks'];
    var targetQueue = [];
    var runnerQueue = [];

    // formatting "cat min" => [cat, min]
    if(_.isString(targets)){
        targets = targets.trim().split(/\s+/);
    }
    // accept ['cat', 'min'] or [{name: 'cat', options:{}}, {name: 'min', options:{}}]
    if(!Array.isArray(targets)){
        throw Error("Targets param is illegal, should be a Array or String");
    }

    targets.map(function(obj){
        var name = '';
        var opts = {};
        if(utils.isPlainObject(obj)){
            name = obj.name;
            opts = obj.options || {};
        }else{
            name = obj;
        }
        var res = name.split(":");
        var taskName = res[0];
        var targetName = res[1];

        // when format is `task`, expand `task` format to `task:target` format list
        if(taskName && !targetName){

            var taskConfig = tasksConfig[taskName];

            // if taskConfig is null
            if(!taskConfig){
                return logger.error("Task '"+ taskName + "' hava no config");
            }

            var expandedTargets = Object.keys(taskConfig).map(function(key) {
                if(utils.isPlainObject(taskConfig[key]) && key !== "options"){
                    return { name: [taskName, key].join(":"), options: opts };
                }
            }).filter(function(k) {
                return k;
            });

            // if task-level?
            if(_.isEmpty(expandedTargets)){
                targetQueue.push({name: name, options: opts});
            }else{
                targetQueue = targetQueue.concat(expandedTargets);
            }

        }else if(taskName && targetName){
            // if target-level?
            targetQueue.push({name: name, options: opts});
        }
    });

    // ready runner queue
    runnerQueue = targetQueue.map(function(obj){
        return function(done){
            var name = obj.name;
            // TODO: varOptions not pass to group type target
            var varOptions = obj.options;
            console.log( loggerPrefix + "Running task " + name.green ) ;

            // support task:target type task
            var res = name.split(":");
            var taskName = res[0];
            var targetName = res[1];

            // if group target?
            if(targetName && Array.isArray( utils.namespace(exports.rc, ["tasks", taskName, targetName, 'group']) )){
                exports.runGroupTarget(taskName, targetName, done);
            }else {
                var task = exports.loadTask(taskName);
                var taskOptions = options.parse(taskName, targetName, varOptions);
                exports.taskRun(task, taskOptions, done);
            }
        }
    });

    // start run queue
    logger.needsEnd = true;
    async.series(runnerQueue, function (err) {
        if(err){
            logger.error(err);
        }
        logger.end();
        done && done(err);
    });
};

// entry point
exports.run = function(opts, done){
    var rc = exports.rc = opts.rc;
    var cmd = opts.cmd;
    var pluginsConfig = rc.plugins;
    var tasksConfig = rc.tasks;
    var targetsConfig = rc.targets;
    done = done || function(){};

    // if cmd is undefined, try run the default
    if ( !cmd ){
        if(targetsConfig['default']){
            cmd = 'default';
        }else{
            var targets = Object.keys(targetsConfig);
            var tasks = Object.keys(tasksConfig);
            if(targets.length === 1){
                cmd = targets[0];
            }else if(tasks.length === 1){
                cmd = tasks[0];
            }else {
                return exports.help(cmd);
            }
        }
    }

    // process task:target format from cli mode
    var taskTarget = cmd.split(":")[1];
    if(taskTarget){
        // process as a targets
        targetsConfig[cmd] = cmd;
    }

    plugins.install(pluginsConfig, function(){
        var task;
        var target;
        var title;

        // run single task
        if (cmd && (task = exports.loadTask(cmd, rc))) {

            title = "Running task " + cmd;
            console.log( loggerPrefix + title.underline );
            process.title = title;
            var taskOptions = options.parse(cmd);
            logger.needsEnd = true;
            exports.taskRun(task, taskOptions, function (err){
                if (err) {
                    logger.error(err);
                }
                logger.end();
                done(err);
            });

        } else if (cmd && (target = targetsConfig[cmd]) ){

            title = "Running target " + cmd + ' "' + target + '"';
            console.log( loggerPrefix + title.underline );
            process.title = title;
            exports.runTargets(target, done);

        } else if (!cmd){

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

            done();
        } else {
            exports.help(cmd);
            done();
        }

    });

};

exports.help = function(cmd){
    if(cmd)
        console.log(("The '" + cmd + "' is not a valid command!").red);
    else
        console.log("No default rule match!".red);

    var taskDictionary = require('./builtin').getTaskList();
    var suggested = require('./utils/suggester').suggest(cmd || '', taskDictionary);

    if(suggested){
        console.log("Did you mean one of these? ".yellow);
        console.log("  " + suggested.grey)
    }

    console.log("Try the following command for more help:".green);
    console.log("  mod -h".grey);
    console.log("  mod help".grey);
    console.log("  mod help [command]".grey);
};
