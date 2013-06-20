var utils = require('../utils');
var _ = require('underscore');
var file = require('../utils/file');
var fs = require('fs');
var path = require('path');

exports.summary = 'Concatenate the content of files';

exports.usage = '<source> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,default : '<source>'
        ,describe : 'destination file'
    },

    "charset" : {
        alias : 'c'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    },

    "files" : {
        describe: "multiple files per target"
    }
};

// cat: {
//    files: {
//        'foobar.js' : ['foo.js','bar.js']
//        'foobar.css' : ['foo.css','bar.css']
//    }
// }

exports.run = function (options, callback) {

    var source = options.source;
    var dest = options.dest;
    var charset = options.charset;
    var files = options.files;


    try {
        if(!source && files){
            Object.keys(files).forEach(function(key){
                dest = key;
                source = files[key];
                exports.task(source, dest, charset);
            })
        }else{
            exports.task(source, dest, charset);
        }

    } catch (err) {
        callback(err);
    }

};


exports.task = function(source, dest, charset, callback){
    // process format: foo.js,bar.js
    source =  utils.arrayify(source);
    var fileContent ='';
    var files = file.glob(source);

    files.forEach(function (fp) {
        fileContent += file.read(fp, charset);
    });

    exports.log(source + " > " + dest );
    file.write(dest, fileContent, charset);
    callback && callback(null, fileContent);
}
