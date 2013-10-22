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

    //console.log(args.argv);
    var src = options.src;
    var dest = options.dest;
    var replace = options.replace;
    var search = options.search;
    var charset = options.charset;
    var flags = options.flags;
    var output = options.output;

    var result;
    exports.files.forEach(function(inputFile){
        if(output === 'file'){
            var outputFile = inputFile;
            if(file.isDirname(dest)){
                outputFile = path.join(dest , path.basename(outputFile) );
            }else{
                outputFile = dest;
            }
        }
        result = exports.replace(inputFile, outputFile, search, replace, charset, flags);
    });
    return result;
};

exports.replace = function(inputFile, outputFile, search, replace, charset, flags){

    charset = charset || "utf-8";
    flags = flags || "gm"; //global  multiline ignoreCase

    if(_.isString(search)){
        search = new RegExp(search,flags);
    }

    var input = fs.readFileSync(inputFile, charset);
    //var input = fs.readFileSync(inputFile).toString();
    var output = input.replace(search, replace);

    // have replaced
    if(input != output){
        exports.log(inputFile, "been replaced");
    }else{
        // no replaced
        exports.log(inputFile, "nothing replaced");
    }

    if(outputFile){
        fs.writeFileSync(outputFile, output, charset);
    }

    return output;
};
