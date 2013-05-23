var _ = require('underscore');
var exec = require('child_process').exec;


exports.summary = 'deploy';

exports.usage = '<source> [options]';

exports.options = {
    dest : {
        alias : 'd'
        ,describe : 'the directory in which the command should be executed.'
    }
};


exports.run = function (options, callback) {



};
