var utils = require('../utils');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');


exports.summary = 'Validate JavaScript/CSS source';

exports.usage = '<src>';

exports.options = {

    "charset" : {
        alias : 'c'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};


exports.run = function (options, done) {

    var source = options.src;
    var ext = path.extname(source);

    var taskMap = {
        '.js' : 'jshint',
        '.css' : 'csslint'
    };

    var realTask = taskMap[ext];

    if(realTask){
        exports.runTask(realTask, options, done);
    }else{
        done("Unsupported file type:", source);
    }

};
