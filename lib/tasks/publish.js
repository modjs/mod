var utils = require('../utils'),
    auth = require('../utils/auth'),
    couchdb = require('../utils/couchdb'),
    repository = require('../repository'),
    url = require('url');


exports.summary = 'Publish a module';

exports.usage = "[modulePath]";

exports.options = {
    "r" : {
        alias : 'repository'
        ,describe : 'Target repository URL'
    },
    "f" : {
        alias : 'force'
        ,default : false
        ,type : 'boolean'
        ,describe : 'Overwrite if version is already published'
    }
};

exports.run = function (opt, callback) {

    var rc = exports.getRuntimeConfig();
    // Path to package directory to publish (defaults to ".")
    var dir = opt._[1] || '.';
    var repository = opt.repository || rc.repositories[0];


    exports.publish('package', repository, dir, opt, callback);
};


// called by both publish and publish-task tasks
exports.publish = function (type, repo, dir, options, callback) {
    auth.completeAuth(repo, true, function (err, repo) {
        if (err) {
            return callback(err);
        }
        auth.catchAuthError(exports.doPublish, repo, [type, dir, options], callback);
    });
};


exports.doPublish = function (repo, type, dir, options, callback) {
    var root = couchdb(repo);
    root.instance.pathname = '';
    root.session(function (err, info, resp) {
        if (err) {
            return callback(err);
        }
        options.user = info.userCtx.name;
        options.server_time = new Date(resp.headers.date);
        repository.publish(dir, repo, options, callback);
    });
};

