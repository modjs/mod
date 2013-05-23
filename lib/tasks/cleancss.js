var utils = require('../utils'),
    format = require('../utils/format'),
    file = require('../utils/file'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore');

var cleanCSS = require('clean-css');


exports.summary = 'Minify css files with cleancss';

exports.usage = '<source> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,default : '<source>'
        ,describe : 'destination directory or file'
    },

    "suffix" : {
        alias : 's'
        ,default : '.min'
        ,describe : 'destination file suffix append'
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


exports.run = function (options, callback) {

    var source = options.source,
        dest = options.dest,
        charset = options.charset,
        output = options.output,
        suffix = options.suffix;

    var cleancssOptions = options['options'] || {};

    try {

        if(file.isDir(source)){
            source = path.join(source, "*.css");
        }

        var result;
        file.globSync(source).forEach(function(inputFile){

            if(output === 'file'){

                var outputFile = inputFile;

                if(file.isDirFormat(dest)){
                    outputFile = path.join(dest , path.basename(outputFile) );

                    // suffix
                    if(suffix)
                        outputFile = file.suffix(inputFile, suffix);

                }else{
                    outputFile = dest;
                }

            }

            result = task(inputFile, outputFile, cleancssOptions ,charset);  // TODO
        });

        callback && callback();

        return result;

    }catch (err){
        callback && callback(err);
    }

};


var task = exports.task = function(inputFile, outputFile, options, charset){

    charset = charset || "utf-8";
    var input = fs.readFileSync(inputFile, charset);

    // skip empty files
    if (input.length) {

        if(outputFile){
            exports.log("Minifying " + inputFile + " > " + outputFile);
        }

        var minimized = cleanCSS.process(input);

        // output to file
        if(outputFile){

            file.write(outputFile, minimized, charset);

            // TODO DRY
            var diff = input.length - minimized.length,
                savings = input.length ? ((100 * diff) / minimized.length).toFixed(2) : 0;
            var info = 'Original size: ' + format.commify(input.length)  +
                '. Minified size: ' + format.commify(minimized.length) +
                '. Savings: ' + format.commify(diff) + ' (' + savings + '%)';

            exports.log(info);
        }

        return minimized;

    } else {
        exports.log("Skipping empty file" ,  inputFile);
    }


};
