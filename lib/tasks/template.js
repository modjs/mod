var utils = require('../utils');
var file = require('../utils/file');
var fs = require('fs');
var path = require('path');
var template = require('../utils/template');
var _ = require('underscore');


exports.summary = 'Build everything';

exports.usage = '<source> [options]';

exports.options = {
    "dest" : {
        alias : 'd'
        ,default : '<source>'
        ,describe : 'destination directory or file'
    },

    "charset" : {
        alias : 'c'
        ,default : 'utf-8'
        ,describe : 'file encoding type'
    }
};


exports.run = function (options, done) {

    var source = options.source;
    var dest = options.dest;
    var settings = options.settings;
    var charset = options.charset;


    try {

        exports.files.forEach(function(inputFile){

            var outputFile = inputFile;

            // console.log(dest, file.isDirFormat(dest));

            if(file.isDirFormat(dest)){
                outputFile = path.join(dest , path.basename(outputFile) );
            }else{
                outputFile = dest;
            }

            exports.template(inputFile, outputFile, charset);

        });

        done()

    }catch (err){
        return done(err);
    }

};


// helpers, could be extend
exports.helpers = {
    // rev cache
    revved: {},
    // rev helper
    rev: function rev(src) {
        var revved = this.revved;
        if (!revved[src]) {
            revved[src] = exports.runTask('hash', {source: src});
        }
        return revved[src];
    },
    // content helper
    content: function content(src, isNotMinify, isNotCombine) {

        if (isNotMinify) {
            // only read file contents
            return file.read(src);
        } else if ( ['.js', '.css', '.html'].indexOf( path.extname(src) ) !== -1 ) {

            // combine css @imports default
            if(!isNotCombine && path.extname(src) === '.css'){
                var contents = exports.runTask('combinecss', {source: src, output: 'pipe'});
                src = file.writeTemp(src, contents);
            }

            return exports.runTask('min', {source: src, output: 'pipe'});

        } else {
            // datauri images
            return exports.runTask('datauri', {source: src, output: 'pipe'});
        }

    }
};


exports.template = function(inputFile, outputFile, charset){

    charset = charset || "utf-8";
    outputFile = outputFile || inputFile;

    var input = file.read(inputFile, charset);
    var output = template(input, exports.helpers);

    file.write(outputFile, output, charset);

};




