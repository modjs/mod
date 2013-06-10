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
    "dest" : {
        alias : 'd'
        ,describe : 'destination directory or file'
    },

    "suffix" : {
        alias : 's'
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
    var input = file.read(inputFile, charset);

    var defaultOptions = {
        removeComments:                 true,      // Conditional comments are left intact, but their inner (insignificant) whitespace is removed
        removeCommentsFromCDATA:        true,     // Also remove comments from scripts and styles
        removeAttributeQuotes:          true,    // (e.g. <p class="foo"> → <p class=foo>)
        removeScriptTypeAttributes:     true,   // Remove type="text/javascript" from script's
        removeStyleLinkTypeAttributes:  true,    // Remove type="text/css" from style's and link's
        removeOptionalTags:              true,    // Remove optional tags. Currently, only: </html>, </head>, </body>, </option> </thead>, </tbody>, </tfoot>, and </tr>

        collapseWhitespace:              false,    // unsafe
        removeCDATASectionsFromCDATA:   false,
        collapseBooleanAttributes:      false,   // (e.g. <... disabled="disabled"> → <... disabled>)
        removeRedundantAttributes:      false,
        useShortDoctype:                 false,
        removeEmptyAttributes:          false,   // Valid attributes are: class, id, style, title, lang, dir, event attributes
        removeEmptyElements:            false    // All except textarea

    };

    options = _.defaults(options, defaultOptions);
    // skip empty files
    if (input.length) {

        if(outputFile){
            exports.log("Minifying " + inputFile + " > " + outputFile);
        }

        // xml header declaration like <?xml version="1.0" encoding="UTF-8"?>
        // strip it temporary, because htmlMinifier can not proecss it
        var xmlHeader ='';
        input = input.replace(/\s*<\?xml.*?>/, function(xml){
            xmlHeader = xml;
            return '';
        });

        var minimized = htmlMinifier.minify(input, options);

        // if there is a xml header, put it on the top of html again
        minimized = xmlHeader + minimized;

        // safe removing whitespace and line endings using regexp
        minimized = minimized.replace(/>\s+</g,"> <");

        // output to file
        if(outputFile){

            file.write(outputFile, minimized, charset);

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

