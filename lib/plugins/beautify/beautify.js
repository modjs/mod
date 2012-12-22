var utils = require('../../utils'),
    logger = require('../../utils/logger'),
    fs = require('fs'),
    path = require('path'),
    _ = require('underscore'),
    argParse = require('../../args').parse;


exports.summary = '格式美化';

exports.usage = '' +
    'mod beautify\n' +
    '\n' +
    'Options:\n' +
    '  -f, --from  from directory or file (defaults to ".")' +
    '  -t, --to  to directory or file (defaults to ".")';


exports.run = function () {

    var a = argParse(args, {
        'from': {match: ['-f','--from'], value: true},
        'to': {match: ['-t','--to'], value: true},
        'charset': {match: ['-c','--charset'], value: true}
    });

    var opt = a.options;
    if (a.positional.length < 1 && !opt.from) {
        console.log(exports.usage);
        logger.clean_exit = true;
        return;
    }
    var from = opt.from || ".",
        to = opt.to || from,
        charset = opt.charset;

    try {

        task(from, to, charset);

        logger.info();

        logger.end();

    }catch (err){
        return logger.error(err);
    }

};


var task = exports.task = function(inputFile, outputFile, charset){


};
