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

    "c" : {
        alias : 'charset'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};

exports.run = function (options, callback) {

    var source = options.source,
        dest = options.dest,
        charset = options.charset;

    var options = options['options'];

    try {

        var files = file.glob(source);

        files.forEach(function(src){

            var target = dest;

            // change to file copy to file
            if(file.isFile(src) && file.isDir(dest)){
                var filename = path.basename(src);
                target = path.join(dest, filename);
            }

            task(src, target, options, charset);
        });

        callback();
    }catch (err){
        callback(err);
    }

};


var task = exports.task = function(inputFile, outputFile, options, charset){

    charset = charset || "utf-8";
    var input = fs.readFileSync(inputFile, charset);

    var configOptions= options  || {};

    options= {
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
    // lint:  new HTMLLint()



    for ( var opt in configOptions ) {
        if ( !options[ opt ] ) {
            delete options[opt];
        } else {
            options[ opt ] = options[ opt ];
        }
    }

    // console.log(JSON.stringify(options, null, "  "))


    // skip empty files
    if (input.length) {

        exports.log("Minifying " + inputFile + "...");

        var minimized = htmlMinifier.minify(input, options);

        fs.writeFileSync(outputFile, minimized, charset);


        var diff = input.length - minimized.length,
        savings = input.length ? ((100 * diff) / minimized.length).toFixed(2) : 0;
        var info = 'Original size: ' + format.commify(input.length)  +
            '. Minified size: ' + format.commify(minimized.length) +
            '. Savings: ' + format.commify(diff) + ' (' + savings + '%)';

        exports.log(info);

    } else {
        exports.log( "Skipping empty file " + inputFile);
    }


};

