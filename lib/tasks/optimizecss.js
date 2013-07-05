var utils = require('../utils');
var format = require('../utils/format');
var file = require('../utils/file');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
var cleanCSS = require('clean-css');
var url = require('url');

exports.summary = 'Optimize CSS';

exports.usage = '<src> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,default : '<src>'
        ,describe : 'destination directory or file'
    },

    "keepSpecialComments": {
        default: "*",
        describe: "* for keeping all (default), 1 for keeping first one, 0 for removing all"
    },

    "keepBreaks": {
        default: false,
        describe: "whether to keep line breaks "
    },

    "removeEmpty": {
        default: false,
        describe: "whether to remove empty elements "
    },

    "root": {
        describe: "path with which to resolve absolute @import rules"
    },

    "relativeTo": {
        describe: "path with which to resolve relative @import rules"
    },

    "ignoreImport": {
        describe: "list of of files to ignore for the @import"
    },

    "urlPrepend": {
        describe : 'global url prepend'
    },

    "urlToBase": {
        describe: "url located to base directory"
    },

    "revDest": {
        default : 'dist'
        ,describe : 'file rev destination directory'
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


exports.run = function (options) {

    var dest = options.dest;
    var charset = options.charset;
    var output = options.output;
    var suffix = options.suffix;

    var result;
    exports.files.forEach(function(inputFile){
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

        result = exports.optimizecss(inputFile, outputFile, options, charset);

    });

    return result;
};

// Modify URL paths to match the path represented by this file.
exports.urlRelocate= function(contents, fromBase, toBase, urlPrepend, revDest){

    if(!exports.file.isDirFormat(fromBase)){
        fromBase = path.dirname(fromBase);
    }
    if(!exports.file.isDirFormat(toBase)){
        toBase =  path.dirname(toBase);
    }

    return contents.replace(/url\(['"]?([^\)]+)['"]?\)/g, function(match, originUrl) {

        if (originUrl[0] !== '/' && originUrl.indexOf('data:') !== 0 && !( /^(http|https):\/\//.test(originUrl) || /^\/\//.test(originUrl)) ) {

            // url prepend
            var urlObj = url.parse(originUrl, true);
            var query = urlObj.query;

            // relative project root path
            var urlRelativeRootPath = path.join(fromBase, urlObj.pathname);

            if('datauri' in query){
                var locatedUrl = exports.runTask('datauri', {src: urlRelativeRootPath, output: 'pipe'});
            }else{

                if(revDest) {
                    // copy to dest path
                    var destPath = path.join(revDest, urlRelativeRootPath);
                    file.copy(urlRelativeRootPath, destPath);
                    exports.log(urlRelativeRootPath, '>', destPath);

                    // rev dest file, and use origin main src when gen src
                    var revedFileName = exports.runTask('hash', {src: destPath});
                    locatedUrl = path.join(path.dirname(originUrl), revedFileName);
                }

                if(toBase){
                    locatedUrl = path.relative(toBase, path.join(fromBase, locatedUrl));
                }

                // if need set url-prepend as empty, use url-prepend=.
                var urlPrepend =  query['url-prepend'] || urlPrepend;
                locatedUrl = url.resolve(urlPrepend, locatedUrl);
            }

        } else {
            exports.warn(fromBase + "\n  URL not a relative URL, skipping: " + url.slice(0,60)+ "...");
        }

        return "url(" + (locatedUrl || originUrl).replace(/\\/g, '/') + ")";
    });
};


exports.optimizecss = function(inputFile, outputFile, options, charset){
    var contents = file.read(inputFile, charset);
    // skip empty files
    if (contents.length) {
        var minimized = cleanCSS.process(contents, options);

        // TODO DRY
        var diff = contents.length - minimized.length;
        var savings = contents.length ? ((100 * diff) / minimized.length).toFixed(2) : 0;
        var info = 'Original size: ' + format.commify(contents.length)  +
            '. Minified size: ' + format.commify(minimized.length) +
            '. Savings: ' + format.commify(diff) + ' (' + savings + '%)';

        exports.log(info);

        // url relocate
        try{
            contents = exports.urlRelocate(minimized, inputFile, outputFile || options.urlToBase, options.urlPrepend, options.revDest);
        }catch (e){
            throw e;
        }

        // output to file
        if(outputFile){
            file.write(outputFile, contents, charset);
        }

    } else {
        exports.log("Skipping empty file" ,  inputFile);
    }
    return contents;
};
