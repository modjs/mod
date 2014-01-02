var util = require('util');
var notifier = require('./notifier');
var colors = require('colors');
var log = console.log;

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

exports.prefix = '';

// Colors of the logging level 
exports.colors = {
    label: 'cyan',
    debug : 'blue',
    info : null,
    warn : 'yellow',
    error : 'red'
};

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

var print = function(label, msg, color){
    var logArgs = [];
    [exports.prefix, label, msg].forEach(function(arg, index){
        if(arg) {
            if(index === 1){
                arg = arg[exports.colors.label];
            }
            if(index === 2 && color){
                arg = arg[color]
            }
            logArgs.push(arg);
        }
    });
    log.apply(console, logArgs);
};

/**
 * Logs debug messages, using util.inspect to show the properties of objects
 * (logged for 'debug' level only)
 */
exports.debug = level(['debug'], function (label, msg) {
    if (msg === undefined) {
        msg = label;
        label = null;
    }
    if (typeof msg !== 'string') {
        msg = util.inspect(msg);
    }

    print(label, msg, exports.colors.debug);
});

/**
 * Logs info messages (logged for 'info' and 'debug' levels)
 */
exports.log = exports.info = level(['info', 'debug'], function (label, msg) {

    if (msg === undefined) {
        msg = label;
        label = null;
    }

    if (typeof msg !== 'string') {
        msg = util.inspect(msg);
    }

    // TODO: hard code for format output
    msg = msg.replace(/\\/g, '/').replace(/>+/g, "->");
    print(label, msg, exports.colors.info);
});

/**
 * Logs warnings messages (logged for 'warn', 'info' and 'debug' levels)
 */
exports.warn = function (label, msg) {
    if (msg === undefined) {
        msg = label;
        label = null;
    }

    if (typeof msg !== 'string') {
        msg = util.inspect(msg);
    }

    print(label, msg, exports.colors.warn);

};

/**
 * Logs error messages (always logged)
 */
exports.error = function (label, err) {
    if (msg === undefined) {
        err = label;
        label = null;
    }
    var msg = err.message || err.error || err;
    if (err.stack) {
        msg = err.stack;
    }

    print(label, msg, exports.colors.error);

    if(!exports.force){
        process.exit(1);
    }
};

// End method should only be called once
exports.end = function (msg) {
    if (!exports.isEnd && !exports.exitWithError) {
        log( '\n' + exports.prefix + (exports.symbols.ok + ' Done' + (msg? (', ' + msg + '.'): '')).bold.green );
        notifier.notify('Done, without errors.');
    }
    exports.isEnd = true;
};

process.on('uncaughtException', function (err) {
    exports.error(err);
});

process.on('exit', function onExit(code) {
    if (code !== 0 || (exports.needsEnd && !exports.isEnd) || exports.exitWithError) {
        if(!exports.isEnd && !exports.exitWithError) var msg = "task not completing";
        log( '\n' + exports.prefix + (exports.symbols.err + ' Failed' + (msg? (', ' + msg + '.'): '')).bold.red );
        notifier.notify('Failed' + (msg ? ', '.bold + msg: ''));
        process.removeListener('exit', onExit);
        process.exit(1);
    }
});
