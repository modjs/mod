// https://github.com/jrburke/r.js/blob/master/build/jslib/optimize.js

var fs = require('fs'),
    file = require('../utils/file'),
    path = require('path'),
    _ = require('underscore');


exports.summary = 'Css Compile';

exports.usage = '<source> [options]';

// assets/css/main.css --no-suffix

exports.options = {
    "d" : {
        alias : 'dest'
        ,default : '<source>'
        ,describe : 'destination directory or file'
    },

    "s" : {
        alias : 'suffix'
        ,default : '.all'
        ,describe : 'destination file suffix append'
    },

    "c" : {
        alias : 'charset'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};

exports.run = function (options, callback) {

    //console.log(args.argv);
    var source = options.source,
        dest = options.dest,
        charset = options.charset,
        suffix = options.suffix;

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

            debugger

            exports.log("Optimizing CSS file: " + inputFile + " > "+ outputFile);
            task(inputFile, outputFile, options ,charset);  // TODO

        });


        callback();

    }catch (err){
        return callback(err);
    }

};


/**
 * Optimizes one CSS file, inlining @import calls, stripping comments, and
 * optionally removes line returns.
 * @param {String} inputFile the path to the CSS file to optimize
 * @param {String} outputFile the path to save the optimized file.
 * @param {Object} config the config object with the optimizeCss and
 * cssImportIgnore options.
 */
var task = exports.task =function(inputFile, outputFile, config, charset) {

    config || (config = {});

    // https://github.com/jrburke/r.js/blob/master/build/example.build.js
    var defaultConfig = {

        //The directory path to save the output. If not specified, then
        //the path will default to be a directory called "build" as a sibling
        //to the build file. All relative paths are relative to the build file.
        dir: ".",

        //By default, comments that have a license in them are preserved in the
        //output. However, for a larger built files there could be a lot of
        //comment files that may be better served by having a smaller comment
        //at the top of the file that points to the list of all the licenses.
        //This option will turn off the auto-preservation, but you will need
        //work out how best to surface the license information.
        preserveLicenseComments: true,

        // keeps the file comments and line
        keepLines: true,

        // keeps the file comments, but removes line
        keepComments : true,

        // If optimizeCss is in use, a list of of files to ignore for the @import
        // inlining. The value of this option should be a string of comma separated
        // CSS file names to ignore (like 'a.css,b.css'. The file names should match
        // whatever strings are used in the @import calls.
        cssImportIgnore: null,

        //
        cssPrefix: ''

    };

    for ( var opt in defaultConfig ) {
        if ( "undefined" === typeof config[ opt ] ) {
            config[ opt ] = defaultConfig[ opt ];
        }
    }


    //Read in the file. Make sure we have a JS string.
    var originalFileContents = file.read(inputFile),
        flat = flattenCss(inputFile, originalFileContents, config.cssImportIgnore, config.cssPrefix, {}),
        //Do not use the flattened CSS if there was one that was skipped.
        fileContents = flat.skippedList.length ? originalFileContents : flat.fileContents,
        startIndex, endIndex, buildText, comment;

    if (flat.skippedList.length) {
        exports.warn('Cannot inline @imports for ' + inputFile +
            ',\nthe following files had media queries in them:\n' +
            flat.skippedList.join('\n'));
    }

    //Do comment removal.
    try {
        if (!config.keepComments) {
            startIndex = 0;
            //Get rid of comments.
            while ((startIndex = fileContents.indexOf("/*", startIndex)) !== -1) {
                endIndex = fileContents.indexOf("*/", startIndex + 2);
                if (endIndex === -1) {
                    throw "Improper comment in CSS file: " + inputFile;
                }
                comment = fileContents.substring(startIndex, endIndex);

                if (config.preserveLicenseComments &&
                    (comment.indexOf('license') !== -1 ||
                        comment.indexOf('opyright') !== -1 ||
                        comment.indexOf('(c)') !== -1)) {
                    //Keep the comment, just increment the startIndex
                    startIndex = endIndex;
                } else {
                    fileContents = fileContents.substring(0, startIndex) + fileContents.substring(endIndex + 2, fileContents.length);
                    startIndex = 0;
                }
            }
        }
        //Get rid of newlines.
        if (!config.keepLines) {
            fileContents = fileContents.replace(/[\r\n]/g, "");
            fileContents = fileContents.replace(/\s+/g, " ");
            fileContents = fileContents.replace(/\{\s/g, "{");
            fileContents = fileContents.replace(/\s\}/g, "}");

            //Remove multiple empty lines.
            fileContents = fileContents.replace(/(\r\n)+/g, "\r\n");
            fileContents = fileContents.replace(/(\n)+/g, "\n");
        }

    } catch (e) {
        fileContents = originalFileContents;
        exports.error("Could not optimized CSS file: " + inputFile + ", error: " + e);
    }

    file.write(outputFile, fileContents);

    //text output to stdout and/or written to build.txt file
    buildText = "\n"+ outputFile.replace(config.dir, "") +"\n----------------\n";
    flat.importList.push(inputFile);
    buildText += flat.importList.map(function(path){
        return path.replace(config.dir, "");
    }).join("\n");
    return buildText +"\n";
};


var backSlashRegExp= /\\/g,
    cssImportRegExp = /\@import\s+(url\()?\s*([^);]+)\s*(\))?([\w, ]*)(;)?/ig,
    cssCommentImportRegExp = /\/\*[^\*]*@import[^\*]*\*\//g,
    cssUrlRegExp = /\url\(\s*([^\)]+)\s*\)?/g;

