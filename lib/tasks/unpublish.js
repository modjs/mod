var utils = require('../utils'),
    auth = require('../utils/auth'),
    repository = require('../repository'),
    url = require('url');

exports.summary = 'Remove a module from the repository';

exports.usage = '<module>@[version]';

exports.options = {
    "r" : {
        alias : 'repository'
        ,describe : 'source repository URL'
    }
};

exports.run = function (opt, config, callback) {

    var rc = exports.getRuntimeConfig();
    var repository = opt.repository || rc.repositories[0];

    var name = opt.module;
    var version;


    if (name.indexOf('@') !== -1) {
        var parts = name.split('@');
        name = parts[0];
        version = parts.slice(1).join('@');
    }

    auth.completeAuth(repository, true, function (err, repo) {
        if (err) {
            return callback(err);
        }
        auth.catchAuthError(
            repository.unpublish,
            repo,
            [name, version, opt],
            callback
        );
    });
};
