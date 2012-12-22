var utils = require('../utils'),
    fs = require('fs'),
    ncp = require('ncp').ncp,
    rimraf = require('rimraf');

exports.summary = 'Move or rename files or directories';

exports.usage = '<source> <dest>';


exports.run = function (options, callback) {

    var source = options.source,
        dest = options.dest;

    ncp.limit = 16;
    ncp(source, dest, function(err){
        if(err){
            return callback(err);
        }

        var ret = rimraf.sync(source);
        callback(null, ret);
    });


};

