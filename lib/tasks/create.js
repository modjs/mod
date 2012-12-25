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
        ,describe: 'destination template'
    },
    "d" : {
        alias : 'dest'
        ,default: '.'
        ,describe: 'target project directory'
    },
    "mod" : {
        type: 'Boolean'
        ,describe: 'create a mod files in target directory'
    },
    "json" : {
        type: 'Boolean'
        ,describe: 'create a package.json file in target directory'
    },
    "git" : {
        type: 'Boolean'
        ,describe: 'create git files in target directory'
    },
    "readme" : {
        type: 'Boolean'
        ,describe: 'create a README.md file in target directory'
    },
    "mocha" : {
        type: 'Boolean'
        ,describe: 'create test files in target directory'
    }
};


exports.run = function (options, callback) {

    //console.log(args.argv);
    var project = options.project;
    options.dest = project;

    mkdirp.sync(project);
    exports.runTask('init', options, callback);

};
