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
        ,describe : 'optimize level'
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

        // TODO, check or create target build dir
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

        // 1. Basic optimisation
        // optipng xx.png -out xx2.png
        // optipng xx.png -dir ./img
        // default -o2

        // TODO
        // 2. Removing unnecessary chunks
        // pngcrush -q -rem gAMA -rem alla -rem text image.png image.crushed.png
        // 3. Reducing the colour palette
        // pngnq -f -n 32 -s 3 image.png
        // 4. Re-compressing final image
        // advpng -z -4 image.png
        case '.png':
        case '.bmp':
        case '.tiff':
            command = 'optipng';
            args.push('-strip all', inputFile, "-out", outputFile, '-o'+(level||2));

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
    exports.debug(args);
    command = path.resolve(__dirname, '../../bin',command);
    child = spawn(command, args);


    child.stderr.on('data', function (data) {
       exports.debug(data);
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
