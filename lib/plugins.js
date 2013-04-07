var _ = require('underscore');
var exec = require('child_process').exec;


exports.load = function(plugins, callback){

    var options = {};
    var uninstalledPlugins = [];

    _.each(plugins, function(taskName, plugin){
        uninstalledPlugins.push(plugin);
    });

    var installPluginsQueue = uninstalledPlugins.map(function(plugin){

        var cp = exec("npm install -g" + plugin, options, function (err, stdout, stderr) {
            if (err) {
                console.warn(err);
            }
            callback();
        });

        if (options.stdout) {
            cp.stdout.pipe(process.stdout);
        }

        if (options.stderr) {
            cp.stderr.pipe(process.stderr);
        }

    });

    callback();
};