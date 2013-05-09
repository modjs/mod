var utils = require('../utils'),
    format = require('../utils/format'),
    file = require('../utils/file'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore');

var htmlMinifier = require('html-minifier');


exports.summary = 'Minify html files with htmlminifier';

exports.usage = '<source> [options]';

exports.options = {
    "d" : {
        alias : 'dest'
        ,describe : 'destination directory or file'
    },

    "s" : {
        alias : 'suffix'
        ,default : ''
        ,describe : 'destination file suffix append'
    },

    'o': {
        alias: 'output'
        ,default : 'file'
        ,describe : 'specify output type: file pipe'
    },

    "c" : {
        alias : 'charset'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};

exports.run = function (options, callback) {

    var source = options.source,
        dest = options.dest,
        suffix = options.suffix,
        output = options.output,
        charset = options.charset;

    // htmlMinifier options
    var htmlMinifierOptions = options['options'] || {};

    try {

        if(file.isDir(source)){
            source = path.join(source, "*.html");
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

            result = task(inputFile, outputFile, htmlMinifierOptions ,charset);  // TODO

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

    var defaultOptions = {
        removeComments:                 true,
        removeCommentsFromCDATA:        true,
        removeCDATASectionsFromCDATA:   true,
        collapseWhitespace:             true,
        collapseBooleanAttributes:      true,
        removeAttributeQuotes:          true,
        removeRedundantAttributes:      true,
        useShortDoctype:                true,
        removeEmptyAttributes:          true,
        removeEmptyElements:            false,
        removeOptionalTags:             true,
        removeScriptTypeAttributes:     true,
        removeStyleLinkTypeAttributes:  true
    };

    options = _.defaults(options, defaultOptions);
    // skip empty files
    if (input.length) {

        if(outputFile){
            exports.log("Minifying " + inputFile + " > " + outputFile);
        }

        var minimized = htmlMinifier.minify(input, options);

        // output to file
        if(outputFile){

            fs.writeFileSync(outputFile, minimized, charset);

            var diff = input.length - minimized.length,
                savings = input.length ? ((100 * diff) / minimized.length).toFixed(2) : 0;
            var info = 'Original size: ' + format.commify(input.length)  +
                '. Minified size: ' + format.commify(minimized.length) +
                '. Savings: ' + format.commify(diff) + ' (' + savings + '%)';

            exports.log(info);
        }

        return minimized;

    } else {
        exports.log( "Skipping empty file " + inputFile);
    }


};

