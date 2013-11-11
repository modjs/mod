var _ = require('underscore');
var exec = require('child_process').exec;
var path = require('path');
var fs = require('fs');
var querystring = require('querystring');
var async = require('async');
var file = require('../utils/file');

exports.summary = 'Remote deployment via ssh';

exports.usage = '<src> [options]';

exports.options = {
    src: {
        describe : 'local file or directory'
    },

    basedir: {
        describe: "local file base dir"
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
    },

    protocol: {
        default: 'ssh',
        describe: "Deploy tunnel protocol, ssh or http"
    },

    url: {
        describe: "The upload url"
    },

    overwrite: {
        default: true,
        describe: "Overwrite existed file"
    }

};

exports.run = function (options, done) {

    exports.log('Deploying...');

    if(options.protocol == 'http'){
        http(options, done)
    }else{
        ssh(options, done)
    }

};

function ssh(options, done){
    var dest = options.dest;

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
        if(file.isDir(localFile)) return cb();
        var filename;
        if(options.basedir) {
            filename = path.relative(options.basedir, localFile);
        }else{
            filename = path.basename(localFile);
        }
        var remoteFile = path.join(client.remote.path, filename);
        remoteFile = file.normalize(remoteFile);
        exports.log(localFile, '>', remoteFile);
        client.upload(localFile, remoteFile, cb);

    }, function(err) {
        client.on('close', function() {
            done && done(err);
        });
        client.close();
        exports.log('Close connection...');
    });

}

function http(options, done){
    var request = require('request');
    async.eachSeries(exports.files, function(localFile, cb){
        if(file.isDir(localFile)) return cb();
        var filename;
        if(options.basedir) {
            filename = path.relative(options.basedir, localFile);
        }else{
            filename = path.basename(localFile);
        }
        var remoteFile = path.join(options.dest, filename);
        remoteFile = file.normalize(remoteFile);

        exports.log(localFile, '>', remoteFile);
        var r = request.post({
            url: options.url,
            qs: {
                token: options.token,
                overwrite: options.overwrite,
                dest: remoteFile
            },
            headers: {
                'Connection': 'keep-alive'
            }
        }, function(err, rep, body){
            if(body) exports.log(body);
            cb(err);
        });
        var body = fs.readFileSync(localFile);
        r.setHeader('Content-Length', body.length);
        r.write(body);
        r.end();

        // Nginx 1.0.* do not work right when post by form
        // var form = r.form();
        // form.append('file', fs.createReadStream(localFile));
        // r.setHeader('Content-Length', form.getLengthSync());

    }, function(err) {
        if(err) throw err;
        done()
    });

}