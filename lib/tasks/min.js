var utils = require('../utils');
var file = require('../utils/file');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

exports.summary = 'Minify JavaScript/CSS/HTML/Image source';

exports.usage = '<src> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,describe : 'destination directory or file'
    },

    "suffix" : {
        alias : 's'
        ,describe : 'destination file suffix append, default suffix is ".min" when "dest" parameter is not set'
    },

    "charset" : {
        alias : 'c'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};

exports.run = function (options, done) {

    var source = options.src || options.source;
    var ext = file.extname(source);

    var taskMap = {
        '.js' : 'uglifyjs',
        '.css' : 'optimizecss',
        '.html' : 'htmlminifier'
    };
    var realTask = taskMap[ext];

    if(realTask){
        return exports.runTask(realTask, options, done);
    }else{
        done("Unsupported file type:", source);
    }

};