/**
 * If an URL from a CSS url value contains start/end quotes, remove them.
 * This is not done in the regexp, since my regexp fu is not that strong,
 * and the CSS spec allows for ' and " in the URL if they are backslash escaped.
 * @param {String} url
 */
function cleanCssUrlQuotes(url) {
    //Make sure we are not ending in whitespace.
    //Not very confident of the css regexps above that there will not be ending
    //whitespace.
    url = url.replace(/\s+$/, "");

    if (url.charAt(0) === "'" || url.charAt(0) === "\"") {
        url = url.substring(1, url.length - 1);
    }

    return url;
}


/**
 * Inlines nested stylesheets that have @import calls in them.
 * @param {String} fileName the file name
 * @param {String} fileContents the file contents
 * @param {String} cssImportIgnore comma delimited string of files to ignore
 * @param {String} cssPrefix string to be prefixed before relative URLs
 * @param {Object} included an object used to track the files already imported
 */
function flattenCss(fileName, fileContents, cssImportIgnore, cssPrefix, included) {
    //Find the last slash in the name.
    fileName = fileName.replace(backSlashRegExp, "/");
    var endIndex = fileName.lastIndexOf("/"),
    //Make a file path based on the last slash.
    //If no slash, so must be just a file name. Use empty string then.
        filePath = (endIndex !== -1) ? fileName.substring(0, endIndex + 1) : "",
    //store a list of merged files
        importList = [],
        skippedList = [];

    //First make a pass by removing an commented out @import calls.
    fileContents = fileContents.replace(cssCommentImportRegExp, '');

    //Make sure we have a delimited ignore list to make matching faster
    if (cssImportIgnore && cssImportIgnore.charAt(cssImportIgnore.length - 1) !== ",") {
        cssImportIgnore += ",";
    }

    fileContents = fileContents.replace(cssImportRegExp, function (fullMatch, urlStart, importFileName, urlEnd, mediaTypes) {
        //Only process media type "all" or empty media type rules.
        if (mediaTypes && ((mediaTypes.replace(/^\s\s*/, '').replace(/\s\s*$/, '')) !== "all")) {
            skippedList.push(fileName);
            return fullMatch;
        }

        importFileName = cleanCssUrlQuotes(importFileName);

        //Ignore the file import if it is part of an ignore list.
        if (cssImportIgnore && cssImportIgnore.indexOf(importFileName + ",") !== -1) {
            return fullMatch;
        }

        //Make sure we have a unix path for the rest of the operation.
        importFileName = importFileName.replace(backSlashRegExp, "/");

        try {
            //if a relative path, then tack on the filePath.
            //If it is not a relative path, then the readFile below will fail,
            //and we will just skip that import.
            var fullImportFileName = importFileName.charAt(0) === "/" ? importFileName : filePath + importFileName,
                importContents = file.read(fullImportFileName), i,
                importEndIndex, importPath, fixedUrlMatch, colonIndex, parts, flat;

            //Skip the file if it has already been included.
            if (included[fullImportFileName]) {
                return '';
            }
            included[fullImportFileName] = true;

            //Make sure to flatten any nested imports.
            flat = flattenCss(fullImportFileName, importContents, cssImportIgnore, cssPrefix, included);
            importContents = flat.fileContents;

            if (flat.importList.length) {
                importList.push.apply(importList, flat.importList);
            }
            if (flat.skippedList.length) {
                skippedList.push.apply(skippedList, flat.skippedList);
            }

            //Make the full import path
            importEndIndex = importFileName.lastIndexOf("/");

            //Make a file path based on the last slash.
            //If no slash, so must be just a file name. Use empty string then.
            importPath = (importEndIndex !== -1) ? importFileName.substring(0, importEndIndex + 1) : "";

            //fix url() on relative import (#5)
            importPath = importPath.replace(/^\.\//, '');

            //Modify URL paths to match the path represented by this file.
            importContents = importContents.replace(cssUrlRegExp, function (fullMatch, urlMatch) {
                fixedUrlMatch = cleanCssUrlQuotes(urlMatch);
                fixedUrlMatch = fixedUrlMatch.replace(backSlashRegExp, "/");

                //Only do the work for relative URLs. Skip things that start with / or have
                //a protocol.
                colonIndex = fixedUrlMatch.indexOf(":");
                if (fixedUrlMatch.charAt(0) !== "/" && (colonIndex === -1 || colonIndex > fixedUrlMatch.indexOf("/"))) {
                    //It is a relative URL, tack on the cssPrefix and path prefix
                    urlMatch = cssPrefix + importPath + fixedUrlMatch;

                } else {
                    exports.warn(importFileName + "\n  URL not a relative URL, skipping: " + urlMatch.slice(0,60)+ "...");
                }

                //Collapse .. and .
                parts = urlMatch.split("/");
                for (i = parts.length - 1; i > 0; i--) {
                    if (parts[i] === ".") {
                        parts.splice(i, 1);
                    } else if (parts[i] === "..") {
                        if (i !== 0 && parts[i - 1] !== "..") {
                            parts.splice(i - 1, 2);
                            i -= 1;
                        }
                    }
                }

                return "url(" + parts.join("/") + ")";
            });

            importList.push(fullImportFileName);
            return importContents;
        } catch (e) {
            exports.error(fileName + "\n  Cannot inline css import, skipping: " + importFileName);
            return fullMatch;
        }
    });

    return {
        importList : importList,
        skippedList: skippedList,
        fileContents : fileContents
    };
}


