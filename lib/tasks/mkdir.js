var utils = require('../utils');
var mkdirp = require('mkdirp');

exports.summary = 'Make a new directory';

exports.usage = '<path> [options]';

exports.options = {
    "path": {
        describe: "The name of the directory one wants to create"
    },
    "mode" : {
        alias : 'm'
        ,default : '0777'
        ,describe : 'Specify the octal permissions of directory'
    }
};

exports.run = function (options) {

    var path = options.path;
    var mode = options.mode;
    var paths = utils.arrayify(path);

    paths.forEach(function(pathname){
        mkdirp.sync(pathname, mode);
        exports.log(pathname);
    });
};
