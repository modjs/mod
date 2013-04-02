var httpRequest = require('request'),
    fs = require('fs'),
    path = require('path');

exports.summary = 'Request resource from URI';

exports.usage = '<source> [options]';

exports.options = {
    s : {
        alias: 'source',
        describe: 'the URI from which to request a resource'
    },
    d : {
        alias : 'dest'
        ,describe : 'the file or directory where to store the requested resource(s)'
    },
    v: {
        alias : 'verbose'
        ,describe : 'show verbose progress information'
    }
};


exports.run = function (options, callback) {

    var source = options.source,
        dest = options.dest,
        verbose = options.verbose;

    // TODO: only support http/https now, will support ftp/file/svn/git/ssh/telnet

    // http://www.iana.org/assignments/uri-schemes/prov/ssh
    // ssh://[<user>[;fingerprint=<host-key fingerprint>]@]<host>[:<port>]


    // http://ant.apache.org/manual/Tasks/ftp.html
    // http://ant.apache.org/manual/Tasks/rexec.html    Task to automate a remote rexec session
    // http://ant.apache.org/manual/Tasks/sshexec.html  Runs a command on a remote machine running SSH daemon.
    // http://ant.apache.org/manual/Tasks/scp.html      Copy file to a remote machine


};
