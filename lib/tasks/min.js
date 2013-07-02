var utils = require('../utils');
var file = require('../utils/file');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');


exports.summary = 'Minify JavaScript/CSS/HTML/Image source';

exports.usage = '<source> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,describe : 'destination directory or file'
    },

    "suffix" : {
        alias : 's'
        ,describe : 'destination file suffix append'
    },

    "charset" : {
        alias : 'c'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};

// TODO
exports.run = function (options, done) {

    var source = options.source;

    var ext = path.extname(source);

    var taskMap = {
        '.js' : 'uglifyjs',
        '.css' : 'cleancss',
        '.html' : 'htmlminifier',
        '.png' : 'optimage',
        '.jpg' : 'optimage',
        '.jpeg' : 'optimage'
    };
    var realTask = taskMap[ext];

    try {

        if(realTask){

            return exports.runTask(realTask, options, done);

        }else{
            exports.log("Unsupported file type:", source);
        }

    }catch (err){
        done && done(err);
    }

};
