var utils = require('../utils');
var format = require('../utils/format');
var file = require('../utils/file');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');
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

    "urlFromBase": {
        describe: "url located from base directory"
    },

    "urlToBase": {
        describe: "url located to base directory"
    },

    "revDest": {
        describe : 'file rev destination directory'
    },

    "suffix" : {
        alias : 's'
        ,describe : 'destination file suffix append, default suffix is ".min" when "dest" parameter is not set'
    },

    'output': {
        alias: 'o'
        ,default : 'file'
        ,describe : 'specify output type: file or pipe'
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
            var outputFile = file.outputFile(inputFile, dest, suffix, ".min");
            
            if(!options.urlFromBase) {
                options.urlFromBase = inputFile;
            }
        }

        result = exports.optimizecss(inputFile, outputFile, options, charset);

    });

    return result;
};

// Modify URL paths to match the path represented by this file.
exports.urlRelocate= function(contents, fromBase, toBase, urlPrepend, revDest){

    return contents.replace(/\/\*[\S\s]*?\*\/|url\(['"]?([^\)]+)['"]?\)/g, function(match, originUrl) {
        // ignore comments
        if(!originUrl) return match;

        if (utils.isRelativeURI(originUrl)) {

            // url prepend
            var urlObj = url.parse(originUrl, true);
            var query = urlObj.query;

            // located url init value
            var locatedUrl = '';
            // relative project root path
            var urlRelativeRootPath = path.join(fromBase, urlObj.pathname);

            if('datauri' in query || 'embed' in query){
                locatedUrl = exports.runTask('datauri', {src: urlRelativeRootPath, output: 'pipe'});
            }else{

                // TODO: if need rev resource?
                var urlRev =  query['rev'];
                if(revDest) {
                    // copy to dest path
                    var destPath = path.join(revDest, urlRelativeRootPath);
                    file.copy(urlRelativeRootPath, destPath);
                    exports.log(urlRelativeRootPath, '>', destPath);

                    // rev dest file, and use origin main src when gen src
                    var revedFileName = exports.runTask('rev', {src: destPath});
                    locatedUrl = path.join(path.dirname(urlObj.pathname), revedFileName);
                }else{
                    locatedUrl = urlObj.pathname;
                }

                // if need set url-prepend as empty, use url-prepend=.
                var urlPrepend =  query['url-prepend'] || urlPrepend;

                if(toBase){
                    locatedUrl = path.relative(toBase, path.join(fromBase, locatedUrl));
                }else if(urlPrepend){
                    locatedUrl = url.resolve(urlPrepend, urlRelativeRootPath);
                }

            }

        } else {
            exports.warn("Skipping, not a relative URL: " + originUrl.slice(0,60)+ "...");
        }

        return "url(" + (locatedUrl || originUrl).replace(/\\/g, '/') + ")";
    });
};


exports.optimizecss = function(inputFile, outputFile, options, charset){
    var cleanCSS = require('clean-css');
    var contents = file.read(inputFile, charset);
    // skip empty files
    if (contents.length) {

        var urlFromBase = options.urlFromBase;
        var urlToBase = options.urlToBase;

        if(urlFromBase && !exports.file.isDirname(urlFromBase)){
            urlFromBase = path.dirname(urlFromBase);
        }

        if(urlToBase && !exports.file.isDirname(urlToBase)){
            urlToBase =  path.dirname(urlToBase);
        }

        if(!options.relativeTo){
            options.relativeTo = urlFromBase;
        }

        var minimized = cleanCSS.process(contents, options);

        // url relocate
        contents = exports.urlRelocate(minimized, urlFromBase, urlToBase, options.urlPrepend, options.revDest);

        // output to file
        if(outputFile){
            file.write(outputFile, contents, charset);
            exports.log(inputFile, '>', outputFile);
        }

    } else {
        exports.log("Skipping empty file" ,  inputFile);
    }
    return contents;
};
