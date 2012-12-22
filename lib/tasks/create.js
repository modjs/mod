var utils = require('../utils'),
    file = require('../utils/file'),
    _ = require('underscore'),
    fs = require('fs'),
    mkdirp = require('mkdirp');

// http://html5boilerplate.com/

exports.summary = 'Generate a project skeleton include project directory';

exports.usage = '<project> [options]';

exports.options = {
    "t" : {
        alias : 'template'
        ,default: 'default'
        ,describe: 'destination template'
    },
    "d" : {
        alias : 'dest'
        ,default: '.'
        ,describe: 'template directory'
    }
};


exports.run = function (opt, callback) {

    //console.log(args.argv);
    var project = opt.project;
    opt.dest = project;

    mkdirp.sync(project);
    exports.runTask('init', opt, callback);

};
