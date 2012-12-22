var utils = require('../utils'),
    _ = require('underscore'),
    url = require('url'),
    request = require('request');


exports.summary = 'deploy';

exports.usage = '[options]';

exports.options = {
    "r" : {
        alias : 'rep'
        ,describe : 'rep url'
    },

    "h" : {
        alias : 'host'
        ,describe : 'host address'
    },

    "m" : {
        alias : 'mode'
        ,default : 'debug'
        ,describe : 'deploy mode'
    },

    "s" : {
        alias : 'server'
        ,describe : 'server address'
    }
};

exports.run = function (opt, config, callback) {

    //console.log(args.argv);
    var rep = opt.rep,
        host = opt.host,
        mode = opt.mode,
        server = opt.server;


    try {

        if(server){

            var qs = {
                rep: rep,
                host: host,
                mode: mode
            };

            var proxy = utils.getHttpProxy( url.parse(server).host );
            exports.log(server + " with " + rep);

            request.get({url: server, qs: qs, proxy: proxy}, function (err, res, data) {
                if (!err && res.statusCode !== 200) {
                    if (res.statusCode === 404) {
                        return callback('Deploy server not available');
                    }
                    return callback('Deploy server returned status code: ' + res.statusCode);
                }


                //logger.info('deploy', JSON.stringify(res,null,"  "));

                callback();
            });

        }

    }catch (err){
        callback(err);
    }

};

