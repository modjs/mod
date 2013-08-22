var httpProxy = require('http-proxy');
var logger = require('./logger');
var _ = require('underscore');

var proxies = [];
var rewrite = function (req) {
    return function (rule) {
        if (rule.from.test(req.url)) {
            req.url = req.url.replace(rule.from, rule.to);
        }
    };
};

exports.registerProxy = function(proxy) {
    proxies.push(proxy);
};

exports.proxies = function() {
    return proxies;
};

exports.reset = function() {
    proxies = [];
};

exports.validateRewrite = function (rule) {
    if (!rule ||
        typeof rule.from === 'undefined' ||
        typeof rule.to === 'undefined' ||
        typeof rule.from !== 'string' ||
        typeof rule.to !== 'string') {
        return false;
    }
    return true;
};

exports.processRewrites = function (rewrites, gruntlog) {
    var rules = [];

    Object.keys(rewrites || {}).forEach(function (from) {
        var rule = {
            from: from,
            to: rewrites[from]
        };

        if (exports.validateRewrite(rule)) {
            rule.from = new RegExp(rule.from);
            rules.push(rule);
            logger.log('Rewrite rule created for: [' + rule.from + ' -> ' + rule.to + '].');
        } else {
            logger.error('Invalid rule');
        }
    });

    return rules;
};

/**
 * connect middleware
 */
exports.proxyRequest = function (req, res, next) {
    var proxied = false;
    proxies.forEach(function(proxy) {
        // TODO: url option could be a RegExp
        if (!proxied && req && req.url.lastIndexOf(proxy.config.url, 0) === 0) {
            if (proxy.config.rules.length) {
                proxy.config.rules.forEach(rewrite(req));
            }
            proxy.server.proxyRequest(req, res);
            // proxying twice would cause the writing to a response header that is already sent. Bad config!
            proxied = true;
        }
    });

    if (!proxied) {
        next();
    }
};


exports.config = function(proxies){

    proxies.forEach(function(option) {
        var proxyOption = _.defaults(option,  {
            port: 80,
            https: false,
            changeOrigin: false,
            rejectUnauthorized: false,
            rules: []
        });

        if (_.isUndefined(proxyOption.host) || _.isUndefined(proxyOption.url)) {
            logger.error('Proxy missing host or url configuration');

        } else {
            proxyOption.rules = exports.processRewrites(proxyOption.rewrite);

            exports.registerProxy({
                // Create an instance of HttpProxy to use with another HTTP server
                server: new httpProxy.HttpProxy({
                    // options for proxy target
                    target: proxyOption,
                    // changes the origin of the host header to the target URL
                    changeOrigin: proxyOption.changeOrigin
                }),
                config: proxyOption
            });
            logger.log('[proxy]', "url path: ".grey + proxyOption.url +  " > " +  proxyOption.host);
        }
    });
}

