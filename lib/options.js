var _ = require('underscore');
var logger = require('./utils/logger');
var utils = require('./utils');

exports.parse = function(task, taskConfig){
    debugger;
    taskConfig = taskConfig || {};

    // delete module cache avoid goes pollute the optimist args when run multi-task
    delete require.cache[require.resolve('optimist')];
    //  get options info
    var taskArgs = require('optimist')
        .usage( utils.usage(task.taskName) +" "+ task.usage)
        .options(task.options);

    // process args
    var taskOptions = taskArgs.argv;

    taskOptions =  utils.merge(taskOptions, taskConfig);

    // do not process non-current task's cli args
    if(task.taskName == taskOptions._[0]){
        // exports.usage
        (task.usage.match(/<[^>]+>/g)||[]).forEach(function(val, key){
            var optionKey = val.replace(/[<>]/g,""), // remove "<" ">" char
                optionValue = taskOptions._[key+1] || taskOptions[optionKey];

            // wrap "<>" symbol is the must required parameter
            if(!optionValue){
                logger.error("missing "+ optionKey);
                console.log();
                task.help();
            }

            // "<source>" : "./path/to"
            taskOptions[val] = optionValue;
            // "source" : "./path/to"
            taskOptions[optionKey] = optionValue;
        });
    }

    // "dest": "<source>" => dest: options.source
    _.each(taskOptions, function(val, key){
        if(typeof val === 'string' && (val = val.match(/^<(.*)>$/)) ){
            // val = ["<_>", "_"]
            taskOptions[key] = taskOptions[ val[1] ];
        }
    });

    // console.log(taskOptions)

    return taskOptions;

};

/**
 * Return an options object with the specified defaults overriden by task-specific overrides, 
 * via the "options" property.
 * @return {object}
 */
exports.extend = function(taskLevelOptions, groupLevelOptions, targetLevelOptions) {
  var args = [{}].concat(_.toArray(arguments));
  return _.extend.apply(null, args);
};


