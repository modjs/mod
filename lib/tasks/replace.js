var utils = require('../utils');
var file = require('../utils/file');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');


exports.summary = 'Replace the contents of files';

exports.usage = '<src> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,default : '<src>'
        ,describe : 'destination directory or file'
    },

    "search" : {
        alias : 's'
        ,describe : 'search string'
    },

    "replace" : {
        alias : 'r'
        ,describe : 'replace string'
    },

    "flags" : {
        alias : 'f'
        ,default : 'gm'
        ,describe : 'flags'
    },

    "charset" : {
        alias : 'c'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};


exports.run = function (options, done) {

    //console.log(args.argv);
    var src = options.src;
    var dest = options.dest;
    var replace = options.replace;
    var search = options.search;
    var charset = options.charset;
    var flags = options.flags;


    try {

        exports.files.forEach(function(inputFile){

            var outputFile = inputFile;

            // console.log(dest, file.isDirFormat(dest));

            if(file.isDirFormat(dest)){
                outputFile = path.join(dest , path.basename(outputFile) );
            }else{
                outputFile = dest;
            }

            exports.replace(inputFile, outputFile, search, replace, charset, flags);

        });

        done()

    }catch (err){
        return done(err);
    }

};


exports.replace = function(inputFile, outputFile, search, replace, charset, flags){

    charset = charset || "utf-8";
    flags = flags || "gm"; //global  multiline ignoreCase
    outputFile = outputFile || inputFile;

    if(_.isString(search)){
        search = new RegExp(search,flags);
    }

    var input = fs.readFileSync(inputFile, charset);
    //var input = fs.readFileSync(inputFile).toString();
    var output = input.replace(search, replace);

    // have replaced
    if(input != output){
        exports.log(inputFile, ">", outputFile, "replaced");
    }else{
    // no replaced
        exports.log(inputFile, ">", outputFile, "no replaced");
    }

    fs.writeFileSync(outputFile, output, charset);
    //fs.writeFileSync(outputFile, output);

};
