var utils = require('../utils'),
    auth = require('../utils/auth'),
    format = require('../utils/format'),
    repository = require('../repository'),
    github = require('../utils/github'),
    async = require('async');


exports.summary = 'Search for module';

exports.usage = '<query>';

exports.options = {
    "r" : {
        alias : 'repository'
        ,describe : 'source repository URL'
    },
    "g" : {
        alias : 'github'
        ,type: 'boolean'
        ,describe : 'Search GitHub for matching repository namee'
    },

    "l" : {
        alias : 'limit'
        ,default : 10
        ,describe : 'Maximum number of results to return'
    }
};

exports.run = function (opt, callback) {

    var rc = exports.getRuntimeConfig();
    var repos = opt.repository ? [opt.repository]: rc.repositories;
    var limit = opt.limit;
    var query = opt.query;

    if (opt.github) {
        exports.searchGitHub(query, limit, callback);
    }
    else {
        exports.searchRepositories(repos, query, limit, callback);
    }
};


exports.searchRepositories = function (repos, query, limit, callback) {
    var total = 0;
    async.forEachLimit(repos, 4, function (repo, cb) {
        repository.search(repo, query, limit, function (err, data) {
            if (repos.length > 1) {
                console.log( ('\n' + ( 'Search ' + auth.noAuthURL(repo) ).magenta).bold );
            }
            if (err) {
                return cb(err);
            }
            total += data.rows.length;

            data.rows.forEach(function (r) {
                var doc= r.doc,
                    desc = format.truncate(doc.description.split('\n')[0], 76);

                // print all versions
                var versions =Object.keys(doc.versions).sort().reverse().join(" ");

                console.log(
                    r.doc.name.green  + '@'.yellow + versions.cyan
                    + '\n' + '   ' + desc.grey
                );
            });
            if (repos.length > 1) {
                console.log( ( 'About ' + data.rows.length + ' results (limit: ' + limit + ')\n').cyan );
            }
            cb();
        });
    },
    function (err) {

        if (!err) {
            return callback(null, 'About ' + total + ' results' +(repos.length > 1 ? '': ' (limit: ' + limit + ')')
            );
        }

        callback(err);
    });
};


exports.searchGitHub = function (query, limit, callback) {
    github.repos.search(query, function (err, data) {
        if (err) {
            return callback(err);
        }
        var repos = data.repositories.slice(0, limit);
        repos.forEach(function (r) {
            var desc = format.truncate(r.description.split('\n')[0], 76);
            console.log(
                ('gh'.yellow + ":" + r.owner.cyan + '/' + r.name.green) + '\n' +
                //(' ' + r.version + '\n').yellow + //TODO get latest tag?
                '   ' + desc.grey
            );
        });

        callback(null, 'About ' + repos.length + ' results  (limit: ' + limit + ')');
    });
};
