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
    }
};


exports.run = function (options, done) {

    // TODO: process format: foo.js,bar.js => [foo.js, bar.js], that should be support by optimist
    // source =  utils.arrayify(source);

    var source = options.source;
    var dest = options.dest;
    var charset = options.charset;

    try {
        exports.cat(exports.files, dest, charset);
        exports.log(source + " > " + dest );
        done();
    } catch (err) {
        done(err);
    }

};


exports.cat = function(files, dest, charset){

    var filesContent = '';

    files.forEach(function (fp) {
        fileContent += file.read(fp, charset);
    });

    file.write(dest, filesContent, charset);
    return fileContent
}
