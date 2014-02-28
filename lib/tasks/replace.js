var utils = require('../utils');
var file = require('../utils/file');
var fs = require('fs');
var path = require('path');
var _ = require('lodash');

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
        ,describe : 'A string or regular expression that will be replaced by the new value'
    },

    "replace" : {
        alias : 'r'
        ,describe : 'A string that replaces the search string or a function to be invoked to create the new string'
    },

    "flags" : {
        alias : 'f'
        ,default : 'gm'
        ,describe : 'A String containing any combination of the RegExp flags: g - global match, i - ignore case, m - match over multiple lines. This parameter is only used if the search parameter is a string'
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
    var search = options.search;
    var replace = options.replace;
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
    flags = flags || "gm";  // Regexp flags: global/multiline/ignoreCase

    if(_.isString(search)){
        search = new RegExp(utils.escapeRegExp(search), flags);
    }

    var input = file.read(inputFile, charset);
    var output = input.replace(search, replace);

    // have replaced
    if(input != output){
        exports.log(inputFile, "been replaced");
    }else{
        // no replaced
        exports.log(inputFile, "nothing replaced");
    }

    if(outputFile){
        file.write(outputFile, output, charset);
    }

    return output;
};
