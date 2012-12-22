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
    "d" : {
        alias : 'dest'
        ,default : '<source>'
        ,describe : 'destination directory or file'
    },

    "s" : {
        alias : 'suffix'
        ,default : '.min'
        ,describe : 'destination file suffix append'
    },

    "c" : {
        alias : 'charset'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};


exports.run = function (opt, callback) {

    var source = opt.source,
        dest = opt.dest,
        charset = opt.charset,
        suffix = opt.suffix;

    var options = opt['options'];

    try {

        if(file.isDir(source)){
            source = path.join(source, "*.css");
        }

        file.globSync(source).forEach(function(inputFile){

            var outputFile = inputFile;

            if(file.isDirFormat(dest)){
                outputFile = path.join(dest , path.basename(outputFile) );

                // suffix
                if(suffix)
                    outputFile = file.suffix(inputFile, suffix);

            }else{
                outputFile = dest;
            }

            task(inputFile, outputFile, options ,charset);  // TODO

        });

        callback();

    }catch (err){
        callback(err);
    }

};


var task = exports.task = function(inputFile, outputFile, options, charset){


    charset = charset || "utf-8";
    var input = fs.readFileSync(inputFile, charset);


    // skip empty files
    if (input.length) {

        exports.log( "Minifying " + inputFile + "...");

        var minimized = cleanCSS.process(input);

        file.write(outputFile, minimized, charset);

        // TODO DRY
        var diff = input.length - minimized.length,
            savings = input.length ? ((100 * diff) / minimized.length).toFixed(2) : 0;
        var info = 'Original size: ' + format.commify(input.length)  +
            '. Minified size: ' + format.commify(minimized.length) +
            '. Savings: ' + format.commify(diff) + ' (' + savings + '%)';

        exports.log(info);

    } else {
        exports.log("Skipping empty file" ,  inputFile);
    }


};
