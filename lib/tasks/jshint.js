var utils = require('../utils');
var file = require('../utils/file');
var fs = require('fs');
var path = require('path');
var _ = require('underscore');

var jshint = require('jshint').JSHINT;


exports.summary = 'Validate javascript files with jshint';

exports.usage = '<source>';

exports.options = {
    "globals" : {
        describe: "pre-define global variables that are exposed"
    },
    "charset" : {
        alias : 'c'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};


exports.run = function (options, done) {

    var source = options.source;
    var charset = options.charset;
    var globals = options.globals;

    try {
        exports.files.forEach(function(inputFile){
            exports.jshint(inputFile, options, globals, charset);
        });
        done();
    }catch (err){
        return done(err);
    }

};


exports.jshint = function(inputFile, options, globals, charset){

    var input = exports.file.read(inputFile, charset);

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
