var _ = require('underscore');
var exec = require('child_process').exec;
var path = require('path');
var async = require('async');
var file = require('../utils/file');

exports.summary = 'deploy';

exports.usage = '<src> [options]';

exports.options = {

    src: {
        describe : 'local file or directory'
    },

    dest: {
        alias: 'd',
        describe : 'The remote, like username:password@host:/path/to/'
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

    exports.log(src, '>', dest);

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

    client = client.parse(dest);

    async.forEach(exports.files, function(localFile, cb){

        var filename = path.basename(localFile);
        var remoteFile = path.join(client.remote.path, filename);
        client.upload(localFile, remoteFile, cb);
        exports.debug(localFile, ">", remoteFile);

    }, function(err) {
        client.on('close', function() {
            done(err);
        });
        client.close();
    });

};
