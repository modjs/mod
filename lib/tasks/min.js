var utils = require('../utils'),
    file = require('../utils/file'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore');


exports.summary = 'Minify js css html image files';

exports.usage = '<source> [options]';

exports.options = {
    "d" : {
        alias : 'dest'
        ,describe : 'destination directory or file'
    },

    "s" : {
        alias : 'suffix'
        ,describe : 'destination file suffix append'
    },

    "c" : {
        alias : 'charset'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};

// TODO
exports.run = function (options, callback) {

    var source = options.source;

    var ext = path.extname(source);

    var taskMap = {
        '.js' : 'uglifyjs',
        '.css' : 'cleancss',
        '.html' : 'htmlminifier',
        '.png' : 'optimage',
        '.jpg' : 'optimage',
        '.jpeg' : 'optimage',
        '.gif' : 'optimage'
    };
    var realTask = taskMap[ext];

    try {

        if(realTask){

            exports.runTask(realTask, options, callback);

        }else{
            callback("Match no task");
        }


    }catch (err){
        return callback(err);
    }

};
