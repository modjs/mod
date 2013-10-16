var utils = require('../utils');
var _ = require('underscore');
var file = require('../utils/file');
var fs = require('fs');
var path = require('path');

exports.summary = 'Concatenate the content of files';

exports.usage = '<src> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,default : '<src>'
        ,describe : 'destination file'
    },

    "charset" : {
        alias : 'c'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    },

    "endings": {
        default: "\n",
        describe: "Make sure each file endings with newline"
    }
};

exports.run = function (options) {
    // TODO: process format: foo.js,bar.js => [foo.js, bar.js], that should be support by optimist
    // source =  utils.arrayify(source);

    var source = options.src;
    var dest = options.dest;
    var charset = options.charset;
    var endings = options.endings;

    exports.cat(exports.files, dest, endings, charset);
    exports.log(exports.files + " > " + dest );

};

exports.cat = function(files, dest, endings, charset){

    var filesContent = '';
    files.forEach(function (fp) {
        var fileContent = file.read(fp, charset);
        if (!RegExp(endings+"$").test(fileContent)) {
            fileContent += endings;
        }
        filesContent += fileContent;
    });

    file.write(dest, filesContent, charset);
    return filesContent
}
