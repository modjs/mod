var utils = require('../utils'),
    file = require('../utils/file'),
    fs = require('fs'),
    path = require('path'),
    template = require('../utils/template'),
    _ = require('underscore');


exports.summary = 'everything is template';

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

var revved = {};

function rev(path){

    if(!revved[path]){
        var hashTask = exports.loadTask('hash');
        revved[path] = hashTask.run({source: path});
    }

    return revved[path];
}

var task = exports.task = function(inputFile, outputFile, charset){

    charset = charset || "utf-8";
    outputFile = outputFile || inputFile;

    var input = file.read(inputFile, charset);
    var output = template(input, {rev: rev});

    file.write(outputFile, output, charset);

};




