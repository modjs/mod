var util = require('util');
var colors = require('colors');

/**
 * The level to log at, change this to alter the global logging level.
 * Possible options are: error, warn, info, debug. Default level is info.
 */
exports.level = 'info';

exports.symbols = {
  ok: '✓',
  err: '✖'
};

// With node.js on Windows: use symbols available in terminal default fonts
if ('win32' == process.platform) {
  exports.symbols.ok = '\u221A';
  exports.symbols.err = '\u00D7';
}

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

    // hard code for format output
    val = val.replace(/\\/g, '/').replace(/>+/g, ">>".yellow);

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
        console.log(msg);
    }else{
        console.log(msg.red);
    }

    exports.hasError = true;
};

exports.end = function (msg) {
    console.log( ('\n' + exports.symbols.ok + ' OK' + (msg ? ': '.bold + msg: '')).bold.green );
};

process.on('uncaughtException', function (err) {
    exports.error(err);
});

process.on('exit', function onExit() {
    if (exports.hasError) {
        console.log( ('\n' + exports.symbols.err + ' Failed').bold.red );
        process.removeListener('exit', onExit);
        process.exit(1);
    }
});