var utils = require('../utils'),
    rimraf = require('rimraf');

exports.summary = 'Remove files';

exports.usage = '<target>';

exports.run = function (opt, callback) {

    var target = opt.target;

    var ret = rimraf.sync(target);
    //console.log(ret);
    exports.log(target);
    callback(null, ret);

};
