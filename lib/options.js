var _ = require('underscore');
var logger = require('./utils/logger');
var utils = require('./utils');

exports.parse = function(taskName, targetName, varOptions){

    var runner = require('./runner');
    var rc = runner.rc;
    var task = runner.loadTask(taskName);
    var targetOptions = rc['tasks'][taskName]  || {};
    // format: options.parse(taskName);
    if(_.isString(targetName)){
        targetOptions = targetOptions[targetName] || {};
    }
    // format: options.parse(taskName, taskOptions);
    if(_.isObject(targetName)){
        varOptions = targetName;
        targetName = null;
    }

    var taskOptions = exports.extend(
        exports.getDefaultOptions(taskName),
        exports.getTaskLevelOptions(taskName),
        exports.getTargetLevelOptions(taskName, targetName),
        targetOptions,
        varOptions || {}
    );

    // do not process non-current task's cli args
    if(task.taskName == taskOptions._[0]){
        // exports.usage
        (task.usage.match(/<[^>]+>/g)||[]).forEach(function(val, key){
            var optionKey = val.replace(/[<>]/g,""), // remove "<" ">" char
                optionValue = taskOptions._[key+1] || taskOptions[optionKey];

            // wrap "<>" symbol is the must required parameter
            if(!optionValue){
                logger.error('Missing necessary parameters "'+ optionKey + '"\n');
                task.help();
            }

            // "<src>" : "./path/to"
            taskOptions[val] = optionValue;
            // "src" : "./path/to"
            taskOptions[optionKey] = optionValue;
        });
    }

    // "dest": "<src>" => dest: options.src
    _.each(taskOptions, function(val, key){
        if(typeof val === 'string' && (val = val.match(/^<(.*)>$/)) ){
            // val = ["<_>", "_"]
            taskOptions[key] = taskOptions[ val[1] ];
        }
    });

    delete taskOptions['$0'];
    delete taskOptions['_'];

    return taskOptions;
};

/**
 * Return an options object with the specified defaults overriden by task-specific overrides,
 * via the "options" property.
 * @return {object}
 */
exports.extend = function(defaultOptions, taskLevelOptions, targetLevelOptions, targetOptions) {
    var args = [{}].concat(_.toArray(arguments));
    return _.extend.apply(null, args);
};

exports.getDefaultOptions = function(taskName){
    var task = require('./runner').loadTask(taskName);
    // delete module cache avoid goes pollute the optimist args when run multi-task
    delete require.cache[require.resolve('optimist')];
    //  get options info
    var taskArgs = require('optimist').options(task.options);

    // process args
    return taskArgs.argv;
};

exports.getTaskLevelOptions = function(taskName){
    if(taskName){
        var rc = require('./runner').rc;
        return utils.namespace(rc, ['tasks', taskName, 'options'])|| {};
    }
    return {};
};

exports.getTargetLevelOptions = function(taskName, targetName){
    if(taskName && targetName){
        var rc = require('./runner').rc;
        return utils.namespace(rc, ['tasks', taskName, targetName, 'options']) || {};
    }
    return {};
};
