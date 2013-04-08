var _ = require('underscore');
var exec = require('child_process').exec;

// http://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
exports.summary = 'Executes a system command';

exports.usage = '<command> [options]';

exports.options = {
    c : {
        alias: 'command',
        describe: 'the command to execute with all command line arguments.'
    },
    d : {
        alias : 'cwd'
        ,describe : 'the directory in which the command should be executed.'
    },
    t : {
        alias : 'timeout',
        type: 'number',
        describe: 'timeout number'
    },
    p: {
        alias : 'platform'
        ,describe : "the platform 'darwin', 'freebsd', 'linux', 'sunos' or 'win32' in which the command should be executed "
    }
};


exports.run = function (options, callback) {

    var command = options.command,
        platform = options.platform;

    if(platform == null || platform === process.platform){

        var cp = exec(command, options, function (err, stdout, stderr) {
            if (err) {
                return callback(err);
            }
            callback();
        });

        cp.stdout.pipe(process.stdout);
        cp.stderr.pipe(process.stderr);
    }


};
