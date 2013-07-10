var utils = require('../utils');
var file = require('../utils/file');
var fs = require('fs');
var path = require('path');
var template = require('../utils/template');
var _ = require('underscore');


exports.summary = 'Compiling based on template';

exports.usage = '<src> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,default : '<src>'
        ,describe : 'destination directory or file'
    },
    "settings": {
       describe: "template settings"
    },
    "charset" : {
        alias : 'c'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};


exports.run = function (options) {

    var dest = options.dest;
    var settings = options.settings;
    var charset = options.charset;

    var result;
    exports.files.forEach(function(inputFile){

        var outputFile = inputFile;

        if(file.isDirFormat(dest)){
            outputFile = path.join(dest , path.basename(outputFile) );
        }else{
            outputFile = dest;
        }
        result = exports.template(inputFile, outputFile, settings, charset);
    });
    return result;
};



// helpers, could be extend
exports.helpers = {

    // rev helper
    rev: function rev(src) {
        // rev cache
        rev.ved = rev.ved || {};
        var absSrc = path.join(process.cwd(), src);
        if (!rev.ved[absSrc]) {
            rev.ved[absSrc] = exports.runTask('hash', {src: src});
        }
        return rev.ved[absSrc];
    },
    // content helper
    content: function content(src, options) {
        options = options || {};
        src = file.normalize(src);
        if (options.noMinify) {
            // only read file contents
            return file.read(src);
        } else if ( ['.js', '.css', '.html'].indexOf( path.extname(src) ) !== -1 ) {
            // combine css @imports default
            if(!options.noCompile && ['.html', '.css'].indexOf( path.extname(src) ) !== -1){
                var contents = exports.runTask('compile', {src: src, output: 'pipe'});
                src = file.writeTemp(src, contents);
            }
            return exports.runTask('min', {
                src: src, 
                output: 'pipe', 
                urlFromBase: options.urlFromBase, 
                urlToBase: options.urlToBase
            });
        } else {
            // datauri images
            return exports.runTask('datauri', {src: src, output: 'pipe'});
        }
    }
};


exports.template = function(inputFile, outputFile, settings, charset){

    charset = charset || "utf-8";
    outputFile = outputFile || inputFile;

    var input = file.read(inputFile, charset);
    var output = template(input, exports.helpers, settings);

    file.write(outputFile, output, charset);
};




