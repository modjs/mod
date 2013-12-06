var httpProxy = require('http-proxy');
var logger = require('./logger');
var _ = require('underscore');
var fs = require('fs');
var path = require('path');
var url = require('url');
var mime = require('connect').static.mime;

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

exports.processRewrites = function (options) {
    var rewrites = options.rewrite || {};
    var location = options.location;
    var rules = [];

    Object.keys(rewrites).forEach(function (from) {
        var rule = {
            from: from,
            to: rewrites[from]
        };

        if (exports.validateRewrite(rule)) {
            // Rewrite by regexp
            rule.from = new RegExp(rule.from);
            rules.push(rule);
            logger.log(' ', 'Rewrite [' + from + ' -> ' + rule.to + ']');
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
        if (!proxied && req && req.url.lastIndexOf(proxy.config.location, 0) === 0) {
            if (proxy.config.rules.length) {
                proxy.config.rules.forEach(rewrite(req));
            }
            proxy.server.proxyRequest(req, res, next);
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
            xforward: false,
            rejectUnauthorized: false,
            rules: []
        });

        if (!proxyOption.location) {
            return logger.error('Proxy missing location configuration');
        } else if(proxyOption.root || proxyOption.alias || proxyOption.file){

            proxyOption.rules = exports.processRewrites(proxyOption);

            exports.registerProxy({
                server: {
                    proxyRequest: function(req, res, next){
                        var file;
                        // Original url may contains a query string, only needs the file pathname
                        var pathname = url.parse(req.url).pathname;
                        if (proxyOption.file){
                            file = proxyOption.file;
                        } else if (proxyOption.root){
                            // Root will still append the directory to the request
                            file = path.join(proxyOption.root, pathname);
                        } else if (proxyOption.alias){

                            if (!/\/$/.test(proxyOption.alias)) {
                                proxyOption.alias += '/';
                            }

                            file = pathname.replace(proxyOption.location, proxyOption.alias);
                        }

                        var stat = fs.statSync(file);
                        if(stat.isFile()){
                            res.statusCode = 200;
                            res.setHeader('Content-Length', stat.size);
                            res.setHeader('Content-Type', mime.lookup(file));
                            fs.createReadStream(file).pipe(res);
                        }else{
                            next();
                        }
                    }
                },
                config: proxyOption
            });

        } else if(proxyOption.host){

            proxyOption.rules = exports.processRewrites(proxyOption);

            exports.registerProxy({
                // Create an instance of HttpProxy to use with another HTTP server
                server: new httpProxy.HttpProxy({
                    // options for proxy target
                    target: proxyOption,
                    // changes the origin of the host header to the target URL
                    changeOrigin: proxyOption.changeOrigin,
                    enable : {
                        xforward: proxyOption.xforward // enables X-Forwarded-For
                    },
                    timeout: proxyOption.timeout
                }),
                config: proxyOption
            });
        }

        logger.log( 'proxy', 'Route [' + proxyOption.location + " -> " + (proxyOption.host || proxyOption.file || proxyOption.root || proxyOption.alias) + ']' );
    });
}

