var tasks = require('../tasks'),
    core = require('../core'),
    logger = require('../utils/logger'),
    format = require('../utils/format');


exports.summary = 'Get help on mod';


exports.usage = '[command]';

exports.run = function (options, callback) {
    var args = process.argv.slice(2);
    var cmd = args[1];
    usage(cmd);
    callback();
};


function usage(cmd) {

    if(cmd){
        return core.loadTask(cmd).showHelp();
    }

    console.log("Usage:");
    var usage = [' ','mod'.cyan, '<target>'.green , 'or'.grey , 'mod'.cyan, '<command>'.green,'[options]'.magenta];
    console.log( usage.join(" ") + "\n");

    console.log('Commands:');
    var len = format.longest(Object.keys(tasks));
    for (var k in tasks) {
        if (!tasks[k].hidden) {
            console.log(
                '  ' +  format.padRight(k, len).green  + '    ' + tasks[k].summary.grey
            );
        }
    }
    logger.clean_exit = true;
}


