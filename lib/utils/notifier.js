var _ = require('underscore');
var path = require('path');
var os = require('os');
var spawn = require('child_process').spawn;

// OSX notification system doesn't have an API Node can access so we are using
// Terminal Notifier created by Eloy Durán https://github.com/alloy/terminal-notifier
var command = path.resolve(__dirname + '../../../asset/Notifier.app/Contents/MacOS/Notifier');

function isNotificationCenterSupported() {
    // Notification center available with Mountain Lion+
    return os.type() === 'Darwin' && parseFloat(os.release()) >= 12;
}

exports.notify = function(options) {
    if (isNotificationCenterSupported()) {
        var args = [];
        if(_.isString(options)){
            options = {
                message: options
            }
        }
        Object.keys(options).forEach(function(prop){
            args = args.concat([
                '-' + prop,
                options[prop]
            ])
        });

        spawn(command, args);
    }
}
