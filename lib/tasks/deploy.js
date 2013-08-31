var _ = require('underscore');
var exec = require('child_process').exec;
var path = require('path');
var async = require('async');
var file = require('../utils/file');

exports.summary = 'Remote deployment via ssh';

exports.usage = '<src> [options]';

exports.options = {
    src: {
        describe : 'local file or directory'
    },

    dest: {
        alias: 'd',
        describe : 'The remote, eg. username:password@host:/path/to/'
    },

    port : {
        alias : 'p',
        default : 22,
        describe : 'The port to connect to on the remote host.'
    },

    username: {
        describe: "The remote username"
    },

    password: {
        describe: "The remote password"
    },

    host: {
        describe: "The remote host"
    },

    path: {
        describe: "The remote path"
    }

};

exports.run = function (options, done) {

    var src = options.src;
    var dest = options.dest;

    exports.log('Deploying...');

    if(!dest){
        dest = {
            host: options.host,
            username: options.username,
            password: options.password,
            path: options.path
        }
    }

    var Client = require('../utils/sshclient').Client;

    var client = new Client({
        port: options.port
    });

    client.parse(dest);

    async.eachSeries(exports.files, function(localFile, cb){

        var filename = path.basename(localFile);
        var remoteFile = path.join(client.remote.path, filename);
        exports.log(localFile, '>', remoteFile);
        client.upload(localFile, remoteFile, cb);

    }, function(err) {
        client.on('close', function() {
            done && done(err);
        });
        client.close();
        exports.log('Done!');
    });

};
