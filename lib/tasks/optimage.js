var utils = require('../utils'),
    file = require('../utils/file'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    spawn   = require('child_process').spawn;


exports.summary = 'Minify image files with optipng jpegtran gifsicle';

exports.usage = '<source> [options]';

exports.options = {
    "d" : {
        alias : 'dest'
        ,describe : 'destination directory or file'
    },

    "l" : {
        alias : 'level'
        ,default : '1'
        ,describe : 'opti level'
    }
};


exports.run = function (options, callback) {

    //console.log(args.argv);
    var source = options.source,
        dest = options.dest,
        level = options.level;

    //console.log(options);

    var files = file.glob(source);


    async.forEach(files, function(inputFile, cb){
        var outputFile = dest;
        // change to file copy to file
        if(file.isFile(inputFile) && file.isDirFormat(dest)){
            var filename = path.basename(inputFile);
            outputFile = path.join(dest, filename);
        }

        exports.log(inputFile, ">", outputFile);

        task(inputFile, outputFile, level, cb);


    }, callback);


};


var task = exports.task = function(inputFile, outputFile, level, callback){

    var child,
        command='',
        args=[];

    outputFile = outputFile || inputFile;

    switch ( path.extname(inputFile) ){

        // optipng
        // optipng xx.png -out xx2.png
        // optipng xx.png -dir ./img
        case '.png':
        case '.bmp':
        case '.tiff':
            command = 'optipng';
            args.push(inputFile, "-out", outputFile);

            break;

        // jpegtran [switches] inputfile outputfile
        case '.jpg':
        case '.jpeg':
            command = 'jpegtran';
            args.push(inputFile, outputFile);

            break;


        // gifsicle -O2 img.gif --output img.gif
        case '.gif':
            command = 'gifsicle';
            args.push('-O2', inputFile, '--output', outputFile);



            break;
        default:
            return;
    }
    // command Dir
    command = path.resolve(__dirname, '../../bin',command);
    child = spawn(command, args);


    child.stderr.on('data', function (data) {
       // console.log(data)
    });

    child.on('exit', function (code) {


        if (code !== 0) {
            child.stderr.on('data', function (data) {
                var errinfo = "\n"+
                    "InputFile: " + inputFile + "\n"+
                    "OutputFile: " +  outputFile + "\n"+
                    data + "\n"+
                    'exited unexpectedly with exit code ' + code ;

                callback(errinfo);
            });
        }else{
            callback();
        }


    });




};
