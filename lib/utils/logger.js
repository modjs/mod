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
var forLevels = function (levels, fn) {
    return function (label, val) {
        for (var i = 0; i < levels.length; i++) {
            if (levels[i] === exports.level) {
                return fn(label, val);
            }
        }
    };
};

/**
 * Logs debug messages, using util.inspect to show the properties of objects
 * (logged for 'debug' level only)
 */
exports.debug = forLevels(['debug'], function (label, val) {
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

exports.log = exports.info = forLevels(['info', 'debug'], function (label, val) {

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

exports.warn = forLevels(['warn', 'info', 'debug'], function (msg) {

    console.log( ('warn: '.bold + msg ).yellow );
});

/**
 * Logs error messages (always logged)
 */

exports.error = function (err) {
    var msg = err.message || err.error || err;
    if (err.stack) {
        msg = err.stack.replace(/^Error: /, '');
    }
    console.log(('Error: '.bold + msg).red);
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

var _onExit = function () {
    if (!exports.clean_exit) {
        //console.log('\n' +'Failed'.bold.red);
        process.removeListener('exit', _onExit);
        process.exit(1);
    }
};
process.on('exit', _onExit);

/**
 * Log uncaught exceptions in the same style as normal errors.
 */
process.on('uncaughtException', function (err) {
    exports.error(err.stack || err);
});
