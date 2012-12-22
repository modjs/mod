var utils = require('../utils'),
    file = require('../utils/file'),
    _ = require('underscore'),
    fs = require('fs'),
    path = require('path');


exports.summary = 'Concatenate the content of files';

exports.usage = '<source> [options]';

exports.options = {
    "d" : {
        alias : 'dest'
        ,default : '<source>'
        ,describe : 'destination file'
    },

    "c" : {
        alias : 'charset'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};

// TODO
//cat: {
//    'dist/main.js' : [
//        'js/vendor/jquery-1.8.1.js',
//        'js/vendor/jquery-ajax-localstorage-cache.js',
//        'js/vendor/lodash-0.6.1.js',
//        'js/vendor/jquery.timeago.js',
//        'js/vendor/list.min.js',
//        'js/main.js'
//    ]
//},

exports.run = function (options, callback) {

    var source = options.source,
        dest = options.dest,
        charset = options.charset;


    var fileContent ='';

    source = utils.arrayify(source);
    var files = file.glob(source);

    try {
        files.forEach(function (fp) {

            fileContent += fs.readFileSync(fp, charset);
        });

        exports.log(source + " > " + dest );
        file.write(dest, fileContent, charset);
        callback(null, fileContent);

    } catch (err) {
        callback(err);
    }



};
