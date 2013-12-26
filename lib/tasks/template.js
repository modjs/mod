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
    'output': {
        alias: 'o'
        ,default : 'file'
        ,describe : 'specify output type: file pipe'
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
    var output = options.output;

    var result;
    exports.files.forEach(function(inputFile){

        if(output === 'file'){
            var outputFile = dest;
            if(file.isDirname(dest)){
                outputFile = path.join(dest , path.basename(inputFile) );
            }
        }
        result = exports.templating(inputFile, outputFile, settings, charset);
    });
    return result;
};

// helpers, could be extend
exports.helpers = {

    // rev helper
    rev: function rev(src) {
        return exports.runTask('rev', {src: src});
    },
    // content helper
    content: function content(src, options) {

        options = options || {};
        src = file.normalize(src);
        options.src = src;
        options.output = 'pipe';

        if (options.noMinify) {
            // only read file contents
            return file.read(src);
        } else if ( ['.js', '.css', '.html'].indexOf( path.extname(src) ) !== -1 ) {
            // combine css @imports default
            if(!options.noCompile && ['.html', '.css'].indexOf( path.extname(src) ) !== -1){

                var contents = exports.runTask('compile', options);
                src = file.writeTemp(src, contents);
            }
            return exports.runTask('min', options);
        } else {
            // datauri images
            return exports.runTask('datauri', options);
        }
    }
};

exports.templating = function(inputFile, outputFile, settings, charset){

    charset = charset || "utf-8";
    var input = file.read(inputFile, charset);
    var output = template(input, exports.helpers, settings);

    if(outputFile){
        file.write(outputFile, output, charset);
        exports.log(inputFile, '>', outputFile);
    }

    return output;
};
