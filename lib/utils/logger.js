var util = require('util'),
    colors = require('colors');

/**
 * The level to log at, change this to alter the global logging level.
 * Possible options are: error, warn, info, debug. Default level is info.
 */
exports.level = 'info';


/**
 * Executes a function only if the current log level is in the levels list
 *
 * @param {Array} levels
 * @param {Function} fn
 */
var level = function (levels, fn) {
    return function (label, msg) {
        for (var i = 0; i < levels.length; i++) {
            if (levels[i] === exports.level) {
                return fn(label, msg);
            }
        }
    };
};

/**
 * Logs debug messages, using util.inspect to show the properties of objects
 * (logged for 'debug' level only)
 */
exports.debug = level(['debug'], function (label, val) {
    if (val === undefined) {
        val = label;
        label = null;
    }
    if (typeof val !== 'string') {
        // for debug error
        if( val.message || val.error){ return exports.error(val) }
        val = util.inspect(val);
    }
    if (label && val) {
        console.log(label.magenta + ' ' + val);
    }
    else {
        console.log(label);
    }
});

/**
 * Logs info messages (logged for 'info' and 'debug' levels)
 */

exports.log = exports.info = level(['info', 'debug'], function (label, val) {

    if (val === undefined) {
        val = label;
        label = null;
    }
    if (typeof val !== 'string') {

        val = util.inspect(val);
    }
    if (label) {
        console.log(label.cyan + ' ' + val);
    }
    else {
        console.log(val);
    }
});

/**
 * Logs warnings messages (logged for 'warn', 'info' and 'debug' levels)
 */
exports.warn = function (msg) {
    // Fixme: why 'Warn:'.bold.yellow will be print a object when colors mode is none
    if(colors.mode == 'none'){
        console.log( 'Warn:', msg );
    }else{
        console.log( 'Warn:'.bold.yellow , msg.yellow );
    }

};

/**
 * Logs error messages (always logged)
 */
exports.error = function (err) {
    var msg = err.message || err.error || err;
    if (err.stack) {
        msg = err.stack;
    }
    if(colors.mode == 'none'){
        err.stack ? 
        console.log(msg) :
        console.log('Error:', msg );
    }else{
        err.stack ? 
        console.log(msg.red) :
        console.log('Error:'.bold.red, msg.red );
    }

};


/**
 * Display a failure message if exit is unexpected.
 */
exports.clean_exit = false;
exports.end = function (msg) {
    exports.clean_exit = true;
    exports.success(msg);
};

exports.success = function (msg) {
    //console.log(('\n' +'OK'.bold + (msg ? ': '.bold + msg: '')).green);
};


process.on('exit', function onExit() {
    if (!exports.clean_exit) {
        //console.log('\n' +'Failed'.bold.red);
        process.removeListener('exit', onExit);
        process.exit(1);
    }
});

/**
 * Log uncaught exceptions in the same style as normal errors.
 */
process.on('uncaughtException', function (err) {
    exports.error(err.stack || err);
});
