var fs = require('fs');
var assert = require('assert');
var path = require('path');
var file = require('../lib/utils/file');
var exec = require('child_process').exec;
var async = require('async');
var colors = require('colors');

var dirs = file.listdir(__dirname);
var binPath = path.resolve('bin/mod');

async.eachSeries(dirs, function (dir, done) {
    if( file.exists(path.join(dir, '.testskip')) ){
        return done();
    }

    console.log('--------------', 'Testing'.green, dir.green, '--------------');

    exec('node ' + binPath, {
    	cwd: dir
    }, function (err, stdout, stderr) {
        console.log(stdout);
        console.log(stderr);
	    done(err);
	});

}, function(err){
    if(err){
        throw err;
        process.exit(1);
    }
})


