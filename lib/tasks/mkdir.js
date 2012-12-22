var utils = require('../utils'),
    mkdirp = require('mkdirp');

exports.summary = 'Create new folder';

exports.usage = '<target> [options]';

exports.options = {
    "m" : {
        alias : 'mode'
        ,default : '0777'
        ,describe : 'set permission mode'
    }
};


exports.run = function (options, callback) {

    var target = options.target,
        mode = options.mode;

    var targets = utils.arrayify(target);

    targets.forEach(function(target){
        mkdirp.sync(target, mode);
        exports.log(target);
    });


    callback(null);
};
