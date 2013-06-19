var utils = require('../utils'),
    file = require('../utils/file'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore');

var jshint = require('jshint').JSHINT;


exports.summary = 'Validate javascript files with jshint';

exports.usage = '<source>';

exports.options = {

    "charset" : {
        alias : 'c'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};


exports.run = function (opt, callback) {


    var source = opt.source;
    var charset = opt.charset;

    var options = opt['options'];
    var globals = opt['globals'];

    try {
        file.glob(source).forEach(function(inputFile){
            task(inputFile, options, globals, charset);
        });
        callback();
    }catch (err){
        return callback(err);
    }

};


var task = exports.task = function(inputFile, options, globals, charset){


    charset = charset || "utf-8";
    var input = fs.readFileSync(inputFile, charset);

    // skip empty files
    if (input.length) {

        exports.log("Linting " + inputFile + "...");

        var result = jshint(input, options || {}, globals || {});
        if (result) {
            // Success!
            exports.log("No errors");
        } else {
            // Something went wrong.

            // Iterate over all errors.
            jshint.errors.forEach(function(e) {
                // Sometimes there's no error object.
                if (!e) { return; }
                var pos;
                var evidence = e.evidence;
                var character = e.character;
                if (evidence) {

                    if (character > evidence.length) {
                        // End of line.
                        evidence = evidence + ' '.inverse.red;
                    } else {
                        // Middle of line.
                        evidence = evidence.slice(0, character - 1) + evidence[character - 1].inverse.red +
                            evidence.slice(character);
                    }

                    // Descriptive code error.
                    pos = '['.red + ('L' + e.line).yellow + ':'.red + ('C' + character).yellow + ']'.red;
                    exports.warn(pos + evidence +'\n' + e.reason);

                } else {
                    // Generic "Whoops, too many errors" error.
                    exports.warn(e.reason);
                }
            });

            exports.log(inputFile.grey, 'has', jshint.errors.length, "warnings" )
        }

    } else {
        exports.log("Skipping empty file " + inputFile);
    }

};
