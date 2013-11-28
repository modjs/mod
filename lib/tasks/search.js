var utils = require('../utils');
var format = require('../utils/format');
var github = require('../utils/github');
var logger = require('../utils/logger');
var async = require('async');

exports.summary = 'Search GitHub for matching repository name';

exports.usage = '<query>';

exports.options = {
    "repository" : {
        alias : 'r'
        ,describe : 'source repository URL'
    },
    "limit" : {
        alias : 'l'
        ,default : 10
        ,describe : 'Maximum number of results to return'
    }
};

exports.run = function (options, done) {

    var limit = options.limit;
    var query = options.query;
    exports.searchGitHub(query, limit, done);

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
                logger.prefix + ('github'.yellow + ": " + r.owner.cyan + '/' + r.name.green) + '\n' +
                //(' ' + r.version + '\n').yellow + //TODO get latest tag?
                '   ' + desc.grey
            );
        });

        console.log(logger.prefix + 'About ' + repos.length + ' results  (limit: ' + limit + ')' );

        callback();
    });
};
