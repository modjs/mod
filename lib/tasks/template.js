var utils = require('../utils'),
    file = require('../utils/file'),
    fs = require('fs'),
    path = require('path'),
    template = require('../utils/template'),
    _ = require('underscore');


exports.summary = 'Build everything';

exports.usage = '<source> [options]';

exports.options = {
    "d" : {
        alias : 'dest'
        ,default : '<source>'
        ,describe : 'destination directory or file'
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
        settings = options.settings,
        charset = options.charset;


    try {

        file.globSync(source).forEach(function(inputFile){

            var outputFile = inputFile;

            // console.log(dest, file.isDirFormat(dest));

            if(file.isDirFormat(dest)){
                outputFile = path.join(dest , path.basename(outputFile) );
            }else{
                outputFile = dest;
            }

            task(inputFile, outputFile, charset);

        });

        callback()

    }catch (err){
        return callback(err);
    }

};


// helpers, could be extend
exports.helpers = {
    // rev cache
    revved: {},
    // rev helper
    rev: function rev(path) {
        var revved = this.revved;
        if (!revved[path]) {
            var hashTask = exports.loadTask('hash');
            revved[path] = hashTask.run({source: path});
        }
        return revved[path];
    },
    // content helper
    content: function content(path, isDoNotMin) {

        if (isDoNotMin) {
            return file.read(path);
        } else {
            var minTask = exports.loadTask('min');
            return minTask.run({source: path, output: 'pipe'});
        }

    }
};


var task = exports.task = function(inputFile, outputFile, charset){

    charset = charset || "utf-8";
    outputFile = outputFile || inputFile;

    var input = file.read(inputFile, charset);
    var output = template(input, exports.helpers);

    file.write(outputFile, output, charset);

};




