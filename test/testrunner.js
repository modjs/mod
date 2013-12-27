var fs = require('fs');
var assert = require('assert');
var path = require('path');
var file = require('../lib/utils/file');
var exec = require('child_process').exec;
var async = require('async');
var colors = require('colors');

console.log('Print process env ...'.green);

for(var key in process.env){
    console.log(key, ':', process.env[key]);
}

var testDirs = file.listdir(__dirname);
var exampleDirs = file.listdir(path.join(__dirname, '../example'));
var dirs = testDirs.concat(exampleDirs);
var binPath = path.resolve('bin/mod');

async.eachSeries(dirs, function (dir, done) {
    if( file.exists(path.join(dir, '.testskip')) ){
        return done();
    }

    console.log('Testing'.green, dir.green, '...'.green);

    exec('node ' + binPath, {
        cwd: dir
    }, function (err, stdout, stderr) {
        stdout && console.log(stdout);
        stderr && console.log(stderr);
        done(err);
    });

}, function(err){
    if(err){
        throw err;
        process.exit(1);
    }
})
