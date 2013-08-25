var fs = require('fs');
var assert = require('assert');
var path = require('path');
var taskRunner = require('../');
var file = require('../lib/utils/file');
var execFile = require('child_process').execFile;
var async = require('async');

var dirs = file.listdir(__dirname);
async.eachSeries(dirs, function (dir, done) {
    console.log(dir)
    taskRunner.run(null, dir, done);
    execFile('bin/mod', [], {
    	cwd: dir
    }, function (err, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
	    done(err);
	});
}, function(err){
    if(err){
        throw err;
        process.exit(1);
    }
})


